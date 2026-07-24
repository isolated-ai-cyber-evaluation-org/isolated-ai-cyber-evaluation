import type {
  ApprovalId,
  EngagementId,
  ExecutionId,
  Sha256Digest,
  UserId
} from "../domain/ids.ts";

export interface AppendOnlyAuditEvent {
  readonly engagementId: EngagementId;
  readonly executionId?: ExecutionId;
  readonly eventType: string;
  readonly eventDigest: Sha256Digest;
  readonly actionDigest: Sha256Digest;
  readonly actorId: UserId;
  readonly approvalId?: ApprovalId;
  readonly occurredAtEpochMs: number;
}

export interface AppendOnlyAuditSink {
  append(event: AppendOnlyAuditEvent): Promise<void>;
}
