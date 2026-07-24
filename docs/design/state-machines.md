# State machines

All transitions use compare-and-set with idempotency key and append an audit event. Unknown or invalid transitions fail closed.

## Engagement

```mermaid
stateDiagram-v2
  [*] --> DRAFT
  DRAFT --> SUBMITTED: schema complete
  SUBMITTED --> AUTHORIZED: signatures valid
  SUBMITTED --> REJECTED: validation/review fails
  AUTHORIZED --> READY: range + telemetry preflight
  READY --> ACTIVE: first job dispatch
  ACTIVE --> SUSPENDED: health/review hold
  SUSPENDED --> ACTIVE: independent resume approval
  ACTIVE --> TERMINATING: stop/expiry/operator
  READY --> TERMINATING: cancel/expiry
  TERMINATING --> CLOSED: revoke + destroy + evidence seal
  REJECTED --> [*]
  CLOSED --> [*]
```

Scope expansion creates a new Engagement generation; it does not mutate `ACTIVE`.

## Approval

```mermaid
stateDiagram-v2
  [*] --> REQUESTED
  REQUESTED --> UNDER_REVIEW: eligible approver opens
  REQUESTED --> EXPIRED: TTL
  UNDER_REVIEW --> APPROVED: bound digest accepted
  UNDER_REVIEW --> REJECTED: decision
  UNDER_REVIEW --> EXPIRED: TTL
  APPROVED --> CONSUMED: one matching dispatch
  APPROVED --> REVOKED: approver/incident/scope change
  APPROVED --> EXPIRED: TTL
  CONSUMED --> [*]
  REJECTED --> [*]
  REVOKED --> [*]
  EXPIRED --> [*]
```

Parameter、target、tool、profile、budget、credential、scope/policy generation changes invalidate approval and require a new request.

## Job

```mermaid
stateDiagram-v2
  [*] --> PLANNED
  PLANNED --> POLICY_CHECK
  POLICY_CHECK --> WAITING_APPROVAL: required
  POLICY_CHECK --> DENIED: deny/indeterminate
  WAITING_APPROVAL --> POLICY_CHECK: approved
  WAITING_APPROVAL --> DENIED: rejected/expired
  POLICY_CHECK --> QUEUED: permit
  QUEUED --> PROVISIONING
  PROVISIONING --> RUNNING: runner attested
  RUNNING --> COLLECTING: action complete
  RUNNING --> STOPPING: stop condition
  COLLECTING --> COMPLETED: evidence sealed
  COLLECTING --> STOPPING: evidence/health failure
  STOPPING --> QUARANTINED
  QUARANTINED --> DESTROYED: evidence deadline + teardown
  COMPLETED --> DESTROYED: normal teardown
  DENIED --> [*]
  DESTROYED --> [*]
```

## Runner lifecycle

```mermaid
stateDiagram-v2
  [*] --> REQUESTED
  REQUESTED --> CREATED: signed image + quota
  CREATED --> ATTESTING
  ATTESTING --> READY: measurements/policy match
  ATTESTING --> DESTROY_PENDING: mismatch
  READY --> ASSIGNED: one job
  ASSIGNED --> QUARANTINED: completion or alert
  QUARANTINED --> EVIDENCE_SEALED
  EVIDENCE_SEALED --> DESTROY_PENDING
  DESTROY_PENDING --> DESTROYED: zero residual
  DESTROY_PENDING --> QUARANTINED: partial failure
  DESTROYED --> [*]
```

Runner never returns from `ASSIGNED/QUARANTINED` to `READY`.

## Finding and patch loop

`CANDIDATE → EVIDENCE_PENDING → VALIDATED | REJECTED → PATCH_PROPOSED → HUMAN_REVIEW → APPLIED_TO_DISPOSABLE_CLONE → REVALIDATED → CLOSED | RESIDUAL_RISK`

`PATCH_PROPOSED` has no production effect. Application and validation remain approval- and Scope-bound.

## Stop dominance

`TERMINATING`/`STOPPING` dominates ordinary transitions. Once entered, no action may resume in the same job/Runner. Resume creates a new execution after incident review.

## Phase 2 realization

The skeleton encodes explicit transition tables in:

- `src/state/engagement-machine.ts`
- `src/state/approval-machine.ts`
- `src/state/job-machine.ts`
- `src/state/runner-machine.ts`

`src/state/state-machine.ts` performs compare-before-transition and throws `InvalidTransitionError` for every missing edge. It has no persistence、scheduler、Runner or side effect. In particular, the negative tests prove that a job cannot skip Policy or evidence collection、an approval cannot be replayed after consumption、a destroyed Runner cannot be reused and partial destruction cannot be declared complete.

The Mermaid state diagrams remain normative. `tests/unit/state-machines.test.ts` is the Phase 2 executable conformance subset; future transition additions require coordinated diagram、table、negative-test and traceability updates.

## Phase 3 stateful services

`LocalEngagementService` applies the existing Engagement transition table and increments
a memory-only revision after a successful audit attempt and, where required, one-shot
approval consumption. `LocalApprovalService` applies the existing Approval transition
table for request、review、approve and consume. Missing edges still throw
`InvalidTransitionError`; Phase 3 adds no permissive transition.

Emergency Stop is a separate dominant latch rather than a resumable state-machine edge.
Once active, Policy returns `TERMINATE/STOP_ACTIVE`; the MVP exposes no clear/reset
method. A new execution after incident review remains a future, separately approved
operation.
