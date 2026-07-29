import { requireHrPermission } from "@/lib/auth/require-hr";
import { listHrTickets } from "@/lib/services/hr-ticket.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ticket HR — HR Console" };

export default async function HrTicketsPage() {
  await requireHrPermission("ticket:read");
  const tickets = await listHrTickets({ take: 100 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Ticket HR</h1>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Câu hỏi</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">SLA</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{t.ticketNumber}</td>
                <td className="px-4 py-3">{t.question.slice(0, 80)}</td>
                <td className="px-4 py-3">{t.category}</td>
                <td className="px-4 py-3">{t.status}</td>
                <td className="px-4 py-3 text-xs">
                  {t.slaDueAt
                    ? new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "short",
                      }).format(t.slaDueAt)
                    : "—"}
                  {t.slaBreached ? " ⚠" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
