import assert from "node:assert/strict";
import test from "node:test";
import type {BoundApproval} from "../../src/domain/approval.ts";
import {ControlPlaneError} from "../../src/domain/control-plane.ts";
import {ids} from "../../src/domain/ids.ts";
import type {
  EngagementSnapshot,
  ResourceBudgets,
  RulesOfEngagementSnapshot,
  ScopeCatalog
} from "../../src/domain/manifests.ts";
import {composeLocalControlPlane} from "../../src/composition/local-control-plane.ts";
import {FailingAppendOnlyAuditSink} from "../../src/stubs/failing-audit-sink.ts";
import {UnavailablePolicyEngine} from "../../src/stubs/unavailable-policy-engine.ts";

const engagementId = ids.engagement("eng_control-mvp-001");
const roeId = ids.roe("roe_control-mvp-001");
const targetId = ids.target("tgt_synthetic-web-001");
const outOfScopeTargetId = ids.target("tgt_outside-001");
const testCaseId = ids.testCase("tc_safe-web-001");
const modelProfileId = ids.profile("mdl_local-fake-001");
const policyDigest = ids.digest(
  "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
);
const scopeDigest = ids.digest(
  "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
);
const requesterId = ids.user("usr_requester-001");
const approverId = ids.user("usr_approver-001");
const readActionDigest = ids.digest(
  "sha256:1111111111111111111111111111111111111111111111111111111111111111"
);
const stateActionDigest = ids.digest(
  "sha256:2222222222222222222222222222222222222222222222222222222222222222"
);
const capabilityActionDigest = ids.digest(
  "sha256:3333333333333333333333333333333333333333333333333333333333333333"
);

const budgets: ResourceBudgets = {
  maxDurationSeconds: 600,
  maxToolCalls: 20,
  maxModelTokens: 10_000,
  maxParallelJobs: 1,
  maxDataBytes: 1_000_000,
  maxRequests: 100,
  maxRequestRatePerSecond: 5,
  maxRetriesPerTest: 1
};

const engagement: EngagementSnapshot = {
  id: engagementId,
  generation: 1,
  digest: ids.digest(
    "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  ),
  rulesOfEngagementId: roeId,
  mode: "white-box",
  dataClassification: "synthetic",
  validFromEpochMs: 0,
  validUntilEpochMs: 2_000,
  scenarioIds: [ids.scenario("scn_synthetic-web-001")],
  budgets
};

const rulesOfEngagement: RulesOfEngagementSnapshot = {
  id: roeId,
  generation: 1,
  digest: ids.digest(
    "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
  ),
  engagementId,
  validFromEpochMs: 0,
  validUntilEpochMs: 2_000,
  budgets
};

const scope: ScopeCatalog = {
  engagementId,
  scopeGeneration: 1,
  scopeDigest,
  policyDigest,
  authorizedTargetIds: [targetId],
  authorizedScenarioIds: [ids.scenario("scn_synthetic-web-001")],
  authorizedRepositoryIds: [ids.repository("repo_synthetic-web-001")],
  authorizedProfileIds: [
    modelProfileId,
    ids.profile("profile_capability-purpose-001")
  ],
  authorizedTestCaseIds: [testCaseId],
  authorizedTestSuiteIds: [ids.testSuite("suite_patch-safe-001")],
  authorizedPocIds: [ids.poc("poc_harmless-marker-001")],
  authorizedExecutionIds: [ids.execution("exe_synthetic-001")],
  authorizedFindingIds: [ids.finding("find_synthetic-001")],
  authorizedPatchIds: [ids.patch("patch_synthetic-001")],
  authorizedEvidenceIds: [ids.evidence("ev_synthetic-001")],
  allowedToolNames: [
    "get_engagement",
    "get_authorized_targets",
    "get_allowed_test_cases",
    "run_web_test",
    "reset_range",
    "terminate_engagement"
  ]
};

function approved(
  id: string,
  actionDigest = stateActionDigest
): BoundApproval {
  return {
    id: ids.approval(id),
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

function compose(overrides: {
  readonly roe?: RulesOfEngagementSnapshot;
  readonly approvals?: readonly BoundApproval[];
  readonly auditSink?: FailingAppendOnlyAuditSink;
  readonly policyEngine?: UnavailablePolicyEngine;
} = {}) {
  return composeLocalControlPlane({
    engagements: [engagement],
    scopes: [scope],
    rulesOfEngagement: [overrides.roe ?? rulesOfEngagement],
    runtimeRecords: [{
      engagementId,
      state: "ACTIVE",
      revision: 3
    }],
    approvals: overrides.approvals ?? [],
    modelProposals: [{
      engagementId,
      toolRequest: {
        tool: "run_web_test",
        targetId,
        testCaseId
      }
    }],
    ...(overrides.auditSink === undefined
      ? {}
      : {auditSink: overrides.auditSink}),
    ...(overrides.policyEngine === undefined
      ? {}
      : {policyEngine: overrides.policyEngine})
  });
}

test("P3-INT-001 model proposal reaches policy-mediated mock only", async () => {
  const controlPlane = compose();
  const proposal = await controlPlane.modelGateway.propose({
    engagementId,
    actorId: requesterId,
    actionDigest: readActionDigest,
    nowEpochMs: 1_000,
    modelProfileId,
    contextReferenceIds: ["evidence-ref-001"]
  });
  const result = await controlPlane.toolGateway.request({
    engagementId,
    actorId: requesterId,
    actionDigest: readActionDigest,
    nowEpochMs: 1_000,
    actionClass: "read_only",
    request: proposal.toolRequest
  });
  assert.deepEqual(result, {
    status: "not-implemented",
    reasonCode: "MOCK_EXECUTION_DISABLED",
    policyResult: "PERMIT"
  });
});

test("P3-INT-002 Scope escape is denied", async () => {
  const result = await compose().toolGateway.request({
    engagementId,
    actorId: requesterId,
    actionDigest: readActionDigest,
    nowEpochMs: 1_000,
    actionClass: "read_only",
    request: {
      tool: "run_web_test",
      targetId: outOfScopeTargetId,
      testCaseId
    }
  });
  assert.equal(result.status, "denied");
  assert.equal(result.reasonCode, "OUT_OF_SCOPE");
});

test("P3-INT-003 expired ROE is denied while Engagement remains valid", async () => {
  const expiredRoe = {...rulesOfEngagement, validUntilEpochMs: 900};
  const result = await compose({roe: expiredRoe}).toolGateway.request({
    engagementId,
    actorId: requesterId,
    actionDigest: readActionDigest,
    nowEpochMs: 1_000,
    actionClass: "read_only",
    request: {tool: "get_engagement"}
  });
  assert.equal(result.status, "denied");
  assert.equal(result.reasonCode, "AUTHORIZATION_EXPIRED");
});

test("P3-INT-004 self approval is rejected without approval", async () => {
  const controlPlane = compose();
  const approvalId = ids.approval("apr_self-review-001");
  await controlPlane.approvalService.open({
    engagementId,
    actorId: requesterId,
    actionDigest: stateActionDigest,
    nowEpochMs: 900,
    approvalId,
    scopeGeneration: 1,
    policyDigest,
    expiresAtEpochMs: 1_500
  });
  await controlPlane.approvalService.startReview({
    engagementId,
    actorId: requesterId,
    actionDigest: stateActionDigest,
    nowEpochMs: 910,
    approvalId
  });
  await assert.rejects(
    controlPlane.approvalService.approve({
      engagementId,
      actorId: requesterId,
      actionDigest: stateActionDigest,
      nowEpochMs: 920,
      approvalId
    }),
    (error: unknown) =>
      error instanceof ControlPlaneError
      && error.reasonCode === "APPROVAL_SELF_REVIEW"
  );
  assert.equal(
    (await controlPlane.approvalService.getApproval(approvalId))?.state,
    "UNDER_REVIEW"
  );
});

test("P3-INT-005 write without approval is rejected", async () => {
  const controlPlane = compose();
  await assert.rejects(
    controlPlane.engagementService.transition({
      engagementId,
      actorId: requesterId,
      actionDigest: stateActionDigest,
      nowEpochMs: 1_000,
      event: "SUSPEND"
    }),
    (error: unknown) =>
      error instanceof ControlPlaneError
      && error.reasonCode === "HUMAN_APPROVAL_REQUIRED"
  );
  assert.equal(
    (await controlPlane.engagementService.get(engagementId))?.state,
    "ACTIVE"
  );
});

test("P3-INT-006 audit failure prevents Engagement mutation", async () => {
  const controlPlane = compose({
    auditSink: new FailingAppendOnlyAuditSink(),
    approvals: [approved("apr_state-change-001")]
  });
  await assert.rejects(
    controlPlane.engagementService.transition({
      engagementId,
      actorId: requesterId,
      actionDigest: stateActionDigest,
      nowEpochMs: 1_000,
      event: "SUSPEND",
      approvalId: ids.approval("apr_state-change-001")
    }),
    (error: unknown) =>
      error instanceof ControlPlaneError
      && error.reasonCode === "AUDIT_APPEND_FAILED"
  );
  assert.equal(
    (await controlPlane.engagementService.get(engagementId))?.state,
    "ACTIVE"
  );
});

test("P3-INT-007 Emergency Stop blocks policy without model or Runner", async () => {
  const controlPlane = compose();
  await controlPlane.emergencyStop.activate({
    engagementId,
    actorId: approverId,
    actionDigest: stateActionDigest,
    nowEpochMs: 1_000,
    reasonCode: "OPERATOR_STOP"
  });
  const decision = await controlPlane.policyAdapter.authorize({
    engagementId,
    actorId: requesterId,
    actionDigest: readActionDigest,
    nowEpochMs: 1_001,
    actionClass: "read_only",
    request: {tool: "get_engagement"}
  });
  assert.deepEqual(decision, {
    result: "TERMINATE",
    reasonCode: "STOP_ACTIVE"
  });
});

test("P3-INT-008 Policy Engine outage fails closed", async () => {
  const result = await compose({
    policyEngine: new UnavailablePolicyEngine()
  }).toolGateway.request({
    engagementId,
    actorId: requesterId,
    actionDigest: readActionDigest,
    nowEpochMs: 1_000,
    actionClass: "read_only",
    request: {tool: "get_engagement"}
  });
  assert.deepEqual(result, {
    status: "denied",
    reasonCode: "POLICY_INDETERMINATE",
    policyResult: "INDETERMINATE"
  });
});

test("P3-INT-009 capability mock returns metadata only", async () => {
  const approvalId = ids.approval("apr_capability-001");
  const controlPlane = compose({
    approvals: [approved("apr_capability-001", capabilityActionDigest)]
  });
  const grant = await controlPlane.credentialBroker.issue({
    engagementId,
    actorId: requesterId,
    actionDigest: capabilityActionDigest,
    nowEpochMs: 1_000,
    approvalId,
    capabilityId: ids.capability("cap_synthetic-001"),
    targetId,
    purposeProfileId: ids.profile("profile_capability-purpose-001"),
    expiresAtEpochMs: 1_100
  });
  assert.equal(grant.state, "active");
  for (const key of Object.keys(grant)) {
    assert.doesNotMatch(
      key,
      /credential|password|secret|token|private|value/i
    );
  }
});

test("P3-INT-010 audit loss during stop activation still blocks operations", async () => {
  const controlPlane = compose({
    auditSink: new FailingAppendOnlyAuditSink()
  });
  await assert.rejects(
    controlPlane.emergencyStop.activate({
      engagementId,
      actorId: approverId,
      actionDigest: stateActionDigest,
      nowEpochMs: 1_000,
      reasonCode: "MONITORING_UNHEALTHY"
    }),
    (error: unknown) =>
      error instanceof ControlPlaneError
      && error.reasonCode === "AUDIT_APPEND_FAILED"
  );
  assert.equal(controlPlane.emergencyStop.isBlocked(engagementId), true);
  assert.equal(
    controlPlane.emergencyStop.activeReason(engagementId),
    "AUDIT_UNAVAILABLE"
  );
});
