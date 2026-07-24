import {
  ControlPlaneError
} from "../domain/control-plane.ts";
import type {EngagementId} from "../domain/ids.ts";
import type {AppendOnlyAuditSink} from "../interfaces/audit-sink.ts";
import type {EmergencyStop} from "../interfaces/emergency-stop.ts";
import type {
  EngagementRuntimeRecord,
  EngagementService,
  EngagementTransitionRequest
} from "../interfaces/engagement-service.ts";
import type {ScopeService} from "../interfaces/scope-service.ts";
import {transitionEngagement} from "../state/engagement-machine.ts";
import {AuditEventFactory} from "./audit-event-factory.ts";
import {LocalApprovalService} from "./local-approval-service.ts";

function approvalRequired(
  event: EngagementTransitionRequest["event"]
): boolean {
  return event !== "TERMINATE" && event !== "CLOSE";
}

export class LocalEngagementService implements EngagementService {
  readonly #scopeService: ScopeService;
  readonly #approvalService: LocalApprovalService;
  readonly #emergencyStop: EmergencyStop;
  readonly #auditSink: AppendOnlyAuditSink;
  readonly #auditFactory: AuditEventFactory;
  readonly #records = new Map<EngagementId, EngagementRuntimeRecord>();

  constructor(
    scopeService: ScopeService,
    approvalService: LocalApprovalService,
    emergencyStop: EmergencyStop,
    auditSink: AppendOnlyAuditSink,
    auditFactory: AuditEventFactory,
    records: readonly EngagementRuntimeRecord[]
  ) {
    this.#scopeService = scopeService;
    this.#approvalService = approvalService;
    this.#emergencyStop = emergencyStop;
    this.#auditSink = auditSink;
    this.#auditFactory = auditFactory;
    for (const record of records) this.#records.set(record.engagementId, record);
  }

  async get(
    engagementId: EngagementId
  ): Promise<EngagementRuntimeRecord | undefined> {
    return this.#records.get(engagementId);
  }

  async transition(
    input: EngagementTransitionRequest
  ): Promise<EngagementRuntimeRecord> {
    try {
      await this.#auditSink.append(this.#auditFactory.create({
        ...input,
        eventType: "ENGAGEMENT_TRANSITION_ATTEMPT"
      }));
    } catch {
      throw new ControlPlaneError("AUDIT_APPEND_FAILED");
    }
    const current = this.#records.get(input.engagementId);
    if (current === undefined) {
      throw new ControlPlaneError("ENGAGEMENT_NOT_FOUND");
    }
    if (
      this.#emergencyStop.isBlocked(input.engagementId)
      && input.event !== "TERMINATE"
      && input.event !== "CLOSE"
    ) {
      throw new ControlPlaneError("STOP_ACTIVE");
    }

    const nextState = transitionEngagement(current.state, input.event);
    const snapshot = await this.#scopeService.getEngagement(input.engagementId);
    const scope = await this.#scopeService.getScope(input.engagementId);
    if (snapshot === undefined || scope === undefined) {
      throw new ControlPlaneError("DEPENDENCY_UNHEALTHY");
    }

    if (approvalRequired(input.event) && input.approvalId === undefined) {
      throw new ControlPlaneError("HUMAN_APPROVAL_REQUIRED");
    }

    if (approvalRequired(input.event)) {
      await this.#approvalService.consume({
        engagementId: input.engagementId,
        actorId: input.actorId,
        actionDigest: input.actionDigest,
        nowEpochMs: input.nowEpochMs,
        approvalId: input.approvalId!,
        scopeGeneration: scope.scopeGeneration,
        policyDigest: scope.policyDigest
      });
    }

    const next = Object.freeze({
      engagementId: current.engagementId,
      state: nextState,
      revision: current.revision + 1
    });
    this.#records.set(current.engagementId, next);
    return next;
  }
}
