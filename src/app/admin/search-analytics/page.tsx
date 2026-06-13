import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";

export const metadata = { title: "Tra cứu — CMS" };

export default async function AdminSearchAnalyticsPage() {
  await requirePermission("search:read");
  const db = getDb();
  const logs = await db.questionLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const noResultCount = logs.filter((l) => l.noResult).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Phân tích tra cứu</h1>
      <p className="text-sm text-muted-foreground">
        {noResultCount} / {logs.length} truy vấn gần nhất không có kết quả rõ ràng.
      </p>
      <ul className="space-y-2 text-sm">
        {logs.map((log) => (
          <li key={log.id} className="rounded-lg border bg-card px-3 py-2">
            <p className="font-medium">{log.question}</p>
            <p className="text-xs text-muted-foreground">
              hits={log.resultCount ?? 0} · {log.confidenceLevel ?? "—"} ·
              {log.noResult ? " no-result" : ""} · {log.createdAt.toISOString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
