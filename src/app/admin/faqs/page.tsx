import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";

export const metadata = { title: "FAQ — CMS" };

export default async function AdminFaqsPage() {
  await requirePermission("faq:read");
  const db = getDb();
  const faqs = await db.fAQ.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { category: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">FAQ</h1>
      <p className="text-sm text-muted-foreground">
        Quản lý FAQ trong DB (DRAFT / APPROVED). FAQ curated tĩnh vẫn hiển thị tại /hoi-dap.
      </p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Câu hỏi</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Chủ đề</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{f.question}</td>
                <td className="px-4 py-3">{f.status}</td>
                <td className="px-4 py-3">{f.category?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
