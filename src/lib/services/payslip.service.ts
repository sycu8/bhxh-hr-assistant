import { getDb } from "@/lib/db/prisma";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";

export async function listPayslipsForUser(userId: string) {
  const db = getDb();
  return db.payslip.findMany({
    where: { userId },
    orderBy: { period: "desc" },
    take: 24,
  });
}

export async function getPayslipForUser(userId: string, period: string) {
  const db = getDb();
  return db.payslip.findFirst({
    where: { userId, period },
    include: { lines: { orderBy: { code: "asc" } } },
  });
}

export async function auditPayslipView(userId: string, payslipId: string) {
  await writeCmsAuditLog({
    actorId: userId,
    action: "payslip.view",
    entityType: "Payslip",
    entityId: payslipId,
  });
}
