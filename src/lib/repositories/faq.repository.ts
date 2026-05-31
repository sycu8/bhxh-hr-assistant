import type { FaqWithCitations, IFaqReadRepository } from "./contracts";
import type { PgDb } from "@/lib/db/pg";

type CitationJson = {
  id: string;
  faqId: string | null;
  documentId: string | null;
  documentChunkId: string | null;
  title: string;
  sourceUrl: string | null;
  legalArticle: string | null;
  legalClause: string | null;
  effectiveDate: string | Date | null;
};

export class FaqRepository implements IFaqReadRepository {
  constructor(private readonly db: PgDb) {}

  async searchApproved(params: {
    query: string;
    categorySlug?: string;
    take: number;
  }): Promise<FaqWithCitations[]> {
    const q = params.query.trim();
    const take = params.take;

    const rows = await this.db.query<{
      id: string;
      question: string;
      shortAnswer: string;
      detailedAnswer: string | null;
      categoryId: string | null;
      status: string;
      employeeGroup: string | null;
      confidenceLevel: string;
      createdAt: string;
      updatedAt: string;
      category_slug: string | null;
      category_name: string | null;
      citations: CitationJson[];
    }>(
      `
      select
        f.id,
        f.question,
        f."shortAnswer",
        f."detailedAnswer",
        f."categoryId",
        f.status,
        f."employeeGroup",
        f."confidenceLevel",
        f."createdAt",
        f."updatedAt",
        c.slug as category_slug,
        c.name as category_name,
        coalesce(
          json_agg(
            json_build_object(
              'id', ct.id,
              'faqId', ct."faqId",
              'documentId', ct."documentId",
              'documentChunkId', ct."documentChunkId",
              'title', ct.title,
              'sourceUrl', ct."sourceUrl",
              'legalArticle', ct."legalArticle",
              'legalClause', ct."legalClause",
              'effectiveDate', ct."effectiveDate"
            )
          ) filter (where ct.id is not null),
          '[]'::json
        ) as citations
      from "FAQ" f
      left join "Category" c on c.id = f."categoryId"
      left join "Citation" ct on ct."faqId" = f.id
      where
        f.status = 'APPROVED'
        and (
          f.question ilike '%' || $1 || '%'
          or f."shortAnswer" ilike '%' || $1 || '%'
          or coalesce(f."detailedAnswer",'') ilike '%' || $1 || '%'
        )
        and ($2::text is null or c.slug = $2::text)
      group by f.id, c.slug, c.name
      order by f."updatedAt" desc
      limit $3
      `,
      [q, params.categorySlug ?? null, take],
    );

    return rows.rows.map((r) => ({
      id: r.id,
      question: r.question,
      shortAnswer: r.shortAnswer,
      detailedAnswer: r.detailedAnswer,
      categoryId: r.categoryId,
      status: r.status as FaqWithCitations["status"],
      employeeGroup: r.employeeGroup as FaqWithCitations["employeeGroup"],
      confidenceLevel: r.confidenceLevel as FaqWithCitations["confidenceLevel"],
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      citations: (r.citations ?? []).map((c) => ({
        ...c,
        effectiveDate: c.effectiveDate ? new Date(c.effectiveDate) : null,
      })),
      category:
        r.category_slug && r.category_name
          ? { slug: r.category_slug, name: r.category_name }
          : null,
    })) as unknown as FaqWithCitations[];
  }
}
