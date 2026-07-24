# Security principles

## Enforcement hierarchy

1. Physical/virtual network isolation and routing absence
2. IAM and workload identity separation
3. Signed Scope/ROE and target catalog
4. Policy Engine decision
5. Content-bound human approval
6. Tool Gateway validation and fixed adapter
7. Runner sandbox and resource quota
8. Independent detection and emergency stop
9. Immutable audit and after-the-fact review

下位層は上位層の代替ではない。prompt instruction、モデルrefusal、operator注意書きだけをsecurity controlとして数えない。

## Principles

| Principle | Normative interpretation |
| --- | --- |
| Default deny | 明示allowが存在しないidentity、action、target、flow、tool、time、budgetを拒否する |
| Least privilege | target・purpose・action・expiry・single-useへ権限を限定する |
| Complete mediation | 再試行を含む全tool callをPolicy EngineとTool Gatewayで毎回再検査する |
| Separation of duties | Requester、Approver、Policy Admin、Range Admin、Auditorを原則分離する |
| Fail closed | Scope、Policy、Approval、Credential、Telemetryの検証不能時は停止する |
| Defense in depth | Schema、署名、policy、IAM、network、sandbox、sensor、WORMを重ねる |
| Compartmentalization | engagement、scenario、runner、planeごとにidentityとstateを分離する |
| Auditability | decision input/output、version、digest、actor、timeを相関可能に保存する |
| Reproducibility | image、scenario、tool、model、prompt、policy、schemaをversion/digestで固定する |
| Disposability | targetとrunnerを再利用せず、鍵破棄を含む完全破棄を行う |
| Secret non-exposure | model context、env、file、log、artifactへ秘密値を入れない |
| Idempotency | stop、revoke、reset、destroyを重複実行しても安全な終状態になる |
| Testability | allow/deny、dependency failure、stop condition、destruction residueをnegative test化する |
| Rollback | policy/image/config rolloutを署名済み前versionへ戻せるが、Scope拡大は再承認する |
| Supply-chain integrity | pin、digest、SBOM、signature、provenance、quarantine importを要求する |
| Evidence as Code | evidence contract、hash、provenance、retention、chain-of-custodyをSchemaで管理する |

## Safety invariants

- RangeからInternet、Corporate、Productionへのrouteは存在してはならない。
- Execution egressはdefault denyで、server-side target mapping以外を送信できない。
- Cloud metadata、Docker socket、unexpected Kubernetes management APIを到達不能にする。
- ModelはScope/ROE、approval、target catalog、policy bundleを変更できない。
- 任意IP、URL、hostname、command、repository、cloud resourceをmodel引数として実行しない。
- 状態変更、exploit validation、credential useは独立した人間承認なしに行わない。
- Audit dataはExecution/Rangeからupdate/delete不能である。
- Stop条件発火時はRunner隔離、credential失効、証拠保存、破棄へ進む。
- 自動merge、production apply、protected branchへのpatch適用を行わない。

## Control evidence

各原則は [traceability matrix](../governance/traceability-matrix.md) の要件ID、設計文書、検証テストへ対応付ける。説明だけでなく、機械的なdeny testと運用review evidenceを要求する。
