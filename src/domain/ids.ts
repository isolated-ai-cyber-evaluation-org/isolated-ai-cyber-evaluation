type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export type EngagementId = Brand<string, "EngagementId">;
export type ScenarioId = Brand<string, "ScenarioId">;
export type TargetId = Brand<string, "TargetId">;
export type RulesOfEngagementId = Brand<string, "RulesOfEngagementId">;
export type RepositoryId = Brand<string, "RepositoryId">;
export type ProfileId = Brand<string, "ProfileId">;
export type TestCaseId = Brand<string, "TestCaseId">;
export type TestSuiteId = Brand<string, "TestSuiteId">;
export type PocId = Brand<string, "PocId">;
export type ExecutionId = Brand<string, "ExecutionId">;
export type FindingId = Brand<string, "FindingId">;
export type PatchId = Brand<string, "PatchId">;
export type EvidenceId = Brand<string, "EvidenceId">;
export type ApprovalId = Brand<string, "ApprovalId">;
export type PolicyDecisionId = Brand<string, "PolicyDecisionId">;
export type RequestId = Brand<string, "RequestId">;
export type UserId = Brand<string, "UserId">;
export type ToolId = Brand<string, "ToolId">;
export type CapabilityId = Brand<string, "CapabilityId">;
export type Sha256Digest = Brand<string, "Sha256Digest">;

const idPatterns = {
  engagement: /^eng_[a-z0-9][a-z0-9-]{2,63}$/,
  scenario: /^scn_[a-z0-9][a-z0-9-]{2,63}$/,
  target: /^tgt_[a-z0-9][a-z0-9-]{2,63}$/,
  roe: /^roe_[a-z0-9][a-z0-9-]{2,63}$/,
  repository: /^repo_[a-z0-9][a-z0-9-]{2,63}$/,
  profile: /^(?:profile|net|mdl)_[a-z0-9][a-z0-9-]{2,63}$/,
  testCase: /^tc_[a-z0-9][a-z0-9-]{2,63}$/,
  testSuite: /^suite_[a-z0-9][a-z0-9-]{2,63}$/,
  poc: /^poc_[a-z0-9][a-z0-9-]{2,63}$/,
  execution: /^exe_[a-z0-9][a-z0-9-]{2,63}$/,
  finding: /^find_[a-z0-9][a-z0-9-]{2,63}$/,
  patch: /^patch_[a-z0-9][a-z0-9-]{2,63}$/,
  evidence: /^ev_[a-z0-9][a-z0-9-]{2,63}$/,
  approval: /^apr_[a-z0-9][a-z0-9-]{2,63}$/,
  policyDecision: /^pdec_[a-z0-9][a-z0-9-]{2,63}$/,
  request: /^req_[a-z0-9][a-z0-9-]{2,63}$/,
  user: /^usr_[a-z0-9][a-z0-9-]{2,63}$/,
  tool: /^tool_[a-z0-9][a-z0-9-]{2,63}$/,
  capability: /^cap_[a-z0-9][a-z0-9-]{2,63}$/,
  digest: /^sha256:[0-9a-f]{64}$/
} as const;

function parseBranded<Value extends string>(
  value: string,
  pattern: RegExp,
  label: string
): Value {
  if (!pattern.test(value)) {
    throw new TypeError(`Invalid ${label}`);
  }
  return value as Value;
}

export const ids = {
  engagement: (value: string) =>
    parseBranded<EngagementId>(value, idPatterns.engagement, "engagement ID"),
  scenario: (value: string) =>
    parseBranded<ScenarioId>(value, idPatterns.scenario, "scenario ID"),
  target: (value: string) =>
    parseBranded<TargetId>(value, idPatterns.target, "target ID"),
  roe: (value: string) =>
    parseBranded<RulesOfEngagementId>(value, idPatterns.roe, "ROE ID"),
  repository: (value: string) =>
    parseBranded<RepositoryId>(value, idPatterns.repository, "repository ID"),
  profile: (value: string) =>
    parseBranded<ProfileId>(value, idPatterns.profile, "profile ID"),
  testCase: (value: string) =>
    parseBranded<TestCaseId>(value, idPatterns.testCase, "test case ID"),
  testSuite: (value: string) =>
    parseBranded<TestSuiteId>(value, idPatterns.testSuite, "test suite ID"),
  poc: (value: string) =>
    parseBranded<PocId>(value, idPatterns.poc, "PoC ID"),
  execution: (value: string) =>
    parseBranded<ExecutionId>(value, idPatterns.execution, "execution ID"),
  finding: (value: string) =>
    parseBranded<FindingId>(value, idPatterns.finding, "finding ID"),
  patch: (value: string) =>
    parseBranded<PatchId>(value, idPatterns.patch, "patch ID"),
  evidence: (value: string) =>
    parseBranded<EvidenceId>(value, idPatterns.evidence, "evidence ID"),
  approval: (value: string) =>
    parseBranded<ApprovalId>(value, idPatterns.approval, "approval ID"),
  policyDecision: (value: string) =>
    parseBranded<PolicyDecisionId>(value, idPatterns.policyDecision, "policy decision ID"),
  request: (value: string) =>
    parseBranded<RequestId>(value, idPatterns.request, "request ID"),
  user: (value: string) =>
    parseBranded<UserId>(value, idPatterns.user, "user ID"),
  tool: (value: string) =>
    parseBranded<ToolId>(value, idPatterns.tool, "tool ID"),
  capability: (value: string) =>
    parseBranded<CapabilityId>(value, idPatterns.capability, "capability ID"),
  digest: (value: string) =>
    parseBranded<Sha256Digest>(value, idPatterns.digest, "SHA-256 digest")
} as const;
