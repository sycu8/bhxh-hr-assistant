import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as PrismaClientNode } from "@prisma/client";
import { cache } from "react";

function isAccelerateUrl(url: string) {
  return url.startsWith("prisma://") || url.startsWith("prisma+postgres://");
}

function workerConnectionString(env: CloudflareEnv): string {
  const direct = env.DATABASE_URL?.trim();
  if (direct && !isAccelerateUrl(direct)) return direct;
  return env.HYPERDRIVE.connectionString;
}

function createPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString, maxUses: 1 });
  return new PrismaClientNode({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function createWorkerPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString, maxUses: 1 });
  // Lazy require — tránh Vitest resolve @prisma/client/wasm; OpenNext bundle WASM trên Workers.
  const { PrismaClient: PrismaClientWasm } =
    require("@prisma/client/wasm") as typeof import("@prisma/client/wasm");
  return new PrismaClientWasm({
    adapter,
    log: ["error"],
  });
}

function createLocalPrismaClient(connectionString?: string) {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url || isAccelerateUrl(url)) {
    return new PrismaClientNode({
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return createPrismaClient(url);
}

/**
 * OpenNext (Cloudflare Workers):
 * - WASM client + adapter-pg (không cần libquery_engine trên workerd)
 * - Ưu tiên DATABASE_URL (wrangler secret); Hyperdrive fallback
 */
export const getDb = cache(() => {
  try {
    const { env } = getCloudflareContext();
    return createWorkerPrismaClient(workerConnectionString(env as CloudflareEnv));
  } catch {
    const connectionString =
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
    return createLocalPrismaClient(connectionString);
  }
});

export async function getDbAsync() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return createWorkerPrismaClient(workerConnectionString(env as CloudflareEnv));
  } catch {
    const connectionString =
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
    return createLocalPrismaClient(connectionString);
  }
}

export type PrismaDb = ReturnType<typeof getDb>;
