/**
 * Thêm FAQ trích từ tổng hợp Thư viện Pháp Luật (bài 20866) — bỏ qua nếu câu hỏi đã tồn tại.
 *
 *   pnpm run faq:import-thuvien
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { THUVIEN_BHXH_FAQ_SEEDS } from "../src/lib/data/thuvien-bhxh-20866";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;
  try {
    await client.query("begin");

    for (const f of THUVIEN_BHXH_FAQ_SEEDS) {
      const dup = await client.query<{ id: string }>(
        `select id from "FAQ" where question = $1 limit 1`,
        [f.question],
      );
      if (dup.rows[0]) {
        skipped += 1;
        continue;
      }

      const cat = await client.query<{ id: string }>(
        `select id from "Category" where slug=$1 limit 1`,
        [f.categorySlug],
      );
      if (!cat.rows[0]?.id) {
        throw new Error(`Missing Category slug=${f.categorySlug}. Run seed first.`);
      }

      const ins = await client.query<{ id: string }>(
        `
        insert into "FAQ"
          (id, question, "shortAnswer", "detailedAnswer", "categoryId", status, "confidenceLevel", "createdAt", "updatedAt")
        values
          ($5, $1, $2, $3, $4, 'APPROVED', 'HIGH', now(), now())
        returning id
        `,
        [f.question, f.shortAnswer, f.detailedAnswer, cat.rows[0].id, randomUUID()],
      );
      const faqId = ins.rows[0]!.id;
      for (const c of f.citations) {
        await client.query(
          `
          insert into "Citation"
            (id, "faqId", title, "sourceUrl", "legalArticle", "legalClause")
          values
            ($6, $1, $2, $3, $4, $5)
          `,
          [
            faqId,
            c.title,
            c.sourceUrl,
            c.legalArticle ?? null,
            c.legalClause ?? null,
            randomUUID(),
          ],
        );
      }
      inserted += 1;
    }

    await client.query("commit");
    console.log(`TLPL FAQ import: inserted=${inserted}, skipped=${skipped}`);
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
