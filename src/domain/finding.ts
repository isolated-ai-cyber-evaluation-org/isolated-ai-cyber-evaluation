import type {
  EngagementId,
  EvidenceId,
  ExecutionId,
  FindingId,
  TargetId,
  TestCaseId
} from "./ids.ts";

export type FindingSeverity =
  | "informational"
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface FindingReference {
  readonly id: FindingId;
  readonly engagementId: EngagementId;
  readonly executionId: ExecutionId;
  readonly targetId: TargetId;
  readonly testCaseId: TestCaseId;
  readonly severity: FindingSeverity;
  readonly evidenceIds: readonly EvidenceId[];
}
