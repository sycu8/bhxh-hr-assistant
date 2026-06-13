import { requirePermission } from "@/lib/auth/require-admin";
import { listHrTickets } from "@/lib/services/hr-ticket.service";

export const metadata = { title: "Ticket HR — CMS" };

export default async function AdminTicketsPage() {
  await requirePermission("ticket:read");
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
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{t.ticketNumber}</td>
                <td className="px-4 py-3">{t.question.slice(0, 80)}</td>
                <td className="px-4 py-3">{t.status}</td>
                <td className="px-4 py-3">{t.replyEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
