import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Client } from "pg";
import { HR_PORTAL_SCHEMA_SQL } from "@/lib/db/hr-portal-schema-sql";

function isAccelerateUrl(url: string) {
  return url.startsWith("prisma://") || url.startsWith("prisma+postgres://");
}

function resolveConnectionString(env: CloudflareEnv): string {
  const direct = env.DATABASE_URL?.trim();
  if (direct && !isAccelerateUrl(direct)) return direct;
  return env.HYPERDRIVE.connectionString;
}

export async function applyHrPortalSchemaSync() {
  const { env } = getCloudflareContext();
  const client = new Client({
    connectionString: resolveConnectionString(env as CloudflareEnv),
  });

  try {
    await client.connect();
    await client.query(HR_PORTAL_SCHEMA_SQL);
    const tables = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
    );
    return {
      applied: true,
      tableCount: tables.rowCount,
      tables: tables.rows.map((row) => row.table_name),
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}
