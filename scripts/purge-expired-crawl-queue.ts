import "dotenv/config";
import { getDb } from "../src/lib/db/prisma";
import {
  archiveAllPendingCrawlItems,
  purgePendingCrawlQueue,
  purgeSupersededPendingCrawlItems,
} from "../src/lib/crawl/purge-expired-pending";

async function main() {
  const all = process.argv.includes("--all");
  const supersededOnly = process.argv.includes("--superseded");
  const prisma = getDb();
  const result = all
    ? await archiveAllPendingCrawlItems(prisma)
    : supersededOnly
      ? await purgeSupersededPendingCrawlItems(prisma)
      : await purgePendingCrawlQueue(prisma);

  console.log(
    all
      ? `Archived ${result.archived} / ${result.scanned} pending item(s) from queue.`
      : supersededOnly
        ? `Archived ${result.archived} superseded / ${result.scanned} pending item(s).`
        : `Archived ${result.archived} expired/superseded / ${result.scanned} pending item(s).`,
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
