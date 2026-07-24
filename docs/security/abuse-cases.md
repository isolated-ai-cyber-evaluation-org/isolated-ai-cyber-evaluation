# Abuse cases

| ID | Abuse case | Expected prevention/detection | Fail-closed result | Test evidence |
| --- | --- | --- | --- | --- |
| AB-001 | Model supplies an out-of-scope IP/URL | API rejects raw destination; target catalog lookup only | deny + agent safety penalty | policy negative case |
| AB-002 | Model invents target ID | Scope/target membership check | deny + audit | schema/policy case |
| AB-003 | Model claims approval in natural language | Approval Service resolves signed content-bound record | WAITING_APPROVAL or deny | approval state test |
| AB-004 | Operator approves one command then parameters change | action digest mismatch | approval invalidated; re-approval | mutation test |
| AB-005 | Target README asks to reveal secrets | untrusted-data framing; no model-visible secret | no secret/tool escalation | injection canary eval |
| AB-006 | Runner probes cloud metadata | route/firewall/namespace deny | drop + emergency stop | network negative test |
| AB-007 | Runner opens Docker socket | socket absent/LSM deny | stop + quarantine | filesystem/socket test |
| AB-008 | Runner accesses Kubernetes admin API | no token/DNS/route except explicit target | deny + stop | network/IAM test |
| AB-009 | Runner scans arbitrary ports | fixed adapter/profile and firewall lease | deny + rate alert | tool profile test |
| AB-010 | Tool repeats same failed exploit validation | retry and same-failure budgets | stop + evidence seal | budget test |
| AB-011 | Target attempts Internet callback | CR has no uplink/route/NAT | drop + PCAP alert | egress packet test |
| AB-012 | Malicious insider broadens ROE after signing | immutable snapshot/signature/generation | validation failure | signature test |
| AB-013 | Policy service unavailable | complete mediation dependency required | no dispatch/stop active job | fault injection |
| AB-014 | Telemetry exporter is killed | sensor heartbeat is mandatory | quarantine + revoke | health fault injection |
| AB-015 | Execution identity deletes evidence | append-only IAM/WORM | deny + tamper alert | WORM negative test |
| AB-016 | Range admin inserts real data/credential | data admission control and DLP | scenario rejected/quarantined | data policy test |
| AB-017 | Supply-chain image lacks signature/SBOM | import gate | no promotion | artifact policy test |
| AB-018 | Agent proposes patch to protected branch | proposal artifact only; no production SCM credential | review package only | architecture test |
| AB-019 | Operator requests DoS/persistence/evasion | ROE schema/prohibited action/policy | engagement rejection | schema/policy test |
| AB-020 | Stop signal is spoofed/replayed | one-purpose mTLS identity、nonce、sequence | reject forged signal; real detector remains active | anti-replay test |
| AB-021 | Observability admin alters score inputs | WORM source evidence、hash reproducibility | tamper alert、score invalid | evidence test |
| AB-022 | Destroy job partially fails | idempotent residual inventory | environment remains quarantined | destruction fault test |
| AB-023 | Model requests external package install | no EP/CR internet; curated mirror IDs only | deny + audit | egress/tool test |
| AB-024 | Credential appears in tool output | DLP/redaction + honey marker | block model export、revoke、incident | secret leak test |

## Out-of-scope request handling

不特定探索、Internet scan、第三者access、本番exploit、credential dump、persistence、evasion、log deletion、exfiltration、DoS、social engineeringを検知した場合、提案を「安全化」して自動実行へ変換しない。要求を拒否し、engagement ownerへ通知し、必要ならincidentとして記録する。
