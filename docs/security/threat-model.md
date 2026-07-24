# Threat model

## 1. Scope and method

対象は制御、実行、サイバーレンジ、監視の四plane、外部model service、人間操作、supply-chain importである。STRIDEを境界ごとに適用し、agent固有のauthorization confusion、indirect prompt injection、tool misuse、goal driftを追加する。可用性より封じ込めを優先し、監視不能時は停止する。

## 2. Security objectives

1. 認可されたengagement、target、test case、time、budget以外を実行しない。
2. Modelまたはtarget contentがScope、ROE、approval、policyを変更できない。
3. 秘密をmodel、prompt、env、file、log、artifactへ露出しない。
4. Range/RunnerからInternet、Corporate、Productionへ到達させない。
5. Runner/target compromiseをhost、別engagement、別planeへ波及させない。
6. 監査・証拠の完全性、順序、帰属、保持を保証する。
7. Stop conditionを独立検知し、fail closedで封じ込める。
8. Range state、credential、storageを証明可能に破棄する。

## 3. Protected assets

- Signed engagement/ROE/target catalog/policy bundles
- Approval decisions and authorizer identities
- Credential Broker master material and issuance authority
- Runner/range isolation substrate and management APIs
- Model prompt/tool catalog/version configuration
- Audit logs、PCAP、process/file telemetry、evidence chain
- Scenario image、SBOM、signature、provenance
- Synthetic target data and dummy credentials
- Scoring rules and ground truth
- Emergency Stop path

## 4. Adversaries

| Actor | Capability | Goal |
| --- | --- | --- |
| External attacker | attacks public operator/model-facing surface、stolen user session | unauthorized job、data access、service disruption |
| Malicious exercise content | controls target HTML、README、logs、API responses、files | indirect prompt injection、parser abuse、agent scope drift |
| Compromised or misaligned model | emits deceptive plans/tool calls、repeats failures、conceals uncertainty | broaden scope、obtain secrets、bypass approval |
| Malicious insider | legitimate partial admin/operator access | unauthorized target/action、evidence suppression、collusion |
| Compromised Runner | code execution inside microVM | escape、metadata/socket access、unexpected egress |
| Compromised range target | controls synthetic target and east-west traffic | leave range、attack Runner/sensors、tamper scoring |
| Supply-chain attacker | poisons package/image/tool/policy dependency | pre-positioned escape、telemetry disablement、backdoor |
| Observability attacker | tampers ingest/admin credentials | hide actions、forge score、block stop |

## 5. Entry points and trust assumptions

| Entry | Trust level | Mandatory validation |
| --- | --- | --- |
| Operator API | authenticated but not inherently authorized | FIDO2/OIDC、role、device/session、CSRF、rate、schema |
| Signed manifests | untrusted until verified | schema、JCS digest、DSSE/Ed25519、issuer、expiry、revocation |
| Model output | always untrusted proposal | structured schema、tool allowlist、policy、approval |
| Target content/tool output | hostile data | type/size、quarantine、redaction、provenance framing |
| Queue/job payload | untrusted across boundary | mTLS identity、signature、nonce、expiry、digest |
| Package/image import | hostile until promoted | source allowlist、hash、signature、SBOM、scan、review |
| Telemetry ingest | producer-authenticated but content-untrusted | identity、sequence、hash、schema、clock drift |

Network isolation、IAM、cryptographic verificationは実装・運用で検証されるまではassumptionであり、文書だけでは保証されない。

## 6. Threat analysis

| ID | Boundary / category | Threat | Preventive controls | Detective / response controls | Residual |
| --- | --- | --- | --- | --- | --- |
| TM-001 | Human/CP Spoofing | stolen approver session | phishing-resistant MFA、device binding、short session、role separation | impossible-travel/session alerts、approval review | insider endpoint compromise |
| TM-002 | CP Tampering | Scope/ROE extension after approval | immutable signed snapshot、generation pin、model write deny | digest mismatch stop、audit hash | signer key compromise |
| TM-003 | Model elevation | model requests arbitrary command/URL | ID-only tools、fixed adapter、schema、policy | denied-call telemetry、agent score penalty | vulnerable adapter implementation |
| TM-004 | Target→Model injection | content instructs agent to exfiltrate/bypass | data/instruction separation、least context、no secret/tool authority | canary instructions、scope adherence score | semantic manipulation within allowed action |
| TM-005 | EP escape | Runner gains host/root or management socket | microVM、dedicated host、no socket/token、seccomp、patched hypervisor | host sensor、unexpected privilege stop | hypervisor zero-day |
| TM-006 | EP information disclosure | credential reaches model/env/file/log | brokered proxy、opaque handle、memory-only adapter、redaction | honey credential、secret scan、revoke | process-memory compromise |
| TM-007 | EP/CR egress | public/corporate/production connection | no route/NAT/proxy、default deny、target mapping | PCAP/flow alert、quarantine | physical mispatch/control-plane bug |
| TM-008 | CR lateral movement | target attacks other scenario/tenant | per-engagement fabric、asset ACL、disposable network | IDS/east-west PCAP、stop | scenario intentionally needs lateral path |
| TM-009 | OP tampering | producer deletes/rewrites evidence | append-only identity、WORM、separate account/KMS | hash chain、replica comparison、tamper alert | OP admin collusion |
| TM-010 | OP spoofing | forged emergency stop or telemetry | mTLS per producer、signed sequence、one-purpose stop identity | anti-replay、identity anomaly | stolen OP key |
| TM-011 | Supply chain | signed but malicious image/tool | controlled build、reviewed source、SBOM、reproducible build、quarantine | sandbox validation、behavior baseline | trusted builder compromise |
| TM-012 | Availability | telemetry/policy dependency outage | redundant service、bounded queue | fail-closed stop、health SLO alert | reduced evaluation availability |
| TM-013 | Repudiation | actor denies tool action | correlated IDs/digests、signed events、trusted time | WORM chain of custody | clock/identity infrastructure compromise |
| TM-014 | Data leakage | raw evidence sent to model/provider | classification gate、redaction、synthetic-only、context budget | DLP/egress log、incident response | unknown retention/contract mismatch |
| TM-015 | Resource abuse | repeated/parallel calls become DoS | quota、rate/concurrency/token/time/data budgets | same-failure detector、health threshold stop | low-and-slow resource pressure |
| TM-016 | Patch misuse | model patch reaches protected code | proposal-only branch/artifact、human review、no production credential | branch protection audit | human merges unsafe patch |
| TM-017 | Destruction gap | snapshot/key/cache remains | asset inventory、crypto erase、key revoke、residual scan | destruction certificate、periodic restore test | provider backup semantics |
| TM-018 | Scoring tamper | agent reads ground truth or changes score | separate OP store/identity、blind scenario labels | score reproducibility check | OP admin compromise |

## 7. Abuse chains

### Malicious content to unauthorized execution

`Target content → model interprets instruction → tool request → policy/approval/tool validation`

Expected breakpoints: target content is framed as data; model has no arbitrary tool; policy requires known test case and target; dangerous action requires content-bound approval; Tool Gateway resolves target server-side. All must fail independently.

### Runner compromise to external pivot

`Target exploit → Runner process compromise → privilege escalation → metadata/socket/network pivot`

Expected breakpoints: non-root adapter; microVM; no metadata route; no socket/token; default-deny egress; dedicated host; sensor stop; credential revoke.

### Insider evidence suppression

`Operator authorizes improper test → attempts log deletion → conceals score`

Expected breakpoints: role separation; approval binding; OP separate identity/account; producer append-only; WORM; independent auditor; immutable score inputs.

## 8. Security validation plan

- Negative authorization tests for out-of-scope target/action/time/budget and missing dependencies
- Indirect prompt injection corpus with harmless canary instructions
- Network negative tests for Internet/corporate/production/metadata/Docker/Kubernetes API, including IPv6
- Runner breakout tests using non-weaponized boundary probes
- Credential honey marker and redaction tests
- WORM update/delete denial and hash-chain tamper tests
- Emergency Stop fault injection for each detector and dependency loss
- Destruction residual scan and credential replay failure
- Supply-chain signature/SBOM/provenance failure tests

## 9. Residual high risks

Hypervisor zero-day、signer/HSM compromise、misconfigured physical routing、OP administrator collusion、provider retention semantics、OpenAI contract mismatchは設計だけで除去できない。[Risk register](risk-register.md) でownerとtreatmentを管理する。

## 10. Phase 2 threat posture

Phase 2 does not instantiate the four planes or expose an attackable service. Its security value is constraining future implementations:

| Phase 2 threat | Control | Residual |
| --- | --- | --- |
| `PERMIT` is mistaken for execution authority | `execution_authorized=false` in Schema/Rego and deny-only Tool Gateway | future adapter could bypass the gateway; R-021 remains blocking |
| model-controlled raw destination/payload enters an API | opaque ID types、closed JSON Schema、OpenAPI/source forbidden-field tests | semantic broadening through a newly named field still requires review |
| Policy outage becomes implicit allow | fail-closed wrapper maps exception/malformed result to `INDETERMINATE` | availability loss is intentional; redundant runtime service is future work |
| test stub is promoted as a production adapter | no service entry point、runtime dependency or external I/O; explicit `stubs/` namespace | copy/reimplementation outside architecture tests; R-022 |
| dependency or CI compromise changes the skeleton | exact dependency versions、lockfile、ignored lifecycle scripts、read-only SHA-pinned CI | registry/build-platform compromise remains; R-010 |

Network isolation、credential non-exposure、WORM evidence and destruction are still design assertions because their components are deliberately absent. Phase 2 tests must not be cited as runtime control effectiveness evidence.
