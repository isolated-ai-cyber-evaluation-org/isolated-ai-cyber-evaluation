import {
  transition,
  type TransitionTable
} from "./state-machine.ts";

export type EngagementState =
  | "DRAFT"
  | "SUBMITTED"
  | "AUTHORIZED"
  | "READY"
  | "ACTIVE"
  | "SUSPENDED"
  | "TERMINATING"
  | "REJECTED"
  | "CLOSED";

export type EngagementEvent =
  | "SUBMIT"
  | "AUTHORIZE"
  | "REJECT"
  | "PREFLIGHT_PASS"
  | "ACTIVATE"
  | "SUSPEND"
  | "RESUME"
  | "TERMINATE"
  | "CLOSE";

export const engagementTransitions: TransitionTable<
  EngagementState,
  EngagementEvent
> = {
  DRAFT: {SUBMIT: "SUBMITTED"},
  SUBMITTED: {AUTHORIZE: "AUTHORIZED", REJECT: "REJECTED"},
  AUTHORIZED: {PREFLIGHT_PASS: "READY", TERMINATE: "TERMINATING"},
  READY: {ACTIVATE: "ACTIVE", TERMINATE: "TERMINATING"},
  ACTIVE: {SUSPEND: "SUSPENDED", TERMINATE: "TERMINATING"},
  SUSPENDED: {RESUME: "ACTIVE", TERMINATE: "TERMINATING"},
  TERMINATING: {CLOSE: "CLOSED"}
};

export function transitionEngagement(
  state: EngagementState,
  event: EngagementEvent
): EngagementState {
  return transition("engagement", engagementTransitions, state, event);
}
