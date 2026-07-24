import type {OperationContext} from "../domain/control-plane.ts";
import type {ApprovalId, EngagementId} from "../domain/ids.ts";
import type {
  EngagementEvent,
  EngagementState
} from "../state/engagement-machine.ts";

export interface EngagementRuntimeRecord {
  readonly engagementId: EngagementId;
  readonly state: EngagementState;
  readonly revision: number;
}

export interface EngagementTransitionRequest extends OperationContext {
  readonly event: EngagementEvent;
  readonly approvalId?: ApprovalId;
}

export interface EngagementService {
  get(
    engagementId: EngagementId
  ): Promise<EngagementRuntimeRecord | undefined>;
  transition(
    input: EngagementTransitionRequest
  ): Promise<EngagementRuntimeRecord>;
}
