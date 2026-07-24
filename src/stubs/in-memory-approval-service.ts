import type {BoundApproval} from "../domain/approval.ts";
import type {
  ApprovalId,
  Sha256Digest
} from "../domain/ids.ts";
import type {ApprovalService} from "../interfaces/approval-service.ts";

export class InMemoryApprovalService implements ApprovalService {
  readonly #byId: ReadonlyMap<ApprovalId, BoundApproval>;

  constructor(approvals: readonly BoundApproval[]) {
    this.#byId = new Map(approvals.map((item) => [item.id, item]));
  }

  async getApproval(id: ApprovalId): Promise<BoundApproval | undefined> {
    return this.#byId.get(id);
  }

  async findApprovalByActionDigest(
    actionDigest: Sha256Digest
  ): Promise<BoundApproval | undefined> {
    return [...this.#byId.values()].find(
      (approval) => approval.actionDigest === actionDigest
    );
  }
}
