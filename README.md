# Isolated AI Cyber Evaluation Platform

生成AIを分析・計画・証拠整理・修正提案に用いながら、認可、実行、資格情報、ネットワーク、監査を決定論的な外部制御で強制する防御的評価基盤の設計リポジトリである。同時に、Web/API、Linux、Windows、コンテナ/Kubernetes、クラウド設定を合成資産で模擬する完全隔離サイバーレンジを設計する。

## Phase

現在は **Phase 02: Non-executable repository skeleton** である。Phase 1設計に加え、TypeScript型、IDベースAPI、純粋Policy判断、明示状態機械、deny-only stub、CIと負のテストを含む。実環境へのデプロイ、外部通信、shell/process実行、cloud/IaC、credential、脆弱性悪用、攻撃ツール実行は実装していない。

## Non-negotiable boundary

- 制御、実行、レンジ、監視を別の信頼境界、IAM、資格情報、ネットワーク、実行ホストに分ける。
- モデルを認可主体にしない。モデルは署名済みScope/ROEを変更できない。
- モデルにroot shell、任意コマンド、任意URL/IP、任意ネットワークを渡さない。
- すべてのツール要求をPolicy EngineとTool Gatewayで完全仲介する。
- 状態変更、Exploit検証、認証情報利用には独立した人間承認を要求する。
- サイバーレンジに一般インターネット、社内、本番への経路を作らない。
- 実行プレーンの送信をデフォルト拒否とする。
- 監査記録を実行側から変更・削除できない監視プレーンへ保存する。
- 自動マージ、自動デプロイ、自動本番反映を行わない。

## Repository map

- [Architecture](ARCHITECTURE.md)
- [Documentation index](docs/index.md)
- [Active Phase 3 plan](docs/exec-plans/active/phase-03-control-plane-mvp.md)
- [Completed Phase 2 plan](docs/exec-plans/completed/phase-02-repository-skeleton.md)
- [Security principles](docs/security/security-principles.md)
- [Threat model](docs/security/threat-model.md)
- [Network matrix](docs/security/network-matrix.md)
- [API boundaries](docs/design/api-boundaries.md)
- [Risk register](docs/security/risk-register.md)
- [Traceability matrix](docs/governance/traceability-matrix.md)
- [Design review checklist](docs/reviews/design-review-checklist.md)

## Validation

```sh
npm ci
make validate
```

`make validate` はSchema、型、Scope/Approval/Policy停止、状態遷移、API、architecture invariant、文書リンク、Mermaidソースを検査する。IaC、コンテナ、VMイメージ、実行adapterは存在しないため、それらの検証は後続フェーズのゲートである。

## Safety

このリポジトリは、明示的に認可された合成・使い捨て資産の防御的評価だけを対象とする。実在する第三者資産、実データ、実資格情報、インターネット規模の探索、DoS、永続化、回避、ログ消去、持出し、社会工学には使用しない。
