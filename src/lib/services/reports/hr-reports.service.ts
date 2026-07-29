import { getDb } from "@/lib/db/prisma";

export async function getHeadcountReport() {
  const db = getDb();
  const byDepartment = await db.employeeProfile.groupBy({
    by: ["departmentId"],
    _count: { id: true },
  });
  const departments = await db.department.findMany();
  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  return {
    total: byDepartment.reduce((sum, row) => sum + row._count.id, 0),
    byDepartment: byDepartment.map((row) => ({
      department: row.departmentId
        ? (deptMap.get(row.departmentId) ?? "Không xác định")
        : "Không xác định",
      count: row._count.id,
    })),
  };
}

export async function getTicketVolumeReport() {
  const db = getDb();
  const byStatus = await db.hrTicket.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const breached = await db.hrTicket.count({ where: { slaBreached: true } });
  return {
    byStatus: byStatus.map((row) => ({
      status: row.status,
      count: row._count.id,
    })),
    slaBreached: breached,
  };
}

export async function getLeaveReport() {
  const db = getDb();
  const byStatus = await db.leaveRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  return byStatus.map((row) => ({
    status: row.status,
    count: row._count.id,
  }));
}

export function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const lines = [
    headers.map((h) => JSON.stringify(h)).join(","),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? "")).join(","),
    ),
  ];
  return lines.join("\n");
}
