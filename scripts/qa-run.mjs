#!/usr/bin/env node
/**
 * QA full inventory — production-like local.
 * 1. Kiểm tra Postgres (hoặc gợi ý docker compose)
 * 2. qa:setup (nếu có DB)
 * 3. vitest + playwright + uat streak
 *
 * Usage: node scripts/qa-run.mjs
 * Env: SKIP_DB=1 — chỉ chạy vitest + UAT streak (không E2E portal)
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import net from "node:net";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.e2e") });
config({ path: resolve(root, ".env") });

function run(cmd, opts = {}) {
  const result = spawnSync(cmd, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: true,
    ...opts,
  });
  return result.status ?? 1;
}

function portOpen(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(2000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const skipDb =
    process.env.SKIP_DB === "1" || process.argv.includes("--lite");
  const dbUp = await portOpen("127.0.0.1", 5432);

  console.log("=== QA run — Cổng HR FPT Telecom ===\n");

  if (!dbUp && !skipDb) {
    console.warn("⚠ Postgres 127.0.0.1:5432 không mở.");
    console.warn("  Chạy: docker compose up -d");
    console.warn("  Hoặc: SKIP_DB=1 node scripts/qa-run.mjs (bỏ E2E portal)\n");
  }

  if (dbUp && !skipDb) {
    console.log("→ pnpm qa:setup");
    if (run("pnpm qa:setup") !== 0) process.exit(1);
  }

  console.log("→ pnpm test");
  if (run("pnpm test") !== 0) process.exit(1);

  if (dbUp && !skipDb) {
    console.log("→ pnpm test:e2e --project=chromium");
    if (run("pnpm test:e2e --project=chromium") !== 0) process.exit(1);
  } else {
    console.log("→ skip E2E portal (no Postgres)");
  }

  console.log("→ UAT streak (target 15)");
  process.env.STREAK_TARGET = process.env.STREAK_TARGET ?? "15";
  if (run("node scripts/uat-realistic-streak.mjs") !== 0) process.exit(1);

  console.log("\n✓ QA run complete.");
  if (!dbUp) {
    console.log("  Handoff: bật Postgres + rerun để đạt E2E 42/42.");
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
