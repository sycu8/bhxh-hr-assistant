import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";

function isAccelerateUrl(url: string) {
  return url.startsWith("prisma://") || url.startsWith("prisma+postgres://");
}

/** True when a real Postgres URL or Hyperdrive binding is available. */
export function isDatabaseConfigured(): boolean {
  const env = tryGetCloudflareEnv();
  const direct = env?.DATABASE_URL?.trim();
  if (direct && !isAccelerateUrl(direct)) return true;
  if (env?.HYPERDRIVE?.connectionString?.trim()) return true;

  const local = process.env.DATABASE_URL?.trim();
  return Boolean(local && !isAccelerateUrl(local));
}
