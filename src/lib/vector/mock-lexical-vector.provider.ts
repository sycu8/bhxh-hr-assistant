import type { IDocumentChunkReadRepository } from "@/lib/repositories/contracts";
import type { VectorSearchHit, VectorSearchProvider } from "./vector-search.types";

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\u00C0-\u024F]/gi, " ");
}

function tokenize(s: string): Set<string> {
  const words = normalizeText(s).split(/\s+/).filter((w) => w.length >= 2);
  return new Set(words);
}

function scoreOverlap(query: string, content: string): number {
  const q = tokenize(query);
  const c = tokenize(content);
  if (q.size === 0 || c.size === 0) return 0;
  let inter = 0;
  for (const t of q) {
    if (c.has(t)) inter++;
  }
  const union = q.size + c.size - inter;
  return union > 0 ? inter / union : 0;
}

export class MockLexicalVectorSearchProvider implements VectorSearchProvider {
  constructor(
    private readonly chunks: IDocumentChunkReadRepository,
    private readonly poolSize = 400,
  ) {}

  async search(
    query: string,
    options?: { limit?: number },
  ): Promise<VectorSearchHit[]> {
    const limit = options?.limit ?? 8;
    const pool = await this.chunks.listApprovedForRetrieval({
      take: this.poolSize,
    });
    const scored = pool.map((row) => ({
      chunkId: row.id,
      score: scoreOverlap(query, `${row.document.title}\n${row.content}`),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.filter((s) => s.score > 0).slice(0, limit);
  }
}
