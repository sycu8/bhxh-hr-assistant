import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import { getHrTicketForUser } from "@/lib/services/hr-ticket.service";

export default async function MyTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEmployeeUser();
  const { id } = await params;
  const ticket = await getHrTicketForUser(user.id, id);
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <Link href="/my-hr/tickets" className="text-sm text-primary hover:underline">
        ← Danh sách ticket
      </Link>
      <div>
        <h1 className="text-2xl font-semibold font-mono">{ticket.ticketNumber}</h1>
        <div className="mt-2 flex gap-2">
          <Badge>{ticket.status}</Badge>
          {ticket.slaDueAt ? (
            <Badge variant="outline">
              SLA:{" "}
              {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(
                ticket.slaDueAt,
              )}
            </Badge>
          ) : null}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nội dung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-medium">{ticket.question}</p>
          {ticket.detail ? (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {ticket.detail}
            </p>
          ) : null}
        </CardContent>
      </Card>
      {ticket.comments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trao đổi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticket.comments.map((c) => (
              <div key={c.id} className="rounded-lg border p-3 text-sm">
                <p>{c.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(c.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
