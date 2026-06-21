import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Pool, type QueryResultRow } from "pg";
import { cache } from "react";
import { isDatabaseConfigured } from "@/lib/db/database-configured";

export type PgDb = {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

/**
 * Cloudflare Workers + Hyperdrive:
 * - Tạo Pool per-request (cache theo request) để tránh reuse connection giữa requests.
 * - connectionString lấy từ env.HYPERDRIVE.connectionString.
 */
export const getPg = cache((): PgDb => {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  let connectionString: string;
  try {
    const { env } = getCloudflareContext();
    const direct = (env as CloudflareEnv).DATABASE_URL?.trim();
    connectionString =
      direct &&
      !direct.startsWith("prisma://") &&
      !direct.startsWith("prisma+postgres://")
        ? direct
        : env.HYPERDRIVE.connectionString;
  } catch {
    connectionString = process.env.DATABASE_URL!.trim();
  }

  const pool = new Pool({
    connectionString,
    // Giảm rủi ro reuse connection giữa requests
    max: 3,
    maxUses: 1,
  });

  return {
    async query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: readonly unknown[],
    ) {
      const result = await pool.query<T>(text, params ? [...params] : undefined);
      return { rows: result.rows };
    },
  };
});
