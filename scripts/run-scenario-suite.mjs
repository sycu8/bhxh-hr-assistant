#!/usr/bin/env node
/**
 * Runs the five major-capability scenarios under consistent conditions
 * and writes docs/scenario-evidence.json.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const evidencePath = path.join(root, "docs/scenario-evidence.json");

const runConditions = {
  startedAt: new Date().toISOString(),
  nodeVersion: process.version,
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY ? "set" : "unset",
  databaseUrl: process.env.DATABASE_URL ? "set" : "unset",
  playwrightPort: process.env.PLAYWRIGHT_PORT ?? "3199",
};

function run(cmd, args, extraEnv = {}) {
  const started = Date.now();
  const result = spawnSync(cmd, args, {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return {
    command: [cmd, ...args].join(" "),
    exitCode: result.status ?? 1,
    durationMs: Date.now() - started,
    stdout: (result.stdout ?? "").slice(-8000),
    stderr: (result.stderr ?? "").slice(-8000),
  };
}

console.log("=== Major capability scenario suite ===\n");
console.log("Conditions:", JSON.stringify(runConditions, null, 2), "\n");

const vitest = run("pnpm", [
  "exec",
  "vitest",
  "run",
  "tests/scenarios-major-capabilities.test.ts",
  "--reporter=verbose",
]);

console.log(vitest.exitCode === 0 ? "✓ Vitest scenarios passed" : "✗ Vitest scenarios failed");

let build = { exitCode: 0, durationMs: 0, command: "skip (PLAYWRIGHT_SKIP_BUILD=1)" };
if (!process.env.PLAYWRIGHT_SKIP_BUILD) {
  console.log("\nBuilding for E2E…");
  build = run("pnpm", ["build"]);
  console.log(build.exitCode === 0 ? "✓ Build OK" : "✗ Build failed");
}

let playwright = {
  exitCode: 1,
  durationMs: 0,
  command: "skipped — build failed",
  stdout: "",
  stderr: "",
};

if (build.exitCode === 0) {
  console.log("\nRunning Playwright scenario E2E…");
  playwright = run("pnpm", [
    "exec",
    "playwright",
    "test",
    "e2e/scenarios-major-capabilities.spec.ts",
  ]);
  console.log(
    playwright.exitCode === 0 ? "✓ E2E scenarios passed" : "✗ E2E scenarios failed",
  );
}

const suitePass = vitest.exitCode === 0 && build.exitCode === 0 && playwright.exitCode === 0;

const evidence = {
  ...runConditions,
  finishedAt: new Date().toISOString(),
  evaluationMethod: "binary pass/fail per check; scenario pass = all checks pass",
  suitePass,
  layers: {
    vitest: {
      pass: vitest.exitCode === 0,
      ...vitest,
    },
    build: {
      pass: build.exitCode === 0,
      ...build,
    },
    e2e: {
      pass: playwright.exitCode === 0,
      ...playwright,
    },
  },
  scenarios: [
    { id: "S1", title: "Natural-language BHXH search", pass: vitest.exitCode === 0 && playwright.exitCode === 0 },
    { id: "S2", title: "FAQ hub and topic browsing", pass: vitest.exitCode === 0 && playwright.exitCode === 0 },
    { id: "S3", title: "Legal updates, sources, and SEO", pass: vitest.exitCode === 0 && playwright.exitCode === 0 },
    { id: "S4", title: "Salary and employee tools", pass: vitest.exitCode === 0 && playwright.exitCode === 0 },
    { id: "S5", title: "HR escalation and platform guardrails", pass: vitest.exitCode === 0 && playwright.exitCode === 0 },
  ],
};

mkdirSync(path.dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(`\nEvidence written to ${evidencePath}`);
console.log(suitePass ? "\n=== SUITE PASS ===" : "\n=== SUITE FAIL ===");

process.exit(suitePass ? 0 : 1);
