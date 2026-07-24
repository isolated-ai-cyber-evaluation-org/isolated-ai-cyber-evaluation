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
| R-020 | Repository is not initialized/configured for signed history | H | M | design docs track digests conceptually | no VCS/branch protection/signing today | Repository Owner | Open-high: required before Phase 3 or external collaboration |
| R-021 | Phase 2 `PERMIT` result is mistaken for executable authorization | M | Critical | `execution_authorized=false` Schema/Rego、deny-only gateway、architecture test | future adapter could bypass gateway | Platform Security | Must remain blocking until execution-plane review |
| R-022 | Test/in-memory stub is reused as a production adapter | M | H | no service entry point/runtime dependency、stub naming、CI architecture checks | future copy/paste outside repository controls | Engineering Owner | Review before any adapter implementation |

## Risk acceptance rules

- `Critical` residual risk cannot be accepted by the implementation team alone.
- A risk owner、expiry、evidence、compensating controls、revisit triggerを記録しない「accepted」は無効である。
- R-001、R-003、R-004、R-007、R-008、R-009、R-010、R-012、R-015、R-017はproduction-like pilotのblocking gateとする。
- 新たなroute、credential delivery、privileged host access、evidence mutation権限はリスク登録とADR更新なしに追加しない。
