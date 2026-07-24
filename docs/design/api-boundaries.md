# API boundaries

## General envelope

Every request across a trust boundary carries:

```json
{
  "schema_version": "v1",
  "request_id": "req_...",
  "engagement_id": "eng_...",
  "scope_generation": 1,
  "execution_id": "exe_...",
  "issued_at": "RFC3339",
  "expires_at": "RFC3339",
  "nonce": "...",
  "payload_digest": "sha256:..."
}
```

Caller identity comes from mTLS/workload authentication, not a body field. Receiver verifies audience、nonce、expiry、signature/digest、schema and reauthorizes locally.

## Model-visible tools

The model receives only narrow, ID-based functions:

| Tool | Model arguments | Effect | Approval |
| --- | --- | --- | --- |
| `get_engagement()` | none | current immutable summary | no |
| `get_authorized_targets()` | none | authorized target IDs/capabilities | no |
| `get_allowed_test_cases()` | optional target ID | allowed IDs and constraints | no |
| `run_static_analysis(repository_id, profile_id)` | authorized IDs | scanner job on synthetic/authorized repository snapshot | no unless profile changes state |
| `run_safe_network_discovery(target_id, profile_id)` | authorized IDs | bounded known-target discovery | profile-dependent; never broad scan |
| `run_web_test(target_id, test_case_id)` | authorized IDs | one fixed web test | state/risk dependent |
| `request_poc_validation(target_id, poc_id)` | authorized IDs | creates approval-bound validation request | always |
| `collect_evidence(execution_id)` | current/authorized execution ID | returns evidence references/derivative | no |
| `propose_patch(finding_id)` | finding ID | creates patch proposal artifact only | no |
| `validate_patch(patch_id, test_suite_id)` | approved disposable clone IDs | runs validation; no protected merge | patch application requires approval |
| `reset_range(scenario_id)` | authorized scenario ID | destroy-and-recreate instance | always human/range policy |
| `terminate_engagement(engagement_id)` | current engagement ID | stop/revoke/quarantine | no approval; stopping is always permitted |

The server determines current engagement from authenticated workflow context; model-supplied IDs must match it.

## Prohibited API shapes

The model-to-tool boundary permits no raw command/URL/IP input and no equivalent hostname, repository path, or cloud-resource escape hatch.

- `run(command: string)`
- `shell(args: string)`
- `fetch(url: string)`
- `scan(ip_or_cidr: string, ports: string)`
- `ssh(host, username, password, command)`
- `kubectl(kubeconfig, args)`
- `cloud(provider, credential, resource_arn, action)`
- any endpoint accepting raw URL/IP/hostname/repository path/cloud resource/command from the model
- generic proxy, arbitrary HTTP, remote MCP registration, plugin install, package install

Adding such a primitive violates architecture even if prompt instructions say “use safely.”

## Server-side resolution

`target_id` resolves through the signed target catalog to:

- immutable target type and scenario membership
- allowed address set/ports/protocols
- allowed test/profile IDs
- credential profile IDs
- state-changing/approval attributes
- health and stop thresholds

The model never sees or overrides routing metadata unless a redacted address is necessary in human evidence. Tool Gateway rejects unknown/mismatched IDs before creating a firewall lease.

## Tool request validation

Order is security-significant:

1. authenticate caller and schema-validate
2. load pinned Engagement/ROE/target/tool snapshots
3. verify time/status/revocation
4. resolve IDs server-side
5. compute canonical action digest
6. obtain Policy Engine decision
7. resolve Human Approval by digest if required
8. re-check budgets/concurrency/rate/retry
9. obtain credential profile handle if allowed
10. create exact firewall lease
11. invoke fixed adapter digest
12. collect/audit result and close lease/handle

Failures after step 8 trigger cleanup; no orphan lease or credential.

## Result contract

```json
{
  "execution_id": "exe_...",
  "status": "succeeded|failed|denied|stopped|waiting_approval",
  "reason_code": "stable_machine_code",
  "finding_ids": [],
  "evidence_ids": [],
  "redacted_summary": "...",
  "budgets_used": {},
  "policy_decision_id": "pdec_...",
  "approval_id": null
}
```

No raw secret、credential、unbounded stdout、active HTML、arbitrary binary is returned to the model. Evidence access returns references and safe derivatives.

## Errors

Stable errors include:

- `SCOPE_MISMATCH`
- `ROE_PROHIBITED`
- `APPROVAL_REQUIRED`
- `APPROVAL_MISMATCH`
- `POLICY_INDETERMINATE`
- `TARGET_NOT_FOUND`
- `PROFILE_NOT_ALLOWED`
- `BUDGET_EXCEEDED`
- `DEPENDENCY_UNHEALTHY`
- `STOPPED`
- `OUTPUT_QUARANTINED`

Error text is untrusted data and cannot supply new instructions/options. Automatic retry is limited to explicitly retryable codes and budgets.

## Versioning

Breaking schema/tool semantic changes require a new API version、ADR、policy/test updates and model-profile eval. Active jobs remain pinned. Deprecated versions cannot silently widen parameters.

## Phase 2 realization

Phase 2 implements only contracts and deterministic in-memory decisions:

| Design contract | Skeleton artifact | Enforced property |
| --- | --- | --- |
| Model-visible tool set | `src/api/model-tools.ts`、`schemas/tool-request.schema.json`、`api/openapi.yaml` | exactly 12 named tools; ID and enum arguments only |
| Boundary envelope | `src/api/envelopes.ts` | typed correlation and immutable snapshot references |
| Policy mediation | `src/interfaces/policy-engine.ts`、`src/policy/` | every Tool Gateway request receives a decision; exception/malformed response becomes `INDETERMINATE` |
| Scope and approval lookup | `src/interfaces/scope-service.ts`、`src/interfaces/approval-service.ts` | interfaces expose metadata only; no transport or secret value |
| Tool Gateway | `src/interfaces/tool-gateway.ts`、`src/stubs/deny-only-tool-gateway.ts` | all requests remain non-executable; even `PERMIT` returns `EXECUTION_DISABLED` |
| External API description | `api/openapi.yaml` | interface-only OpenAPI; no server URL or listener implementation |

Phase 2 intentionally stops before steps 9–12 of the server-side resolution flow. It has no Credential Broker adapter、firewall lease、fixed test adapter、Runner or evidence transport. Their absence is tested by `ARCH-201` and is not an implementation gap to be silently filled.
