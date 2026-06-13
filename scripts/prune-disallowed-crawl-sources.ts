import "dotenv/config";
import { getDb } from "../src/lib/db/prisma";
import {
  DISALLOWED_CRAWL_DOMAINS,
  INSURANCE_CRAWL_SOURCES,
} from "../src/lib/crawl/allowed-sources";

async function main() {
  const prisma = getDb();

  const blocked = [...DISALLOWED_CRAWL_DOMAINS];
  const deactivated = await prisma.crawlSource.updateMany({
    where: { domain: { in: blocked } },
    data: { active: false },
  });
  console.log(`Deactivated ${deactivated.count} disallowed crawl source(s).`);

  const deletedItems = await prisma.crawlItem.deleteMany({
    where: { domain: { in: blocked } },
  });
  console.log(`Removed ${deletedItems.count} crawl item(s) from disallowed domains.`);

  for (const source of INSURANCE_CRAWL_SOURCES) {
    await prisma.crawlSource.upsert({
      where: {
        domain_baseUrl: { domain: source.domain, baseUrl: source.baseUrl },
      },
      create: source,
      update: {
        name: source.name,
        sourceType: source.sourceType,
        trustLevel: source.trustLevel,
        active: source.active,
        crawlFrequency: source.crawlFrequency,
      },
    });
  }
  console.log(`Ensured ${INSURANCE_CRAWL_SOURCES.length} insurance-related crawl source(s).`);
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
