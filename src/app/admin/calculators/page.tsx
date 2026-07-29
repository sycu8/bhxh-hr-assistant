import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Công thức tính — CMS" };

export default async function AdminCalculatorsPage() {
  await requirePermission("calculator:read");
  const db = getDb();
  const configs = await db.calculatorConfig.findMany({
    orderBy: [{ key: "asc" }, { effectiveFrom: "desc" }],
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cấu hình công thức tính</h1>
      <p className="text-sm text-muted-foreground">
        Tỷ lệ BHXH/BHYT/BHTN và tham số lương thuế theo phiên bản hiệu lực.
      </p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Hiệu lực</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có cấu hình DB — đang dùng quy tắc tĩnh trong{" "}
                  <code className="text-xs">salary-tax-rules.ts</code>.
                </td>
              </tr>
            ) : (
              configs.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{c.key}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">
                    {new Intl.DateTimeFormat("vi-VN").format(c.effectiveFrom)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{c.status}</Badge>
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
