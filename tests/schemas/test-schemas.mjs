import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {parse as parseYaml} from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ajv = new Ajv2020({allErrors: true, strict: true});
addFormats(ajv);

const schemaFiles = fs.readdirSync(path.join(root, "schemas"))
  .filter((name) => name.endsWith(".schema.json"))
  .sort();
const requiredSchemas = [
  "approval.schema.json",
  "audit-event.schema.json",
  "capability-grant.schema.json",
  "emergency-stop.schema.json",
  "engagement.schema.json",
  "evidence.schema.json",
  "finding.schema.json",
  "job.schema.json",
  "policy-decision.schema.json",
  "roe.schema.json",
  "scenario.schema.json",
  "score.schema.json",
  "tool-request.schema.json"
];
assert.deepEqual(schemaFiles, requiredSchemas, "required Schema set changed");

const validators = new Map();
for (const name of schemaFiles) {
  const schema = JSON.parse(fs.readFileSync(path.join(root, "schemas", name), "utf8"));
  validators.set(name.replace(".schema.json", ""), ajv.compile(schema));
  process.stdout.write(`PASS SCH-001 compile ${name}\n`);
}

function loadYaml(name) {
  return parseYaml(fs.readFileSync(path.join(root, "examples", name), "utf8"), {uniqueKeys: true});
}

function validate(kind, document, label) {
  const validator = validators.get(kind);
  const ok = validator(document);
  assert.ok(ok, `${label}: ${ajv.errorsText(validator.errors, {separator: "\n"})}`);
  process.stdout.write(`PASS SCH-002 validate ${label}\n`);
}

const engagement = loadYaml("engagement.yaml");
const roe = loadYaml("roe.yaml");
const scenario = loadYaml("scenario.yaml");
validate("engagement", engagement, "examples/engagement.yaml");
validate("roe", roe, "examples/roe.yaml");
validate("scenario", scenario, "examples/scenario.yaml");

for (const kind of [
  "audit-event",
  "capability-grant",
  "emergency-stop",
  "finding",
  "evidence",
  "approval",
  "score",
  "tool-request",
  "policy-decision",
  "job"
]) {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "tests/schemas/fixtures", `${kind}.json`), "utf8"));
  validate(kind, fixture, `fixtures/${kind}.json`);
}

assert.equal(engagement.spec.roe_id, roe.metadata.id, "engagement to ROE reference");
assert.equal(roe.spec.engagement_id, engagement.metadata.id, "ROE to engagement reference");
assert.ok(engagement.spec.scenario_ids.includes(scenario.metadata.id), "scenario reference");
const scenarioTargets = new Set(scenario.spec.assets.map((asset) => asset.target_id));
for (const target of engagement.spec.target_ids) {
  assert.ok(scenarioTargets.has(target), `target ${target} must exist in scenario`);
}
assert.ok(Date.parse(roe.spec.valid_from) >= Date.parse(engagement.metadata.created_at), "ROE starts within engagement");
assert.ok(Date.parse(roe.spec.valid_until) <= Date.parse(engagement.metadata.expires_at), "ROE ends within engagement");
for (const [key, value] of Object.entries(engagement.spec.budgets)) {
  assert.ok(roe.spec.limits[key] <= value, `ROE limit ${key} must not exceed engagement`);
}
process.stdout.write("PASS SCH-003 cross-document references and limits\n");

const badEngagement = structuredClone(engagement);
badEngagement.spec.data_classification = "production";
assert.equal(validators.get("engagement")(badEngagement), false, "production data must fail");

const badScenario = structuredClone(scenario);
badScenario.spec.network.internet_route = true;
assert.equal(validators.get("scenario")(badScenario), false, "Internet route must fail");

const badRoe = structuredClone(roe);
badRoe.spec.stop_conditions = badRoe.spec.stop_conditions.filter((x) => x !== "monitoring_failure");
assert.equal(validators.get("roe")(badRoe), false, "missing mandatory stop condition must fail");

const badApproval = JSON.parse(fs.readFileSync(path.join(root, "tests/schemas/fixtures/approval.json"), "utf8"));
badApproval.spec.required_approvers = 1;
assert.equal(validators.get("approval")(badApproval), false, "critical approval needs at least two approvers");

const badToolRequest = JSON.parse(
  fs.readFileSync(path.join(root, "tests/schemas/fixtures/tool-request.json"), "utf8")
);
badToolRequest.tool_request.url = "https://not-authorized.invalid";
assert.equal(
  validators.get("tool-request")(badToolRequest),
  false,
  "raw URL field must fail"
);

const badPolicyDecision = JSON.parse(
  fs.readFileSync(path.join(root, "tests/schemas/fixtures/policy-decision.json"), "utf8")
);
badPolicyDecision.execution_authorized = true;
assert.equal(
  validators.get("policy-decision")(badPolicyDecision),
  false,
  "Policy decision must never authorize execution in Phase 2"
);

const badJob = JSON.parse(
  fs.readFileSync(path.join(root, "tests/schemas/fixtures/job.json"), "utf8")
);
badJob.execution_mode = "enabled";
assert.equal(validators.get("job")(badJob), false, "job execution must remain disabled");

const badCapability = JSON.parse(
  fs.readFileSync(
    path.join(root, "tests/schemas/fixtures/capability-grant.json"),
    "utf8"
  )
);
badCapability.value = "not-permitted";
assert.equal(
  validators.get("capability-grant")(badCapability),
  false,
  "capability metadata must reject material-bearing fields"
);

const badAudit = JSON.parse(
  fs.readFileSync(
    path.join(root, "tests/schemas/fixtures/audit-event.json"),
    "utf8"
  )
);
delete badAudit.engagement_id;
assert.equal(
  validators.get("audit-event")(badAudit),
  false,
  "audit event must remain engagement-bound"
);
process.stdout.write("PASS SCH-004 negative schema controls\n");
