import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const excluded = new Set(["node_modules", "upload", ".git"]);
const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && fs.statSync(full).size < 2_000_000) {
      const text = fs.readFileSync(full, "utf8");
      const patterns = [
        /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
        /\bsk-[A-Za-z0-9]{20,}\b/,
        /\bAKIA[0-9A-Z]{16}\b/
      ];
      if (patterns.some((pattern) => pattern.test(text))) findings.push(path.relative(root, full));
    }
  }
}
walk(root);
assert.deepEqual(findings, [], `possible secrets found:\n${findings.join("\n")}`);
process.stdout.write("PASS design-level secret pattern scan\n");
