import assert from "node:assert/strict";
import test from "node:test";
import {transitionApproval} from "../../src/state/approval-machine.ts";
import {transitionEngagement} from "../../src/state/engagement-machine.ts";
import {transitionJob} from "../../src/state/job-machine.ts";
import {transitionRunner} from "../../src/state/runner-machine.ts";
import {InvalidTransitionError} from "../../src/state/state-machine.ts";

test("engagement follows authorized lifecycle", () => {
  let state = transitionEngagement("DRAFT", "SUBMIT");
  state = transitionEngagement(state, "AUTHORIZE");
  state = transitionEngagement(state, "PREFLIGHT_PASS");
  state = transitionEngagement(state, "ACTIVATE");
  state = transitionEngagement(state, "TERMINATE");
  state = transitionEngagement(state, "CLOSE");
  assert.equal(state, "CLOSED");
});

test("STATE-101 closed engagement cannot resume", () => {
  assert.throws(
    () => transitionEngagement("CLOSED", "RESUME"),
    InvalidTransitionError
  );
});

test("approval is one-shot and cannot be reapproved", () => {
  let state = transitionApproval("REQUESTED", "START_REVIEW");
  state = transitionApproval(state, "APPROVE");
  assert.equal(transitionApproval(state, "CONSUME"), "CONSUMED");
  assert.throws(
    () => transitionApproval("APPROVED", "APPROVE"),
    InvalidTransitionError
  );
  assert.throws(
    () => transitionApproval("CONSUMED", "CONSUME"),
    InvalidTransitionError
  );
});

test("STATE-102 job cannot skip Policy check or evidence collection", () => {
  assert.throws(() => transitionJob("PLANNED", "PERMIT"), InvalidTransitionError);
  assert.throws(
    () => transitionJob("RUNNING", "SEAL_EVIDENCE"),
    InvalidTransitionError
  );
});

test("job stop dominates execution lifecycle", () => {
  let state = transitionJob("PLANNED", "CHECK_POLICY");
  state = transitionJob(state, "PERMIT");
  state = transitionJob(state, "PROVISION");
  state = transitionJob(state, "START");
  state = transitionJob(state, "STOP");
  state = transitionJob(state, "QUARANTINE");
  state = transitionJob(state, "DESTROY");
  assert.equal(state, "DESTROYED");
});

test("STATE-103 Runner cannot be reused", () => {
  let state = transitionRunner("REQUESTED", "CREATE");
  state = transitionRunner(state, "ATTEST");
  state = transitionRunner(state, "ATTESTATION_PASS");
  state = transitionRunner(state, "ASSIGN");
  state = transitionRunner(state, "QUARANTINE");
  assert.throws(
    () => transitionRunner(state, "ATTESTATION_PASS"),
    InvalidTransitionError
  );
});

test("partial destroy returns Runner to quarantine only", () => {
  let state = transitionRunner("QUARANTINED", "SEAL_EVIDENCE");
  state = transitionRunner(state, "BEGIN_DESTROY");
  state = transitionRunner(state, "DESTROY_PARTIAL");
  assert.equal(state, "QUARANTINED");
  assert.throws(
    () => transitionRunner(state, "ASSIGN"),
    InvalidTransitionError
  );
});
