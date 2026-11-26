// Robot Romance: One-Line Pickup Lines for AI
// Writes one single-line joke pickup line to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Node 22, stdlib-only, deterministic: the same line every run.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// One line, 117 characters: a pickup line aimed at a CAPTCHA —
// an AI that tests whether you are human. The joke lands on the
// machine premise (picking traffic lights to prove you are human)
// and twists it in the last words with a negation/contrast punch:
// he is not proving anything, he is showing off for it.
// No batteries, no charging, no rebooting.
const ENTRY =
  "Are you a CAPTCHA? Because I've been picking traffic lights for an hour — not to prove I'm human, but to impress you.";

const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir; // resolved from the script location, never process.cwd()

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
