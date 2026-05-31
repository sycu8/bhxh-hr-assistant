import type { ConfidenceLevel } from "@prisma/client";
import type { PgDb } from "@/lib/db/pg";

export class QuestionLogRepository {
  constructor(private readonly db: PgDb) {}

  async create(entry: {
    userId?: string | null;
    question: string;
    normalizedQuestion?: string | null;
    answer?: string | null;
    confidenceLevel?: ConfidenceLevel | null;
    needsHrReview: boolean;
  }) {
    await this.db.query(
      `
      insert into "QuestionLog"
        ("userId","question","normalizedQuestion","answer","confidenceLevel","needsHrReview","createdAt")
      values
        ($1,$2,$3,$4,$5,$6,now())
      `,
      [
        entry.userId ?? null,
        entry.question,
        entry.normalizedQuestion ?? null,
        entry.answer ?? null,
        entry.confidenceLevel ?? null,
        entry.needsHrReview,
      ],
    );
    return { ok: true };
  }
}
