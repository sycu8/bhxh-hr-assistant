import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: "trangtth39@fpt.com" },
  });
  console.log({
    found: Boolean(user),
    role: user?.role,
    isActive: user?.isActive,
    hasHash: Boolean(user?.passwordHash),
  });
  await prisma.$disconnect();
}

main();
