# Design review checklist

Decision: `APPROVE`, `APPROVE WITH EXPLICIT RISK ACCEPTANCE`, or `REJECT`. “Documented” is not evidence that a runtime control works.

## Authorization and model boundary

- [ ] Engagement/ROE/target/tool catalogs are schema-valid, signature-valid, immutable and cross-referenced.
- [ ] Model and Runner lack write/delete access to Scope、ROE、Policy、Approval。
- [ ] Model-visible tools use IDs/enums only; no arbitrary command/URL/IP/hostname/repository/cloud resource.
- [ ] Every retry and long-running step is reauthorized.
- [ ] State change、exploit validation、credential use require content-bound human approval.
- [ ] GPT model/profile/version/data controls are explicitly approved; built-in execution tools are disabled.

## Plane and network separation

- [ ] CP/EP/CR/OP have separate account/project、network、host/cluster、IAM、PKI、KMS/secret namespace。
- [ ] CR has no uplink、default route、NAT、proxy、VPN、peering、transit to Internet/corporate/production.
- [ ] EP egress is deny-by-default and target flows use short dynamic leases.
- [ ] IPv4/IPv6/DNS/service mesh/host networking are covered.
- [ ] Metadata、Docker/container socket、unexpected Kubernetes API are unreachable.
- [ ] OP producer identities are append-only and cannot query/update/delete.

## Isolation and lifecycle

- [ ] Hostile execution uses microVM/full VM primary boundary; containers are not sole boundary.
- [ ] No plane co-residency or shared management socket/node.
- [ ] Runner is single-job, non-root, read-only base, encrypted ephemeral scratch.
- [ ] Asset ledger includes compute/network/storage/identity/key/cache/queue objects.
- [ ] Stop, revoke, quarantine, evidence seal and destroy are idempotent.
- [ ] Residual scan and credential replay failure are required before destruction certificate.

## Credentials and data

- [ ] Credential Broker uses target/purpose/action/expiry/single-use binding.
- [ ] Secret value cannot reach prompt、tool args、environment、files、logs、artifacts。
- [ ] Synthetic-only admission and real-data/secret quarantine are defined.
- [ ] Model context excludes raw restricted evidence and carries provenance.
- [ ] Provider retention/ZDR/region/contract has Legal and Security approval.

## Monitoring and evidence

- [ ] All normative stop conditions have independent detectors and EP local watchdog coverage.
- [ ] Sensor/policy/telemetry loss causes fail-closed stop.
- [ ] Raw evidence is WORM/object-locked with separate OP KMS and hash checkpoints.
- [ ] Clock drift、sequence gaps、parser failures are evidence and alertable.
- [ ] Retention、legal hold、restore、expiry deletion and evidence access are tested.

## Range and scenarios

- [ ] Scenario images/artifacts are pinned、signed、SBOM/provenance checked and quarantined.
- [ ] DNS/PKI/IdP/mirror are range-only and mirror has no upstream.
- [ ] Windows has no corporate trust or real tenant credential.
- [ ] Target Kubernetes is distinct from control/runner infrastructure.
- [ ] Cloud scenarios are simulators unless a future dedicated ADR authorizes real accounts.
- [ ] Ground truth is hidden from model/target and immutable to scorer inputs.

## Scoring, testing and governance

- [ ] Safety gate cannot be offset by quality score.
- [ ] Precision/recall、evidence、patch/revalidation and injection resistance are calibrated.
- [ ] Negative and fail-closed tests cover every authorization rule/dependency.
- [ ] Traceability has no missing requirement/design/test references.
- [ ] Critical residual risks have owner、evidence、expiry and authorized treatment.
- [ ] Required unexecuted tests are explicitly listed.
- [ ] No automatic merge、deployment、production patch or production credential exists.

## Required reviewers

- Principal Security Architect
- Platform/Virtualization Engineering
- SRE
- Network Security
- Identity/Credential Security
- SOC/Detection Engineering
- Range/Penetration Test Lead
- AI Security/Model Risk
- Legal/Privacy
- Independent Auditor
