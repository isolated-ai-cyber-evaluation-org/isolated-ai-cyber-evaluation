# Phase 2 repository skeleton

## Purpose

Phase 2 translates approved design contracts into a type-checked, testable, non-executable skeleton. It deliberately contains no HTTP server、shell/process adapter、network client、cloud SDK、database、container/VM driver、credential value、exploit logic。

## Directory structure

| Path | Purpose | Runtime effect |
| --- | --- | --- |
| `src/domain/` | branded IDs and immutable domain types | none |
| `src/api/` | model-visible ID-only request unions and envelopes | none |
| `src/interfaces/` | Policy、Scope、Approval、Tool Gateway、append-only audit ports | none |
| `src/policy/` | pure reference policy and fail-closed wrapper | deterministic memory-only decision |
| `src/state/` | explicit transition tables | deterministic memory-only transition |
| `src/stubs/` | in-memory repositories、unavailable Policy、deny-only gateway | no external I/O |
| `schemas/` | ten Draft 2020-12 schemas | validation contract |
| `api/` | OpenAPI 3.1 interface-only contract | no server declaration |
| `policy/` | Rego rule skeleton | not deployed |
| `tests/unit/` | Scope、approval、outage、state negative tests | local test only |
| `tests/architecture/` | prohibited primitive and design invariant tests | repository inspection only |
| `.github/workflows/` | validation-only CI | no deploy/write credential |

## Non-executable boundary

There are two independent gates:

1. `PolicyEngine.evaluate()` returns `PERMIT`, `REQUIRE_APPROVAL`, `DENY`, `INDETERMINATE`, or `TERMINATE`.
2. `DenyOnlyToolGateway.request()` converts all non-permit outcomes to deny/stop and converts even `PERMIT` to:

```json
{
  "status": "not-implemented",
  "reasonCode": "EXECUTION_DISABLED",
  "policyResult": "PERMIT"
}
```

No interface exists below the Tool Gateway for command、HTTP、network、filesystem、cloud、container、VM or credential execution.

## Scope enforcement

`PurePolicyEngine` receives a trusted `ScopeCatalog` and checks every ID carried by the discriminated tool request:

- engagement
- target/scenario/repository
- test case/test suite/profile
- PoC metadata ID
- execution/finding/patch references
- allowed tool name

The model cannot supply an address or command. Runtime JSON must first pass `tool-request.schema.json`, which rejects unknown properties.

## Approval

State change、exploit validation、credential-use classification is trusted catalog context, not a model argument. Approval is valid only when engagement、Scope generation、Policy digest、action digest、expiry、one remaining use and requester/approver separation all match.

Phase 2 never handles a credential profile, credential value, token, password, key or Broker session. `credential_use` is only a policy classification used to demonstrate mandatory approval.

## Policy outage

`FailClosedPolicyEngine` catches delegate exceptions or malformed results and returns:

`INDETERMINATE / POLICY_ENGINE_UNAVAILABLE`

The deny-only Tool Gateway converts this to `denied / POLICY_INDETERMINATE`.

## State machines

Engagement、Approval、Job、Runner states use explicit transition tables. Missing transitions throw `InvalidTransitionError`; there is no permissive default. Tests cover terminal-state reuse、Policy-step skipping、evidence-step skipping、approval replay and Runner reuse.

## CI permissions

CI has `contents: read` only, retains no checkout credential, uses pinned action commit SHAs, installs with `--ignore-scripts`, and runs validation/audit/SBOM only. It defines no deployment environment、cloud identity federation、package publish or artifact execution.

## Deliberately absent

- service entry point/listener
- model API client
- shell/process execution
- arbitrary HTTP or socket client
- cloud/IaC implementation
- exploit/PoC body
- secret/credential storage or delivery
- Runner/range provisioning
- audit/WORM backend

Adding any of these requires a later approved execution plan, ADR/risk review, and new trust-boundary tests.
