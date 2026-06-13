import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";

export const metadata = { title: "Chủ đề — CMS" };

export default async function AdminTopicsPage() {
  await requirePermission("topic:read");
  const db = getDb();
  const topics = await db.topicPage.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Chủ đề</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((t) => (
          <div key={t.id} className="rounded-xl border bg-card p-4">
            <p className="font-medium">{t.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">/{t.slug} · {t.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
