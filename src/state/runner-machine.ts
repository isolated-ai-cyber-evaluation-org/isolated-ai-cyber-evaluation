import {
  transition,
  type TransitionTable
} from "./state-machine.ts";

export type RunnerState =
  | "REQUESTED"
  | "CREATED"
  | "ATTESTING"
  | "READY"
  | "ASSIGNED"
  | "QUARANTINED"
  | "EVIDENCE_SEALED"
  | "DESTROY_PENDING"
  | "DESTROYED";

export type RunnerEvent =
  | "CREATE"
  | "ATTEST"
  | "ATTESTATION_PASS"
  | "ATTESTATION_FAIL"
  | "ASSIGN"
  | "QUARANTINE"
  | "SEAL_EVIDENCE"
  | "BEGIN_DESTROY"
  | "DESTROY_SUCCESS"
  | "DESTROY_PARTIAL";

export const runnerTransitions: TransitionTable<
  RunnerState,
  RunnerEvent
> = {
  REQUESTED: {CREATE: "CREATED"},
  CREATED: {ATTEST: "ATTESTING"},
  ATTESTING: {
    ATTESTATION_PASS: "READY",
    ATTESTATION_FAIL: "DESTROY_PENDING"
  },
  READY: {ASSIGN: "ASSIGNED"},
  ASSIGNED: {QUARANTINE: "QUARANTINED"},
  QUARANTINED: {
    SEAL_EVIDENCE: "EVIDENCE_SEALED",
    BEGIN_DESTROY: "DESTROY_PENDING"
  },
  EVIDENCE_SEALED: {BEGIN_DESTROY: "DESTROY_PENDING"},
  DESTROY_PENDING: {
    DESTROY_SUCCESS: "DESTROYED",
    DESTROY_PARTIAL: "QUARANTINED"
  }
};

export function transitionRunner(
  state: RunnerState,
  event: RunnerEvent
): RunnerState {
  return transition("runner", runnerTransitions, state, event);
}
