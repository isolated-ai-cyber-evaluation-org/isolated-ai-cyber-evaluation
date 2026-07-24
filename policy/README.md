# Policy-as-Code design contract

`authorization.rego` is the Rego rule skeleton. It is not a deployed policy bundle. `tests/policy/policy-cases.json` defines required allow/deny/approval/terminate/fail-closed behavior and is executable without a live target.

Phase 2 also provides a pure TypeScript reference decision function and an unavailable-engine stub:

- `src/policy/pure-policy-engine.ts`
- `src/policy/fail-closed-policy-engine.ts`
- `src/stubs/unavailable-policy-engine.ts`
- `src/stubs/deny-only-tool-gateway.ts`

Every Rego result contains `execution_authorized: false`. `PERMIT` means only that deterministic policy conditions passed; the deny-only Tool Gateway still returns `EXECUTION_DISABLED`.

Phase 02 must:

- pin OPA version and bundle format
- sign and verify policy bundles
- run `opa fmt`, `opa check --strict`, `opa test`, coverage and mutation tests
- prove undefined、compile error、timeout、unavailable become `INDETERMINATE` and no execution
- bind the policy digest into approvals、jobs、events and evidence

The policy never accepts a raw URL/IP/hostname/command or returns credentials.
