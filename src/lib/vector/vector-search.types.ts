/**
 * Abstraction cho tìm kiếm ngữ nghĩa / vector.
 * MVP: triển khai lexical mock; sau này thay bằng pgvector, Qdrant, Pinecone…
 */
export type VectorSearchHit = {
  chunkId: string;
  /** Điểm tương đồng 0–1 (mock: overlap lexical) */
  score: number;
};

export type VectorSearchOptions = {
  limit?: number;
};

export interface VectorSearchProvider {
  search(
    query: string,
    options?: VectorSearchOptions,
  ): Promise<VectorSearchHit[]>;
}
