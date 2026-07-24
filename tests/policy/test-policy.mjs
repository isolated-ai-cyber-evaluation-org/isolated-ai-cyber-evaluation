import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cases = JSON.parse(fs.readFileSync(path.join(root, "tests/policy/policy-cases.json"), "utf8"));

const baseline = {
  schema_valid: true,
  signature_valid: true,
  within_time: true,
  scope_match: true,
  action_allowed: true,
  target_allowed: true,
  profile_allowed: true,
  no_raw_destination: true,
  policy_digest_match: true,
  dependencies_healthy: true,
  stop_active: false,
  action_class: "read_only",
  budgets: {within_limits: true, exceeded: false},
  approval: {
    valid: true,
    digest_match: true,
    unexpired: true,
    uses_remaining: 1,
    self_approved: false
  }
};

function merge(base, overrides) {
  const out = structuredClone(base);
  for (const [key, value] of Object.entries(overrides)) {
    out[key] = value && typeof value === "object" && !Array.isArray(value)
      ? {...out[key], ...value}
      : value;
  }
  return out;
}

function evaluate(input) {
  if (input.stop_active || input.budgets.exceeded) return "TERMINATE";
  if (!input.dependencies_healthy) return "INDETERMINATE";

  const baseValid = [
    "schema_valid",
    "signature_valid",
    "within_time",
    "scope_match",
    "action_allowed",
    "target_allowed",
    "profile_allowed",
    "no_raw_destination",
    "policy_digest_match"
  ].every((key) => input[key]) && input.budgets.within_limits;

  if (!baseValid) return "DENY";

  const approvalRequired = ["state_change", "exploit_validation", "credential_use"]
    .includes(input.action_class);
  const approvalValid = input.approval.valid
    && input.approval.digest_match
    && input.approval.unexpired
    && input.approval.uses_remaining === 1
    && !input.approval.self_approved;
  if (approvalRequired && !approvalValid) return "REQUIRE_APPROVAL";
  return "PERMIT";
}

for (const testCase of cases) {
  const actual = evaluate(merge(baseline, testCase.overrides));
  assert.equal(actual, testCase.expected, testCase.name);
  process.stdout.write(`PASS ${testCase.name}\n`);
}

const rego = fs.readFileSync(path.join(root, "policy/authorization.rego"), "utf8");
for (const required of [
  "default decision",
  "INDETERMINATE",
  "REQUIRE_APPROVAL",
  "TERMINATE",
  "no_raw_destination",
  "\"execution_authorized\": false"
]) {
  assert.ok(rego.includes(required), `reference Rego missing ${required}`);
}
