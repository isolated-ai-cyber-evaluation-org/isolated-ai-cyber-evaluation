# Incident response

## Incident triggers

- Scope/ROE/policy/approval tampering or mismatch
- out-of-scope target/domain/repository/cloud asset
- general Internet、corporate、production connection attempt
- root/unexpected privilege escalation、persistence、log manipulation
- credential search/exposure、metadata/socket/Kubernetes admin access
- unexpected listener、rate/data/time/token/tool budget breach
- sensor/telemetry/policy health loss
- supply-chain integrity failure
- real personal/confidential/secret data detection
- destruction residual or credential replay after teardown

## Immediate automated containment

1. set engagement/job to `TERMINATING`; block new dispatch
2. revoke firewall leases and set Runner network to quarantine/drop
3. revoke all job/scenario credential handles, sessions, tokens, certificates
4. freeze process/VM where safe for bounded evidence capture
5. seal logs、PCAP、process tree、file diff、policy/approval/manifest digests
6. isolate affected target/scenario and prevent reuse
7. notify SOC、engagement owner、platform on-call
8. destroy Runner after evidence deadline or earlier if containment requires

Steps are idempotent and can run in parallel. Evidence failure does not justify restoring network access.

## Severity

| Severity | Example | Response |
| --- | --- | --- |
| SEV-1 | route to production/Internet succeeded、secret exposed、audit tamper | full engagement stop、environment isolation、executive/legal notification |
| SEV-2 | attempted scope escape blocked、unexpected root、sensor failure | affected job/range stop、forensic review before resume |
| SEV-3 | repeated denial、budget breach、health degradation | job stop、owner review、control tuning |
| SEV-4 | malformed model/tool output without execution | deny/retry within budget、audit |

## Roles

- Incident Commander: coordination and resume decision owner
- SOC Responder: detection validation、stop、evidence triage
- Platform/Range SRE: quarantine and destruction under IC direction
- Identity Responder: revocation and key/session rotation
- Forensic Auditor: OP evidence and chain-of-custody
- Legal/Privacy: real data、retention、notification decisions
- Engagement Owner: business context; cannot overrule containment

## Investigation

Use OP evidence only as the authoritative source. Preserve model/prompt/tool/policy/manifest/approval versions and aliases. Determine earliest divergence, attempted and successful flows, credential exposure, cross-engagement impact, evidence integrity, residual resources.

Do not rerun suspected exploit content to investigate without a new isolated incident scenario and approval.

## Recovery and resume

Resume requires:

- root cause and blast radius understood
- affected credentials/keys/certificates rotated
- vulnerable image/policy/tool quarantined
- network and IAM negative tests passed
- evidence integrity confirmed
- new clean scenario/Runner instantiated
- engagement/ROE still valid or newly signed
- Incident Commander and independent Security reviewer approval

Resume is a new job/execution ID. Quarantined Runner is never returned to service.

## Post-incident

Update risk register、threat model、ADR/control、test cases、scenario corpus、detection rules、scoring penalties。Track containment and evidence SLOs. Retain after-action record in WORM and avoid including secrets.
