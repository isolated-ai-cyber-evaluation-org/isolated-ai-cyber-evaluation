import type {
  EngagementId,
  ExecutionId,
  Sha256Digest
} from "../domain/ids.ts";

export interface AppendOnlyAuditEvent {
  readonly engagementId: EngagementId;
  readonly executionId?: ExecutionId;
  readonly eventType: string;
  readonly eventDigest: Sha256Digest;
  readonly occurredAtEpochMs: number;
}

export interface AppendOnlyAuditSink {
  append(event: AppendOnlyAuditEvent): Promise<void>;
}
