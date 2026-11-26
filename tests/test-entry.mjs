// TDD-lite tests for the Robot Romance entry.
// Run: node --test tests/test-entry.mjs   (from the entry dir)
// Each test mirrors one kit requirement: gate limits, single-line
// UTF-8 output, determinism, and stdlib-only source.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const entryDir = dirname(fileURLToPath(import.meta.url)); // tests/ -> entry dir is parent
const repoDir = join(entryDir, "..");
const mainTs = join(repoDir, "main.ts");

async function runMain(outDir) {
  await run(process.execPath, [mainTs], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir, MAKEFUN_INPUT_DIR: "/input" },
    cwd: tmpdir(), // must not depend on cwd
  });
  return readFile(join(outDir, "entry.txt"), "utf8");
}

test("gate: entry.txt is UTF-8 text of 1 to 200 characters, not only whitespace", async () => {
  const out = await mkdtemp(join(tmpdir(), "robot-romance-"));
  const text = await runMain(out);
  assert.ok(text.length >= 1 && text.length <= 200, `length ${text.length} outside 1..200`);
  assert.ok(text.trim().length > 0, "entry is only whitespace");
});

test("format: exactly one line, no trailing newline games", async () => {
  const out = await mkdtemp(join(tmpdir(), "robot-romance-"));
  const text = await runMain(out);
  assert.equal(text.split("\n").filter((l) => l.length > 0).length, 1, "must be a single line");
  assert.ok(!text.includes("\r"), "no carriage returns");
});

test("determinism: two runs write byte-identical entry.txt", async () => {
  const a = await mkdtemp(join(tmpdir(), "robot-romance-a-"));
  const b = await mkdtemp(join(tmpdir(), "robot-romance-b-"));
  const textA = await runMain(a);
  const textB = await runMain(b);
  assert.equal(textA, textB);
});

test("stdlib-only: main.ts imports nothing outside node: builtins", async () => {
  const src = await readFile(mainTs, "utf8");
  const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const requires = [...src.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  for (const spec of [...imports, ...requires]) {
    assert.ok(spec.startsWith("node:"), `non-stdlib import: ${spec}`);
  }
});
