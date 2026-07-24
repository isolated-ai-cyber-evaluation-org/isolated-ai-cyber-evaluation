# Phase 2 repository-skeleton traceability

## Implementation requirements

| ID | Requirement | Design | Skeleton artifact | Test |
| --- | --- | --- | --- | --- |
| P2-01 | Directory structure | `docs/design/repository-skeleton.md` | `src/`, `api/`, `tests/`, `.github/workflows/` | ARCH-001 |
| P2-02 | JSON Schema | API boundary and Phase 1 schemas | `schemas/` | SCH-001..004 |
| P2-03 | Typed definitions | least privilege and typed boundary | `src/domain/`, `src/api/` | TYPE-001 |
| P2-04 | API interfaces | `docs/design/api-boundaries.md` | `api/openapi.yaml`, `src/interfaces/` | API-001 |
| P2-05 | Policy rule skeleton | ADR-003、authorization model | `policy/authorization.rego`, `src/policy/` | POL-001..006、POL-101..104 |
| P2-06 | State transitions | `docs/design/state-machines.md` | `src/state/` | STATE-101..103 |
| P2-07 | Test harness | verification plan | `tests/`, `package.json`, `Makefile` | CI-001 |
| P2-08 | CI definition | supply-chain principles | `.github/workflows/ci.yml` | ARCH-202 |
| P2-09 | Documentation validation | documentation requirements | `tests/architecture/test-docs.mjs` | DOC-001..003 |
| P2-10 | Architecture tests | complete mediation and default deny | `tests/architecture/` | ARCH-201..203 |

## Constraints

| ID | Constraint | Enforcement artifact | Test |
| --- | --- | --- | --- |
| P2C-01 | No shell/process implementation | no executor port; import/source scan | ARCH-201 |
| P2C-02 | No cloud resource creation | no runtime dependencies/IaC/cloud imports | ARCH-201 |
| P2C-03 | No exploit validation implementation | PoC is opaque ID only; no payload type | API-001、ARCH-201 |
| P2C-04 | No credential handling | no secret-bearing type/interface/source field | ARCH-201 |
| P2C-05 | Mocks and stubs only | `src/stubs/`, no service entry point | ARCH-201 |

## Completion conditions

| ID | Completion condition | Evidence |
| --- | --- | --- |
| P2D-01 | All schemas validate | SCH-001..004 |
| P2D-02 | Out-of-scope target denied | POL-102 unit test |
| P2D-03 | Unapproved operation denied | POL-103 unit test |
| P2D-04 | Policy outage fails closed | POL-104 unit test |
| P2D-05 | Negative state transitions pass | STATE-101..103 unit tests |
| P2D-06 | Design traceability exists | this document + TRACE-201 |

`PERMIT` is not execution authorization in Phase 2. Schema、Rego and deny-only gateway independently encode this restriction.
