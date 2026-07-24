# Phase 3 local Control Plane MVP traceability

Phase 3 is executable only as deterministic, memory-only Control Plane logic in a local
Node.js test process. It has no listener、external model client、Runner、range route、
credential material、cloud SDK or exploit adapter.

## Implementation requirements

| ID | Requirement | Design | Artifact | Verification |
| --- | --- | --- | --- | --- |
| P3-01 | Engagement Service | `docs/design/control-plane.md` | `src/services/local-engagement-service.ts` | P3-INT-005/006、ARCH-304 |
| P3-02 | Scope/ROE Service | `docs/governance/rules-of-engagement.md` | `src/interfaces/scope-service.ts`、`src/stubs/in-memory-scope-service.ts` | P3-INT-003、ARCH-302 |
| P3-03 | Policy Engine adapter | ADR-003、API boundaries | `src/services/local-policy-engine-adapter.ts` | P3-INT-002/003/008、ARCH-302 |
| P3-04 | Approval Service | ADR-014、state machines | `src/services/local-approval-service.ts` | P3-INT-004/005、STATE-101..103 |
| P3-05 | Model Gateway abstraction | ADR-013 | `src/interfaces/model-gateway.ts`、`src/stubs/local-model-gateway-fake.ts` | P3-INT-001、ARCH-301 |
| P3-06 | Tool Gateway mock | API boundaries | `src/stubs/local-tool-gateway-mock.ts` | P3-INT-001/002/008、ARCH-203 |
| P3-07 | Credential Broker mock | credential model、ADR-009 | `src/interfaces/credential-broker.ts`、`src/stubs/local-credential-broker-mock.ts` | P3-INT-009、ARCH-305 |
| P3-08 | Emergency Stop | incident response、stop dominance | `src/services/local-emergency-stop-service.ts` | P3-INT-007、ARCH-303 |
| P3-09 | Audit event generation | observability、ADR-007/011 | `src/services/audit-event-factory.ts`、`schemas/audit-event.schema.json` | P3-INT-006、ARCH-304、SCH-001..004 |
| P3-10 | Local composition and harness | ADR-006 | `src/composition/local-control-plane.ts`、`tests/integration/control-plane-mvp.test.ts` | P3-INT-001..010 |

## Constraints

| ID | Constraint | Enforcement artifact | Verification |
| --- | --- | --- | --- |
| P3C-01 | No real sensitive material | opaque capability type/schema; source and repository scan | P3-INT-009、ARCH-305、secret-check |
| P3C-02 | External model remains abstract/fake | `LocalModelGatewayFake`; no model package/network client | ARCH-201、P3-INT-001 |
| P3C-03 | No arbitrary command API | closed model tool union、OpenAPI、source scan | API-001、ARCH-201 |
| P3C-04 | No arbitrary URL/IP API | branded opaque IDs、closed Schema | API-001、SCH-004、ARCH-201 |
| P3C-05 | Every exposed operation is engagement-bound | `OperationContext` and nested OpenAPI paths | ARCH-301、API-001 |
| P3C-06 | Business writes need content-bound approval | Approval binding and one-shot consume | P3-INT-004/005/009 |
| P3C-07 | Audit failure prevents mutation | audit attempt before state update | P3-INT-006、ARCH-304 |

Emergency Stop activation and the Approval decision lifecycle are governance controls,
not requester-initiated business writes. They require an engagement-bound, append-only
audit event but do not recursively require another approval. Stop reduction of authority
remains always available and cannot be blocked by the model or a Runner.

## Completion conditions

| ID | Completion condition | Evidence |
| --- | --- | --- |
| P3D-01 | Scope escape rejected | P3-INT-002 |
| P3D-02 | Expired ROE rejected | P3-INT-003 |
| P3D-03 | Self approval rejected | P3-INT-004 |
| P3D-04 | Audit outage fails closed | P3-INT-006/010 |
| P3D-05 | Kill Switch is model/Runner independent | P3-INT-007、ARCH-303 |
| P3D-06 | Integration suite passes | P3-INT-001..010 |

`PERMIT` is still not execution authority. The local Tool Gateway returns
`MOCK_EXECUTION_DISABLED`, and Phase 2 non-execution controls remain regression gates.
