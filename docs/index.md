# Documentation index

## Start here

- [Repository mission and validation](../README.md)
- [Architecture](../ARCHITECTURE.md)
- [Agent operating rules](../AGENTS.md)
- [Active Phase 03 plan](exec-plans/active/phase-03-control-plane-mvp.md)
- [Completed Phase 01 plan](exec-plans/completed/phase-01-design.md)
- [Completed Phase 02 plan](exec-plans/completed/phase-02-repository-skeleton.md)
- [Assumptions](assumptions.md)

## Security

- [Security principles](security/security-principles.md)
- [Threat model](security/threat-model.md)
- [Trust boundaries](security/trust-boundaries.md)
- [Data-flow diagrams](security/data-flow-diagrams.md)
- [Network matrix](security/network-matrix.md)
- [IAM model](security/iam-model.md)
- [Credential model](security/credential-model.md)
- [Prompt-injection model](security/prompt-injection-model.md)
- [Abuse cases](security/abuse-cases.md)
- [Risk register](security/risk-register.md)

## Governance

- [Authorization model](governance/authorization-model.md)
- [Rules of Engagement](governance/rules-of-engagement.md)
- [Data handling](governance/data-handling.md)
- [Evidence retention](governance/evidence-retention.md)
- [Incident response](governance/incident-response.md)
- [Traceability matrix](governance/traceability-matrix.md)
- [Phase 2 traceability](governance/phase-02-traceability.md)
- [Phase 3 traceability](governance/phase-03-traceability.md)
- [Verification plan](governance/verification-plan.md)

## Component design

- [Control plane](design/control-plane.md)
- [Execution plane](design/execution-plane.md)
- [Cyber range](design/cyber-range.md)
- [Observability](design/observability.md)
- [Scoring](design/scoring.md)
- [Reset and destruction](design/reset-and-destruction.md)
- [API boundaries](design/api-boundaries.md)
- [State machines](design/state-machines.md)
- [Phase 2 repository skeleton](design/repository-skeleton.md)
- [Next-phase implementation roadmap](design/implementation-roadmap.md)

## Decisions and review

- [ADR index](adr/README.md)
- [Design review checklist](reviews/design-review-checklist.md)

## Machine-readable artifacts

- JSON Schemas: [`schemas/`](../schemas/)
- Synthetic examples: [`examples/`](../examples/)
- Mermaid sources: [`diagrams/`](../diagrams/)
- Architecture tests: [`tests/architecture/`](../tests/architecture/)
- Policy tests: [`tests/policy/`](../tests/policy/)
- Control Plane integration tests: [`tests/integration/`](../tests/integration/)
- Schema tests: [`tests/schemas/`](../tests/schemas/)

## Status legend

- **Normative**: `AGENTS.md`, approved ADRs, `ARCHITECTURE.md`, security and governance documents.
- **Design contract**: component documents, schemas, policy interface, network matrix.
- **Illustrative**: examples and diagrams. They may not broaden normative authorization.
- **Open**: assumptions and risk register entries with unresolved owner decisions.
