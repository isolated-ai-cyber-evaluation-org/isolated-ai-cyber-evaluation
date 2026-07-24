# Phase 03 — Local control-plane MVP

Status: blocked on repository protection preflight  
Owner: Principal Security Architect / Platform Engineering  
Last updated: 2026-07-24

## 目的

承認済みPhase 2骨格を基に、ローカル開発環境内だけで動作するControl Plane MVPを実装する。外部モデル、実行プレーン、サイバーレンジ、クラウド、実資格情報とは接続しない。

## 前提ゲート

- [x] Private GitHub repositoryを作成する
- [x] `main`とGitHub署名済み初期commitを確認する
- [ ] Phase 2基準treeをGitHubへ登録する
- [ ] Phase 2 CIを成功させる
- [ ] signed commit、PR、2 approvals、required checks、stale approval dismissal、conversation resolution、force-push/delete/bypass禁止を`main`へ設定する
- [ ] protection設定をGitHub側から再読して検証する

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

- GitHub CLI device flowは対話端末出力をユーザーが閲覧できず未認証。GitHub接続機能とCloud Browserで前提ゲートを進める。
- GitHub API経由commitが`Verified`になるかを基準commitで検証する。未署名ならR-020をcloseせず、Phase 3実装を停止する。
- 個人private repositoryで要求したbranch protection機能が利用可能かはGitHub設定画面で確認する。

## 検証結果

未実行。前提ゲート、実装、negative/integration test、未実行項目を順次記録する。
