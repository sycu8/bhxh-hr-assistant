import "dotenv/config";
import { readFile } from "node:fs/promises";
import { importMicrosoftUserExportCsv } from "../src/lib/services/hris-sync.service";

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: pnpm hr:import-microsoft <path-to-users.csv>");
    process.exit(1);
  }

  const csv = await readFile(filePath, "utf8");
  const result = await importMicrosoftUserExportCsv(csv);

  console.log(
    JSON.stringify(
      {
        imported: result.count,
        skipped: result.skipped,
        warnings: result.warnings,
      },
      null,
      2,
    ),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
