import type { PgDb } from "@/lib/db/pg";
import { getPg } from "@/lib/db/pg";

export type FaqCitationRow = {
  title: string;
  sourceUrl: string | null;
  legalArticle: string | null;
  legalClause: string | null;
};

export type FaqDetailRow = {
  id: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string | null;
  category: { slug: string; name: string } | null;
  citations: FaqCitationRow[];
};

export async function getApprovedFaqById(
  id: string,
): Promise<FaqDetailRow | null> {
  try {
    const db: PgDb = getPg();
    const faqRes = await db.query<{
      id: string;
      question: string;
      shortAnswer: string;
      detailedAnswer: string | null;
      category_slug: string | null;
      category_name: string | null;
    }>(
      `
      select
        f.id,
        f.question,
        f."shortAnswer",
        f."detailedAnswer",
        c.slug as category_slug,
        c.name as category_name
      from "FAQ" f
      left join "Category" c on c.id = f."categoryId"
      where f.id = $1 and f.status = 'APPROVED'
      limit 1
      `,
      [id],
    );
    const row = faqRes.rows[0];
    if (!row) return null;

    const citRes = await db.query<{
      title: string;
      sourceUrl: string | null;
      legalArticle: string | null;
      legalClause: string | null;
    }>(
      `
      select ct.title, ct."sourceUrl", ct."legalArticle", ct."legalClause"
      from "Citation" ct
      where ct."faqId" = $1
      order by ct.id asc
      `,
      [id],
    );

    return {
      id: row.id,
      question: row.question,
      shortAnswer: row.shortAnswer,
      detailedAnswer: row.detailedAnswer,
      category:
        row.category_slug && row.category_name
          ? { slug: row.category_slug, name: row.category_name }
          : null,
      citations: citRes.rows.map((c) => ({
        title: c.title,
        sourceUrl: c.sourceUrl,
        legalArticle: c.legalArticle,
        legalClause: c.legalClause,
      })),
    };
  } catch {
    return null;
  }
}
