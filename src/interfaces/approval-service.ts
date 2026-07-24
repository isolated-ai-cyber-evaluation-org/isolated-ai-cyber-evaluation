import type {ApprovalId, Sha256Digest} from "../domain/ids.ts";
import type {BoundApproval} from "../domain/approval.ts";

export interface ApprovalService {
  getApproval(id: ApprovalId): Promise<BoundApproval | undefined>;
  findApprovalByActionDigest(
    actionDigest: Sha256Digest
  ): Promise<BoundApproval | undefined>;
}
