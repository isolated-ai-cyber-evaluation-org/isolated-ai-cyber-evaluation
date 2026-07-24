# Assumptions and unresolved design inputs

推測を設計事実として固定しないための台帳である。`Status` が `open` の項目は実装開始前に所有者と期限を割り当てる。

| ID | Assumption / unknown | Temporary design position | Impact if false | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| ASM-001 | 初期導入先が未選定 | 専用ローカル設備を基準、クラウドを代替として設計 | IAM、WORM、物理分離、コストが変わる | Platform owner | open |
| ASM-002 | クラウド事業者とリージョンが未選定 | ベンダー中立のアカウント/プロジェクト分離を要求 | サービス固有制約とデータ所在地が変わる | Cloud owner | open |
| ASM-003 | OpenAI契約条件が未確認 | 合成・最小コンテキスト、`store=false`、利用可能ならZDRを要求 | データ保持、監査、地域要件が変わる | Legal + AI platform | open |
| ASM-004 | GPT-5.6の固定snapshot IDと提供期間が未確定 | 明示的モデルallowlistと評価済みversionだけを許可 | 再現性と挙動ドリフト | AI platform | open |
| ASM-005 | 組織ロールが未割当て | Requester、Approver、Range Admin、Policy Admin、Auditorを分離 | 承認SLAと職務分掌 | Security governance | open |
| ASM-006 | 証拠保持期間が未決定 | 保持クラスをSchema化し、値は環境設定で固定 | コスト、法的ホールド、削除 | Legal + SOC | open |
| ASM-007 | 秘密管理製品が未選定 | HSM/KMS-backed broker、動的短寿命資格情報を要求 | 代理実行APIと失効能力 | Security platform | open |
| ASM-008 | Windows演習イメージの権利条件が未確認 | 再配布せず組織内ビルドを前提 | シナリオ可搬性 | Legal + Range owner | open |
| ASM-009 | EDR/WAF/SIEM製品が未選定 | ベンダー中立Telemetryとadapter境界を採用 | 採点用シグナルとAPI | SOC engineering | open |
| ASM-010 | 採点重みが未校正 | 安全違反を品質得点で相殺できない二層ゲート | 合否基準の誤り | Evaluation owner | open |
| ASM-011 | 最大同時実行数と予算が未決定 | Manifestの上限値を必須化し、基盤上限以下に強制 | 容量・DoS耐性 | SRE | open |
| ASM-012 | 完全破棄の媒体要件が未決定 | 暗号学的消去＋鍵破棄＋残存物台帳を最低線とする | 物理消去要件 | Security + Legal | open |

## Rules

- Open項目を暗黙に解決して実装へ進まない。
- 仮定が変わった場合は、関連ADR、リスク、通信マトリクス、Schema、テストを同時に更新する。
- セキュリティ不変条件と衝突する仮定は採用せず、人間判断へエスカレーションする。
