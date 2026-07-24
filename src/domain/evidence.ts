import type {
  EngagementId,
  EvidenceId,
  ExecutionId,
  Sha256Digest,
  TargetId
} from "./ids.ts";

export type EvidenceKind =
  | "audit-log"
  | "packet-capture"
  | "process-tree"
  | "file-diff"
  | "metric"
  | "trace"
  | "tool-result"
  | "policy-decision"
  | "destruction-certificate"
  | "derived-summary";

export interface EvidenceReference {
  readonly id: EvidenceId;
  readonly engagementId: EngagementId;
  readonly executionId: ExecutionId;
  readonly targetId?: TargetId;
  readonly kind: EvidenceKind;
  readonly contentDigest: Sha256Digest;
  readonly classification: "synthetic" | "internal" | "restricted-evidence";
}
