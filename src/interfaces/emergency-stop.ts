import type {OperationContext} from "../domain/control-plane.ts";
import type {EngagementId} from "../domain/ids.ts";

export type StopReasonCode =
  | "OPERATOR_STOP"
  | "SCOPE_ESCAPE"
  | "AUDIT_UNAVAILABLE"
  | "POLICY_UNAVAILABLE"
  | "MONITORING_UNHEALTHY";

export interface EmergencyStopActivation extends OperationContext {
  readonly reasonCode: StopReasonCode;
}

export interface EmergencyStop {
  activate(input: EmergencyStopActivation): Promise<void>;
  isBlocked(engagementId: EngagementId): boolean;
  activeReason(engagementId: EngagementId): StopReasonCode | undefined;
}
