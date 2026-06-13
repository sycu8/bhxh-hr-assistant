import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";

export const metadata = { title: "Công thức tính — CMS" };

export default async function AdminCalculatorsPage() {
  await requirePermission("calculator:read");
  const db = getDb();
  const configs = await db.calculatorConfig.findMany({
    orderBy: [{ key: "asc" }, { effectiveFrom: "desc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Công thức tính</h1>
      <div className="space-y-3">
        {configs.map((c) => (
          <div key={c.id} className="rounded-xl border bg-card p-4 text-sm">
            <p className="font-medium">
              {c.name} <span className="text-muted-foreground">({c.key})</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {c.status} · hiệu lực {c.effectiveFrom.toISOString().slice(0, 10)} · v
              {c.version}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
