# ADR-003: Policy Engine

Status: Accepted for design  
Date: 2026-07-23

## Context

Every tool call requires deterministic, auditable, fail-closed authorization across signed Scope/ROE, approval, identity, target, action, time, and budgets.

## Decision

Use Open Policy Agent (OPA) as the reference engine with Rego policies, signed immutable bundles, explicit decision schema and per-job bundle digest pinning. The application remains behind a narrow Policy Engine interface so an equivalent engine can replace OPA.

## Alternatives

- Cedar: strong authorization language and analyzability; smaller fit for arbitrary budget/runtime conditions without adjacent logic.
- Casbin: straightforward RBAC/ABAC; weaker fit for rich structured decisions and bundle governance.
- custom code: full control; highest review, consistency, and audit risk.
- cloud-native policy services: vendor integration; portability and offline range constraints.

## Security consequences

Positive: policy-as-code、unit tests、explicit deny、decision traces。Risk: complex Rego can contain logic gaps; OPA availability/cache misuse may become fail-open. Controls require bundle signature、lint/test、deny on undefined/error、no runtime model-written policy.

## Operational consequences

Teams need Rego expertise, bundle release pipeline, performance testing, and decision-log redaction. Bundle rollback is straightforward if signed and pinned.

## Rejected options

- prompt-based policy: not a security boundary.
- custom `if` statements spread across services: incomplete mediation and drift risk.
- remote-only engine without local fail-closed cache rules: availability ambiguity.

## Revisit conditions

Revisit if formal analysis requirements、performance、language safety、or organizational standard favor Cedar/equivalent, provided decision and fail-closed contracts remain.
