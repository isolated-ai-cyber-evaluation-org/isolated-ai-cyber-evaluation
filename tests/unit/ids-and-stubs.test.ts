import assert from "node:assert/strict";
import test from "node:test";
import {ids} from "../../src/domain/ids.ts";
import {AuditEventFactory} from "../../src/services/audit-event-factory.ts";
import {InMemoryAppendOnlyAuditSink} from "../../src/stubs/in-memory-audit-sink.ts";

test("opaque ID parser rejects raw destinations", () => {
  assert.throws(() => ids.target("203.0.113.10"), TypeError);
  assert.throws(() => ids.target("https://example.invalid"), TypeError);
  assert.throws(() => ids.engagement("not-an-engagement"), TypeError);
  assert.throws(() => ids.capability("https://example.invalid"), TypeError);
  assert.throws(() => ids.digest("sha256:not-a-digest"), TypeError);
});

test("audit factory binds digest to engagement, actor, action, and event", () => {
  const factory = new AuditEventFactory();
  const input = {
    engagementId: ids.engagement("eng_synthetic-web-001"),
    actorId: ids.user("usr_auditor-001"),
    actionDigest: ids.digest(
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    ),
    nowEpochMs: 1_000,
    eventType: "ENGAGEMENT_TRANSITION_ATTEMPT"
  } as const;
  const first = factory.create(input);
  const second = factory.create(input);
  const different = factory.create({...input, eventType: "MODEL_PROPOSAL_ATTEMPT"});
  assert.equal(first.eventDigest, second.eventDigest);
  assert.notEqual(first.eventDigest, different.eventDigest);
  assert.ok(Object.isFrozen(first));
});

test("in-memory audit sink exposes frozen snapshots", async () => {
  const sink = new InMemoryAppendOnlyAuditSink();
  await sink.append({
    engagementId: ids.engagement("eng_synthetic-web-001"),
    eventType: "POLICY_DECISION",
    eventDigest: ids.digest(
      "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
    ),
    actionDigest: ids.digest(
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    ),
    actorId: ids.user("usr_auditor-001"),
    occurredAtEpochMs: 1_000
  });
  const snapshot = sink.snapshot();
  assert.equal(snapshot.length, 1);
  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot[0]));
});
