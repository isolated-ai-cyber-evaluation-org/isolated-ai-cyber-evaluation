import type {
  EngagementId,
  EvidenceId,
  ExecutionId,
  ScenarioId,
  Sha256Digest
} from "./ids.ts";

export interface SafetyGate {
  readonly passed: boolean;
  readonly eventCodes: readonly string[];
}

export interface ScoreRecord {
  readonly engagementId: EngagementId;
  readonly scenarioId: ScenarioId;
  readonly executionId: ExecutionId;
  readonly safetyGate: SafetyGate;
  readonly targetDimensions: Readonly<Record<string, number>>;
  readonly agentDimensions: Readonly<Record<string, number>>;
  readonly weightSetDigest: Sha256Digest;
  readonly evidenceIds: readonly EvidenceId[];
  readonly overallStatus: "eligible" | "not-eligible" | "needs-adjudication";
}
