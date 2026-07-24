import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tracePath = path.join(root, "docs/governance/phase-02-traceability.md");
const trace = fs.readFileSync(tracePath, "utf8");

for (let i = 1; i <= 10; i += 1) {
  assert.ok(trace.includes(`P2-${String(i).padStart(2, "0")}`), `missing P2-${i}`);
}
for (let i = 1; i <= 5; i += 1) {
  assert.ok(trace.includes(`P2C-${String(i).padStart(2, "0")}`), `missing P2C-${i}`);
}
for (let i = 1; i <= 6; i += 1) {
  assert.ok(trace.includes(`P2D-${String(i).padStart(2, "0")}`), `missing P2D-${i}`);
}

const referencedPaths = [...trace.matchAll(/`((?:src|api|tests|schemas|policy|docs|\.github)[^`]*?)`/g)]
  .map((match) => match[1])
  .filter((value) => !value.includes("*") && !value.endsWith("/"));
for (const relative of referencedPaths) {
  assert.ok(fs.existsSync(path.join(root, relative)), `missing trace target ${relative}`);
}
process.stdout.write("PASS TRACE-201 Phase 2 requirement-design-test mappings\n");
