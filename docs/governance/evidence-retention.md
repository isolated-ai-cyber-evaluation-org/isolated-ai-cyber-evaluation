# Evidence retention

## Evidence objectives

Evidence must be attributable、tamper-evident、reproducible、minimized、reviewable and destroyable at policy end. Execution/Range producers can append but cannot read, update, delete, shorten retention, or release a legal hold.

## Retention classes

Concrete durations are unresolved and require Legal/SOC approval. Schemas use stable class IDs, while an environment policy maps each class to an approved duration.

| Class | Intended content | Default access | Deletion condition |
| --- | --- | --- | --- |
| `short-operational` | health/low-value operational metrics | SRE + SOC | duration elapsed, no incident/hold |
| `engagement-standard` | audit、findings、derived evidence、score | engagement reviewer + auditor | duration elapsed, engagement closed |
| `restricted-raw` | PCAP、raw logs、file diffs | limited forensic role | duration elapsed, no open finding/hold |
| `incident-hold` | incident chain of custody | incident/legal roles | explicit two-person hold release |
| `benchmark-baseline` | synthetic ground truth/eval result | evaluation custodians | superseded and approved |

## WORM design

- OP account/project owns object store、KMS、retention policy。
- Compliance/object-lock mode prevents shorten/delete, including ordinary admin.
- Each evidence object has content digest and a signed manifest entry.
- Append events form a per-execution hash chain plus periodic signed checkpoint.
- Cross-failure-domain replica receives immutable checkpoints.
- Legal hold is additive; producer cannot remove it.

Product-specific WORM guarantees remain an open ADR implementation choice.

## Chain of custody

Record:

- evidence ID、execution/job/engagement/target/tool IDs
- producer workload identity and attestation
- collection/start/end/ingest timestamps plus clock uncertainty
- MIME、size、hash algorithm/digest
- source path or sensor (without secret values)
- transformation lineage and tool/version/digest
- classification、retention class、legal hold
- access/export events and reviewer identity

## Access

Query and export require OP-specific human role and purpose. Raw restricted evidence is not sent to GPT. Scores read immutable evidence; they append score records instead of mutating source artifacts.

## Deletion

At retention expiry:

1. verify no legal hold、open incident、active appeal。
2. produce deletion candidate manifest and obtain required approval。
3. destroy object and all replicas/cache/index copies according to storage guarantee。
4. destroy relevant DEK when crypto-shred is part of control。
5. append non-sensitive deletion certificate containing IDs/digests, not content。

Evidence for disposable range destruction is retained separately from the destroyed range.

## Verification

Implementation phase must test update/delete denial、retention shortening denial、legal-hold release policy、digest mismatch detection、restore integrity、replica consistency、expiry deletion completeness。
