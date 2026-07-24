import type {ModelToolRequest} from "../api/model-tools.ts";
import type {BoundApproval} from "../domain/approval.ts";
import type {ScopeCatalog} from "../domain/manifests.ts";
import type {PolicyEngine} from "../interfaces/policy-engine.ts";
import type {
  PolicyDecision,
  PolicyInput,
  PolicyResult
} from "./types.ts";

const validResults = new Set<PolicyResult>([
  "PERMIT",
  "REQUIRE_APPROVAL",
  "DENY",
  "INDETERMINATE",
  "TERMINATE"
]);

function includes<Value>(values: readonly Value[], candidate: Value): boolean {
  return values.includes(candidate);
}

function isRequestInScope(
  request: ModelToolRequest,
  scope: ScopeCatalog,
  engagementId: PolicyInput["engagementId"]
): boolean {
  switch (request.tool) {
    case "get_engagement":
    case "get_authorized_targets":
      return true;
    case "get_allowed_test_cases":
      return request.targetId === undefined
        || includes(scope.authorizedTargetIds, request.targetId);
    case "run_static_analysis":
      return includes(scope.authorizedRepositoryIds, request.repositoryId)
        && includes(scope.authorizedProfileIds, request.profileId);
    case "run_safe_network_discovery":
      return includes(scope.authorizedTargetIds, request.targetId)
        && includes(scope.authorizedProfileIds, request.profileId);
    case "run_web_test":
      return includes(scope.authorizedTargetIds, request.targetId)
        && includes(scope.authorizedTestCaseIds, request.testCaseId);
    case "request_poc_validation":
      return includes(scope.authorizedTargetIds, request.targetId)
        && includes(scope.authorizedPocIds, request.pocId);
    case "collect_evidence":
      return includes(scope.authorizedExecutionIds, request.executionId);
    case "propose_patch":
      return includes(scope.authorizedFindingIds, request.findingId);
    case "validate_patch":
      return includes(scope.authorizedPatchIds, request.patchId)
        && includes(scope.authorizedTestSuiteIds, request.testSuiteId);
    case "reset_range":
      return includes(scope.authorizedScenarioIds, request.scenarioId);
    case "terminate_engagement":
      return request.engagementId === engagementId;
  }
}

function needsApproval(input: PolicyInput): boolean {
  return input.actionClass === "state_change"
    || input.actionClass === "exploit_validation"
    || input.actionClass === "credential_use";
}

function isApprovalValid(
  approval: BoundApproval | undefined,
  input: PolicyInput
): boolean {
  if (approval === undefined) return false;
  return approval.state === "APPROVED"
    && approval.engagementId === input.engagementId
    && approval.scopeGeneration === input.scope.scopeGeneration
    && approval.policyDigest === input.scope.policyDigest
    && approval.actionDigest === input.actionDigest
    && approval.expiresAtEpochMs >= input.nowEpochMs
    && approval.remainingUses === 1
    && !approval.approverIds.includes(input.requesterId);
}

export class PurePolicyEngine implements PolicyEngine {
  async evaluate(input: PolicyInput): Promise<PolicyDecision> {
    if (input.stopActive) {
      return {result: "TERMINATE", reasonCode: "STOP_ACTIVE"};
    }
    if (input.budgetState === "exceeded") {
      return {result: "TERMINATE", reasonCode: "BUDGET_EXCEEDED"};
    }
    if (!input.dependencies.monitoringHealthy) {
      return {result: "TERMINATE", reasonCode: "MONITORING_UNHEALTHY"};
    }
    if (
      !input.dependencies.scopeServiceHealthy
      || !input.dependencies.approvalServiceHealthy
      || !input.dependencies.policyBundleHealthy
    ) {
      return {result: "INDETERMINATE", reasonCode: "DEPENDENCY_UNHEALTHY"};
    }
    if (
      !input.schemaValid
      || !input.signaturesValid
      || !input.argumentsValidated
      || !input.policyDigestMatches
    ) {
      return {result: "DENY", reasonCode: "INPUT_INVALID"};
    }
    if (
      input.nowEpochMs < input.engagementValidFromEpochMs
      || input.nowEpochMs > input.engagementValidUntilEpochMs
    ) {
      return {result: "DENY", reasonCode: "AUTHORIZATION_EXPIRED"};
    }
    if (
      input.scope.engagementId !== input.engagementId
      || !isRequestInScope(input.request, input.scope, input.engagementId)
    ) {
      return {result: "DENY", reasonCode: "OUT_OF_SCOPE"};
    }
    if (!includes(input.scope.allowedToolNames, input.request.tool)) {
      return {result: "DENY", reasonCode: "TOOL_NOT_ALLOWED"};
    }
    if (needsApproval(input) && !isApprovalValid(input.approval, input)) {
      return {
        result: "REQUIRE_APPROVAL",
        reasonCode: "HUMAN_APPROVAL_REQUIRED"
      };
    }
    return {result: "PERMIT", reasonCode: "ALL_CONTROLS_SATISFIED"};
  }
}

export function isPolicyDecision(value: unknown): value is PolicyDecision {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PolicyDecision>;
  return typeof candidate.result === "string"
    && validResults.has(candidate.result as PolicyResult)
    && typeof candidate.reasonCode === "string";
}
