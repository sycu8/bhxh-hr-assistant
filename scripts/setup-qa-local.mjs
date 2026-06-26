#!/usr/bin/env node
/** Load .env.e2e + push schema + seed QA scale data for local Playwright. */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.e2e") });
config({ path: resolve(root, ".env") });

if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    "DATABASE_URL chưa cấu hình. Sao chép .env.e2e.example → .env.e2e và chỉnh Postgres local.",
  );
  process.exit(1);
}

function run(cmd) {
  const result = spawnSync(cmd, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("→ prisma db push");
run("pnpm exec prisma db push --accept-data-loss");
console.log("→ prisma db seed (base)");
run("pnpm exec prisma db seed");
console.log("→ QA scale seed");
run("pnpm exec tsx prisma/seed-qa-scale.ts");
console.log("QA local data ready.");
