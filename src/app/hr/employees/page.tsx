import { MicrosoftImportForm } from "@/components/hr/microsoft-import-form";
import { requireHrPermission } from "@/lib/auth/require-hr";
import { listEmployeesForHr } from "@/lib/services/employee-profile.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nhân viên — HR Console" };

export default async function HrEmployeesPage() {
  await requireHrPermission("employee:read");
  const employees = await listEmployeesForHr({ take: 200 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Danh sách nhân viên</h1>
        <p className="text-sm text-muted-foreground">
          Đồng bộ từ file export Microsoft 365 hoặc HRIS API.
        </p>
      </div>

      <MicrosoftImportForm />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Mã NV</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phòng ban</th>
              <th className="px-4 py-3">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{e.employeeCode}</td>
                <td className="px-4 py-3">{e.user.name}</td>
                <td className="px-4 py-3">{e.user.email}</td>
                <td className="px-4 py-3">{e.department?.name ?? "—"}</td>
                <td className="px-4 py-3">{e.user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
