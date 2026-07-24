import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {parse as parseYaml} from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const openapiPath = path.join(root, "api/openapi.yaml");
const api = parseYaml(fs.readFileSync(openapiPath, "utf8"), {uniqueKeys: true});

assert.equal(api.openapi, "3.1.0");
assert.equal(api["x-phase"], "repository-skeleton");
assert.equal(api["x-execution-enabled"], false);
assert.equal(api.servers, undefined, "Phase 2 must not declare a reachable server");
assert.deepEqual(api.security, [{workloadMTLS: []}]);
assert.equal(api.components.securitySchemes.workloadMTLS.type, "mutualTLS");

const expectedPaths = [
  "/v1/engagement",
  "/v1/authorized-targets",
  "/v1/allowed-test-cases",
  "/v1/tool-requests",
  "/v1/engagements/{engagement_id}/terminate"
];
assert.deepEqual(Object.keys(api.paths).sort(), expectedPaths.sort());

const externalRef = api.paths["/v1/tool-requests"].post.requestBody
  .content["application/json"].schema.$ref;
const resolvedRef = path.resolve(path.dirname(openapiPath), externalRef);
assert.ok(fs.existsSync(resolvedRef), `missing external Schema ${externalRef}`);

const toolSchema = JSON.parse(fs.readFileSync(resolvedRef, "utf8"));
const toolVariants = toolSchema.$defs.model_tool_request.oneOf;
const toolNames = toolVariants.map((variant) => variant.properties.tool.const).sort();
assert.deepEqual(toolNames, [
  "collect_evidence",
  "get_allowed_test_cases",
  "get_authorized_targets",
  "get_engagement",
  "propose_patch",
  "request_poc_validation",
  "reset_range",
  "run_safe_network_discovery",
  "run_static_analysis",
  "run_web_test",
  "terminate_engagement",
  "validate_patch"
].sort());

const forbiddenArgumentNames = new Set([
  "command",
  "credential",
  "hostname",
  "ip",
  "password",
  "secret",
  "shell",
  "token",
  "url"
]);
for (const variant of toolVariants) {
  for (const propertyName of Object.keys(variant.properties)) {
    assert.ok(
      !forbiddenArgumentNames.has(propertyName),
      `forbidden tool argument ${propertyName}`
    );
  }
}

for (const route of Object.keys(api.paths)) {
  assert.ok(!route.includes("shell"));
  assert.ok(!route.includes("proxy"));
  assert.ok(!route.includes("cloud"));
}
process.stdout.write("PASS API-001 OpenAPI is ID-only and non-executable\n");
