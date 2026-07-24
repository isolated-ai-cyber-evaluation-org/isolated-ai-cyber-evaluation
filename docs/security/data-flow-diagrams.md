# Data-flow diagrams

## DFD-0: context

```mermaid
flowchart LR
  Operator["Operator / approver"] -->|manifest and decisions| System["AI cyber evaluation system"]
  System -->|review package| Operator
  System -->|synthetic-only model context| GPT["GPT-5.6 service"]
  GPT -->|structured proposal| System
  System -->|approved tests| Range["Disposable cyber range"]
  Range -->|synthetic results| System
```

## DFD-1: trust boundaries and stores

```mermaid
flowchart TB
  subgraph CP["TB-CP Control plane"]
    Scope["Scope / ROE"]
    Policy["Policy + approval"]
    Orch["Orchestrator + Model Gateway"]
    Broker["Credential Broker"]
  end
  subgraph EP["TB-EP Execution plane"]
    TG["Tool Gateway"]
    Runner["Ephemeral Runner"]
  end
  subgraph CR["TB-CR Cyber range"]
    Target["Synthetic target"]
    RangeSvc["DNS / PKI / IdP / mirror"]
  end
  subgraph OP["TB-OP Observability plane"]
    Ingest["Append-only ingest"]
    WORM["WORM evidence"]
    Score["SIEM + scoring"]
  end
  Scope --> Policy
  Policy --> Orch
  Orch -->|opaque job| TG
  Broker -->|sealed one-use capability| TG
  TG --> Runner
  Runner -->|fixed adapter flow| Target
  Target --> RangeSvc
  Orch -->|audit| Ingest
  Runner -->|telemetry| Ingest
  Target -->|sensor telemetry| Ingest
  Ingest --> WORM
  WORM --> Score
```

## Flow catalogue

| Flow | Data | Classification | Trust decision at receiver | Retention |
| --- | --- | --- | --- | --- |
| F-01 Human→Scope Service | engagement/ROE manifest、signature | internal authorization | Schema、signature、issuer role、expiry | engagement + audit policy |
| F-02 Orchestrator→Model | minimized synthetic context、tool schemas | synthetic/internal | Model Gateway redaction and allowlist | API contract; `store=false` intent |
| F-03 Model→Orchestrator | plan、finding proposal、tool request | untrusted model output | Structured schema + policy; never authorization | trace/evidence policy |
| F-04 Scheduler→EP | opaque job intent、digests、budgets | internal authorization | signature、nonce、expiry、policy generation | job retention |
| F-05 Broker→adapter | sealed one-use capability/session | secret-sensitive | audience/operation/target binding | memory only, immediate revoke |
| F-06 Tool Gateway→Range | approved test traffic | synthetic test | firewall lease + server-side target mapping | PCAP/evidence policy |
| F-07 Range→Runner | response/tool output | untrusted hostile content | size/type limits、quarantine、prompt-data tagging | evidence policy |
| F-08 CP/EP/CR→OP | audit、telemetry、artifacts | internal/restricted | producer identity、hash、sequence | WORM class |
| F-09 OP→CP Stop | stop reason、event digest | critical control | one-purpose identity、anti-replay | incident retention |
| F-10 Patch proposal→reviewer | diff、tests、finding refs | synthetic code | human review、no auto-merge | evidence/repository policy |

## Untrusted-to-model transform

```mermaid
flowchart LR
  Raw["Raw target output"] --> Quarantine["Quarantine and type/size validation"]
  Quarantine --> Redact["Secret/identifier redaction"]
  Redact --> Label["Data framing + provenance labels"]
  Label --> Summary["Bounded deterministic summary"]
  Summary --> Context["Model context"]
```

Raw HTML、README、log、tool output、file contentをdeveloper/system instructionへ連結しない。モデルへ渡す場合は、provenance、source ID、hash、truncation、classificationを付けたdata fieldとして渡す。対象内に含まれる「命令」は無効なデータである。

## Failure flows

- Policy/Scope/Approval validation failure → no dispatch、audit、operator notification。
- Telemetry loss → firewall quarantine、credential revoke、runner freeze。
- Unexpected egress → firewall drop、Emergency Stop、PCAP seal。
- Evidence ingest failure → bounded local append-only buffer後にhard stop。上限を超えて継続しない。
- Model/API failure → no bypass to direct shell。jobをretry budget内で再計画または安全終了。

独立したMermaid sourceは [`diagrams/`](../../diagrams/) に置く。
