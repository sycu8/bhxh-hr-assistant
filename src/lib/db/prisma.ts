import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";

function createPrismaClient(connectionString?: string) {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url || url.startsWith("prisma://") || url.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  const adapter = new PrismaPg({ connectionString: url, maxUses: 1 });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * OpenNext (Cloudflare Workers) + Hyperdrive:
 * - Không dùng PrismaClient global (Workers không cho reuse pool qua nhiều request)
 * - Lấy connection string từ Hyperdrive binding: env.HYPERDRIVE.connectionString
 * - maxUses=1 để tránh tái sử dụng connection giữa requests
 */
export const getDb = cache(() => {
  try {
    const { env } = getCloudflareContext();
    return createPrismaClient(env.HYPERDRIVE.connectionString);
  } catch {
    const connectionString =
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
    return createPrismaClient(connectionString);
  }
});
