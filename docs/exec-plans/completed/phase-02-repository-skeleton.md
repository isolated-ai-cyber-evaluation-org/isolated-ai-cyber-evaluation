# Phase 02 — Non-executable repository skeleton

Status: approved and completed  
Owner: Principal Security Architect / Platform Engineering  
Last updated: 2026-07-24

## 目的

承認済みPhase 1設計を、型検査・Schema検証・Policy判断・状態遷移・architecture testが可能なリポジトリ骨格へ変換する。外部作用を持つ実装は一切含めず、すべての実行要求をdeny-only Tool Gatewayで終了させる。

## 作業項目

- [x] 添付Phase 1 ZIPと現行ツリーの一致確認
- [x] Phase 1計画をcompletedへ移動
- [x] Phase 2ディレクトリ構成と型定義
- [x] IDベースAPIインターフェースとOpenAPI契約
- [x] JSON Schema拡張とfixture
- [x] Policy Engine純粋参照実装・停止stub・fail-closed wrapper
- [x] deny-only Tool GatewayとScope/Approval stub
- [x] Engagement、Approval、Job、Runner状態機械
- [x] Scope外、未承認、Policy停止、負の状態遷移テスト
- [x] shell/network/cloud/credential/exploit非実装を強制するarchitecture test
- [x] CI、文書検証、トレーサビリティ更新
- [x] 全検証、SBOM、依存監査、成果物パッケージ化

## 前提

- Phase 1のsecurity invariants、ADR、network matrix、API boundaryを変更しない。
- 実装はNode.js/TypeScriptの純粋ドメイン層とインメモリstubに限定する。
- HTTP server、queue consumer、database、filesystem adapter、model client、cloud/VM/container driverを作らない。
- Credential Brokerは実装せず、秘密値・token・password・keyを表す型も導入しない。
- Policy `PERMIT`は実行権限ではなく、deny-only gatewayへ到達できるだけである。

## 判断事項

- TypeScript `strict` + `noEmit`で型検査し、Node.js標準test runnerで純粋ロジックを検証する。
- model-visible APIはdiscriminated unionとOpenAPI 3.1で定義し、引数はopaque IDとenumだけにする。
- Policy Engineは純粋参照実装、停止stub、例外を`INDETERMINATE`へ変換するwrapperに分割する。
- Tool Gateway stubはPolicy結果にかかわらず実作用を行わず、許可時も`EXECUTION_DISABLED`を返す。
- 状態遷移は明示tableとcompare-before-transitionで表現し、未定義遷移は例外にする。
- `src/`のimport allowlistと禁止primitiveをarchitecture testで検査する。

## 影響する信頼境界

- TB-CP: authorization、policy、approval、state interfacesの骨格
- TB-EP: deny-only Tool Gateway interface。Runner、network、process executorは未実装
- TB-CR: ID型とscenario contractのみ。range lifecycle/targetは未実装
- TB-OP: evidence/score IDとappend intent interfaceのみ。storage/telemetryは未実装

## ADR評価

既存ADR-003、ADR-013、ADR-014を具体化するが判断変更はない。新規インフラ・製品・通信を選定しないため、新ADRは不要と暫定判断する。矛盾が判明した場合は作業を止めて記録する。

## 進捗

- 添付 `cyber-evaluation-design-phase-01(1).zip` と現行Phase 1 archiveは同一SHA-256だった。
- Phase 1に87ファイル、7 Schema、14 ADR、10 Mermaid source、設計検証testが存在する。
- Phase 2で10 Schema、27 TypeScript source、OpenAPI契約、Rego/TypeScript Policy骨格、4状態機械、CI、単体/API/architecture/traceability testを追加した。
- `PERMIT`を含む全Policy結果が外部作用へ到達しないdeny-only Tool Gatewayを実装した。
- Phase 2要件、制約、完了条件を `docs/governance/phase-02-traceability.md` へ対応付けた。

## 未解決事項

- OPA binaryが検証環境に存在しないため、Rego native evaluationは未実行。Phase 2では同じ判断をTypeScript純粋参照実装とfixture-based Rego structure testで検証した。
- Mermaid CLIが存在しないため、10図のrender testは未実行。source presenceと文書linkは検証済み。
- OpenAPIはYAML構文、closed path set、12 tool、禁止field、外部Schema参照を検証したが、独立したOpenAPI全仕様validatorは導入していない。
- R-020の通りVCS、署名履歴、branch protectionは未構成であり、Phase 3または外部共同作業前のblocking decisionである。

## リスク

- skeletonの`PERMIT`を将来の実行許可として誤用する
- 型にraw destinationやcredential valueが後から追加される
- test用stubがproduction adapterとして流用される
- 状態遷移tableと設計文書がdriftする
- CIの追加が外部deploy権限を持つ

## 検証結果

- `npm ci --ignore-scripts`: lockfileから11開発packageを再構築、成功。
- `npm run validate`: 成功。TypeScript strict、10 Schema compile、10 positive document/fixture、Schema negative/cross-reference、11 Policy case、17 unit test、API、9 architecture check、traceability、56 Markdown、secret pattern scanを検証した。
- 主要完了条件: `POL-102` Scope外拒否、`POL-103` 未承認拒否、`POL-104` Policy停止時fail closed、`STATE-101..103` 負の状態遷移がすべて成功。
- `make supply-chain-check`: `npm audit` 0 vulnerabilities、CycloneDX SBOM JSON生成・parse成功。
- 実行していないもの: OPA native evaluation、Mermaid render、HTTP server、ネットワーク通信、shell/process、cloud/IaC、Runner/range、Exploit、credential、deploy。
