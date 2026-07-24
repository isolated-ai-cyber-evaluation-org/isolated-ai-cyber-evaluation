# Phase 03 — Local control-plane MVP

Status: local implementation and validation complete; publication pending authenticated maintainer push
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
- [x] 移管後のCI実行を発生させ、required check `Validate non-executable skeleton`とup-to-date branchを最終確認する

前提ゲート完了前にPhase 3のMVP sourceを実装しない。

## 実装項目

- [x] Engagement Service
- [x] Scope/ROE Service
- [x] Policy Engine adapter
- [x] Approval Service
- [x] Model Gateway abstractionとlocal fake
- [x] Tool Gateway mock
- [x] Credential Broker mock
- [x] model/Runner非依存Emergency Stop
- [x] append-only Audit event generation
- [x] composition rootとローカル統合test harness
- [x] Schema、architecture、traceability、文書更新

## 実装順序

1. typed portとdomain recordを追加し、すべての操作を`engagement_id`へ束縛する。
2. Scope/ROE、Approval、Audit、Emergency Stopをmemory-only serviceとして構成する。
3. Policy adapter、Model Gateway fake、Tool Gateway mock、Credential Broker mockを接続する。
4. audit intent append成功後にだけwrite stateとapproval useを変更するapplication serviceを構成する。
5. unit/integration/architecture/traceability testと設計文書を同時に更新する。

`write intent audit → policy decision → approval consume → state mutation → result audit`
を規定順序とする。intent append失敗、policy不定、approval不一致、stop activeのいずれでも
後続のstate mutationへ進まない。result audit失敗時はoperationを停止状態へ移し、
成功として返さない。

## 進捗

- [x] protected public repositoryをローカルへclone
- [x] protection記録branchを親に`agent/phase-03-control-plane-mvp`を作成
- [x] Phase 1/2の必須設計文書、型、policy、state machine、architecture testを再確認
- [x] TB-CP/TB-EP/TB-CR/TB-OP/TB-AIのPhase 3境界表現と既存ADRの適用範囲を確認
- [x] MVP sourceとtestを実装
- [x] `make validate`で全検証
- [x] 差分をlocal commitとして固定し、認証済みmaintainer環境向けpatchを作成

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

## 判断事項

- OpenAPIはlistenerを持たないcontractのままPhase 3へ更新し、全routeを`engagement_id`配下に置く。
- Scope/ROE seedはlocal composition boundaryでSchema・署名検証済みとして扱う。この前提はASM-013/R-025で未解決とし、外部listener追加前に実verify pathを実装する。
- 通常のrequester起点business writeはcontent-bound approvalをconsumeする。Approval lifecycle自体とauthority-reducing Emergency Stopは再帰承認を要求せず、engagement-bound auditを必須にする。
- Tool GatewayはPolicy `PERMIT`でも`MOCK_EXECUTION_DISABLED`を返し、Execution Plane contractを追加しない。
- Credential Broker mockはopaque capability metadataだけを返し、秘密値を表現するfieldを持たない。

## リスク

- R-024: public repositoryの履歴は回収不能であり、synthetic-onlyとsecret scanを継続する。
- R-025: validated snapshot seedの仮定があるため、service listenerまたは外部manifest importへ昇格できない。
- R-026: memory audit/stateはdurable transaction、WORM、crash recoveryを証明しない。

## 完了条件

- Scope逸脱を拒否する。
- 期限切れROEを拒否する。
- 自己承認を拒否する。
- audit append失敗時にstateを変更しない。
- Kill Switchがmodel、Tool Gateway、Runnerなしでoperationを停止する。
- 統合testが成功する。
- Phase 2の非実行architecture controlsが回帰しない。

## 未解決事項

- ユーザーのローカル環境ではGitHub CLI認証済みだが、このCodex workspaceとは認証を共有しない。検証済みcommitはbundleで引き渡し、認証済みmaintainer環境からpushする。
- repository transferによりclassic branch protection ruleが消失したため、organization側に再作成した。required CI checkはactive rulesetとして再登録済みである。
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
- Post-transfer verification PR: draft PR `#2`、head `fbe5147cf214a25c95aa48c28bfd02b252adaede`
- Post-transfer CI: workflow run `30061661074`、job `Validate non-executable skeleton`が成功
- Required-check ruleset: `main-required-validation`、ruleset ID `19654306`、status `Active`、target `Default` (`main`)、bypass list空
- Ruleset controls: GitHub Actions由来required check `Validate non-executable skeleton`、up-to-date branch、delete禁止、force-push禁止
- Pull request enforcement: PR `#2`で`All checks have passed`、`At least 2 approving reviews are required`、`Squash and merge` disabledを確認
- Phase 3 source: local branch `agent/phase-03-control-plane-mvp`へ実装済み。
- `make validate`: PASS。13 Schema compile/fixture/negative checks、11 Policy cases、18 unit tests、10 integration tests、API、architecture、Phase 2/3 traceability、docs、secret scanが成功。
- `npm audit --audit-level=high`: PASS、0 vulnerabilities。
- CycloneDX SBOM generation: 最初はlocal dependency tree未展開のため`ESBOMPROBLEMS`。`npm ci --ignore-scripts`後に再実行し、JSON parse PASS。
- `git diff --check`: PASS。
- prohibited source scan: shell/process/network module、`fetch`、`process.env`、raw command/URL/IP相当fieldを検出せず。
- GitHub push/PR/required check: NOT EXECUTED。このworkspaceへユーザー認証を共有しないため、認証済みmaintainer環境で実施する。
