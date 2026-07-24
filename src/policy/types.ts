import type {ModelToolRequest} from "../api/model-tools.ts";
import type {BoundApproval} from "../domain/approval.ts";
import type {
  EngagementId,
  Sha256Digest,
  UserId
} from "../domain/ids.ts";
import type {ScopeCatalog} from "../domain/manifests.ts";

export type ActionClass =
  | "read_only"
  | "state_change"
  | "exploit_validation"
  | "credential_use";

export interface PolicyDependencies {
  readonly scopeServiceHealthy: boolean;
  readonly approvalServiceHealthy: boolean;
  readonly policyBundleHealthy: boolean;
  readonly monitoringHealthy: boolean;
}

export interface PolicyInputContext {
  readonly engagementId: EngagementId;
  readonly scope: ScopeCatalog;
  readonly nowEpochMs: number;
  readonly engagementValidFromEpochMs: number;
  readonly engagementValidUntilEpochMs: number;
  readonly schemaValid: boolean;
  readonly signaturesValid: boolean;
  readonly argumentsValidated: boolean;
  readonly policyDigestMatches: boolean;
  readonly actionClass: ActionClass;
  readonly actionDigest: Sha256Digest;
  readonly requesterId: UserId;
  readonly approval?: BoundApproval;
  readonly budgetState: "within-limits" | "exceeded";
  readonly stopActive: boolean;
  readonly dependencies: PolicyDependencies;
}

export interface PolicyInput extends PolicyInputContext {
  readonly request: ModelToolRequest;
}

export type PolicyResult =
  | "PERMIT"
  | "REQUIRE_APPROVAL"
  | "DENY"
  | "INDETERMINATE"
  | "TERMINATE";

export type PolicyReasonCode =
  | "ALL_CONTROLS_SATISFIED"
  | "HUMAN_APPROVAL_REQUIRED"
  | "AUTHORIZATION_MISMATCH"
  | "OUT_OF_SCOPE"
  | "TOOL_NOT_ALLOWED"
  | "AUTHORIZATION_EXPIRED"
  | "INPUT_INVALID"
  | "DEPENDENCY_UNHEALTHY"
  | "POLICY_ENGINE_UNAVAILABLE"
  | "STOP_ACTIVE"
  | "BUDGET_EXCEEDED"
  | "MONITORING_UNHEALTHY";

export interface PolicyDecision {
  readonly result: PolicyResult;
  readonly reasonCode: PolicyReasonCode;
}
