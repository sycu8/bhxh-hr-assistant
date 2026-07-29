import { requireHrPermission } from "@/lib/auth/require-hr";
import {
  getHeadcountReport,
  getLeaveReport,
  getTicketVolumeReport,
  toCsv,
} from "@/lib/services/reports/hr-reports.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Báo cáo — HR Console" };

export default async function HrReportsPage() {
  await requireHrPermission("report:read");
  const [headcount, tickets, leave] = await Promise.all([
    getHeadcountReport(),
    getTicketVolumeReport(),
    getLeaveReport(),
  ]);

  const headcountCsv = toCsv(
    headcount.byDepartment.map((row) => ({
      department: row.department,
      count: row.count,
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Báo cáo HR</h1>
        <p className="text-sm text-muted-foreground">
          Headcount, ticket và nghỉ phép — xuất CSV từ dữ liệu hiện tại.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Headcount</h2>
        <p className="text-2xl font-bold tabular-nums">{headcount.total}</p>
        <ul className="mt-2 space-y-1 text-sm">
          {headcount.byDepartment.map((row) => (
            <li key={row.department}>
              {row.department}: {row.count}
            </li>
          ))}
        </ul>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-primary">
            Xuất CSV headcount
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
            {headcountCsv}
          </pre>
        </details>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Ticket theo trạng thái</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {tickets.byStatus.map((row) => (
            <li key={row.status}>
              {row.status}: {row.count}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          SLA vi phạm: {tickets.slaBreached}
        </p>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Nghỉ phép theo trạng thái</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {leave.map((row) => (
            <li key={row.status}>
              {row.status}: {row.count}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
