# IAM model

## Identity domains

| Domain | Examples | Authority | Reuse across planes |
| --- | --- | --- | --- |
| Human | requester、approver、range admin、auditor | corporate IdP federated into each plane | same person may have roles only if SoD policy allows; credentials/sessions are plane-specific |
| Workload | orchestrator、policy、scheduler、tool gateway、sensor | plane-local workload CA/SPIFFE trust domain | prohibited |
| Machine | hypervisor、runner host、collector appliance | plane-local machine identity | prohibited |
| Target | synthetic user/service account、dummy cloud principal | range-local IdP/PKI | prohibited |
| Artifact signer | scenario/image/policy/document release signer | offline or HSM-backed signing domain | verify-only keys may be distributed; signing keys not shared |

## Human roles

| Role | Allowed | Explicitly denied |
| --- | --- | --- |
| Engagement Requester | draft engagement、submit plan、view own results | approve own dangerous action、modify policy、delete evidence |
| Scope Authorizer | sign engagement/ROE and target catalog | execute tool、administer OP evidence |
| Action Approver | approve/reject content-bound action | alter requested action、self-request high-risk approval |
| Policy Administrator | author/test/sign policy bundle | approve engagement、execute range job |
| Range Administrator | provision/reset/destroy synthetic scenario | change Scope、read Credential Broker master |
| Execution Administrator | maintain runner host/tool adapters | alter OP evidence、approve actions |
| Credential Administrator | configure issuance policy/HSM | view model prompts、approve tool use |
| SOC/Incident Responder | receive alerts、invoke stop、quarantine | broaden Scope、resume without review |
| Auditor | read audit/evidence/score、place legal hold | run tools、modify source event |
| Platform SRE | service health and rollback | bypass policy/approval for availability |
| Break-glass Responder | stop and containment only by default | authorize new evaluation action |

## Service authorization matrix

| Caller | Resource | Permission | Constraint |
| --- | --- | --- | --- |
| Scope Service | signed manifest store | read/write snapshot | write only after signature validation; immutable version |
| Orchestrator | Scope/ROE snapshot | read | no write/delete |
| Orchestrator | Model Gateway | invoke approved profile | minimized context; budget |
| Scheduler | EP lifecycle | create/cancel job | signed opaque intent only |
| Policy Engine | manifests/catalog/policy bundle | read | fixed generation per job |
| Tool Gateway | Policy Engine | authorize | every call, no cache past decision TTL |
| Tool Gateway | Range target | scoped connect | dynamic firewall lease |
| Credential adapter | Credential Broker | redeem handle | one operation/audience/target/expiry |
| CP/EP/CR exporter | OP ingest | create append | no read/update/delete/list |
| OP scorer | evidence store | read + append score | no source evidence mutation |
| OP detector | Emergency Stop | invoke stop only | signed reason/event digest |

## Authentication

- Human: OIDC authorization code flow with phishing-resistant FIDO2/WebAuthn MFA; no shared accounts.
- Workload: short-lived mTLS certificate from plane-local CA, hardware-attested where supported.
- Machine: measured boot/TPM-backed identity and host enrollment.
- API authorization: audience、subject、engagement、nonce、iat/exp、schema generationを検証する。
- Long-lived static access key、password embedded in image、shared kubeconfig、shared SSH keyを禁止する。

## Separation of duties

- requesterとapproverはhigh-risk actionで同一人物になれない。
- policy authorとpolicy signerは原則分離する。
- Range adminとOP auditorは同一engagementで兼務しない。
- evidence retention change/deleteはtwo-person approvalとlegal hold checkを要求する。
- emergency stopは広く許可できるが、resumeは別のincident reviewerとengagement ownerを要する。

## Break-glass

Break-glassは停止、資格情報失効、隔離、証拠保全に限定する。Scope拡大、approval bypass、Internet egress、audit deletionを許可しない。利用はhardware-backed credential、理由入力、短いTTL、dual notification、session recording、事後reviewを要求する。

## Lifecycle and review

- joiner/mover/leaverをIdP groupとplane-local roleへ反映する。
- quarterly entitlement review、per-engagement approval review、credential usage reviewを行う。
- unused role、orphan workload identity、expired certificate、cross-plane trustを継続検出する。
- role変更、policy bundle変更、CA/key rotationをWORM auditへ記録する。
