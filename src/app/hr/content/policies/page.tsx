import { Badge } from "@/components/ui/badge";
import { requireHrPermission } from "@/lib/auth/require-hr";
import { listAllPoliciesForAdmin } from "@/lib/services/company-policy.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chính sách — HR Console" };

export default async function HrPoliciesPage() {
  await requireHrPermission("policy:read");
  const policies = await listAllPoliciesForAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Quản lý chính sách</h1>
      <p className="text-sm text-muted-foreground">
        Chỉ chính sách trạng thái PUBLISHED hiển thị cho nhân viên tại{" "}
        <code className="text-xs">/my-hr/policies</code>.
      </p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3">{p.category ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
