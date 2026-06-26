import { getDb } from "@/lib/db/prisma";
import { maskPhone } from "@/lib/auth/access-control";

export async function getEmployeeProfileByUserId(userId: string) {
  const db = getDb();
  return db.employeeProfile.findUnique({
    where: { userId },
    include: {
      department: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          managerId: true,
          manager: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export function toPublicProfile(
  profile: NonNullable<Awaited<ReturnType<typeof getEmployeeProfileByUserId>>>,
) {
  return {
    id: profile.id,
    employeeCode: profile.employeeCode,
    name: profile.user.name,
    email: profile.user.email,
    role: profile.user.role,
    jobTitle: profile.jobTitle,
    department: profile.department?.name ?? null,
    hireDate: profile.hireDate,
    phone: maskPhone(profile.phone),
    manager: profile.user.manager,
    status: profile.status,
    syncedAt: profile.syncedAt,
  };
}

export async function listEmployeesForHr(params?: { take?: number }) {
  const db = getDb();
  return db.employeeProfile.findMany({
    take: params?.take ?? 100,
    orderBy: { employeeCode: "asc" },
    include: {
      department: true,
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}
