import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {parse as parseYaml} from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const srcRoot = path.join(root, "src");

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(srcRoot).filter((name) => name.endsWith(".ts"));
assert.ok(sourceFiles.length >= 20, "expected a meaningful typed skeleton");

const prohibitedNodeModules = new Set([
  "node:child_process",
  "node:cluster",
  "node:dgram",
  "node:fs",
  "node:http",
  "node:https",
  "node:net",
  "node:tls",
  "node:worker_threads"
]);
const prohibitedPackagePrefixes = [
  "@aws-sdk/",
  "@azure/",
  "@google-cloud/",
  "dockerode",
  "kubernetes-client",
  "openai"
];

for (const file of sourceFiles) {
  const relative = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/from\s+["']([^"']+)["']/g)) {
    const imported = match[1];
    assert.ok(!prohibitedNodeModules.has(imported), `${relative} imports ${imported}`);
    assert.ok(
      imported.startsWith("."),
      `${relative} must use relative, pure-domain imports only: ${imported}`
    );
    for (const prefix of prohibitedPackagePrefixes) {
      assert.ok(!imported.startsWith(prefix), `${relative} imports ${prefix}`);
    }
  }
  assert.ok(!/\bprocess\.env\b/.test(text), `${relative} reads process.env`);
  assert.ok(!/\bfetch\s*\(/.test(text), `${relative} uses fetch`);
  assert.ok(!/\b(?:exec|execFile|spawn|fork)\s*\(/.test(text), `${relative} creates a process`);
  assert.ok(!/\b(?:eval|Function)\s*\(/.test(text), `${relative} evaluates code`);
  assert.ok(
    !/\b(?:command|hostname|password|secret|shell|token|url)\??\s*:/.test(text),
    `${relative} declares a prohibited execution/secret field`
  );
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
assert.ok(
  packageJson.dependencies === undefined
    || Object.keys(packageJson.dependencies).length === 0,
  "Phase 2 must have no production runtime dependencies"
);

const gateway = fs.readFileSync(
  path.join(root, "src/stubs/deny-only-tool-gateway.ts"),
  "utf8"
);
assert.ok(gateway.includes("EXECUTION_DISABLED"));
assert.ok(gateway.includes("POLICY_INDETERMINATE"));

const policySchema = JSON.parse(
  fs.readFileSync(path.join(root, "schemas/policy-decision.schema.json"), "utf8")
);
assert.equal(policySchema.properties.execution_authorized.const, false);
const jobSchema = JSON.parse(
  fs.readFileSync(path.join(root, "schemas/job.schema.json"), "utf8")
);
assert.equal(jobSchema.properties.execution_mode.const, "disabled");
process.stdout.write("PASS ARCH-203 Policy permit remains non-executable\n");

const prohibitedArtifacts = walk(root)
  .map((name) => path.relative(root, name))
  .filter((name) => {
    if (name.startsWith("node_modules/") || name.startsWith("upload/")) return false;
    return name.endsWith(".sh")
      || name.endsWith(".tf")
      || path.basename(name) === "Dockerfile";
  });
assert.deepEqual(prohibitedArtifacts, [], "no shell/IaC/container implementation allowed");

process.stdout.write(
  `PASS ARCH-201 non-executable source boundary (${sourceFiles.length} TypeScript files)\n`
);

const workflowPath = path.join(root, ".github/workflows/ci.yml");
const workflowText = fs.readFileSync(workflowPath, "utf8");
const workflow = parseYaml(workflowText, {uniqueKeys: true});
assert.deepEqual(workflow.permissions, {contents: "read"});
assert.equal(workflow.jobs.validate.environment, undefined);
assert.ok(!workflowText.includes("id-token: write"));
assert.ok(!workflowText.includes("contents: write"));
assert.ok(!workflowText.includes("packages: write"));
assert.ok(!workflowText.includes("secrets."));
for (const step of workflow.jobs.validate.steps) {
  if (typeof step.uses === "string") {
    assert.match(step.uses, /@[0-9a-f]{40}$/, `CI action is not SHA-pinned: ${step.uses}`);
  }
}
process.stdout.write("PASS ARCH-202 validation-only CI permissions and action pins\n");

const packageScripts = packageJson.scripts;
for (const script of [
  "validate",
  "test:schemas",
  "test:policy",
  "test:unit",
  "test:api",
  "test:architecture",
  "test:traceability",
  "test:docs",
  "test:secrets",
  "typecheck"
]) {
  assert.equal(typeof packageScripts[script], "string", `missing script ${script}`);
}
const makefile = fs.readFileSync(path.join(root, "Makefile"), "utf8");
for (const target of ["validate:", "test-unit:", "test-api:", "test-traceability:"]) {
  assert.ok(makefile.includes(target), `missing Makefile target ${target}`);
}
process.stdout.write("PASS CI-001 local and CI validation harness entrypoints\n");
