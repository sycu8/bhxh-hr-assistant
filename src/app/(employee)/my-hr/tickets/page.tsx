import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import { listHrTicketsForUser } from "@/lib/services/hr-ticket.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ticket HR của tôi" };

export default async function MyTicketsPage() {
  const user = await requireEmployeeUser();
  const tickets = await listHrTicketsForUser(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Ticket HR của tôi</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi các yêu cầu đã gửi tới HR/C&amp;B.
          </p>
        </div>
        <Link
          href="/ask-hr"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Gửi ticket mới
        </Link>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Chưa có ticket nào.{" "}
            <Link href="/ask-hr" className="text-primary underline">
              Hỏi HR
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/my-hr/tickets/${ticket.id}`}>
              <Card className="transition-colors hover:bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base font-mono text-sm">
                      {ticket.ticketNumber}
                    </CardTitle>
                    <Badge variant="outline">{ticket.status}</Badge>
                    {ticket.priority === "URGENT" ? (
                      <Badge variant="danger">Khẩn</Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm">{ticket.question}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
