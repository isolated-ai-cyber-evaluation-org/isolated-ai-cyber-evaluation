import type {ModelToolRequest} from "../api/model-tools.ts";
import type {OperationContext} from "../domain/control-plane.ts";
import type {ApprovalId} from "../domain/ids.ts";
import type {
  ActionClass,
  PolicyDecision
} from "../policy/types.ts";

export interface AuthorizationAttempt extends OperationContext {
  readonly request: ModelToolRequest;
  readonly actionClass: ActionClass;
  readonly approvalId?: ApprovalId;
}

export interface PolicyEngineAdapter {
  authorize(input: AuthorizationAttempt): Promise<PolicyDecision>;
}
