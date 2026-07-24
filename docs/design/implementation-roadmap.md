# Phase 02 implementation roadmap

This is a dependency-ordered plan only. Phase 01 does not implement or deploy these items.

## Gate 0 — Human decisions

1. approve security invariants, threat model, residual risks and risk owners
2. choose local/cloud deployment and legal region
3. approve OpenAI data-control posture/model version policy
4. choose HSM/KMS/secret broker and OP WORM/SIEM products
5. assign SoD roles、approval quorum、retention schedule、score thresholds
6. approve isolation substrate benchmark and Windows licensing path
7. initialize protected VCS repository、signed commits/releases、CODEOWNERS

No infrastructure work begins before R-001/R-003/R-004/R-007/R-008 owners approve acceptance criteria.

## Increment 1 — Offline contracts and CI

- pin Node/Python/OPA/OpenTofu/toolchain versions
- implement full JSON Schema and cross-document verifier
- implement JCS/DSSE signature verification and test vectors
- implement OPA policy bundle and exhaustive negative/fail-closed tests
- build documentation/link/Mermaid/ADR/traceability checks
- dependency lock、SBOM、secret scan、SLSA-style provenance for repository artifacts

Exit: no network/runtime execution; all contract tests and supply-chain checks pass.

## Increment 2 — Observability root of trust

- create separate OP account/hosts/network/PKI/KMS
- deploy append-only ingest、WORM、hash chain、SIEM/detectors、scorer skeleton
- verify producer cannot read/update/delete; test legal hold and restore
- establish clock/drift and sensor health contracts

Dependency: chosen WORM/KMS/SIEM. Exit: immutable synthetic test events and stop signals verified.

## Increment 3 — Control plane minimum

- Scope/ROE Service、Policy Engine、Approval Service、Emergency Stop
- immutable snapshots and signed policy bundles
- operator FIDO2/OIDC and SoD roles
- Model Gateway in mock mode first; structured proposal schemas
- scheduler state machines without Runner execution

Dependency: Increment 1/2. Exit: authorization replay and fail-closed fault injection pass.

## Increment 4 — Isolated fabric and empty range

- physically/logically isolated CR fabric with no uplink
- range-only DNS/PKI/IdP/mirror skeleton
- route/DNS/IPv4/IPv6 negative tests
- lifecycle asset ledger and destruction verifier

Dependency: approved network design. Exit: independent evidence proves no Internet/corporate/production path.

## Increment 5 — Execution plane benign adapter

- Firecracker host pool、Lifecycle Manager、attestation
- Tool Gateway、quota、dynamic firewall leases、artifact collector
- one benign target and fixed read-only test adapter
- metadata/socket/Kubernetes API negative tests
- emergency stop/revocation/destruction fault injection

Dependency: Increments 2–4. Exit: end-to-end harmless marker test and zero-residual teardown.

## Increment 6 — Credential Broker

- HSM/KMS integration、proxy-auth or sealed memory adapter
- target/purpose/action-bound issuance and immediate revoke
- honey-marker、DLP、log/env/file non-exposure tests

Dependency: chosen product and threat review. Exit: secret never enters model-facing process/context/evidence.

## Increment 7 — Scenario families

In order: Web/API → Linux network → container/Kubernetes target → Windows domain → cloud configuration simulator. Each adds signed images、SBOM、ground truth、sensor coverage、reset/destruction tests before the next.

## Increment 8 — GPT-5.6 and closed loop

- representative model/version/effort evaluation
- Model Gateway live integration with synthetic-only context and `store=false` posture
- injection corpus and canaries
- discovery→validation→patch proposal→approved clone apply→revalidation
- safety and quality scoring calibration

Dependency: all deterministic controls already operational. Exit: agent has no path around Policy/Tool Gateway and cannot see secrets.

## Increment 9 — Pilot and independent assessment

- white/gray-box synthetic pilot
- platform penetration test focused on boundaries, not external targets
- disaster recovery、WORM restore、key rotation、incident exercise
- evidence and score inter-rater review
- go/no-go decision; no automatic production integration

## Rollback

Each increment is separately versioned. Rollback restores a previously signed image/policy/config; it never restores expired approval/credential or broadens Scope. Security-control failure triggers stop and rollback, not bypass.
