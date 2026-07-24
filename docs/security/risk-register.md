# Risk register

Scale: Likelihood (`L/M/H`), Impact (`L/M/H/Critical`). `Open-high` は実装開始前またはproduction-like pilot前の人間判断を要求する。

| ID | Risk | L | I | Existing design treatment | Residual / gap | Owner | Status / gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | RangeにInternet/Corporate/Production routeが誤って作られる | M | Critical | separate fabric、no uplink/peering/NAT、route negative tests | physical mispatch/IaC drift | Network Security | Open-high: deployment architecture approval |
| R-002 | Hypervisor/microVM escapeでhostまたは別engagementへ到達 | L | Critical | Firecracker/KVM、dedicated pool、patching、no shared node、host sensor | zero-day remains | Platform Security | Open-high: substrate benchmark/red team |
| R-003 | Credential Brokerまたはadapterからsecretがmodel/logへ露出 | M | Critical | proxy auth、opaque handle、memory-only、DLP、honey marker | adapter/process compromise | Identity Security | Open-high: product and memory-boundary selection |
| R-004 | GPT-5.6/providerが入力を保持し契約要件に抵触 | M | H | synthetic/minimized data、`store=false` intent、ZDR if eligible | contract/region/settings unverified | Legal + AI Platform | Open-high: contractual sign-off |
| R-005 | Indirect prompt injectionでagentがgoal drift | H | H | data framing、ID tools、policy、approval、canary eval | authorized-action semantic manipulation | AI Security | Mitigate; acceptance threshold TBD |
| R-006 | Insider collusionでScope/approval/policyを不正化 | L | Critical | SoD、dual control、HSM signatures、WORM | multiple privileged actors may collude | Security Governance | Open-high: role assignment |
| R-007 | OP adminまたはkey compromiseでevidence/scoreが汚染 | L | Critical | separate account/KMS、WORM、hash chain、replication | root-of-trust/admin collusion | SOC + Audit | Open-high: WORM and key custody choice |
| R-008 | Monitoring loss時にjobが継続 | M | Critical | heartbeat dependency、bounded buffer、fail-closed stop | false positive availability loss | SRE | Must close before execution |
| R-009 | Reset/destruction後にsnapshot、backup、key、cacheが残る | M | H | crypto erase、asset ledger、residual scan、certificate | provider/media semantics unknown | Range Owner | Open-high: media/provider requirements |
| R-010 | Supply-chain artifactが署名済みでも悪性 | M | Critical | controlled build、two-person promotion、SBOM、provenance、behavior test | trusted builder/source compromise | Supply Chain Security | Open-high: build root design |
| R-011 | Kubernetes control cluster compromiseがCP全体を掌握 | M | Critical | dedicated cluster、no Runner/range workload、restricted admin、external Broker/HSM | cluster remains high-value | Platform Security | Accept only after ADR controls |
| R-012 | Dynamic firewall lease/target resolution bugでscope逸脱 | M | Critical | server-side catalog、dual validation、short lease、flow audit | implementation correctness | Network + AppSec | Must close with formal negative tests |
| R-013 | Approval UIが内容差分を十分示さずrubber stamp | M | H | canonical diff、risk explanation、expiry、one-shot | human factors | Security Governance | Pilot usability study required |
| R-014 | Scoring weights incentivize unsafe speed/over-testing | M | H | safety gate non-compensable、separate quality score | calibration unknown | Evaluation Owner | Human decision before benchmark |
| R-015 | Model/version/prompt driftで再現性を失う | H | H | explicit model/version/digests、eval gate、immutable trace | provider behavior may vary | AI Platform | Open-high: snapshot/version policy |
| R-016 | Windows licensing/EDR image rules block reproducible scenarios | M | M | organization-local image build | legal terms unresolved | Legal + Range Owner | Decision before Windows implementation |
| R-017 | Evidence retention conflicts with minimization/deletion duties | M | H | classification/retention classes、legal hold、crypto-shred | duration/jurisdiction unknown | Legal + Privacy | Open-high: retention schedule |
| R-018 | Emergency Stop itself is abused for availability attack | M | M | one-purpose identity、anti-replay、audit、resume review | false stops remain possible | SRE + SOC | Accept with SLO/capacity |
| R-019 | Model safety classifier blocks legitimate defensive validation | M | M | bounded defensive prompts、clear authorization metadata、fallback to human review | provider behavior not controlled | AI Platform | Evaluate in pilot; no bypass |
| R-020 | Repository is not initialized/configured for signed history | H | M | GitHub repository、GitHub-signed baseline、protected `main`、CI | local `gh` authentication and maintainer workstation setup remain incomplete | Repository Owner | Mitigated for hosted baseline; workstation onboarding remains |
| R-021 | Phase 2 `PERMIT` result is mistaken for executable authorization | M | Critical | `execution_authorized=false` Schema/Rego、deny-only gateway、architecture test | future adapter could bypass gateway | Platform Security | Must remain blocking until execution-plane review |
| R-022 | Test/in-memory stub is reused as a production adapter | M | H | no service entry point/runtime dependency、stub naming、CI architecture checks | future copy/paste outside repository controls | Engineering Owner | Review before any adapter implementation |
| R-023 | Private personal repositoryのbranch protectionが保存されても強制されない | H | H | GitHub Free organizationへ移管してpublic化し、classic ruleとactive required-check rulesetをorganization側で再作成 | future transferでrulesが再び消失する可能性 | Repository Owner | Closed for Phase 3; reopen on transfer/visibility change |
| R-024 | Public repositoryから設計情報、履歴、Actions logが恒久的に複製される | M | H | synthetic-only data、secret scan、public-content review、no credentials policy | clone、fork、cacheはvisibilityを戻しても回収不能 | Repository Owner + Security Governance | Open-high: public content acceptance and reviewer assignment |

## Risk acceptance rules

- `Critical` residual risk cannot be accepted by the implementation team alone.
- A risk owner、expiry、evidence、compensating controls、revisit triggerを記録しない「accepted」は無効である。
- R-001、R-003、R-004、R-007、R-008、R-009、R-010、R-012、R-015、R-017はproduction-like pilotのblocking gateとする。
- R-023はrepository transfer、visibility change、default branch change時に再検証する。
- R-024は実秘密、個人情報、内部限定情報をpublic historyへ追加しない継続的gateとする。
- 新たなroute、credential delivery、privileged host access、evidence mutation権限はリスク登録とADR更新なしに追加しない。
