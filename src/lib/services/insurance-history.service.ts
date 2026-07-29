import { getDb } from "@/lib/db/prisma";

export async function listInsuranceHistoryForUser(userId: string) {
  const db = getDb();
  const profile = await db.employeeProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  return db.insuranceParticipationPeriod.findMany({
    where: { employeeId: profile.id },
    orderBy: [{ insuranceType: "asc" }, { startDate: "desc" }],
  });
}
