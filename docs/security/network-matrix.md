# Network communication matrix

## Interpretation

この表に `ALLOW` として記載され、かつruntime policy、identity、Scope、time、rate、approvalが一致する通信だけを許可する。宛先IPはモデル入力ではなく、署名済みtarget catalogの`target_id`から受信側が解決する。表にない通信はすべて `DENY + ALERT` である。

## Allowed flows

| ID | Source | Destination | Protocol/port | Direction | Purpose | Identity and constraints | Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NET-001 | Authorized operator network | CP operator/API gateway | HTTPS/443 | inbound | engagement、approval、review | OIDC + FIDO2、role、device posture、rate limit | ALLOW |
| NET-002 | CP internal services | CP service endpoints | mTLS/explicit ports | east-west | orchestration、policy、scope、approval | per-service SPIFFE ID、service allowlist | ALLOW |
| NET-003 | CP Model Gateway | OpenAI API fixed FQDN/IP set | TLS/443 | outbound | minimized model request | dedicated egress proxy、SNI/DNS pin policy、no range route | ALLOW |
| NET-004 | CP Scheduler | EP lifecycle ingress | mTLS/443 | outbound | opaque job dispatch/cancel | scheduler identity、signed job intent、no secrets | ALLOW |
| NET-005 | EP lifecycle status | CP Scheduler status ingress | mTLS/443 | outbound from EP | state/health only | lifecycle identity、schema-limited | ALLOW |
| NET-006 | CP Credential Broker | EP credential adapter | mTLS/443 | outbound | one-use sealed capability/session | operation digest、target/purpose/expiry binding | ALLOW |
| NET-007 | EP Tool Gateway | CR target endpoint | scenario-defined TCP/UDP | outbound | approved test case | target_id/profile mapping、per-flow firewall lease | ALLOW |
| NET-008 | EP Tool Gateway | CR internal DNS | DNS/53 | outbound | range-only name resolution | dedicated resolver、no recursion/forwarding | ALLOW |
| NET-009 | CR assets | CR internal DNS/PKI/IdP/mirror | scenario-defined | internal | synthetic dependencies | scenario network policy | ALLOW |
| NET-010 | CP audit exporter | OP append-only ingest | OTLP/gRPC 4317 or HTTPS/443 | outbound | audit/trace/metric | append-only producer identity | ALLOW |
| NET-011 | EP sensor/exporter | OP append-only ingest | OTLP/gRPC 4317 or HTTPS/443 | outbound | telemetry/evidence chunks | append-only producer, bounded buffer | ALLOW |
| NET-012 | CR sensor gateway | OP append-only ingest | one-way gateway + TLS | outbound | PCAP/process/file/target telemetry | sensor-owned identity; targets cannot use channel | ALLOW |
| NET-013 | OP stop detector | CP Emergency Stop endpoint | mTLS/443 | outbound | stop-only signed signal | one-purpose identity、no general CP API | ALLOW |
| NET-014 | Auditor network | OP query/admin endpoints | HTTPS/443 | inbound | review、legal hold、score | OIDC + FIDO2、separate auditor role | ALLOW |

## Explicitly denied flows

| ID | Source | Destination | Reason | Enforcement |
| --- | --- | --- | --- | --- |
| DENY-001 | CR any | General internet | absolute isolation invariant | no uplink/route/NAT/proxy + firewall |
| DENY-002 | CR any | Corporate network | prevent escape and pivot | separate fabric/VRF, no peering |
| DENY-003 | CR any | Production network | prevent production impact | no route/transit/VPN |
| DENY-004 | EP any except Model-independent approved flow | General internet | execution default deny | egress firewall + DNS deny |
| DENY-005 | EP/CR | OpenAI API or any model endpoint | model access only via CP | no route + FQDN/IP deny |
| DENY-006 | Model Gateway/CP | CR target endpoints | prevent model/control direct execution | no route + ACL |
| DENY-007 | Runner/target | `169.254.169.254`, IPv6/provider metadata | prevent cloud credential theft | null route + host firewall + namespace policy |
| DENY-008 | Runner/target | Docker/container runtime socket/API | prevent host takeover | no mount + filesystem/LSM deny |
| DENY-009 | Runner | Kubernetes management API | prevent cluster takeover | no service-account token/DNS/route |
| DENY-010 | CR target | Kubernetes management API except an explicit target cluster test | preserve target boundary | scenario-specific deny and target_id mapping |
| DENY-011 | EP/CR producer | OP query/update/delete/admin | immutable audit | IAM + network ACL + WORM |
| DENY-012 | OP general services | CP/EP/CR management | monitoring is not admin plane | egress deny; stop endpoint exception only |
| DENY-013 | CP/EP/CR | Corporate DNS/NTP/package repositories | eliminate covert/accidental egress | plane-local service only |
| DENY-014 | Any plane | Another plane's SSH/RDP/hypervisor/Kubernetes admin | prevent shared administration | separate admin networks and ACL |
| DENY-015 | CR mirror | Upstream package registry | no live supply-chain path | offline signed import only |

## Dynamic firewall lease

`NET-007` は静的な広域allowではない。Policy decisionが発行するleaseは、`engagement_id + execution_id + runner_id + target_id + resolved address set + protocol/port + issued_at + expires_at + bytes/rate ceiling`へバインドする。Tool Gatewayとfirewall controllerの両方が署名とgenerationを検証する。job終了、stop、approval失効、Scope変更、timeoutのいずれでも即時削除する。

## DNS and route controls

- CR resolverはauthoritative range zonesだけを提供し、recursive forwardingとroot hintsを持たない。
- EP resolverはrange service discoveryと固定control namesだけを返す。
- FQDN allowlistだけに依存せず、route absence、IP allowlist、TLS identityを併用する。
- IPv4、IPv6、overlay、service mesh egress、host network、sidecar、ICMP tunnelを同じdeny方針で扱う。
- Control/Observabilityの管理networkをworkload networkと分離する。

## Validation

- architecture testは全四plane、`DENY-001`〜`DENY-015`、metadata/Docker/Kubernetes denyを検査する。
- 実装フェーズではroute table dump、firewall policy、packet test、DNS recursion test、IPv6 test、negative connectivity testを証拠化する。

## Phase 2 network posture

Phase 2 creates no runtime flow in this matrix. There is no service listener、HTTP/socket client、DNS resolver、firewall controller、Runner/range driver or cloud SDK. `api/openapi.yaml` has no `servers` entry and is a contract only. `ARCH-201` rejects network/process/cloud primitives in `src/`; any future runtime flow must first map to an existing `NET-*` row or update this matrix through review.

The validation-only CI workflow may download pinned development packages from the configured package registry during repository validation. This is a build-environment supply-chain flow, not a CP/EP/CR/OP runtime authorization. It does not create a route for the designed system and must not be reused as an execution-plane egress path.
