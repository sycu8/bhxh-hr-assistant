import { getPg } from "@/lib/db/pg";
import type { PgDb } from "@/lib/db/pg";
import { CACHE_KEYS } from "@/lib/cloudflare/cache-keys";
import { PUBLIC_CACHE_TTL_SEC, withKvJsonCache } from "@/lib/cloudflare/kv-json-cache";

export type FaqListPublicRow = {
  id: string;
  question: string;
  shortAnswer: string;
  category_slug: string | null;
  category_name: string | null;
  citations_count: number;
};

async function loadApprovedFaqList50(): Promise<FaqListPublicRow[]> {
  try {
    const db: PgDb = getPg();
    const res = await db.query<FaqListPublicRow>(
      `
    select
      f.id,
      f.question,
      f."shortAnswer",
      c.slug as category_slug,
      c.name as category_name,
      count(ct.id)::int as citations_count
    from "FAQ" f
    left join "Category" c on c.id = f."categoryId"
    left join "Citation" ct on ct."faqId" = f.id
    where f.status = 'APPROVED'
    group by f.id, c.slug, c.name
    order by f."updatedAt" desc
    limit 50
    `,
    );
    return res.rows;
  } catch {
    return [];
  }
}

export async function getApprovedFaqListForPublic(): Promise<FaqListPublicRow[]> {
  return withKvJsonCache(
    CACHE_KEYS.faqList50,
    PUBLIC_CACHE_TTL_SEC,
    loadApprovedFaqList50,
  );
}
