import type {
  EngagementId,
  ExecutionId,
  RequestId,
  Sha256Digest
} from "../domain/ids.ts";

export interface BoundaryEnvelope<Payload> {
  readonly schemaVersion: "v1";
  readonly requestId: RequestId;
  readonly engagementId: EngagementId;
  readonly scopeGeneration: number;
  readonly executionId?: ExecutionId;
  readonly issuedAtEpochMs: number;
  readonly expiresAtEpochMs: number;
  readonly nonce: string;
  readonly payloadDigest: Sha256Digest;
  readonly payload: Payload;
}
