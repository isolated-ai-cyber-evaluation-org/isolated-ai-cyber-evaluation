import {createHash} from "node:crypto";
import type {OperationContext} from "../domain/control-plane.ts";
import {ids, type ApprovalId} from "../domain/ids.ts";
import type {AppendOnlyAuditEvent} from "../interfaces/audit-sink.ts";

export interface AuditEventInput extends OperationContext {
  readonly eventType: string;
  readonly approvalId?: ApprovalId;
}

function canonicalEvent(input: AuditEventInput): string {
  const fields = input.approvalId === undefined
    ? {
        actionDigest: input.actionDigest,
        actorId: input.actorId,
        engagementId: input.engagementId,
        eventType: input.eventType,
        occurredAtEpochMs: input.nowEpochMs
      }
    : {
        actionDigest: input.actionDigest,
        actorId: input.actorId,
        approvalId: input.approvalId,
        engagementId: input.engagementId,
        eventType: input.eventType,
        occurredAtEpochMs: input.nowEpochMs
      };
  return JSON.stringify(fields);
}

export class AuditEventFactory {
  create(input: AuditEventInput): AppendOnlyAuditEvent {
    const hash = createHash("sha256")
      .update(canonicalEvent(input), "utf8")
      .digest("hex");
    const base = {
      engagementId: input.engagementId,
      eventType: input.eventType,
      eventDigest: ids.digest(`sha256:${hash}`),
      actionDigest: input.actionDigest,
      actorId: input.actorId,
      occurredAtEpochMs: input.nowEpochMs
    };
    return input.approvalId === undefined
      ? Object.freeze(base)
      : Object.freeze({...base, approvalId: input.approvalId});
  }
}
