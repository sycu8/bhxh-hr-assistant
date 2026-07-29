import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sql = readFileSync(
  resolve(root, "prisma/sql/hr-portal-schema-sync.sql"),
  "utf8",
);
writeFileSync(
  resolve(root, "src/lib/db/hr-portal-schema-sql.ts"),
  `export const HR_PORTAL_SCHEMA_SQL = ${JSON.stringify(sql)};\n`,
);
console.log("Generated src/lib/db/hr-portal-schema-sql.ts");
