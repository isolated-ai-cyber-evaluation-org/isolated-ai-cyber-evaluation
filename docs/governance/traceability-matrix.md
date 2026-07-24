# Requirements traceability matrix

Every row maps a normative requirement to design evidence and a verification ID. Phase 02 IDs are intentionally future tests and are not claimed as executed in Phase 01.

## Security invariants

| Requirement ID | Requirement | Design evidence | Verification |
| --- | --- | --- | --- |
| INV-01 | Four separate trust boundaries | `ARCHITECTURE.md` §3; `security/trust-boundaries.md` | ARCH-003; ISO-001 |
| INV-02 | No shared IAM/credentials/network/hosts | `security/trust-boundaries.md`; `security/iam-model.md` | ARCH-003; IAM-001; ISO-002 |
| INV-03 | No CR path to Internet/corporate/production | `security/network-matrix.md` DENY-001..003 | ARCH-004; NET-001 |
| INV-04 | EP egress default deny | `security/network-matrix.md` NET-007/DENY-004 | ARCH-004; NET-002 |
| INV-05 | Metadata/Docker/Kubernetes admin unreachable | `security/network-matrix.md` DENY-007..010 | ARCH-004; NET-003 |
| INV-06 | Signed machine-readable Scope/ROE | `governance/authorization-model.md`; schemas | SCH-001..004; SUPPLY-001 |
| INV-07 | Model cannot change Scope | `design/api-boundaries.md`; IAM model | POL-002; IAM-002 |
| INV-08 | Every tool via Policy + Tool Gateway | `design/execution-plane.md`; `design/api-boundaries.md` | POL-001..005; ARCH-006 |
| INV-09 | Human approval for state/exploit/credential | `governance/authorization-model.md`; ADR-014 | SCH-004; POL-003 |
| INV-10 | Broker holds credentials; no model/env/file | `security/credential-model.md`; ADR-009 | ARCH-006; CRED-001 |
| INV-11 | Credentials target/purpose/short-lived | `security/credential-model.md` Binding | POL-003; CRED-002 |
| INV-12 | All operations to independent OP | `design/observability.md`; audit-flow diagram | ARCH-003/005; OBS-001 |
| INV-13 | Execution cannot modify audit | `security/network-matrix.md` DENY-011; ADR-007/011 | ARCH-004; OBS-002 |
| INV-14 | Stop on escape/escalation/persistence/tamper/comms | `governance/incident-response.md`; ROE schema | SCH-004; POL-006; STOP-001 |
| INV-15 | No automatic merge/deploy/production apply | `design/scoring.md`; `AGENTS.md` | ARCH-006; AI-004 |
| INV-16 | No production/real personal/secret data | `governance/data-handling.md`; scenario schema | SCH-004; SUPPLY-002 |
| INV-17 | Synthetic data/dummy credentials/safe markers | `design/cyber-range.md`; examples | SCH-002/003; AI-001 |
| INV-18 | Unknown decisions recorded | `assumptions.md`; `security/risk-register.md` | DOC-002 |

## Completion criteria

| Requirement ID | Requirement | Design evidence | Verification |
| --- | --- | --- | --- |
| DONE-01 | Four planes and boundaries explicit | `ARCHITECTURE.md`; trust boundaries | ARCH-003 |
| DONE-02 | Allowed/denied communication matrix | network matrix | ARCH-004 |
| DONE-03 | Scope/ROE JSON Schema validation | engagement/ROE schemas and examples | SCH-001/002 |
| DONE-04 | Dangerous approval state machine | `design/state-machines.md`; diagram 05 | ARCH-005; POL-003 |
| DONE-05 | Credentials hidden from model | credential model; API boundaries | ARCH-006; CRED-001 |
| DONE-06 | Stop conditions/fail-close defined | incident response; ROE schema | SCH-004; POL-006 |
| DONE-07 | Complete range destruction | reset/destruction design | ARCH-006; DEST-001 |
| DONE-08 | Target and agent scoring | scoring design; score schema | SCH-001; AI-003 |
| DONE-09 | Five required threat actors | threat model §4 | ARCH-006 |
| DONE-10 | High risks registered | risk register | DOC-002 |
| DONE-11 | Decisions tracked as ADR | ADR-001..014 | ARCH-006 |
| DONE-12 | Requirement-design-test traceability | this file | DOC-001 |
| DONE-13 | Major unresolved matters explicit | assumptions and risk register | DOC-002 |
| DONE-14 | Design review checklist | `reviews/design-review-checklist.md` | DOC-003 |
| DONE-15 | Dependency-ordered next phase plan | `design/implementation-roadmap.md` | DOC-003 |

## Non-functional requirements

| Requirement set | Design evidence | Verification |
| --- | --- | --- |
| default deny / least privilege / complete mediation / fail-close | security principles、IAM、API boundaries | POL-001..006; NET/IAM Phase 02 |
| SoD / defense in depth / compartmentalization | trust boundaries、IAM、ADR-007/014 | ARCH-003; IAM Phase 02 |
| audit / reproducibility / evidence as code | observability、evidence retention、schemas | SCH/OBS Phase 02 |
| disposability / idempotency / rollback | reset/destruction、state machines、roadmap | DEST/STOP Phase 02 |
| supply-chain integrity / SBOM / pin / signatures | ADR-004/008、cyber range | SUPPLY Phase 02 |
| IaC / Policy as Code / testability | ADR-003/004、verification plan | POL and Phase 02 CI |
