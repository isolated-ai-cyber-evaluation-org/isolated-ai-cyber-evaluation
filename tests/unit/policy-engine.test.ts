import assert from "node:assert/strict";
import test from "node:test";
import type {BoundApproval} from "../../src/domain/approval.ts";
import {ids} from "../../src/domain/ids.ts";
import type {ScopeCatalog} from "../../src/domain/manifests.ts";
import {FailClosedPolicyEngine} from "../../src/policy/fail-closed-policy-engine.ts";
import {PurePolicyEngine} from "../../src/policy/pure-policy-engine.ts";
import type {PolicyInputContext} from "../../src/policy/types.ts";
import {DenyOnlyToolGateway} from "../../src/stubs/deny-only-tool-gateway.ts";
import {UnavailablePolicyEngine} from "../../src/stubs/unavailable-policy-engine.ts";

const engagementId = ids.engagement("eng_synthetic-web-001");
const authorizedTargetId = ids.target("tgt_web-app-001");
const outOfScopeTargetId = ids.target("tgt_not-authorized-001");
const testCaseId = ids.testCase("tc_web-safe-001");
const actionDigest = ids.digest(
  "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
);
const policyDigest = ids.digest(
  "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
);
const scopeDigest = ids.digest(
  "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
);
const requesterId = ids.user("usr_requester-001");
const approverId = ids.user("usr_approver-001");

const scope: ScopeCatalog = {
  engagementId,
  scopeGeneration: 1,
  scopeDigest,
  policyDigest,
  authorizedTargetIds: [authorizedTargetId],
  authorizedScenarioIds: [ids.scenario("scn_synthetic-web-001")],
  authorizedRepositoryIds: [ids.repository("repo_synthetic-web-001")],
  authorizedProfileIds: [ids.profile("profile_safe-web-001")],
  authorizedTestCaseIds: [testCaseId],
  authorizedTestSuiteIds: [ids.testSuite("suite_patch-safe-001")],
  authorizedPocIds: [ids.poc("poc_harmless-marker-001")],
  authorizedExecutionIds: [ids.execution("exe_synthetic-001")],
  authorizedFindingIds: [ids.finding("find_synthetic-001")],
  authorizedPatchIds: [ids.patch("patch_synthetic-001")],
  authorizedEvidenceIds: [ids.evidence("ev_synthetic-result-001")],
  allowedToolNames: [
    "get_engagement",
    "get_authorized_targets",
    "get_allowed_test_cases",
    "run_web_test",
    "reset_range",
    "terminate_engagement"
  ]
};

const dependencies = {
  scopeServiceHealthy: true,
  approvalServiceHealthy: true,
  policyBundleHealthy: true,
  monitoringHealthy: true
} as const;

function baseContext(): PolicyInputContext {
  return {
    engagementId,
    scope,
    nowEpochMs: 1_000,
    engagementValidFromEpochMs: 0,
    engagementValidUntilEpochMs: 2_000,
    schemaValid: true,
    signaturesValid: true,
    argumentsValidated: true,
    policyDigestMatches: true,
    actionClass: "read_only",
    actionDigest,
    requesterId,
    budgetState: "within-limits",
    stopActive: false,
    dependencies
  };
}

function approvedAction(): BoundApproval {
  return {
    id: ids.approval("apr_synthetic-001"),
    engagementId,
    scopeGeneration: 1,
    policyDigest,
    actionDigest,
    requesterId,
    approverIds: [approverId],
    state: "APPROVED",
    expiresAtEpochMs: 1_500,
    remainingUses: 1
  };
}

test("POL-101 authorized read-only request reaches PERMIT but no execution", async () => {
  const policy = new FailClosedPolicyEngine(new PurePolicyEngine());
  const gateway = new DenyOnlyToolGateway(policy);
  const request = {
    tool: "run_web_test",
    targetId: authorizedTargetId,
    testCaseId
  } as const;

  const decision = await policy.evaluate({...baseContext(), request});
  assert.deepEqual(decision, {
    result: "PERMIT",
    reasonCode: "ALL_CONTROLS_SATISFIED"
  });

  const gatewayResult = await gateway.request(request, baseContext());
  assert.deepEqual(gatewayResult, {
    status: "not-implemented",
    reasonCode: "EXECUTION_DISABLED",
    policyResult: "PERMIT"
  });
});

test("POL-102 out-of-scope target is denied", async () => {
  const policy = new FailClosedPolicyEngine(new PurePolicyEngine());
  const gateway = new DenyOnlyToolGateway(policy);
  const request = {
    tool: "run_web_test",
    targetId: outOfScopeTargetId,
    testCaseId
  } as const;

  const decision = await policy.evaluate({...baseContext(), request});
  assert.deepEqual(decision, {result: "DENY", reasonCode: "OUT_OF_SCOPE"});
  const gatewayResult = await gateway.request(request, baseContext());
  assert.equal(gatewayResult.status, "denied");
  assert.equal(gatewayResult.reasonCode, "OUT_OF_SCOPE");
});

test("POL-103 unapproved state change is denied by gateway", async () => {
  const policy = new FailClosedPolicyEngine(new PurePolicyEngine());
  const gateway = new DenyOnlyToolGateway(policy);
  const context: PolicyInputContext = {
    ...baseContext(),
    actionClass: "state_change"
  };
  const request = {
    tool: "reset_range",
    scenarioId: ids.scenario("scn_synthetic-web-001")
  } as const;

  const decision = await policy.evaluate({...context, request});
  assert.equal(decision.result, "REQUIRE_APPROVAL");
  const gatewayResult = await gateway.request(request, context);
  assert.deepEqual(gatewayResult, {
    status: "denied",
    reasonCode: "APPROVAL_REQUIRED",
    policyResult: "REQUIRE_APPROVAL"
  });
});

test("matching approval permits policy but gateway remains disabled", async () => {
  const policy = new FailClosedPolicyEngine(new PurePolicyEngine());
  const gateway = new DenyOnlyToolGateway(policy);
  const context: PolicyInputContext = {
    ...baseContext(),
    actionClass: "state_change",
    approval: approvedAction()
  };
  const request = {
    tool: "reset_range",
    scenarioId: ids.scenario("scn_synthetic-web-001")
  } as const;

  const decision = await policy.evaluate({...context, request});
  assert.equal(decision.result, "PERMIT");
  const gatewayResult = await gateway.request(request, context);
  assert.equal(gatewayResult.status, "not-implemented");
  assert.equal(gatewayResult.reasonCode, "EXECUTION_DISABLED");
});

test("POL-104 Policy Engine outage fails closed", async () => {
  const policy = new FailClosedPolicyEngine(new UnavailablePolicyEngine());
  const gateway = new DenyOnlyToolGateway(policy);
  const request = {tool: "get_engagement"} as const;

  const decision = await policy.evaluate({...baseContext(), request});
  assert.deepEqual(decision, {
    result: "INDETERMINATE",
    reasonCode: "POLICY_ENGINE_UNAVAILABLE"
  });
  const gatewayResult = await gateway.request(request, baseContext());
  assert.deepEqual(gatewayResult, {
    status: "denied",
    reasonCode: "POLICY_INDETERMINATE",
    policyResult: "INDETERMINATE"
  });
});

test("monitoring failure and budget breach terminate", async () => {
  const policy = new PurePolicyEngine();
  const request = {tool: "get_engagement"} as const;
  const monitoringDown: PolicyInputContext = {
    ...baseContext(),
    dependencies: {...dependencies, monitoringHealthy: false}
  };
  const overBudget: PolicyInputContext = {
    ...baseContext(),
    budgetState: "exceeded"
  };

  assert.deepEqual(await policy.evaluate({...monitoringDown, request}), {
    result: "TERMINATE",
    reasonCode: "MONITORING_UNHEALTHY"
  });
  assert.deepEqual(await policy.evaluate({...overBudget, request}), {
    result: "TERMINATE",
    reasonCode: "BUDGET_EXCEEDED"
  });
});

test("self-approved action is not valid approval", async () => {
  const policy = new PurePolicyEngine();
  const approval = {
    ...approvedAction(),
    approverIds: [requesterId]
  } satisfies BoundApproval;
  const request = {
    tool: "reset_range",
    scenarioId: ids.scenario("scn_synthetic-web-001")
  } as const;
  const context: PolicyInputContext = {
    ...baseContext(),
    actionClass: "state_change",
    approval
  };
  const decision = await policy.evaluate({...context, request});
  assert.equal(decision.result, "REQUIRE_APPROVAL");
});

test("runtime validation and tool allowlist fail closed", async () => {
  const policy = new PurePolicyEngine();
  const invalidContext: PolicyInputContext = {
    ...baseContext(),
    argumentsValidated: false
  };
  const disallowedScope: ScopeCatalog = {
    ...scope,
    allowedToolNames: ["get_engagement"]
  };
  const request = {
    tool: "run_web_test",
    targetId: authorizedTargetId,
    testCaseId
  } as const;

  assert.deepEqual(await policy.evaluate({...invalidContext, request}), {
    result: "DENY",
    reasonCode: "INPUT_INVALID"
  });
  assert.deepEqual(
    await policy.evaluate({
      ...baseContext(),
      scope: disallowedScope,
      request
    }),
    {result: "DENY", reasonCode: "TOOL_NOT_ALLOWED"}
  );
});
