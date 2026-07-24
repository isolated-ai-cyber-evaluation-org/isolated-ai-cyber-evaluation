import type {OperationContext} from "../domain/control-plane.ts";
import type {
  ApprovalId,
  CapabilityId,
  ProfileId,
  TargetId
} from "../domain/ids.ts";

export interface OpaqueCapabilityGrant {
  readonly capabilityId: CapabilityId;
  readonly engagementId: OperationContext["engagementId"];
  readonly targetId: TargetId;
  readonly purposeProfileId: ProfileId;
  readonly issuedAtEpochMs: number;
  readonly expiresAtEpochMs: number;
  readonly state: "active" | "revoked";
}

export interface CapabilityIssueRequest extends OperationContext {
  readonly capabilityId: CapabilityId;
  readonly targetId: TargetId;
  readonly purposeProfileId: ProfileId;
  readonly approvalId: ApprovalId;
  readonly expiresAtEpochMs: number;
}

export interface CapabilityRevokeRequest extends OperationContext {
  readonly capabilityId: CapabilityId;
  readonly approvalId: ApprovalId;
}

export interface CredentialBroker {
  issue(input: CapabilityIssueRequest): Promise<OpaqueCapabilityGrant>;
  revoke(input: CapabilityRevokeRequest): Promise<OpaqueCapabilityGrant>;
}
