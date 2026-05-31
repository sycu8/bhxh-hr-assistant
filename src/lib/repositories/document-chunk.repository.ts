import type {
  ChunkWithDocument,
  IDocumentChunkReadRepository,
} from "./contracts";
import type { PgDb } from "@/lib/db/pg";

type DocumentChunkRow = {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  embedding: unknown;
  metadata: unknown;
  createdAt: string | Date;
  document_id: string;
  document_title: string;
  document_status: string;
};

export class DocumentChunkRepository implements IDocumentChunkReadRepository {
  constructor(private readonly db: PgDb) {}

  async findByIds(ids: string[]): Promise<ChunkWithDocument[]> {
    if (ids.length === 0) return [];
    const res = await this.db.query<DocumentChunkRow>(
      `
      select
        ch.id,
        ch."documentId",
        ch.content,
        ch."chunkIndex",
        ch.embedding,
        ch.metadata,
        ch."createdAt",
        d.id as document_id,
        d.title as document_title,
        d.status as document_status
      from "DocumentChunk" ch
      join "Document" d on d.id = ch."documentId"
      where ch.id = any($1::text[])
        and d.status = 'APPROVED'
      `,
      [ids],
    );

    return res.rows.map((r) => ({
      id: r.id,
      documentId: r.documentId,
      content: r.content,
      chunkIndex: r.chunkIndex,
      embedding: r.embedding,
      metadata: r.metadata,
      createdAt: new Date(r.createdAt),
      document: {
        id: r.document_id,
        title: r.document_title,
        status: r.document_status,
      },
    })) as ChunkWithDocument[];
  }

  async listApprovedForRetrieval(params: {
    take: number;
  }): Promise<ChunkWithDocument[]> {
    const res = await this.db.query<DocumentChunkRow>(
      `
      select
        ch.id,
        ch."documentId",
        ch.content,
        ch."chunkIndex",
        ch.embedding,
        ch.metadata,
        ch."createdAt",
        d.id as document_id,
        d.title as document_title,
        d.status as document_status
      from "DocumentChunk" ch
      join "Document" d on d.id = ch."documentId"
      where d.status = 'APPROVED'
      order by ch."createdAt" desc
      limit $1
      `,
      [params.take],
    );

    return res.rows.map((r) => ({
      id: r.id,
      documentId: r.documentId,
      content: r.content,
      chunkIndex: r.chunkIndex,
      embedding: r.embedding,
      metadata: r.metadata,
      createdAt: new Date(r.createdAt),
      document: {
        id: r.document_id,
        title: r.document_title,
        status: r.document_status,
      },
    })) as ChunkWithDocument[];
  }
}
