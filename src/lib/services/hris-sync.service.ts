import type { UserRole } from "@prisma/client";
import { HrisSyncStatus } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db/prisma";
import { createHrisAdapter } from "@/lib/integrations/hris";
import type { HrisEmployeeRecord } from "@/lib/integrations/hris/types";
import { parseMicrosoftUserExportCsv } from "@/lib/integrations/hris/microsoft-export-parser";

const PRIVILEGED_ROLES: UserRole[] = ["HR", "CB", "RECRUITER", "ADMIN", "SUPER_ADMIN"];

function resolveImportRole(
  existingRole: UserRole | undefined,
  importedRole: UserRole,
): UserRole {
  if (!existingRole) return importedRole;
  if (PRIVILEGED_ROLES.includes(existingRole)) return existingRole;
  if (existingRole === "MANAGER" && importedRole === "EMPLOYEE") {
    return "MANAGER";
  }
  return importedRole;
}

export async function syncHrisEmployeesFromRecords(
  employees: HrisEmployeeRecord[],
) {
  const db = getDb();
  const log = await db.hrisSyncLog.create({
    data: { entityType: "employees", status: HrisSyncStatus.RUNNING },
  });

  try {
    const count = await upsertEmployeeRecords(employees);
    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.SUCCESS,
        recordCount: count,
        completedAt: new Date(),
      },
    });
    return { count };
  } catch (error) {
    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function importMicrosoftUserExportCsv(csvContent: string) {
  const parsed = parseMicrosoftUserExportCsv(csvContent);
  const result = await syncHrisEmployeesFromRecords(parsed.employees);
  return { ...result, skipped: parsed.skipped, warnings: parsed.warnings };
}

export async function syncHrisEmployees() {
  const db = getDb();
  const log = await db.hrisSyncLog.create({
    data: { entityType: "employees", status: HrisSyncStatus.RUNNING },
  });

  try {
    const adapter = createHrisAdapter();
    const employees = await adapter.fetchEmployees();
    const count = await upsertEmployeeRecords(employees);
    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.SUCCESS,
        recordCount: count,
        completedAt: new Date(),
      },
    });

    return { count };
  } catch (error) {
    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

async function upsertEmployeeRecords(employees: HrisEmployeeRecord[]) {
  const db = getDb();
  const codeToUserId = new Map<string, string>();
  const emailToUserId = new Map<string, string>();

    for (const deptCode of [...new Set(employees.map((e) => e.departmentCode))]) {
      const sample = employees.find((e) => e.departmentCode === deptCode)!;
      await db.department.upsert({
        where: { code: deptCode },
        create: { code: deptCode, name: sample.departmentName },
        update: { name: sample.departmentName },
      });
    }

    for (const record of employees) {
      const department = await db.department.findUnique({
        where: { code: record.departmentCode },
      });

      const importedRole = (record.role ?? "EMPLOYEE") as UserRole;
      const existing = await db.user.findUnique({
        where: { email: record.email.toLowerCase() },
        select: { id: true, role: true },
      });
      const role = resolveImportRole(existing?.role, importedRole);

      const user = await db.user.upsert({
        where: { email: record.email.toLowerCase() },
        create: {
          email: record.email.toLowerCase(),
          name: record.name,
          role,
          passwordHash:
            record.email === "admin@fpt.com"
              ? await hashPassword("Admin@123456")
              : null,
        },
        update: {
          name: record.name,
          role,
        },
      });

      codeToUserId.set(record.employeeCode, user.id);
      emailToUserId.set(record.email.toLowerCase(), user.id);

      await db.employeeProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          employeeCode: record.employeeCode,
          departmentId: department?.id,
          jobTitle: record.jobTitle,
          hireDate: record.hireDate ? new Date(record.hireDate) : null,
          phone: record.phone,
          hrisExternalId: record.externalId,
          syncedAt: new Date(),
        },
        update: {
          departmentId: department?.id,
          jobTitle: record.jobTitle,
          hireDate: record.hireDate ? new Date(record.hireDate) : null,
          phone: record.phone,
          hrisExternalId: record.externalId,
          syncedAt: new Date(),
        },
      });
    }

  for (const record of employees) {
    const userId = codeToUserId.get(record.employeeCode);
    if (!userId) continue;

    let managerId: string | undefined;
    if (record.managerEmployeeCode) {
      managerId = codeToUserId.get(record.managerEmployeeCode);
    }
    if (!managerId && record.managerEmail) {
      managerId = emailToUserId.get(record.managerEmail.toLowerCase());
    }
    if (!managerId) continue;

    await db.user.update({
      where: { id: userId },
      data: { managerId },
    });
  }

  const managerIds = new Set(
    employees
      .map((r) => {
        if (r.managerEmployeeCode) return codeToUserId.get(r.managerEmployeeCode);
        if (r.managerEmail) return emailToUserId.get(r.managerEmail.toLowerCase());
        return undefined;
      })
      .filter((id): id is string => Boolean(id)),
  );

  for (const managerId of managerIds) {
    const user = await db.user.findUnique({
      where: { id: managerId },
      select: { role: true },
    });
    if (user && user.role === "EMPLOYEE") {
      await db.user.update({
        where: { id: managerId },
        data: { role: "MANAGER" },
      });
    }
  }

  return employees.length;
}

export async function syncHrisLeaveBalances(year = new Date().getFullYear()) {
  const db = getDb();
  const log = await db.hrisSyncLog.create({
    data: { entityType: "leave_balances", status: HrisSyncStatus.RUNNING },
  });

  try {
    const adapter = createHrisAdapter();
    const balances = await adapter.fetchLeaveBalances(year);
    let count = 0;

    for (const record of balances) {
      const profile = await db.employeeProfile.findUnique({
        where: { employeeCode: record.employeeCode },
      });
      if (!profile) continue;

      const leaveType = await db.leaveType.upsert({
        where: { code: record.leaveTypeCode },
        create: {
          code: record.leaveTypeCode,
          name:
            record.leaveTypeCode === "ANNUAL"
              ? "Nghỉ phép năm"
              : record.leaveTypeCode,
        },
        update: {},
      });

      await db.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: profile.id,
            leaveTypeId: leaveType.id,
            year: record.year,
          },
        },
        create: {
          employeeId: profile.id,
          leaveTypeId: leaveType.id,
          year: record.year,
          entitled: record.entitled,
          used: record.used,
          remaining: record.remaining,
          syncedAt: new Date(),
        },
        update: {
          entitled: record.entitled,
          used: record.used,
          remaining: record.remaining,
          syncedAt: new Date(),
        },
      });
      count++;
    }

    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.SUCCESS,
        recordCount: count,
        completedAt: new Date(),
      },
    });

    return { count };
  } catch (error) {
    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function syncHrisPayslips(period?: string) {
  const db = getDb();
  const log = await db.hrisSyncLog.create({
    data: { entityType: "payslips", status: HrisSyncStatus.RUNNING },
  });

  try {
    const adapter = createHrisAdapter();
    const payslips = await adapter.fetchPayslips(period);
    let count = 0;

    for (const record of payslips) {
      const profile = await db.employeeProfile.findUnique({
        where: { employeeCode: record.employeeCode },
        include: { user: true },
      });
      if (!profile) continue;

      const payslip = await db.payslip.upsert({
        where: {
          employeeId_period: {
            employeeId: profile.id,
            period: record.period,
          },
        },
        create: {
          employeeId: profile.id,
          userId: profile.userId,
          period: record.period,
          grossAmount: record.grossAmount,
          netAmount: record.netAmount,
          hrisExternalId: record.externalId,
          syncedAt: new Date(),
        },
        update: {
          grossAmount: record.grossAmount,
          netAmount: record.netAmount,
          hrisExternalId: record.externalId,
          syncedAt: new Date(),
        },
      });

      await db.payslipLine.deleteMany({ where: { payslipId: payslip.id } });
      await db.payslipLine.createMany({
        data: record.lines.map((line) => ({
          payslipId: payslip.id,
          code: line.code,
          label: line.label,
          amount: line.amount,
          category: line.category,
        })),
      });
      count++;
    }

    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.SUCCESS,
        recordCount: count,
        completedAt: new Date(),
      },
    });

    return { count };
  } catch (error) {
    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function syncHrisInsurancePeriods() {
  const db = getDb();
  const log = await db.hrisSyncLog.create({
    data: { entityType: "insurance_periods", status: HrisSyncStatus.RUNNING },
  });

  try {
    const adapter = createHrisAdapter();
    const periods = await adapter.fetchInsurancePeriods();
    let count = 0;

    for (const record of periods) {
      const profile = await db.employeeProfile.findUnique({
        where: { employeeCode: record.employeeCode },
      });
      if (!profile) continue;

      const existing = await db.insuranceParticipationPeriod.findFirst({
        where: {
          employeeId: profile.id,
          insuranceType: record.insuranceType,
          startDate: new Date(record.startDate),
        },
      });

      if (!existing) {
        await db.insuranceParticipationPeriod.create({
          data: {
            employeeId: profile.id,
            insuranceType: record.insuranceType,
            startDate: new Date(record.startDate),
            endDate: record.endDate ? new Date(record.endDate) : null,
            employerName: record.employerName,
            salaryBase: record.salaryBase,
            syncedAt: new Date(),
          },
        });
        count++;
      }
    }

    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.SUCCESS,
        recordCount: count,
        completedAt: new Date(),
      },
    });

    return { count };
  } catch (error) {
    await db.hrisSyncLog.update({
      where: { id: log.id },
      data: {
        status: HrisSyncStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function runFullHrisSync() {
  const employees = await syncHrisEmployees();
  const year = new Date().getFullYear();
  const balances = await syncHrisLeaveBalances(year);
  const payslips = await syncHrisPayslips();
  const insurance = await syncHrisInsurancePeriods();
  return { employees, balances, payslips, insurance };
}
