# Architecture

## 1. Architectural intent

本システムは、GPT-5.6を判断支援に利用するが、モデルの出力を権限、Scope、承認、実行許可として扱わない。認可は署名済みマニフェスト、Policy Engine、人間承認、Tool Gateway、IAM、ネットワーク制御の積で成立する。いずれかが不明、期限切れ、利用不能、または不整合なら拒否する。

## 2. System context

```mermaid
flowchart TB
  Human["Authorized operator / approver"] -->|signed engagement, approval| CP["Control plane"]
  CP -->|bounded job intent| EP["Execution plane"]
  EP -->|ID-based approved tests| CR["Isolated cyber range"]
  CP -->|append-only audit| OP["Observability plane"]
  EP -->|telemetry and evidence| OP
  CR -->|sensor telemetry| OP
  CP -->|minimized synthetic context| Model["GPT-5.6 via Model Gateway"]
  Model -->|structured proposals only| CP
```

一般インターネットへの許可経路はModel GatewayからOpenAI APIへの専用経路だけであり、サイバーレンジと実行プレーンには存在しない。Model Gatewayはレンジへ到達できない。

## 3. Trust boundaries

| Plane | Security purpose | Owns | Must not own or reach |
| --- | --- | --- | --- |
| Control plane | 認可、計画、承認、調停 | Orchestrator、Scope/ROE、Policy、Approval、Credential Broker、Scheduler、Emergency Stop、Model Gateway | レンジ対象の直接通信、Runnerホスト管理ソケット |
| Execution plane | 承認済み操作の限定実行 | ephemeral Runner、Tool Gateway、allowlist、quota、egress firewall、artifact collector、lifecycle | 一般インターネット、社内、本番、モデルAPI、監査記録の変更 |
| Cyber range | 合成対象と演習依存サービス | 使い捨てWeb/API/Linux/Windows/K8s/cloud simulators、内部DNS/PKI/IdP/mirror | 一般インターネット、社内、本番、制御管理API |
| Observability plane | 独立監視、証拠、採点 | log、PCAP、process tree、file diff、OTel、metrics、SIEM、WORM evidence、scoring | Runner/targetへの汎用管理、モデル実行 |

各プレーンは別アカウント/プロジェクト、別ネットワーク、別管理ホスト、別PKI intermediate、別workload identity、別secret namespaceを持つ。共用クラスタ、共用node pool、共用サービスアカウント、共用SSH鍵、共用Kubernetes管理API、共用Docker socketを禁止する。

## 4. Control and execution path

1. AuthorizerがEngagementとROEを作成する。
2. Scope ServiceがSchema、時刻、相互参照、DSSE署名、署名者権限、失効状態を検証し、不変snapshotを発行する。
3. Orchestratorがモデルへ最小化された合成コンテキストと、IDベースのツールSchemaだけを提示する。
4. モデルはproposalを返す。proposalは命令ではない。
5. Policy Engineがengagement snapshot、ROE、target catalog、tool profile、budget、approval requirementを決定論的に評価する。
6. 危険操作は内容ハッシュへバインドした人間承認がなければ待機し、期限切れまたは変更時は再承認となる。
7. Schedulerはopaqueなjob intentをExecution Planeへ送る。生の資格情報、任意URL、任意コマンドは含めない。
8. Tool Gatewayは全引数を再検証し、server-side target catalogから宛先と固定tool adapterを解決する。
9. Runnerは短寿命microVMで実行され、通信、CPU、memory、I/O、時間、tool count、rate、data volumeを制限される。
10. 結果、telemetry、PCAP、process tree、file diffをObservability Planeへ追記送信する。
11. Findingとpatch proposalを生成し、合成cloneへ人間が明示承認した場合だけ適用して再検証する。保護ブランチや本番への反映は行わない。

## 5. Model boundary

Model GatewayだけがOpenAI APIを利用できる。基準モデルは評価済みの明示的なGPT-5.6-family model IDで、初期の品質重視分析は `gpt-5.6-sol` を候補とするが、実装前にsnapshot、利用条件、データ保持、コスト、レイテンシを評価してallowlistへ固定する。`gpt-5.6` aliasの無条件利用は再現性のため避ける。

OpenAIの現行資料はResponses API、Function Calling、Structured Outputsを提供している。本設計はこれらを**出力整形と要求表現**に利用するが、API機能をセキュリティ境界にはしない。Hosted Shell、Web Search、Computer Use、remote MCP、Code Interpreter等の組込みツールはこのシステムの評価経路では無効化し、独自のTool Gatewayだけを提示する。

Model Gatewayの必須制御:

- `store=false` を要求し、契約上利用可能ならZDRを採用する。実装前に組織設定と保持仕様を法務・セキュリティが検証する。
- 合成データでも最小化・分類・redactionを行う。
- system/developer instructions、tool schema、Scope snapshot digestを固定し、対象コンテンツを引用された非命令データとして分離する。
- model、prompt、policy、schema、tool catalogのversion/digestを監査記録へ残す。
- Structured OutputsのSchema違反、refusal、tool call不整合は再試行上限内で処理し、最終的にfail closedとする。
- token、time、tool call、concurrency、cost budgetをEngagementとplatform ceilingの小さい方で制限する。

参考: [GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [data controls](https://developers.openai.com/api/docs/guides/your-data)。

## 6. Identity and credentials

Human identity、workload identity、target credentialを分離する。Credential Brokerはmaster secretと発行権限を保持し、モデル、Orchestrator prompt、job payload、環境変数、永続ファイル、ログには秘密を渡さない。

認証が必要なtool adapterは、承認済みoperation digestへバインドされた一回限りのopaque handleを受け取り、Brokerとの相互TLS channelで対象限定資格情報または代理認証セッションを取得する。秘密はRunnerのモデル可視processから隔離されたadapter memoryだけに短時間存在し、可能な場合はBrokerが直接代理実行して秘密値自体をExecution Planeへ出さない。

## 7. Network architecture

- Cyber Range: uplinkなしの隔離fabric。一般インターネット、社内、本番へのroute、NAT、proxy、transit、peering、VPNを作らない。
- Execution Plane: default-deny egress。Tool GatewayからScope snapshotに登録されたrange endpointへの明示flowと、Observability ingestへの追記flowだけを許可する。
- Control Plane: Model Gatewayの専用AI egress、Execution lifecycle API、Observability ingest、operator UIだけを許可する。
- Observability Plane: ingest endpointはappend-only identityを受け入れ、管理APIは別のauditor networkに限定する。stop detectorだけがControl PlaneのEmergency Stop専用endpointを呼べる。
- Metadata: `169.254.169.254`、IPv6 metadata、provider固有metadata DNSをhost route、firewall、namespace policy、seccompで多層遮断する。
- Docker/Kubernetes: socketをmountせず、management endpoint routeを作らず、必要なrange Kubernetes APIはscenario target IDとtest caseで限定する。

詳細は [network matrix](docs/security/network-matrix.md) を参照する。

## 8. Isolation substrate

- Linux Runner: Firecracker microVMを第一候補とし、read-only base、per-job encrypted scratch、non-root adapter、seccomp、cgroup/VM quotaを用いる。
- Windows/特殊演習: KVM/libvirt VMを用い、専用host poolとvirtual switchでrange内に閉じる。
- Kata Containers: Kubernetes運用が必要な限定caseの候補だが、controlとrangeの主境界には使わない。
- OCI container: 一つのVM内の補助分離または対象再現に用いるが、hostile targetに対する唯一の境界にしない。

## 9. Fail-closed and emergency stop

stop conditionはPolicy Engine、Tool Gateway、egress firewall、host sensor、range sensor、Observability detectorのいずれでも発火できる。発火時は、順序依存せず以下を並行実行する。

1. Schedulerが新規dispatchを停止し、engagementを`TERMINATING`にする。
2. Egress FirewallがRunnerの全flowを遮断する。
3. Lifecycle ManagerがRunnerをquarantine networkへ移し、実行をfreezeする。
4. Credential Brokerがhandle、session、token、certificateを失効させる。
5. Artifact CollectorとObservability Planeが証拠snapshotを確定する。
6. Lifecycle Managerが収集完了またはhard timeout後にRunnerを破棄する。
7. 独立reviewなしに再開しない。

Policy、Scope、Approval、telemetry dependencyが利用不能な場合も停止する。可用性を理由にbypassしない。

## 10. Evidence and scoring

各eventはengagement、scenario、target、runner、execution、tool、model、prompt、policy、approvalのID/digestへ紐付ける。EvidenceはSHA-256以上のdigest、時刻、producer identity、chain-of-custody、classification、retention classを持つ。Observability PlaneのWORM object storeへ保存し、Execution/Range identityにdelete/update権限を与えない。

採点は二層で行う。

- Safety gate: Scope逸脱、未承認操作、秘密露出、永続化、回避、監視操作等を失格または大幅減点とし、品質点で相殺不可。
- Quality score: 対象側の予防・検知・対応・回復、およびagent側のfinding精度、証拠品質、再現性、patch品質、効率を採点する。

## 11. Lifecycle

`Scenario template -> signed image/artifact import -> isolated instantiate -> baseline attest -> execute -> evidence seal -> cryptographic erase -> key revoke -> storage purge -> residual scan -> destruction certificate`

破棄は冪等で、構成資産、snapshot、volume、memory dump、credential、certificate、DNS、PKI、IdP state、queue、cache、object、backup indexを残存物台帳と照合する。Evidenceだけは別の保持ポリシーでWORM保管する。

## 12. Architecture decisions

ADRは [docs/adr](docs/adr/README.md) に集約する。主要判断は以下である。

- Primary Linux isolation: Firecracker microVM
- Windows/special virtualization: KVM/libvirt
- Policy: OPA with signed immutable bundles
- IaC: OpenTofu
- Control orchestration: dedicated Kubernetes allowed only under strict constraints
- Baseline deployment: local-first dedicated equipment
- Observability: separate account/project and management plane
- Message queue: NATS JetStream候補、opaque IDs and mTLS
- Evidence: object lock/WORM plus hash chain
- Model context: least-context, no secrets, no arbitrary tools
- Approval: content-bound, expiring, one-shot authorization

## 13. Explicit non-goals

不特定資産探索、一般インターネットscan、第三者アクセス、本番exploit、credential dump、persistence、evasion、log deletion、data exfiltration、DoS、social engineering、自動merge/production patchを設計しない。

## 14. Phase 2 skeleton realization

Phase 2 adds only typed contracts and deterministic memory-only behavior:

- branded opaque IDs and immutable domain interfaces
- ID-only model tool discriminated union and OpenAPI 3.1 contract
- pure Policy reference function and fail-closed unavailable-engine wrapper
- deny-only Tool Gateway that returns `EXECUTION_DISABLED` even after `PERMIT`
- explicit Engagement、Approval、Job、Runner transition tables
- in-memory Scope、Approval、append-only audit stubs
- Schema、Policy、state、API、architecture、traceability tests

No service entry point、network/process/filesystem adapter、credential-bearing interface、cloud SDK、IaC or Runner/range provisioner exists. This skeleton concretizes ADR-003、ADR-013 and ADR-014 without changing their decisions.
