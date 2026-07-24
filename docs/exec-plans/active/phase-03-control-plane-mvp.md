# Phase 03 — Local control-plane MVP

Status: blocked on required-check re-registration after repository transfer  
Owner: Principal Security Architect / Platform Engineering  
Last updated: 2026-07-24

## 目的

承認済みPhase 2骨格を基に、ローカル開発環境内だけで動作するControl Plane MVPを実装する。外部モデル、実行プレーン、サイバーレンジ、クラウド、実資格情報とは接続しない。

## 前提ゲート

- [x] GitHub Free organization配下のpublic repositoryを作成する
- [x] `main`とGitHub署名済み初期commitを確認する
- [x] Phase 2基準treeをGitHubへ登録する
- [x] Phase 2 CIを成功させる
- [x] signed commit、PR、2 approvals、stale approval dismissal、latest-push independent approval、conversation resolution、force-push/delete/bypass禁止を`main`へ再設定する
- [x] 移管後のprotection設定をGitHub側から再読し、public repositoryの`main` 1 branchへ適用されることを検証する
- [ ] 移管後のCI実行を発生させ、required check `Validate non-executable skeleton`とup-to-date branchを最終確認する

前提ゲート完了前にPhase 3のMVP sourceを実装しない。

## 実装項目

- [ ] Engagement Service
- [ ] Scope/ROE Service
- [ ] Policy Engine adapter
- [ ] Approval Service
- [ ] Model Gateway abstractionとlocal fake
- [ ] Tool Gateway mock
- [ ] Credential Broker mock
- [ ] model/Runner非依存Emergency Stop
- [ ] append-only Audit event generation
- [ ] composition rootとローカル統合test harness
- [ ] Schema、architecture、traceability、文書更新

## 強制制約

- 実秘密、外部model API、任意command、任意URL/IP、shell/process、cloud SDKを導入しない。
- すべての操作は`engagement_id`へバインドする。
- 書込み操作は独立approverによる内容バインド済み承認recordを必須とする。
- intent auditを先にappendできない操作はstateを変更しない。
- Emergency Stopはmodel、Tool Gateway、Runnerに依存せず、Control Plane stateと新規operation gateを直接停止する。
- Credential Broker mockはopaque synthetic capability metadataだけを返し、credential value、token、password、key型を持たない。

## 影響する信頼境界

- TB-CP: Phase 3の唯一のruntime boundary。ローカルprocess内のtyped serviceとmemory adapterとして実装する。
- TB-EP: Tool Gateway mockのdeny/non-executable responseだけ。Runner通信なし。
- TB-CR: opaque target/scenario IDのScope検証だけ。range通信なし。
- TB-OP: append-only audit portとfail-closed behaviorだけ。WORM backendは未実装。
- TB-AI: model abstractionとdeterministic fakeだけ。外部通信なし。

## ADR評価

既存ADR-003、ADR-013、ADR-014の範囲内であり、製品・network・credential方式を新規選定しない。ローカルmemory-only compositionはADR-006の実装前段である。判断を変更する新規ADRは現時点で不要。

## 完了条件

- Scope逸脱を拒否する。
- 期限切れROEを拒否する。
- 自己承認を拒否する。
- audit append失敗時にstateを変更しない。
- Kill Switchがmodel、Tool Gateway、Runnerなしでoperationを停止する。
- 統合testが成功する。
- Phase 2の非実行architecture controlsが回帰しない。

## 未解決事項

- GitHub CLI device flowは対話端末出力をユーザーが閲覧できず未認証。別の対話端末またはユーザーローカル環境でのみ継続できる。
- repository transferによりclassic branch protection ruleが消失したため、organization側に再作成した。移管後のCI check contextを再登録するまでPhase 3実装を開始しない。
- 2 approvalsを実際に満たすには、repository owner以外に少なくとも2名の独立reviewerが必要である。collaborator/organization role assignmentは人間判断を要する。
- public化以前にrepositoryへ含めた情報は公開済みとして扱う。実秘密、個人情報、内部限定情報を履歴へ追加しない（R-024）。

## 検証結果

- Public repository: `isolated-ai-cyber-evaluation-org/isolated-ai-cyber-evaluation`
- Phase 2 bootstrap PR: `#1`
- `main` Phase 2 commit: `c14cb8d4490ab1fa5b663e15756a30e1f4752bbe`
- Commit signature: GitHub UIで`Verified`
- GitHub Actions: `repository-skeleton-validation / Validate non-executable skeleton`が成功
- Repository transfer: organization `isolated-ai-cyber-evaluation-org`へ完了
- Visibility: GitHub connectorとGitHub UIで`public`を確認
- Transfer finding: 移管前classic rule `80705248`はorganization repositoryへ引き継がれなかった
- Recreated classic branch protection rule ID: `80707009`
- 再設定済み: PR必須、2 approvals、stale approval dismissal、latest-push independent approval、conversation resolution、signed commits、linear history、administrator bypass禁止、force push禁止、delete禁止
- Enforcement verification: GitHub UIで`Currently applies to 1 branch`を確認し、private repository時の`Not enforced`表示がないことを確認
- Pending verification: 移管後のPR CIを実行し、required check `Validate non-executable skeleton`を追加する
- Phase 3 implementation/integration tests: 未実行。required-check再登録ゲートでfail-closed停止中。
