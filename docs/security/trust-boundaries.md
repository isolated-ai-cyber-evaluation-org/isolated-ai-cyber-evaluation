# Trust boundaries

## Boundary catalogue

| ID | Boundary | Assets inside | Entry points | Primary threats | Required controls |
| --- | --- | --- | --- | --- | --- |
| TB-CP | Control plane | Scope/ROE snapshot、policy、approval、job state、model prompts、credential master | Operator API、Model Gateway response、Execution status、Observability stop signal | insider misuse、model manipulation、policy bypass | separate IAM/PKI/hosts、signed manifests、dual control、immutable policy bundle、mTLS |
| TB-EP | Execution plane | ephemeral runners、tool adapters、temporary artifacts、opaque credential handles | Scheduler job intent、Broker channel、range responses | sandbox escape、scope drift、credential exposure | microVM、non-root、default-deny egress、fixed adapter、quota、no management sockets |
| TB-CR | Cyber range | synthetic targets、dummy identities/data、internal DNS/PKI/IdP/mirror | Tool Gateway test traffic、offline scenario import | malicious content、range escape、lateral movement | no uplink/route/NAT、separate fabric、synthetic-only、sensor coverage、disposable lifecycle |
| TB-OP | Observability plane | audit events、PCAP、process/file telemetry、metrics、scores、WORM evidence | append-only ingest、auditor/admin UI | log tampering、evidence loss、false stop injection | separate account/hosts/PKI、append-only IAM、object lock、hash chain、admin segregation |
| TB-AI | External model service | minimized synthetic prompt and model response | Model Gateway only | retention、model compromise、prompt injection propagation | no secrets、store policy、contract review、structured output、tool deny, safety identifier where applicable |
| TB-HUM | Human governance | authorizer/approver/auditor decisions | OIDC/FIDO2 UI | account takeover、rubber stamp、collusion | phishing-resistant MFA、role separation、content-bound approval、session recording |
| TB-SC | Supply-chain quarantine | source packages、images、SBOM、signatures | controlled import station | poisoned dependency/image/policy | allowlisted sources、malware scan、provenance、offline promotion、digest pinning |

## Separation requirements

| Dimension | Requirement |
| --- | --- |
| Account/project | CP、EP、CR、OPで別のcloud account/project/subscriptionまたは同等の管理domain |
| Host | 同一hypervisor/worker node上に異なるplaneのworkloadを同居させない |
| IAM | service account、human admin role、trust policyを共有しない |
| Credentials | root/admin key、PKI intermediate、SSH key、KMS key、secret namespaceを共有しない |
| Network | VRF/VPC/VNet、firewall、route table、DNS resolver、load balancerを共有しない |
| Orchestration | Kubernetes clusterまたはvirtualization control APIを共有しない |
| Logging | plane local bufferを除き、authoritative audit storeはOPだけに置く |
| Time | hostを共有せず、plane別time sourceを監視し、correlation時にdriftを記録する |

## Boundary crossing rules

すべての越境messageは相互TLS workload identity、audience、engagement ID、nonce、issued/expiry、schema version、payload digestを持つ。受信側は再認可し、送信側の判断を盲信しない。

- CP→EP: opaque job intent。生credential、任意宛先、任意commandを禁止。
- EP→CR: Tool Gatewayの固定adapterによるScope内flowのみ。
- CP/EP/CR→OP: append-only ingest。senderにquery/update/delete権限なし。
- OP→CP: Emergency Stop専用のone-purpose messageのみ。一般管理操作不可。
- CP↔AI: Model Gatewayだけ。秘密・生credential・署名鍵・未最小化ログを禁止。
- Supply chain→各plane: live networkではなく、署名済みartifactの検疫済みpromotion。

## Compromise containment

- **Model compromise**: proposalはPolicy/Approval/Tool Gatewayを越えられず、Scopeを拡張できない。
- **Runner compromise**: range allowlistとOP ingest以外へ通信できず、host socket/metadata/APIへ到達できない。
- **Range compromise**: uplinkがなく、EP ingress以外のplaneへ開始通信できない。OP telemetryはsensor-owned exporter経由。
- **Control compromise**: OP evidenceを変更できず、Rangeへの直接routeがない。High-risk actionは別human approverを要する。
- **Observability compromise**:Emergency Stop以外のcontrol権限を持たず、Runner/targetへ管理接続できない。

## Review questions

- 一つのcredentialまたはadmin roleで二つのplaneを操作できないか。
- 同一host、cluster、socket、DNS、route、NAT、proxyが境界を実質的に崩していないか。
- fail-open health check、break-glass bypass、debug endpointがないか。
- senderがaudit recordを削除・上書きできないか。
- target-supplied dataがcontrol instructionとして解釈されないか。
