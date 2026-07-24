import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

for (const relative of [
  "src/interfaces/emergency-stop.ts",
  "src/interfaces/engagement-service.ts",
  "src/interfaces/model-gateway.ts",
  "src/interfaces/policy-engine-adapter.ts",
  "src/interfaces/credential-broker.ts"
]) {
  const source = read(relative);
  assert.ok(
    source.includes("OperationContext"),
    `${relative} lacks engagement-bound operation context`
  );
}
process.stdout.write("PASS ARCH-301 Control Plane operations are engagement-bound\n");

const policyAdapter = read("src/services/local-policy-engine-adapter.ts");
for (const control of [
  "getRulesOfEngagement",
  "Math.max(",
  "Math.min(",
  "FailClosedPolicyEngine",
  "isBlocked("
]) {
  assert.ok(policyAdapter.includes(control), `Policy adapter missing ${control}`);
}
process.stdout.write("PASS ARCH-302 ROE, fail-close, and stop mediation\n");

const emergencyStop = read("src/services/local-emergency-stop-service.ts");
for (const forbiddenDependency of [
  "model-gateway",
  "tool-gateway",
  "runner",
  "execution-plane"
]) {
  assert.ok(
    !emergencyStop.toLowerCase().includes(forbiddenDependency),
    `Emergency Stop depends on ${forbiddenDependency}`
  );
}
assert.ok(emergencyStop.includes("#auditFailureBlocks.add"));
process.stdout.write("PASS ARCH-303 Emergency Stop is model/Runner independent\n");

for (const relative of [
  "src/services/local-engagement-service.ts",
  "src/services/local-approval-service.ts",
  "src/stubs/local-credential-broker-mock.ts"
]) {
  const source = read(relative);
  assert.ok(source.includes("ATTEMPT"), `${relative} lacks intent audit`);
  assert.ok(source.includes("AUDIT_APPEND_FAILED"), `${relative} lacks audit fail-close`);
}
process.stdout.write("PASS ARCH-304 mutations require successful audit append\n");

const capabilitySchema = JSON.parse(
  read("schemas/capability-grant.schema.json")
);
assert.equal(capabilitySchema.additionalProperties, false);
for (const prohibited of [
  "credential",
  "password",
  "private_key",
  "secret",
  "token",
  "value"
]) {
  assert.equal(
    Object.hasOwn(capabilitySchema.properties, prohibited),
    false,
    `capability schema exposes ${prohibited}`
  );
}
process.stdout.write("PASS ARCH-305 capability mock has metadata only\n");
