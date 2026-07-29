import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireHrPermission } from "@/lib/auth/require-hr";
import { getAdminDashboardData } from "@/lib/db/admin-queries";
import { listEmployeesForHr } from "@/lib/services/employee-profile.service";
import { listHrTickets } from "@/lib/services/hr-ticket.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "HR Console" };

export default async function HrDashboardPage() {
  await requireHrPermission("hr:console:access");
  const [dashboard, employees, tickets] = await Promise.all([
    getAdminDashboardData(),
    listEmployeesForHr({ take: 5 }),
    listHrTickets({ take: 5 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">HR Console</h1>
        <p className="text-sm text-muted-foreground">
          Vận hành nhân sự, ticket, chính sách và báo cáo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {employees.length}+
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Ticket mở
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {tickets.filter((t) => t.status === "OPEN").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              FAQ đã duyệt
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {dashboard.metrics.approvedFaqs}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Câu hỏi cần HR (7 ngày)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {dashboard.metrics.hrReviewQuestions7d}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {tickets.map((t) => (
              <div key={t.id} className="flex justify-between gap-2 border-b py-2 last:border-0">
                <span className="font-mono text-xs">{t.ticketNumber}</span>
                <span className="truncate">{t.question.slice(0, 50)}</span>
              </div>
            ))}
            <Link href="/hr/tickets" className="text-sm text-primary hover:underline">
              Xem tất cả →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nhân viên mẫu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {employees.map((e) => (
              <div key={e.id} className="flex justify-between border-b py-2 last:border-0">
                <span>{e.user.name}</span>
                <span className="font-mono text-xs">{e.employeeCode}</span>
              </div>
            ))}
            <Link href="/hr/employees" className="text-sm text-primary hover:underline">
              Danh sách đầy đủ →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
