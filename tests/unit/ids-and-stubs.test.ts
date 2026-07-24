import assert from "node:assert/strict";
import test from "node:test";
import {ids} from "../../src/domain/ids.ts";
import {InMemoryAppendOnlyAuditSink} from "../../src/stubs/in-memory-audit-sink.ts";

test("opaque ID parser rejects raw destinations", () => {
  assert.throws(() => ids.target("203.0.113.10"), TypeError);
  assert.throws(() => ids.target("https://example.invalid"), TypeError);
  assert.throws(() => ids.engagement("not-an-engagement"), TypeError);
  assert.throws(() => ids.digest("sha256:not-a-digest"), TypeError);
});

test("in-memory audit sink exposes frozen snapshots", async () => {
  const sink = new InMemoryAppendOnlyAuditSink();
  await sink.append({
    engagementId: ids.engagement("eng_synthetic-web-001"),
    eventType: "POLICY_DECISION",
    eventDigest: ids.digest(
      "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
    ),
    occurredAtEpochMs: 1_000
  });
  const snapshot = sink.snapshot();
  assert.equal(snapshot.length, 1);
  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot[0]));
});
