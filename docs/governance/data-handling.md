# Data handling

## Data classes

| Class | Allowed content | Model exposure | Storage | Example |
| --- | --- | --- | --- | --- |
| PUBLIC | public design references, no target data | allowed if needed | ordinary repo/artifact | public standards URL |
| SYNTHETIC | generated code/data/identities with no real mapping | minimized allowed | engagement store/evidence | dummy customer record |
| INTERNAL | platform config/telemetry without secrets | summarized/redacted only | encrypted restricted | policy decision metadata |
| RESTRICTED-EVIDENCE | PCAP、process tree、raw logs、memory-adjacent artifacts | prohibited by default; derived minimum only | OP WORM, least privilege | raw target response |
| SECRET | key/token/password/private key | prohibited | Broker/HSM only | target session token |
| PROHIBITED | production data、real PII、real company secret、leaked credential | never admitted | quarantine then approved deletion | real access token |

## Admission

Scenario import requires producer attestation、data-class scan、secret scan、PII pattern scan、manual review for uncertain matches. A real-looking identifier or credential is rejected unless provenance proves it is generated and harmless. Unknown classification defaults to `PROHIBITED` pending review.

## Model context

- only PUBLIC、SYNTHETIC and necessary redacted INTERNAL derivatives
- no SECRET or raw RESTRICTED-EVIDENCE
- deterministic redaction before model call
- source ID、hash、classification、truncation marker、purpose
- no active HTML/script、external URL fetching、remote images、target MCP
- context minimization by current task, not convenience

OpenAI API configuration uses a dedicated organization/project, approved model allowlist, `store=false` request intent, and ZDR if contractually available. Legal and Security must verify provider retention and regional controls before implementation.

## Storage and encryption

- per-plane KMS key hierarchy and per-engagement data encryption keys
- OP evidence key inaccessible to CP/EP/CR
- per-run ephemeral storage keys destroyed at teardown
- TLS/mTLS across allowed network flows
- no cross-engagement shared writable volume
- backup/replica included in retention and destruction inventory

## Output and export

Findings and patch proposals contain synthetic references, not secrets. Human export requires authorization、classification check、DLP、evidence ID、recipient purpose、audit. General Internet upload、personal storage、clipboard-based secret transferは禁止する。

## Minimization

Collect only evidence required to prove/deny a finding and evaluate controls. Full packet or file capture is scoped by profile and time. When a deterministic hash/summary suffices, retain raw evidence only in restricted WORM and expose the derivative.

## Incident handling

Real data/credential detection triggers stop、quarantine、Broker/global scenario rotation、restricted access、legal/privacy notification、documented disposal. It is not converted into test data or sent to the model.
