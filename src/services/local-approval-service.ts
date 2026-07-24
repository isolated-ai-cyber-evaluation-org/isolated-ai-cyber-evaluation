import {
  approvalMatches,
  type BoundApproval
} from "../domain/approval.ts";
import {
  ControlPlaneError,
  type OperationContext
} from "../domain/control-plane.ts";
import type {
  ApprovalId,
  EngagementId,
  Sha256Digest
} from "../domain/ids.ts";
import type {ApprovalService} from "../interfaces/approval-service.ts";
import type {AppendOnlyAuditSink} from "../interfaces/audit-sink.ts";
import {transitionApproval} from "../state/approval-machine.ts";
import {AuditEventFactory} from "./audit-event-factory.ts";

export interface ApprovalOpenRequest extends OperationContext {
  readonly approvalId: ApprovalId;
  readonly scopeGeneration: number;
  readonly policyDigest: Sha256Digest;
  readonly expiresAtEpochMs: number;
}

export interface ApprovalReviewRequest extends OperationContext {
  readonly approvalId: ApprovalId;
}

export interface ApprovalConsumeRequest extends OperationContext {
  readonly approvalId: ApprovalId;
  readonly scopeGeneration: number;
  readonly policyDigest: Sha256Digest;
}

export class LocalApprovalService implements ApprovalService {
  readonly #auditSink: AppendOnlyAuditSink;
  readonly #auditFactory: AuditEventFactory;
  readonly #byId = new Map<ApprovalId, BoundApproval>();

  constructor(
    auditSink: AppendOnlyAuditSink,
    auditFactory: AuditEventFactory,
    approvals: readonly BoundApproval[] = []
  ) {
    this.#auditSink = auditSink;
    this.#auditFactory = auditFactory;
    for (const approval of approvals) this.#byId.set(approval.id, approval);
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

  async open(input: ApprovalOpenRequest): Promise<BoundApproval> {
    await this.#append("APPROVAL_REQUEST_ATTEMPT", input, input.approvalId);
    if (this.#byId.has(input.approvalId)) {
      throw new ControlPlaneError("DUPLICATE_RECORD");
    }
    const approval: BoundApproval = {
      id: input.approvalId,
      engagementId: input.engagementId,
      scopeGeneration: input.scopeGeneration,
      policyDigest: input.policyDigest,
      actionDigest: input.actionDigest,
      requesterId: input.actorId,
      approverIds: [],
      state: "REQUESTED",
      expiresAtEpochMs: input.expiresAtEpochMs,
      remainingUses: 0
    };
    this.#byId.set(input.approvalId, Object.freeze(approval));
    return approval;
  }

  async startReview(input: ApprovalReviewRequest): Promise<BoundApproval> {
    await this.#append("APPROVAL_REVIEW_ATTEMPT", input, input.approvalId);
    const current = this.#require(input.approvalId, input.engagementId);
    const nextState = transitionApproval(current.state, "START_REVIEW");
    const next = Object.freeze({...current, state: nextState});
    this.#byId.set(current.id, next);
    return next;
  }

  async approve(input: ApprovalReviewRequest): Promise<BoundApproval> {
    await this.#append("APPROVAL_DECISION_ATTEMPT", input, input.approvalId);
    const current = this.#require(input.approvalId, input.engagementId);
    if (current.requesterId === input.actorId) {
      throw new ControlPlaneError("APPROVAL_SELF_REVIEW");
    }
    if (current.expiresAtEpochMs < input.nowEpochMs) {
      throw new ControlPlaneError("AUTHORIZATION_EXPIRED");
    }
    const nextState = transitionApproval(current.state, "APPROVE");
    const next: BoundApproval = Object.freeze({
      ...current,
      approverIds: Object.freeze([input.actorId]),
      state: nextState,
      remainingUses: 1
    });
    this.#byId.set(current.id, next);
    return next;
  }

  async consume(input: ApprovalConsumeRequest): Promise<BoundApproval> {
    await this.#append("APPROVAL_CONSUME_ATTEMPT", input, input.approvalId);
    const current = this.#require(input.approvalId, input.engagementId);
    if (!approvalMatches(current, {
      engagementId: input.engagementId,
      scopeGeneration: input.scopeGeneration,
      policyDigest: input.policyDigest,
      actionDigest: input.actionDigest,
      requesterId: input.actorId,
      nowEpochMs: input.nowEpochMs
    })) {
      throw new ControlPlaneError("APPROVAL_STATE_INVALID");
    }
    const nextState = transitionApproval(current.state, "CONSUME");
    const next: BoundApproval = Object.freeze({
      ...current,
      state: nextState,
      remainingUses: 0
    });
    this.#byId.set(current.id, next);
    return next;
  }

  #require(id: ApprovalId, engagementId: EngagementId): BoundApproval {
    const approval = this.#byId.get(id);
    if (approval === undefined || approval.engagementId !== engagementId) {
      throw new ControlPlaneError("APPROVAL_NOT_FOUND");
    }
    return approval;
  }

  async #append(
    eventType: string,
    input: OperationContext,
    approvalId: ApprovalId
  ): Promise<void> {
    try {
      await this.#auditSink.append(this.#auditFactory.create({
        ...input,
        eventType,
        approvalId
      }));
    } catch {
      throw new ControlPlaneError("AUDIT_APPEND_FAILED");
    }
  }
}
