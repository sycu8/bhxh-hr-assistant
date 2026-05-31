import type { Citation, Document, DocumentChunk, FAQ } from "@prisma/client";

export type FaqWithCitations = FAQ & {
  citations: Citation[];
  category: { slug: string; name: string } | null;
};

export type ChunkWithDocument = DocumentChunk & {
  document: Pick<Document, "id" | "title" | "status">;
};

export interface IFaqReadRepository {
  searchApproved(params: {
    query: string;
    categorySlug?: string;
    take: number;
  }): Promise<FaqWithCitations[]>;
}

export interface IDocumentChunkReadRepository {
  findByIds(ids: string[]): Promise<ChunkWithDocument[]>;
  /** Chỉ chunk thuộc tài liệu đã Approved — phục vụ vector / lexical index */
  listApprovedForRetrieval(params: { take: number }): Promise<ChunkWithDocument[]>;
}
