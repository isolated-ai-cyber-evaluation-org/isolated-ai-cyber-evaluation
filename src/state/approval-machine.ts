import {
  transition,
  type TransitionTable
} from "./state-machine.ts";

export type ApprovalMachineState =
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CONSUMED"
  | "REVOKED"
  | "EXPIRED";

export type ApprovalEvent =
  | "START_REVIEW"
  | "APPROVE"
  | "REJECT"
  | "CONSUME"
  | "REVOKE"
  | "EXPIRE";

export const approvalTransitions: TransitionTable<
  ApprovalMachineState,
  ApprovalEvent
> = {
  REQUESTED: {START_REVIEW: "UNDER_REVIEW", EXPIRE: "EXPIRED"},
  UNDER_REVIEW: {
    APPROVE: "APPROVED",
    REJECT: "REJECTED",
    EXPIRE: "EXPIRED"
  },
  APPROVED: {
    CONSUME: "CONSUMED",
    REVOKE: "REVOKED",
    EXPIRE: "EXPIRED"
  }
};

export function transitionApproval(
  state: ApprovalMachineState,
  event: ApprovalEvent
): ApprovalMachineState {
  return transition("approval", approvalTransitions, state, event);
}
