import type {PolicyReasonCode} from "../policy/types.ts";
import type {
  EngagementId,
  Sha256Digest,
  UserId
} from "./ids.ts";

export type ControlPlaneReasonCode =
  | PolicyReasonCode
  | "APPROVAL_NOT_FOUND"
  | "APPROVAL_SELF_REVIEW"
  | "APPROVAL_STATE_INVALID"
  | "AUDIT_APPEND_FAILED"
  | "CAPABILITY_NOT_FOUND"
  | "DUPLICATE_RECORD"
  | "ENGAGEMENT_NOT_FOUND"
  | "MODEL_PROFILE_NOT_ALLOWED";

export class ControlPlaneError extends Error {
  readonly reasonCode: ControlPlaneReasonCode;

  constructor(reasonCode: ControlPlaneReasonCode) {
    super(reasonCode);
    this.name = "ControlPlaneError";
    this.reasonCode = reasonCode;
  }
}

export interface OperationContext {
  readonly engagementId: EngagementId;
  readonly actorId: UserId;
  readonly actionDigest: Sha256Digest;
  readonly nowEpochMs: number;
}
