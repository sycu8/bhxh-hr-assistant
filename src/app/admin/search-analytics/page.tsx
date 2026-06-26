import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tra cứu — Analytics" };

export default async function AdminSearchAnalyticsPage() {
  await requirePermission("search:read");
  const db = getDb();
  const logs = await db.questionLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      question: true,
      confidenceLevel: true,
      needsHrReview: true,
      noResult: true,
      resultCount: true,
      createdAt: true,
    },
  });

  const noResultCount = logs.filter((l) => l.noResult).length;
  const hrReviewCount = logs.filter((l) => l.needsHrReview).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Phân tích tra cứu</h1>
        <p className="text-sm text-muted-foreground">
          100 truy vấn gần nhất — {noResultCount} không có kết quả,{" "}
          {hrReviewCount} cần HR rà soát.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Câu hỏi</th>
              <th className="px-4 py-3">Tin cậy</th>
              <th className="px-4 py-3">HR?</th>
              <th className="px-4 py-3">Hits</th>
              <th className="px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="max-w-md px-4 py-3">{log.question.slice(0, 120)}</td>
                <td className="px-4 py-3">{log.confidenceLevel ?? "—"}</td>
                <td className="px-4 py-3">{log.needsHrReview ? "Có" : "—"}</td>
                <td className="px-4 py-3 tabular-nums">{log.resultCount ?? 0}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(log.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
