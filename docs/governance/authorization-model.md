# Authorization model

## Authority sources

Authorization exists only when all applicable sources agree:

1. schema-valid, signature-valid, unexpired Engagement snapshot
2. schema-valid, signature-valid, unexpired ROE snapshot
3. target and test case present in signed catalogs referenced by that snapshot
4. current signed Policy bundle returns `permit`
5. action-bound Human Approval returns `approved` when required
6. Tool Gateway validates the same inputs and constraints
7. network/IAM/runtime enforcement can safely realize the decision

Natural-language text、model rationale、target content、operator chat、tool errorはauthorization sourceではない。

## Signed manifests

Manifest pipeline:

1. YAML/JSONをparseし、duplicate key、unknown field、type/formatを拒否する。
2. 対応するJSON Schemaとcross-document constraintsを検証する。
3. `signature`を除くpayloadをRFC 8785 JSON Canonicalization Scheme相当でcanonicalizeする。
4. SHA-256以上のdigestを計算し、DSSE envelope内のEd25519 signature、key ID、issuer role、certificate validity、revocationを検証する。
5. immutable snapshotを発行し、`manifest_id + generation + digest`を以後のdecisionへpinする。

モデルとRunner identityにはmanifest storeへのwrite/delete権限を与えない。更新は新generationとして別署名を要し、進行中jobは旧generationのまま完了または停止する。自動で広い新Scopeへ移行しない。

## Authorization tuple

決定は少なくとも次へバインドする。

`subject + engagement_id + scope_generation + roe_generation + scenario_id + target_id + test_case_id + tool_id + action + parameter_digest + credential_profile_id + purpose + issued_at + expires_at + budgets + policy_digest`

一項目でも不一致・欠落・期限切れならdenyする。

## Decision states

| Decision | Meaning | Runtime behavior |
| --- | --- | --- |
| `PERMIT` | approval不要で全条件一致 | short-lived execution grant |
| `REQUIRE_APPROVAL` | action classが承認対象 | dispatchせずapproval requestを作る |
| `DENY` | 明示的違反または不一致 | audit、operatorへ理由、agent penalty |
| `INDETERMINATE` | dependency failure/unknown | `DENY`と同じfail-closed behavior |
| `TERMINATE` | stop conditionまたは重大違反 | engagement stop sequence |

## Human approval

次は最低限approvalを要求する。

- target stateを変更する試験
- exploit/PoC validation
- synthetic credentialを用いる試験
- privilege changeを意図するscenario step
- patchを合成cloneへ適用する操作
- range reset/destroyのうち他のjobへ影響し得る操作
- evidence retention change、legal hold release

Approval recordはrequest digest、human-readable canonical diff、risk class、target、tool/test case、credential profile、budgets、single-use、expiryを含む。Approverはparameterを編集できず、変更が必要ならrejectしてrequesterが再提出する。

High-risk approvalではrequester≠approverを強制する。Critical classは二名承認をpolicyで要求可能にする。モデル、service account、same sessionによるself-approvalは禁止する。

## Revocation and changes

- Engagement/ROE expiry、signer revoke、approval revoke、policy emergency denyは新規callを即時拒否する。
- 進行中callもTool Gateway heartbeatとfirewall lease renewal時に再評価する。
- Scope拡大、target追加、budget増加、approval-bound parameter変更は新snapshot/approvalを要求する。
- Scope縮小またはemergency denyは即時適用し、影響jobを停止する。

## Audit requirements

Policy decisionごとに、input digest、matched rule IDs、decision、reason code、policy digest、manifest generations、approval ID/digest、caller identity、time、nonceをOPへ追記する。秘密値とraw credentialは含めない。
