import "dotenv/config";
import { EmployeeStatus, UserRole } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db/prisma";
import { seedCmsData } from "./seed-cms";

const DEPARTMENTS = [
  { code: "IT", name: "Công nghệ thông tin" },
  { code: "HR", name: "Nhân sự" },
  { code: "CB", name: "C&B" },
  { code: "SALES", name: "Kinh doanh" },
  { code: "OPS", name: "Vận hành" },
  { code: "FIN", name: "Tài chính" },
  { code: "MKT", name: "Marketing" },
  { code: "CS", name: "Chăm sóc khách hàng" },
] as const;

const FIRST_NAMES = [
  "An",
  "Bình",
  "Chi",
  "Dũng",
  "Hà",
  "Hùng",
  "Lan",
  "Minh",
  "Nam",
  "Oanh",
  "Phúc",
  "Quân",
  "Trang",
  "Tuấn",
  "Vy",
];
const LAST_NAMES = [
  "Nguyễn",
  "Trần",
  "Lê",
  "Phạm",
  "Hoàng",
  "Vũ",
  "Đặng",
  "Bùi",
];

function syntheticName(index: number): string {
  const fn = FIRST_NAMES[index % FIRST_NAMES.length]!;
  const ln = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]!;
  return `${ln} ${fn}`;
}

function syntheticEmail(index: number): string {
  return `nv${String(index).padStart(4, "0")}@fpt.com`;
}

export async function seedQaScale() {
  const db = getDb();
  const year = new Date().getFullYear();

  const deptRows = await Promise.all(
    DEPARTMENTS.map((d, i) =>
      db.department.upsert({
        where: { code: d.code },
        create: {
          id: `qa-dept-${d.code.toLowerCase()}`,
          code: d.code,
          name: d.name,
        },
        update: { name: d.name },
      }),
    ),
  );

  await db.leaveType.upsert({
    where: { code: "ANNUAL" },
    create: {
      id: "qa-leave-annual",
      code: "ANNUAL",
      name: "Nghỉ phép năm",
      paid: true,
    },
    update: {},
  });

  const leaveType = await db.leaveType.findUniqueOrThrow({
    where: { code: "ANNUAL" },
  });

  const managerIds: string[] = [];

  for (let i = 0; i < deptRows.length; i++) {
    const dept = deptRows[i]!;
    const mgrId = `qa-mgr-${dept.code.toLowerCase()}`;
    managerIds.push(mgrId);
    await db.user.upsert({
      where: { email: `manager.${dept.code.toLowerCase()}@fpt.com` },
      create: {
        id: mgrId,
        email: `manager.${dept.code.toLowerCase()}@fpt.com`,
        name: `QL ${dept.name}`,
        role: UserRole.MANAGER,
        employeeGroup: "MANAGER",
        isActive: true,
      },
      update: { role: UserRole.MANAGER, isActive: true },
    });
    await db.employeeProfile.upsert({
      where: { userId: mgrId },
      create: {
        id: `qa-prof-${mgrId}`,
        userId: mgrId,
        employeeCode: `FTEL-M${String(i + 1).padStart(3, "0")}`,
        departmentId: dept.id,
        jobTitle: "Trưởng nhóm",
        status: EmployeeStatus.ACTIVE,
        hireDate: new Date("2018-01-15"),
        hrisExternalId: `qa-hris-mgr-${dept.code}`,
        syncedAt: new Date(),
      },
      update: { departmentId: dept.id, syncedAt: new Date() },
    });
    await db.department.update({
      where: { id: dept.id },
      data: { managerId: mgrId },
    });
  }

  const employeeCount = 72;
  for (let i = 1; i <= employeeCount; i++) {
    const email = syntheticEmail(i);
    const userId = `qa-emp-${String(i).padStart(4, "0")}`;
    const dept = deptRows[i % deptRows.length]!;
    const managerId = managerIds[i % managerIds.length]!;

    await db.user.upsert({
      where: { email },
      create: {
        id: userId,
        email,
        name: syntheticName(i),
        role: UserRole.EMPLOYEE,
        employeeGroup: "OFFICIAL",
        managerId,
        isActive: true,
      },
      update: {
        name: syntheticName(i),
        managerId,
        isActive: true,
      },
    });

    const profileId = `qa-prof-${userId}`;
    await db.employeeProfile.upsert({
      where: { userId },
      create: {
        id: profileId,
        userId,
        employeeCode: `FTEL-${String(1000 + i)}`,
        departmentId: dept.id,
        jobTitle: "Chuyên viên",
        status: EmployeeStatus.ACTIVE,
        hireDate: new Date(2020 + (i % 5), (i % 12), 1),
        phone: `090${String(1000000 + i).slice(-7)}`,
        hrisExternalId: `qa-hris-${i}`,
        syncedAt: new Date(),
      },
      update: {
        departmentId: dept.id,
        syncedAt: new Date(),
      },
    });

    await db.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: profileId,
          leaveTypeId: leaveType.id,
          year,
        },
      },
      create: {
        id: `qa-bal-${userId}-${year}`,
        employeeId: profileId,
        leaveTypeId: leaveType.id,
        year,
        entitled: 12,
        used: i % 5,
        remaining: 12 - (i % 5),
      },
      update: {
        entitled: 12,
        used: i % 5,
        remaining: 12 - (i % 5),
      },
    });

    for (const period of [`${year}-04`, `${year}-05`, `${year}-06`]) {
      await db.payslip.upsert({
        where: {
          employeeId_period: { employeeId: profileId, period },
        },
        create: {
          id: `qa-pay-${userId}-${period}`,
          employeeId: profileId,
          userId,
          period,
          grossAmount: 20_000_000 + (i % 10) * 500_000,
          netAmount: 16_500_000 + (i % 10) * 400_000,
          hrisExternalId: `qa-payslip-${i}-${period}`,
          syncedAt: new Date(),
        },
        update: { syncedAt: new Date() },
      });
    }
  }

  await db.user.upsert({
    where: { email: "admin@fpt.com" },
    create: {
      email: "admin@fpt.com",
      name: "QA Admin",
      role: UserRole.SUPER_ADMIN,
      passwordHash: await hashPassword("Admin@123456"),
      isActive: true,
    },
    update: {
      role: UserRole.SUPER_ADMIN,
      passwordHash: await hashPassword("Admin@123456"),
    },
  });

  await seedCmsData();

  console.log(
    `QA scale seed: ${deptRows.length} departments, ${employeeCount} employees, 3 payslip periods.`,
  );
}

async function main() {
  await seedQaScale();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
