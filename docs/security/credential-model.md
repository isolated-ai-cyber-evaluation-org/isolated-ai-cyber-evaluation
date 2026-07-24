# Credential model

## Objective

資格情報の価値と露出時間を最小化し、model context、prompt、tool arguments、job payload、environment variable、filesystem、logs、evidenceへ秘密値を渡さない。

## Credential classes

| Class | Example | Issuer/store | TTL | Exposure rule |
| --- | --- | --- | --- | --- |
| Human session | operator/approver token | IdP | minutes-hours | browser/session only; no job forwarding |
| Workload identity | mTLS/SPIFFE certificate | plane-local CA | minutes | service memory; plane-bound |
| Broker redemption handle | opaque one-use ID | Credential Broker | seconds-minutes | may appear in adapter control message; not a secret-bearing token |
| Target credential | synthetic account token/password/cert | Range IdP/Broker | one action/job | adapter memory or broker proxy only |
| Storage/evidence key | per-engagement DEK | OP KMS/HSM | retention-bound | OP services only |
| Signing key | manifest/policy/image signer | offline/HSM | rotation policy | never online in model/runner/range |
| Dummy marker | honey credential/canary | Range generator | scenario lifetime | harmless; use detects policy failure |

## Secretless operation flow

1. Policy Engine returns `permit` plus required credential profile ID; it never returns a secret.
2. Human approval, if required, binds `credential_profile_id` and operation digest.
3. Credential Broker validates engagement、target、purpose、tool、approval、caller、budget、expiry。
4. Broker prefers direct proxy authentication or delegated session creation so the secret never leaves the Broker.
5. If adapter delivery is unavoidable, Broker sends a sealed value to an isolated credential adapter over mTLS. The adapter decrypts into locked memory, disables core dump/swap, and supplies it through a structured library call.
6. The model-facing Runner process receives only success/failure and redacted evidence.
7. Completion、stop、timeout、approval revoke、runner lossのいずれでもsession/token/certを失効する。

## Prohibited delivery

- prompt、model response、tool JSON arguments
- process environment
- command-line argument
- repository/file、temporary plaintext file、shell history
- general-purpose stdout/stderr、trace、crash dump
- container image、VM snapshot、user-data、cloud-init
- queue message、approval record、finding description

## Binding and limits

Every issue/redeem operation is bound to:

`engagement_id + scope_generation + execution_id + runner_id + tool_id + target_id + purpose + action_digest + audience + issued_at + expires_at + max_uses`

Any mismatch denies redemption. Default `max_uses=1`; retry requires a new handle and policy decision. Target permissions contain only test-specific synthetic permissions and cannot administer range infrastructure.

## Revocation

Credential Broker exposes a stop-priority revocation path independent of the model and Scheduler. Revocation fan-out covers:

- outstanding opaque handles
- target sessions/tokens/certificates
- workload certificates for quarantined Runner
- dynamic firewall leases associated with execution
- temporary storage/data encryption keys where destruction begins

Revocation is idempotent. Unknown state is treated as not safely revoked, keeps the Runner isolated, and opens an incident.

## Logging and detection

Log metadata only: issuer、subject pseudonym、profile、target、purpose、issued/expiry、use count、decision、revocation、digest. Never log secret value or reversible derivative. DLP scans tool outputs and evidence; honey credentials validate that collection/search attempts trigger stop.

## Failure behavior

- Broker unavailable → deny credentialed operation; do not fall back to static secret.
- Revocation unavailable → firewall quarantine and Runner freeze until confirmed or hard destruction.
- Redaction failure → block model context/evidence export and preserve raw data only in restricted quarantine.
- Secret suspected exposed → emergency stop、global scenario credential rotation、evidence seal、incident response。
