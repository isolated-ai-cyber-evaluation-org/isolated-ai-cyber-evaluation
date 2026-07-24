import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === "upload") return [];
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const markdown = walk(root).filter((name) => name.endsWith(".md"));
const broken = [];
const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
for (const file of markdown) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(linkPattern)) {
    const target = match[1].split("#")[0];
    if (!target || /^(https?:|mailto:|evidence:)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) broken.push(`${path.relative(root, file)} -> ${target}`);
  }
}
assert.deepEqual(broken, [], `broken local links:\n${broken.join("\n")}`);
process.stdout.write(`PASS DOC-001 local links (${markdown.length} markdown files)\n`);

const trace = fs.readFileSync(path.join(root, "docs/governance/traceability-matrix.md"), "utf8");
for (let i = 1; i <= 18; i += 1) {
  assert.ok(trace.includes(`INV-${String(i).padStart(2, "0")}`), `missing INV-${i}`);
}
for (let i = 1; i <= 15; i += 1) {
  assert.ok(trace.includes(`DONE-${String(i).padStart(2, "0")}`), `missing DONE-${i}`);
}
const risks = fs.readFileSync(path.join(root, "docs/security/risk-register.md"), "utf8");
assert.ok((risks.match(/Open-high/g) || []).length >= 8, "expected explicit open high risks");
const assumptions = fs.readFileSync(path.join(root, "docs/assumptions.md"), "utf8");
assert.ok((assumptions.match(/\| open \|/g) || []).length >= 8, "expected explicit open assumptions");
process.stdout.write("PASS DOC-002 traceability and open risks\n");

for (const relative of [
  "docs/reviews/design-review-checklist.md",
  "docs/design/implementation-roadmap.md",
  "docs/governance/verification-plan.md"
]) {
  assert.ok(fs.statSync(path.join(root, relative)).size > 500, `${relative} is unexpectedly empty`);
}
process.stdout.write("PASS DOC-003 checklist, verification plan and roadmap\n");
