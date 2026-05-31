import { getPg } from "@/lib/db/pg";

export type PendingDocumentRow = {
  id: string;
  title: string;
  fileName: string | null;
  updatedAt: Date;
};

export type HrReviewQuestionRow = {
  id: string;
  question: string;
  answer: string | null;
  createdAt: Date;
};

export async function getAdminDashboardData(): Promise<{
  metrics: {
    approvedFaqs: number;
    pendingDocuments: number;
    hrReviewQuestions7d: number;
    totalQuestionLogs30d: number;
  };
  pendingDocuments: PendingDocumentRow[];
  hrReviewQuestions: HrReviewQuestionRow[];
}> {
  const empty = {
    metrics: {
      approvedFaqs: 0,
      pendingDocuments: 0,
      hrReviewQuestions7d: 0,
      totalQuestionLogs30d: 0,
    },
    pendingDocuments: [] as PendingDocumentRow[],
    hrReviewQuestions: [] as HrReviewQuestionRow[],
  };

  try {
    const since7 = new Date();
    since7.setDate(since7.getDate() - 7);
    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);

    const db = getPg();

    const [
      approvedFaqs,
      pendingDocumentsCount,
      hrReview7d,
      logs30d,
      pendingDocuments,
      hrReviewQuestions,
    ] = await Promise.all([
      db
        .query<{ count: string }>(
          `select count(*)::text as count from "FAQ" where status='APPROVED'`,
        )
        .then((r) => Number(r.rows[0]?.count ?? 0)),
      db
        .query<{ count: string }>(
          `select count(*)::text as count from "Document" where status='PENDING_REVIEW'`,
        )
        .then((r) => Number(r.rows[0]?.count ?? 0)),
      db
        .query<{ count: string }>(
          `select count(*)::text as count from "QuestionLog" where "needsHrReview"=true and "createdAt" >= $1`,
          [since7.toISOString()],
        )
        .then((r) => Number(r.rows[0]?.count ?? 0)),
      db
        .query<{ count: string }>(
          `select count(*)::text as count from "QuestionLog" where "createdAt" >= $1`,
          [since30.toISOString()],
        )
        .then((r) => Number(r.rows[0]?.count ?? 0)),
      db
        .query<PendingDocumentRow>(
          `select id, title, "fileName" as "fileName", "updatedAt" as "updatedAt" from "Document" where status='PENDING_REVIEW' order by "updatedAt" desc limit 10`,
        )
        .then((r) =>
          r.rows.map((x) => ({
            ...x,
            updatedAt: new Date(x.updatedAt),
          })),
        ),
      db
        .query<HrReviewQuestionRow>(
          `select id, question, answer, "createdAt" as "createdAt" from "QuestionLog" where "needsHrReview"=true order by "createdAt" desc limit 12`,
        )
        .then((r) =>
          r.rows.map((x) => ({
            ...x,
            createdAt: new Date(x.createdAt),
          })),
        ),
    ]);

    return {
      metrics: {
        approvedFaqs,
        pendingDocuments: pendingDocumentsCount,
        hrReviewQuestions7d: hrReview7d,
        totalQuestionLogs30d: logs30d,
      },
      pendingDocuments,
      hrReviewQuestions,
    };
  } catch {
    return empty;
  }
}
