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

export interface ApprovalBinding {
  readonly engagementId: EngagementId;
  readonly scopeGeneration: number;
  readonly policyDigest: Sha256Digest;
  readonly actionDigest: Sha256Digest;
  readonly requesterId: UserId;
  readonly nowEpochMs: number;
}

export function approvalMatches(
  approval: BoundApproval | undefined,
  binding: ApprovalBinding
): approval is BoundApproval {
  if (approval === undefined) return false;
  return approval.state === "APPROVED"
    && approval.engagementId === binding.engagementId
    && approval.scopeGeneration === binding.scopeGeneration
    && approval.policyDigest === binding.policyDigest
    && approval.actionDigest === binding.actionDigest
    && approval.requesterId === binding.requesterId
    && approval.expiresAtEpochMs >= binding.nowEpochMs
    && approval.remainingUses === 1
    && !approval.approverIds.includes(binding.requesterId);
}
