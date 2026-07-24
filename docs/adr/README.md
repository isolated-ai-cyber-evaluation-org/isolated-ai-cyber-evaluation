# Architecture Decision Records

Status values: `Accepted for design` means the Phase 01 baseline; implementation still requires validation and risk gates.

| ADR | Decision | Status |
| --- | --- | --- |
| [ADR-001](001-isolation-unit.md) | VM/microVM/container isolation roles | Accepted for design |
| [ADR-002](002-virtualization-stack.md) | Firecracker + KVM/libvirt; Kata conditional | Accepted for design |
| [ADR-003](003-policy-engine.md) | OPA as reference Policy Engine | Accepted for design |
| [ADR-004](004-iac-tooling.md) | OpenTofu as primary IaC | Accepted for design |
| [ADR-005](005-kubernetes-control-plane.md) | Kubernetes constrained to control services | Accepted with risks |
| [ADR-006](006-local-vs-cloud.md) | Local-first baseline, cloud parity later | Accepted for design |
| [ADR-007](007-observability-separation.md) | Separate OP account/project and admin domain | Accepted for design |
| [ADR-008](008-package-mirror.md) | Offline curated immutable mirror | Accepted for design |
| [ADR-009](009-secret-management.md) | HSM/KMS-backed brokered credentials | Accepted; product open |
| [ADR-010](010-message-queue.md) | NATS JetStream candidate with constrained use | Accepted; benchmark required |
| [ADR-011](011-worm-evidence.md) | Object-lock WORM + hash checkpoints | Accepted; product open |
| [ADR-012](012-telemetry-stack.md) | OpenTelemetry-first vendor-neutral pipeline | Accepted for design |
| [ADR-013](013-model-context-minimization.md) | Least-context, structured tools, no built-in execution | Accepted for design |
| [ADR-014](014-human-approval-boundaries.md) | Content-bound one-shot approvals | Accepted for design |

ADR precedence is below `AGENTS.md` security invariants. A change that weakens an invariant is invalid even if documented as an ADR.
