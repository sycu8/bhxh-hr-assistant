import "dotenv/config";
import { getDb } from "../src/lib/db/prisma";
import { purgeIrrelevantLegalDocuments } from "../src/lib/crawl/purge-irrelevant-legal";

async function main() {
  const prisma = getDb();
  const result = await purgeIrrelevantLegalDocuments(prisma);

  console.log(
    [
      `Crawl queue: archived ${result.archivedCrawlItems} / ${result.scannedCrawlItems}.`,
      `Legal updates: archived ${result.archivedLegalUpdates} / ${result.scannedLegalUpdates}.`,
    ].join(" "),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = getDb();
    await prisma.$disconnect();
  });
