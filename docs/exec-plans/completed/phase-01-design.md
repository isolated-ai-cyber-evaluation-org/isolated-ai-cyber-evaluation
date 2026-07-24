# Phase 01 — Design

Status: completed and approved for Phase 2 skeleton  
Owner: Principal Security Architect  
Last updated: 2026-07-24

## 目的

生成AIを用いる防御的サイバー評価システムと、完全に隔離された使い捨てサイバーレンジについて、実装可能かつ機械検証可能な設計ベースラインを作る。本フェーズは文書、ADR、JSON Schema、例、Policy as Codeの契約、設計検証テストまでとし、デプロイ、外部通信、脆弱性悪用、攻撃ツール実行は行わない。

## 作業項目

- [x] 初期状態と添付 `AGENTS.md` の確認
- [x] セキュリティ不変条件と成果物一覧の確定
- [x] 四プレーン、信頼境界、データフロー、通信マトリクスの設計
- [x] Scope、ROE、承認、証拠、採点等のSchemaと例の作成
- [x] 脅威モデル、濫用ケース、リスク登録簿の作成
- [x] 14件以上のADRの作成
- [x] 10種類のMermaid図の作成
- [x] 要件・設計・テストのトレーサビリティ作成
- [x] アーキテクチャ、ポリシー、Schema、文書整合性テストの作成
- [x] 全設計検証と結果記録
- [x] 次フェーズ実装計画と人間の判断事項の確定

## 前提

- 初期リリースはWhite-box/Gray-boxの防御的評価だけを扱う。
- 対象は合成データと使い捨て演習資産に限定する。
- GPT-5.6は提案・分析主体であり、認可主体でも実行主体でもない。
- ベースラインはローカルファーストの専用設備とし、クラウドは同一境界を別アカウントで再現する代替構成とする。
- 未確定事項は `docs/assumptions.md`、高リスク事項は `docs/security/risk-register.md` に記録する。

## 判断事項

- Scope/ROEは、Schema検証後にRFC 8785相当の正規化表現へ変換し、Ed25519を用いるDSSE形式で署名検証する設計とする。
- Linux Runnerの第一候補をFirecracker microVM、Windows/特殊仮想化をKVM/libvirtとし、コンテナ単独を信頼境界にしない。
- OPAをPolicy Engineの基準実装とし、署名済みポリシーバンドルを固定してジョブ中の更新を禁止する。
- OpenTofuをIaC基準とし、イメージ生成は別工程で署名・SBOM・来歴を要求する。
- OpenAI Responses APIと構造化された関数呼出しを想定するが、Hosted Shell、Web Search、Computer Use等の組込み実行機能は本システムでは許可しない。
- 人間承認は操作内容のダイジェスト、Scope世代、対象、ツール、期限、回数へ暗号学的にバインドする。

## 進捗

- リポジトリは未初期化の空ディレクトリで、添付 `upload/AGENTS.md` のみ存在した。
- `AGENTS.md` をリポジトリ直下へ反映した。
- GPT-5.6の現行公開資料で、Responses API、Function Calling、Structured Outputs、`store=false`/データ保持設定を設計上の検討対象として確認した。
- OpenAI Developer Docs MCPは当該実行環境に存在せず、`codex` CLIも未導入だったため、公式OpenAIドメインの公開資料へフォールバックした。
- 四plane設計、全必須セキュリティ/ガバナンス/コンポーネント文書、14 ADR、10 Mermaid source、7 Schema、3 manifest例を作成した。
- Requirement→Design→Testの33行（INV-01..18、DONE-01..15）を追跡可能にした。
- Policy判断contract、Schema正例/負例、architecture/doc/secret検査をNode.jsで実行可能にした。
- npm監査で初期固定versionにmoderate脆弱性が見つかったため、`ajv 8.20.0` と `yaml 2.9.0` へ更新しlockfileを再生成した。

## 未解決事項

- 実装時の物理設備、クラウド事業者、リージョン、データ所在地
- HSM/KMS、Secret Manager、WORMストレージ、SIEMの製品選定
- OpenAI APIの契約上のデータ保持、ZDR適格性、リージョン要件
- WindowsライセンスとEDRテスト用イメージの再配布条件
- 承認者の人数、当番、緊急停止権限の組織割当て
- 証拠保持期間、法的ホールド、削除承認の具体値
- 採点重みと合格閾値の業務別キャリブレーション
- 実装開始前のリポジトリ初期化、ブランチ保護、署名方式

## リスク

- モデル出力を実行命令として誤信する設計退行
- サイバーレンジと管理/本番ネットワークの物理・経路上の混在
- Credential Broker経由の代理認証が実質的な秘密露出になる実装
- 監視停止時に継続実行する誤った可用性優先
- 破棄不能なスナップショット、ログ、バックアップ、クラウド残存物
- 悪意ある演習コンテンツによる間接プロンプトインジェクション
- サプライチェーン経由での署名済みイメージ・ポリシーの汚染

## 検証結果

### Executed

- `make validate`: PASS
  - JavaScript syntax/type-shape check: PASS
  - seven Draft 2020-12 JSON Schemas compile: PASS
  - three YAML examples and four JSON fixtures: PASS
  - cross-document IDs/time windows/budget ceilings: PASS
  - negative Schema controls (production data、Internet route、missing stop、critical approval quorum): PASS
  - 11 Policy contract cases: PASS
  - required-file/four-boundary/15 network deny/10 Mermaid/14 ADR checks: PASS
  - local links across 52 Markdown files: PASS
  - traceability/open-risk/checklist/roadmap checks: PASS
  - design-level secret pattern scan: PASS
- `make supply-chain-check`: PASS after dependency update
  - `npm audit --audit-level=high`: 0 vulnerabilities
  - CycloneDX SBOM generation and JSON parse: PASS

### Not executed / not claimable in Phase 01

- OPA binary was unavailable; Rego compile、strict check、native `opa test` were not executed. The executable test covers the decision contract, not OPA runtime semantics.
- Mermaid CLI was unavailable; source presence/type was checked, but diagrams were not renderer-validated.
- OpenTofu/Terraform、IaC security scan、container/VM image scan、cosign verification were not executed because Phase 01 contains no IaC or image.
- Runtime unit/integration、network isolation、microVM escape、credential non-exposure、WORM mutation denial、Emergency Stop latency、complete destruction were not executed because no platform was implemented.
- A dedicated secret-scanning product such as Gitleaks was unavailable; only the repository's narrow pattern scan ran.
- The workspace was not a Git repository, so commit signing、branch protection、history verification were not testable.
