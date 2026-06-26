import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit log — CMS" };

export default async function AdminAuditPage() {
  await requirePermission("audit:read");
  const db = getDb();
  const logs = await db.cmsAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Audit log</h1>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Hành động</th>
              <th className="px-4 py-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(log.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {log.actor?.name ?? "—"}
                  <span className="block text-xs text-muted-foreground">
                    {log.actor?.email}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                <td className="px-4 py-3 text-xs">
                  {log.entityType}
                  {log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
