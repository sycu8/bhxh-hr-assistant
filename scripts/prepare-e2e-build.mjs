import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.e2e") });
config({ path: resolve(root, ".env") });

const result = spawnSync("pnpm", ["build"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
