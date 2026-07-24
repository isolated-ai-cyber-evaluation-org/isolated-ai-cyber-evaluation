# Design verification plan

## Scope

Phase 01 verifies documents, JSON Schemas, synthetic examples, policy decision cases, Mermaid sources, ADR completeness, file/link coverage and traceability. It does not claim runtime isolation, network separation, WORM, credential non-exposure or complete destruction; those require Phase 02 infrastructure and adversarial tests.

## Automated suites

| Suite | IDs | Purpose |
| --- | --- | --- |
| Schema | SCH-001..SCH-004 | compile all Draft 2020-12 schemas、validate examples/fixtures、cross-document constraints、negative cases |
| Policy contract | POL-001..POL-006 | default deny、approval、scope/time/budget、dependency fail-close、stop dominance |
| Architecture | ARCH-001..ARCH-006 | required files、four planes、network deny、diagram coverage、ADR sections、normative terms |
| Documentation | DOC-001..DOC-003 | local links、traceability rows、open-risk/checklist/plan status |
| Type/API skeleton | TYPE-001、API-001 | strict TypeScript interfaces and ID-only OpenAPI |
| Phase 2 policy | POL-101..POL-104 | permit-without-execution、Scope deny、approval deny、outage fail-close |
| State machines | STATE-101..STATE-103 | terminal/replay/skip/reuse negative transitions |
| Non-executable architecture | ARCH-201..ARCH-203 | prohibited imports/fields/artifacts、CI permissions、deny-only boundary |
| Phase 2 traceability | TRACE-201 | Phase 2 requirement/design/artifact/test mapping |

## Phase 02 runtime suites

- NET: route/egress/DNS/IPv4/IPv6/metadata/socket/Kubernetes API negative connectivity
- ISO: microVM/VM boundary、host socket/mount/token absence、cross-engagement isolation
- IAM: cross-plane role denial、SoD、short-lived identity、break-glass constraints
- CRED: proxy/one-use/revoke、env/file/log/model non-exposure、honey marker
- OBS: append-only/WORM/tamper/restore/hash chain、sensor heartbeat
- STOP: every stop condition、dependency outage、race/idempotency、containment latency
- DEST: asset ledger、crypto erase、credential replay failure、zero residual
- AI: injection canary、Scope adherence、finding precision/recall、model/version drift
- SUPPLY: signature/SBOM/provenance、quarantine、revocation、reproducible build

## Evidence standard

Each test result records command、tool/version、time、commit/artifact digest、environment、pass/fail/skip、stdout/stderr reference. A missing tool or unexecuted suite is `NOT EXECUTED`, never `PASS`.

## Acceptance

Phase 01: all automated design suites pass; limitations are recorded in the active plan.  
Phase 02 increments: the corresponding runtime suite passes before enabling the next dependency stage.  
Pilot: independent security review confirms residual Critical risks have an authorized treatment.
