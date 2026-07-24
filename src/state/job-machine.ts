import {
  transition,
  type TransitionTable
} from "./state-machine.ts";

export type JobState =
  | "PLANNED"
  | "POLICY_CHECK"
  | "WAITING_APPROVAL"
  | "DENIED"
  | "QUEUED"
  | "PROVISIONING"
  | "RUNNING"
  | "COLLECTING"
  | "COMPLETED"
  | "STOPPING"
  | "QUARANTINED"
  | "DESTROYED";

export type JobEvent =
  | "CHECK_POLICY"
  | "REQUIRE_APPROVAL"
  | "DENY"
  | "PERMIT"
  | "APPROVAL_GRANTED"
  | "APPROVAL_REJECTED"
  | "PROVISION"
  | "START"
  | "ACTION_COMPLETE"
  | "SEAL_EVIDENCE"
  | "STOP"
  | "QUARANTINE"
  | "DESTROY";

export const jobTransitions: TransitionTable<JobState, JobEvent> = {
  PLANNED: {CHECK_POLICY: "POLICY_CHECK", STOP: "STOPPING"},
  POLICY_CHECK: {
    REQUIRE_APPROVAL: "WAITING_APPROVAL",
    DENY: "DENIED",
    PERMIT: "QUEUED",
    STOP: "STOPPING"
  },
  WAITING_APPROVAL: {
    APPROVAL_GRANTED: "POLICY_CHECK",
    APPROVAL_REJECTED: "DENIED",
    STOP: "STOPPING"
  },
  QUEUED: {PROVISION: "PROVISIONING", STOP: "STOPPING"},
  PROVISIONING: {START: "RUNNING", STOP: "STOPPING"},
  RUNNING: {ACTION_COMPLETE: "COLLECTING", STOP: "STOPPING"},
  COLLECTING: {SEAL_EVIDENCE: "COMPLETED", STOP: "STOPPING"},
  STOPPING: {QUARANTINE: "QUARANTINED"},
  QUARANTINED: {DESTROY: "DESTROYED"},
  COMPLETED: {DESTROY: "DESTROYED"}
};

export function transitionJob(state: JobState, event: JobEvent): JobState {
  return transition("job", jobTransitions, state, event);
}
