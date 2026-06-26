#!/usr/bin/env node
/**
 * Generate wrangler.local.jsonc for deploy (local or CI).
 * Binding IDs are resource identifiers — override via env if needed.
 * Giữ HR_EMAIL_FROM từ file hiện có / .env — tránh ghi đè bằng placeholder khi deploy.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "wrangler.local.jsonc");

config({ path: path.join(root, ".env") });

/** Đọc giá trị string từ wrangler.local.jsonc hiện có (jsonc đơn giản). */
function readExistingLocalVar(name) {
  if (!fs.existsSync(outPath)) return undefined;
  const text = fs.readFileSync(outPath, "utf8");
  const match = text.match(new RegExp(`"${name}"\\s*:\\s*"([^"]+)"`));
  return match?.[1]?.trim() || undefined;
}

const accountId =
  process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ||
  "4c15704ef706b9c8954cd6f9feb678d8";
if (!process.env.CLOUDFLARE_ACCOUNT_ID?.trim()) {
  console.warn(
    "generate-wrangler-local: CLOUDFLARE_ACCOUNT_ID unset — using production default.",
  );
}

const workerName = process.env.WRANGLER_WORKER_NAME?.trim() || "vn-insurance-fti";
const kvId =
  process.env.WRANGLER_KV_NAMESPACE_ID?.trim() ||
  "d64885431a8b45868a8003c78c49961e";
const d1Id =
  process.env.WRANGLER_D1_DATABASE_ID?.trim() ||
  "05c03226-189d-4d0a-a3e1-61c5102f83a8";
const hyperdriveId =
  process.env.WRANGLER_HYPERDRIVE_ID?.trim() ||
  "7729796d48d04475943be240b24f38cf";
const r2Bucket =
  process.env.WRANGLER_R2_BUCKET?.trim() || "vn-insurance-fti-media";
const cronBase =
  process.env.CRON_WORKER_BASE_URL?.trim() ||
  readExistingLocalVar("CRON_WORKER_BASE_URL") ||
  "https://bhxh.orangecloud.vn";
const hrFrom =
  process.env.HR_EMAIL_FROM?.trim() ||
  readExistingLocalVar("HR_EMAIL_FROM") ||
  "noreply@orangecloud.vn";
const hrContact =
  process.env.HR_CONTACT_EMAIL?.trim() ||
  readExistingLocalVar("HR_CONTACT_EMAIL") ||
  "hr-cnb@your-company.com";

if (hrFrom.includes("your-verified-domain")) {
  console.error(
    "generate-wrangler-local: HR_EMAIL_FROM vẫn là placeholder — đặt noreply@<domain-đã-onboard-Email-Sending> trong .env hoặc wrangler.local.jsonc",
  );
  process.exit(1);
}
const turnstileSite =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
  "1x00000000000000000000AA";
const hyperdriveLocal =
  process.env.HYPERDRIVE_LOCAL_CONNECTION_STRING?.trim() ||
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

const config = {
  $schema: "./node_modules/wrangler/config-schema.json",
  name: workerName,
  main: "cloudflare/worker-entry.ts",
  compatibility_date: "2026-05-11",
  compatibility_flags: ["nodejs_compat"],
  assets: {
    directory: ".open-next/assets",
    binding: "ASSETS",
  },
  vars: {
    NEXT_PRIVATE_MINIMAL_MODE: "1",
    MEDIA_DEFAULT_MAX_WIDTH: "1280",
    CLOUDFLARE_ACCOUNT_ID: accountId,
    HR_EMAIL_FROM: hrFrom,
    HR_CONTACT_EMAIL: hrContact,
    CRON_WORKER_BASE_URL: cronBase,
    NEXT_PUBLIC_SITE_URL: cronBase,
    ADMIN_ACTION_RATE_LIMIT_MAX: "120",
    ADMIN_ACTION_RATE_WINDOW_SEC: "600",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: turnstileSite,
  },
  send_email: [{ name: "EMAIL" }],
  r2_buckets: [
    {
      binding: "MEDIA_BUCKET",
      bucket_name: r2Bucket,
    },
  ],
  observability: { enabled: true },
  triggers: { crons: ["0 23 * * *"] },
  kv_namespaces: [
    {
      binding: "APP_CACHE",
      id: kvId,
    },
  ],
  d1_databases: [
    {
      binding: "APP_CONFIG_D1",
      database_name: "vn-insurance-fti-config",
      database_id: d1Id,
      migrations_dir: "migrations/d1",
    },
  ],
  hyperdrive: [
    {
      binding: "HYPERDRIVE",
      id: hyperdriveId,
      localConnectionString: hyperdriveLocal,
    },
  ],
};

fs.writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath} (worker: ${workerName})`);
