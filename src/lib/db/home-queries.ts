import { CACHE_KEYS } from "@/lib/cloudflare/cache-keys";
import { PUBLIC_CACHE_TTL_SEC, withKvJsonCache } from "@/lib/cloudflare/kv-json-cache";
import type { PgDb } from "@/lib/db/pg";
import { getPg } from "@/lib/db/pg";

export type PopularFaqRow = {
  id: string;
  question: string;
  shortAnswer: string;
  category: { slug: string; name: string } | null;
};

async function loadPopularFaqs(limit: number): Promise<PopularFaqRow[]> {
  try {
    const db: PgDb = getPg();
    const res = await db.query<{
      id: string;
      question: string;
      shortAnswer: string;
      category_slug: string | null;
      category_name: string | null;
    }>(
      `
      select
        f.id,
        f.question,
        f."shortAnswer",
        c.slug as category_slug,
        c.name as category_name
      from "FAQ" f
      left join "Category" c on c.id = f."categoryId"
      where f.status = 'APPROVED'
      order by f."updatedAt" desc
      limit $1
      `,
      [limit],
    );
    return res.rows.map((r) => ({
      id: r.id,
      question: r.question,
      shortAnswer: r.shortAnswer,
      category:
        r.category_slug && r.category_name
          ? { slug: r.category_slug, name: r.category_name }
          : null,
    }));
  } catch {
    return [];
  }
}

export async function getPopularFaqs(limit = 6): Promise<PopularFaqRow[]> {
  if (limit !== 6) {
    return loadPopularFaqs(limit);
  }
  return withKvJsonCache(CACHE_KEYS.homePopular6, PUBLIC_CACHE_TTL_SEC, () =>
    loadPopularFaqs(6),
  );
}
