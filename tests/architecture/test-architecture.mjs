import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const required = [
  "README.md", "AGENTS.md", "ARCHITECTURE.md", "docs/index.md", "docs/assumptions.md",
  "docs/security/security-principles.md", "docs/security/threat-model.md",
  "docs/security/trust-boundaries.md", "docs/security/data-flow-diagrams.md",
  "docs/security/network-matrix.md", "docs/security/iam-model.md",
  "docs/security/credential-model.md", "docs/security/prompt-injection-model.md",
  "docs/security/abuse-cases.md", "docs/security/risk-register.md",
  "docs/governance/authorization-model.md", "docs/governance/rules-of-engagement.md",
  "docs/governance/data-handling.md", "docs/governance/evidence-retention.md",
  "docs/governance/incident-response.md", "docs/design/control-plane.md",
  "docs/design/execution-plane.md", "docs/design/cyber-range.md",
  "docs/design/observability.md", "docs/design/scoring.md",
  "docs/design/reset-and-destruction.md", "docs/design/api-boundaries.md",
  "docs/design/state-machines.md", "docs/design/repository-skeleton.md",
  "docs/exec-plans/active/phase-03-control-plane-mvp.md",
  "docs/exec-plans/completed/phase-02-repository-skeleton.md",
  "docs/exec-plans/completed/phase-01-design.md",
  "schemas/engagement.schema.json", "schemas/roe.schema.json",
  "schemas/scenario.schema.json", "schemas/finding.schema.json",
  "schemas/evidence.schema.json", "schemas/approval.schema.json",
  "schemas/score.schema.json", "schemas/tool-request.schema.json",
  "schemas/policy-decision.schema.json", "schemas/job.schema.json",
  "schemas/audit-event.schema.json", "schemas/capability-grant.schema.json",
  "schemas/emergency-stop.schema.json",
  "examples/engagement.yaml", "examples/roe.yaml",
  "examples/scenario.yaml", "api/openapi.yaml",
  "src/api/model-tools.ts", "src/policy/pure-policy-engine.ts",
  "src/stubs/deny-only-tool-gateway.ts", "src/state/job-machine.ts",
  "src/composition/local-control-plane.ts",
  "src/services/local-policy-engine-adapter.ts",
  "src/services/local-emergency-stop-service.ts",
  "src/stubs/local-model-gateway-fake.ts",
  "src/stubs/local-tool-gateway-mock.ts",
  "src/stubs/local-credential-broker-mock.ts",
  "tests/integration/control-plane-mvp.test.ts",
  "tests/unit/policy-engine.test.ts", "tests/unit/state-machines.test.ts",
  ".github/workflows/ci.yml", "tsconfig.json", "Makefile"
];
for (const relative of required) {
  assert.ok(fs.existsSync(path.join(root, relative)), `missing required file ${relative}`);
}
process.stdout.write(`PASS ARCH-001 required files (${required.length})\n`);

const architecture = fs.readFileSync(path.join(root, "ARCHITECTURE.md"), "utf8");
for (const plane of ["Control plane", "Execution plane", "Cyber range", "Observability plane"]) {
  assert.ok(architecture.includes(plane), `missing plane ${plane}`);
}
const boundaries = fs.readFileSync(path.join(root, "docs/security/trust-boundaries.md"), "utf8");
for (const id of ["TB-CP", "TB-EP", "TB-CR", "TB-OP"]) {
  assert.ok(boundaries.includes(id), `missing boundary ${id}`);
}
process.stdout.write("PASS ARCH-003 four trust boundaries\n");

const network = fs.readFileSync(path.join(root, "docs/security/network-matrix.md"), "utf8");
for (let i = 1; i <= 15; i += 1) {
  assert.ok(network.includes(`DENY-${String(i).padStart(3, "0")}`), `missing DENY-${i}`);
}
for (const term of ["169.254.169.254", "Docker", "Kubernetes", "General internet", "Production network"]) {
  assert.ok(network.toLowerCase().includes(term.toLowerCase()), `network matrix missing ${term}`);
}
process.stdout.write("PASS ARCH-004 explicit network denies\n");

const diagramDir = path.join(root, "diagrams");
const diagrams = fs.readdirSync(diagramDir).filter((name) => name.endsWith(".mmd")).sort();
assert.equal(diagrams.length, 10, "expected ten required Mermaid sources");
for (const name of diagrams) {
  const text = fs.readFileSync(path.join(diagramDir, name), "utf8").trim();
  assert.match(text, /^(flowchart|sequenceDiagram|stateDiagram-v2)\b/, `${name} does not start with a supported Mermaid diagram type`);
}
process.stdout.write("PASS ARCH-005 ten Mermaid sources\n");

const adrDir = path.join(root, "docs/adr");
const adrs = fs.readdirSync(adrDir).filter((name) => /^\d{3}-.*\.md$/.test(name)).sort();
assert.ok(adrs.length >= 14, "expected at least fourteen ADRs");
const sections = [
  "## Context", "## Decision", "## Alternatives", "## Security consequences",
  "## Operational consequences", "## Rejected options", "## Revisit conditions"
];
for (const name of adrs) {
  const text = fs.readFileSync(path.join(adrDir, name), "utf8");
  for (const section of sections) assert.ok(text.includes(section), `${name} missing ${section}`);
}
const threat = fs.readFileSync(path.join(root, "docs/security/threat-model.md"), "utf8");
for (const actor of ["External attacker", "Malicious exercise content", "Compromised or misaligned model", "Malicious insider", "Supply-chain attacker"]) {
  assert.ok(threat.includes(actor), `threat model missing ${actor}`);
}
const api = fs.readFileSync(path.join(root, "docs/design/api-boundaries.md"), "utf8");
for (const term of ["Prohibited API shapes", "target_id", "no raw command/URL/IP", "Policy Engine"]) {
  assert.ok(api.toLowerCase().includes(term.toLowerCase()), `API boundary missing ${term}`);
}
process.stdout.write("PASS ARCH-006 ADR and normative security coverage\n");
