import type {
  ApprovalId,
  EngagementId,
  Sha256Digest,
  UserId
} from "./ids.ts";

export type ApprovalState =
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CONSUMED"
  | "REVOKED"
  | "EXPIRED";

export interface BoundApproval {
  readonly id: ApprovalId;
  readonly engagementId: EngagementId;
  readonly scopeGeneration: number;
  readonly policyDigest: Sha256Digest;
  readonly actionDigest: Sha256Digest;
  readonly requesterId: UserId;
  readonly approverIds: readonly UserId[];
  readonly state: ApprovalState;
  readonly expiresAtEpochMs: number;
  readonly remainingUses: 0 | 1;
}
