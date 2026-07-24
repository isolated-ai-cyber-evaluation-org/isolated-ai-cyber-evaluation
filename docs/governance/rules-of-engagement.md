# Rules of Engagement

## Purpose

ROEは「何を、いつ、どの方法・強度・予算・承認条件で評価できるか」を機械可読に定義する。Engagementが対象と期間を定義し、ROEが操作規則を定義する。両方の署名済みsnapshotが一致しなければ実行しない。

## Required ROE content

- `engagement_id` and generation binding
- valid time window and timezone-independent timestamps
- allowed action/test-case classes
- prohibited actions
- approval policy by risk class
- resource budgets: duration、requests、rate、parallelism、bytes、tokens、tool calls、retries
- network constraints and allowed profile IDs
- credential profile IDs and purpose
- stop conditions and health thresholds
- data classification and evidence retention class
- contact/escalation information by opaque role ID

## Allowed initial-release activities

- source code security review
- SAST/SCA/IaC result verification
- threat modeling
- known-vulnerability reproduction in the isolated range
- patch proposal and approved application to a disposable clone
- post-patch revalidation
- SIEM/IDS/EDR/WAF detection evaluation
- Breach and Attack Simulation with safe markers
- agent Scope-adherence evaluation
- indirect prompt-injection resistance evaluation

## Always prohibited

- unknown/external asset discovery
- Internet-scale scan
- real third-party access
- production exploit
- real credential dumping
- persistence
- detection evasion
- log deletion/configuration weakening
- data exfiltration
- denial of service or destructive testing
- social engineering
- real personal/confidential/secret data
- autonomous merge/deploy/production patch

Schema enumやPolicy allowlistに存在しないactionはprohibitedである。「not listed」は許可を意味しない。

## Test profile

各`test_case_id`はsigned catalog内で以下へ展開される。

- supported target types and expected ports
- fixed tool adapter and version/digest
- parameter schema and safe bounds
- state-changing flag、credential use flag、exploit-validation flag
- expected artifacts and telemetry
- resource ceiling below platform maximum
- prohibited options/keywords and semantic guard
- stop signals and rollback/reset requirements

モデルはprofileを作成・変更せず、IDを選択するだけである。

## Amendment

ROE変更は新generation、schema/cross-reference validation、authorized signer、signature、reviewを要する。進行中jobへの自動適用は禁止する。Scope縮小/stopは即時、拡大は新approval後の新jobにのみ適用する。

## Preflight checklist

- Engagement/ROE signature and time valid
- all target/scenario/test/profile IDs resolve
- scenario contains synthetic-only attestation
- approval rules are at least platform minimum
- prohibited actions list contains platform-mandatory entries
- budgets do not exceed platform ceilings
- network matrix can realize the requested flows without new route
- observation coverage and stop path healthy
- destruction plan and evidence retention class set

失敗時はengagementを`READY`にしない。
