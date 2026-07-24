import {approvalMatches} from "../domain/approval.ts";
import {ControlPlaneError} from "../domain/control-plane.ts";
import type {CapabilityId} from "../domain/ids.ts";
import type {AppendOnlyAuditSink} from "../interfaces/audit-sink.ts";
import type {
  CapabilityIssueRequest,
  CapabilityRevokeRequest,
  CredentialBroker,
  OpaqueCapabilityGrant
} from "../interfaces/credential-broker.ts";
import type {EmergencyStop} from "../interfaces/emergency-stop.ts";
import type {ScopeService} from "../interfaces/scope-service.ts";
import {AuditEventFactory} from "../services/audit-event-factory.ts";
import {LocalApprovalService} from "../services/local-approval-service.ts";

export class LocalCredentialBrokerMock implements CredentialBroker {
  readonly #scopeService: ScopeService;
  readonly #approvalService: LocalApprovalService;
  readonly #emergencyStop: EmergencyStop;
  readonly #auditSink: AppendOnlyAuditSink;
  readonly #auditFactory: AuditEventFactory;
  readonly #grants = new Map<CapabilityId, OpaqueCapabilityGrant>();

  constructor(
    scopeService: ScopeService,
    approvalService: LocalApprovalService,
    emergencyStop: EmergencyStop,
    auditSink: AppendOnlyAuditSink,
    auditFactory: AuditEventFactory
  ) {
    this.#scopeService = scopeService;
    this.#approvalService = approvalService;
    this.#emergencyStop = emergencyStop;
    this.#auditSink = auditSink;
    this.#auditFactory = auditFactory;
  }

  async issue(input: CapabilityIssueRequest): Promise<OpaqueCapabilityGrant> {
    await this.#append("CAPABILITY_ISSUE_ATTEMPT", input);
    if (this.#emergencyStop.isBlocked(input.engagementId)) {
      throw new ControlPlaneError("STOP_ACTIVE");
    }
    if (this.#grants.has(input.capabilityId)) {
      throw new ControlPlaneError("DUPLICATE_RECORD");
    }
    const [engagement, scope, rulesOfEngagement] = await Promise.all([
      this.#scopeService.getEngagement(input.engagementId),
      this.#scopeService.getScope(input.engagementId),
      this.#scopeService.getRulesOfEngagement(input.engagementId)
    ]);
    const approval = await this.#approvalService.getApproval(input.approvalId);
    if (
      engagement === undefined
      || scope === undefined
      || rulesOfEngagement === undefined
    ) {
      throw new ControlPlaneError("DEPENDENCY_UNHEALTHY");
    }
    const authorizationExpiresAtEpochMs = Math.min(
      engagement.validUntilEpochMs,
      rulesOfEngagement.validUntilEpochMs
    );
    if (
      rulesOfEngagement.engagementId !== engagement.id
      || rulesOfEngagement.id !== engagement.rulesOfEngagementId
      || scope.engagementId !== engagement.id
      || scope.scopeGeneration !== engagement.generation
    ) {
      throw new ControlPlaneError("AUTHORIZATION_MISMATCH");
    }
    if (
      input.nowEpochMs < Math.max(
        engagement.validFromEpochMs,
        rulesOfEngagement.validFromEpochMs
      )
      || input.nowEpochMs > authorizationExpiresAtEpochMs
      || input.expiresAtEpochMs <= input.nowEpochMs
      || input.expiresAtEpochMs > authorizationExpiresAtEpochMs
    ) {
      throw new ControlPlaneError("AUTHORIZATION_EXPIRED");
    }
    if (
      !scope.authorizedTargetIds.includes(input.targetId)
      || !scope.authorizedProfileIds.includes(input.purposeProfileId)
    ) {
      throw new ControlPlaneError("OUT_OF_SCOPE");
    }
    if (!approvalMatches(approval, {
      engagementId: input.engagementId,
      scopeGeneration: scope.scopeGeneration,
      policyDigest: scope.policyDigest,
      actionDigest: input.actionDigest,
      requesterId: input.actorId,
      nowEpochMs: input.nowEpochMs
    })) {
      throw new ControlPlaneError("HUMAN_APPROVAL_REQUIRED");
    }
    await this.#approvalService.consume({
      engagementId: input.engagementId,
      actorId: input.actorId,
      actionDigest: input.actionDigest,
      nowEpochMs: input.nowEpochMs,
      approvalId: input.approvalId,
      scopeGeneration: scope.scopeGeneration,
      policyDigest: scope.policyDigest
    });
    const grant: OpaqueCapabilityGrant = Object.freeze({
      capabilityId: input.capabilityId,
      engagementId: input.engagementId,
      targetId: input.targetId,
      purposeProfileId: input.purposeProfileId,
      issuedAtEpochMs: input.nowEpochMs,
      expiresAtEpochMs: input.expiresAtEpochMs,
      state: "active"
    });
    this.#grants.set(input.capabilityId, grant);
    return grant;
  }

  async revoke(input: CapabilityRevokeRequest): Promise<OpaqueCapabilityGrant> {
    await this.#append("CAPABILITY_REVOKE_ATTEMPT", input);
    const current = this.#grants.get(input.capabilityId);
    const scope = await this.#scopeService.getScope(input.engagementId);
    const approval = await this.#approvalService.getApproval(input.approvalId);
    if (
      current === undefined
      || current.engagementId !== input.engagementId
    ) {
      throw new ControlPlaneError("CAPABILITY_NOT_FOUND");
    }
    if (scope === undefined) {
      throw new ControlPlaneError("DEPENDENCY_UNHEALTHY");
    }
    if (!approvalMatches(approval, {
      engagementId: input.engagementId,
      scopeGeneration: scope.scopeGeneration,
      policyDigest: scope.policyDigest,
      actionDigest: input.actionDigest,
      requesterId: input.actorId,
      nowEpochMs: input.nowEpochMs
    })) {
      throw new ControlPlaneError("HUMAN_APPROVAL_REQUIRED");
    }
    await this.#approvalService.consume({
      engagementId: input.engagementId,
      actorId: input.actorId,
      actionDigest: input.actionDigest,
      nowEpochMs: input.nowEpochMs,
      approvalId: input.approvalId,
      scopeGeneration: scope.scopeGeneration,
      policyDigest: scope.policyDigest
    });
    const revoked = Object.freeze({...current, state: "revoked" as const});
    this.#grants.set(current.capabilityId, revoked);
    return revoked;
  }

  async #append(
    eventType: string,
    input: CapabilityIssueRequest | CapabilityRevokeRequest
  ): Promise<void> {
    try {
      await this.#auditSink.append(this.#auditFactory.create({
        ...input,
        eventType,
        approvalId: input.approvalId
      }));
    } catch {
      throw new ControlPlaneError("AUDIT_APPEND_FAILED");
    }
  }
}
