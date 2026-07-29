import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ — CMS" };

export default async function AdminFaqsPage() {
  await requirePermission("faq:read");
  const db = getDb();
  const faqs = await db.fAQ.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      question: true,
      status: true,
      slug: true,
      confidenceLevel: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Quản lý FAQ</h1>
      <p className="text-sm text-muted-foreground">
        FAQ đã duyệt được đưa vào kho tra cứu công khai và pipeline AI.
      </p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Câu hỏi</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Tin cậy</th>
              <th className="px-4 py-3">Slug</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id} className="border-b last:border-0">
                <td className="px-4 py-3">{faq.question.slice(0, 100)}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{faq.status}</Badge>
                </td>
                <td className="px-4 py-3">{faq.confidenceLevel}</td>
                <td className="px-4 py-3 font-mono text-xs">{faq.slug ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
