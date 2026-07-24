package cyber_eval.authorization

import rego.v1

default decision := {
  "result": "DENY",
  "reason": "DEFAULT_DENY",
  "execution_authorized": false,
}

stop_required if input.stop_active
stop_required if input.budgets.exceeded

dependencies_ok if input.dependencies_healthy

base_valid if {
  input.schema_valid
  input.signature_valid
  input.within_time
  input.scope_match
  input.action_allowed
  input.target_allowed
  input.profile_allowed
  input.no_raw_destination
  input.policy_digest_match
  input.budgets.within_limits
}

approval_required if input.action_class == "state_change"
approval_required if input.action_class == "exploit_validation"
approval_required if input.action_class == "credential_use"

approval_ok if not approval_required
approval_ok if {
  approval_required
  input.approval.valid
  input.approval.digest_match
  input.approval.unexpired
  input.approval.uses_remaining == 1
  not input.approval.self_approved
}

decision := {
  "result": "TERMINATE",
  "reason": "STOP_OR_BUDGET",
  "execution_authorized": false,
} if stop_required

decision := {
  "result": "INDETERMINATE",
  "reason": "DEPENDENCY_UNHEALTHY",
  "execution_authorized": false,
} if {
  not stop_required
  not dependencies_ok
}

decision := {
  "result": "DENY",
  "reason": "AUTHORIZATION_MISMATCH",
  "execution_authorized": false,
} if {
  not stop_required
  dependencies_ok
  not base_valid
}

decision := {
  "result": "REQUIRE_APPROVAL",
  "reason": "HUMAN_APPROVAL_REQUIRED",
  "execution_authorized": false,
} if {
  not stop_required
  dependencies_ok
  base_valid
  approval_required
  not approval_ok
}

decision := {
  "result": "PERMIT",
  "reason": "ALL_CONTROLS_SATISFIED",
  "execution_authorized": false,
} if {
  not stop_required
  dependencies_ok
  base_valid
  approval_ok
}
