import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";

export const metadata = { title: "Audit log — CMS" };

export default async function AdminAuditPage() {
  await requirePermission("audit:read");
  const db = getDb();
  const logs = await db.cmsAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Audit log</h1>
      <ul className="space-y-2 text-sm">
        {logs.map((log) => (
          <li key={log.id} className="rounded-lg border bg-card px-3 py-2">
            <span className="font-medium">{log.action}</span> · {log.entityType}
            {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
            <span className="block text-xs text-muted-foreground">
              {log.actor?.email ?? "system"} · {log.createdAt.toISOString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
