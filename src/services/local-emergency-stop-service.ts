import {ControlPlaneError} from "../domain/control-plane.ts";
import type {EngagementId} from "../domain/ids.ts";
import type {AppendOnlyAuditSink} from "../interfaces/audit-sink.ts";
import type {
  EmergencyStop,
  EmergencyStopActivation,
  StopReasonCode
} from "../interfaces/emergency-stop.ts";
import {AuditEventFactory} from "./audit-event-factory.ts";

export class LocalEmergencyStopService implements EmergencyStop {
  readonly #auditSink: AppendOnlyAuditSink;
  readonly #auditFactory: AuditEventFactory;
  readonly #active = new Map<EngagementId, StopReasonCode>();
  readonly #auditFailureBlocks = new Set<EngagementId>();

  constructor(
    auditSink: AppendOnlyAuditSink,
    auditFactory: AuditEventFactory
  ) {
    this.#auditSink = auditSink;
    this.#auditFactory = auditFactory;
  }

  async activate(input: EmergencyStopActivation): Promise<void> {
    try {
      await this.#auditSink.append(this.#auditFactory.create({
        ...input,
        eventType: "EMERGENCY_STOP_INTENT"
      }));
    } catch {
      this.#auditFailureBlocks.add(input.engagementId);
      throw new ControlPlaneError("AUDIT_APPEND_FAILED");
    }
    this.#active.set(input.engagementId, input.reasonCode);
  }

  isBlocked(engagementId: EngagementId): boolean {
    return this.#active.has(engagementId)
      || this.#auditFailureBlocks.has(engagementId);
  }

  activeReason(engagementId: EngagementId): StopReasonCode | undefined {
    return this.#active.get(engagementId)
      ?? (this.#auditFailureBlocks.has(engagementId)
        ? "AUDIT_UNAVAILABLE"
        : undefined);
  }
}
