import type {
  EngagementId,
  EvidenceId,
  ExecutionId,
  FindingId,
  PatchId,
  PocId,
  ProfileId,
  RepositoryId,
  RulesOfEngagementId,
  ScenarioId,
  Sha256Digest,
  TargetId,
  TestCaseId,
  TestSuiteId
} from "./ids.ts";
import type {ModelToolName} from "../api/model-tools.ts";

export type EvaluationMode = "white-box" | "gray-box";
export type DataClassification = "synthetic";

export interface ResourceBudgets {
  readonly maxDurationSeconds: number;
  readonly maxToolCalls: number;
  readonly maxModelTokens: number;
  readonly maxParallelJobs: number;
  readonly maxDataBytes: number;
  readonly maxRequests: number;
  readonly maxRequestRatePerSecond: number;
  readonly maxRetriesPerTest: number;
}

export interface EngagementSnapshot {
  readonly id: EngagementId;
  readonly generation: number;
  readonly digest: Sha256Digest;
  readonly rulesOfEngagementId: RulesOfEngagementId;
  readonly mode: EvaluationMode;
  readonly dataClassification: DataClassification;
  readonly validFromEpochMs: number;
  readonly validUntilEpochMs: number;
  readonly scenarioIds: readonly ScenarioId[];
  readonly budgets: ResourceBudgets;
}

export interface ScopeCatalog {
  readonly engagementId: EngagementId;
  readonly scopeGeneration: number;
  readonly scopeDigest: Sha256Digest;
  readonly policyDigest: Sha256Digest;
  readonly authorizedTargetIds: readonly TargetId[];
  readonly authorizedScenarioIds: readonly ScenarioId[];
  readonly authorizedRepositoryIds: readonly RepositoryId[];
  readonly authorizedProfileIds: readonly ProfileId[];
  readonly authorizedTestCaseIds: readonly TestCaseId[];
  readonly authorizedTestSuiteIds: readonly TestSuiteId[];
  readonly authorizedPocIds: readonly PocId[];
  readonly authorizedExecutionIds: readonly ExecutionId[];
  readonly authorizedFindingIds: readonly FindingId[];
  readonly authorizedPatchIds: readonly PatchId[];
  readonly authorizedEvidenceIds: readonly EvidenceId[];
  readonly allowedToolNames: readonly ModelToolName[];
}

export interface RulesOfEngagementSnapshot {
  readonly id: RulesOfEngagementId;
  readonly generation: number;
  readonly digest: Sha256Digest;
  readonly engagementId: EngagementId;
  readonly validFromEpochMs: number;
  readonly validUntilEpochMs: number;
  readonly budgets: ResourceBudgets;
}
