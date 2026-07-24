import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tracePath = path.join(
  root,
  "docs/governance/phase-03-traceability.md"
);
const trace = fs.readFileSync(tracePath, "utf8");

for (let i = 1; i <= 10; i += 1) {
  assert.ok(
    trace.includes(`P3-${String(i).padStart(2, "0")}`),
    `missing P3-${i}`
  );
}
for (let i = 1; i <= 7; i += 1) {
  assert.ok(
    trace.includes(`P3C-${String(i).padStart(2, "0")}`),
    `missing P3C-${i}`
  );
}
for (let i = 1; i <= 6; i += 1) {
  assert.ok(
    trace.includes(`P3D-${String(i).padStart(2, "0")}`),
    `missing P3D-${i}`
  );
}

const referencedPaths = [
  ...trace.matchAll(
    /`((?:src|api|tests|schemas|policy|docs|\.github)[^`]*?)`/g
  )
]
  .map((match) => match[1])
  .filter((value) => !value.includes("*") && !value.endsWith("/"));
for (const relative of referencedPaths) {
  assert.ok(
    fs.existsSync(path.join(root, relative)),
    `missing trace target ${relative}`
  );
}
process.stdout.write("PASS TRACE-301 Phase 3 requirement-design-test mappings\n");
