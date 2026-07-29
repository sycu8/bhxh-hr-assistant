import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chủ đề — CMS" };

export default async function AdminTopicsPage() {
  await requirePermission("topic:read");
  const db = getDb();
  const topics = await db.topicPage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Trang chủ đề</h1>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {topics.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có TopicPage trong DB — chủ đề tĩnh vẫn dùng từ{" "}
                  <code className="text-xs">src/lib/data/topics.ts</code>.
                </td>
              </tr>
            ) : (
              topics.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{t.title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{t.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{t.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
