import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db/prisma";
import { runFullHrisSync } from "@/lib/services/hris-sync.service";
import { PublishWorkflowStatus, type UserRole } from "@prisma/client";

export async function seedCmsData() {
  const prisma = getDb();

  await prisma.user.upsert({
    where: { email: "admin@fpt.com" },
    create: {
      email: "admin@fpt.com",
      name: "System Admin",
      role: "SUPER_ADMIN" as UserRole,
      passwordHash: await hashPassword("Admin@123456"),
    },
    update: {
      role: "SUPER_ADMIN" as UserRole,
      passwordHash: await hashPassword("Admin@123456"),
    },
  });

  await runFullHrisSync();

  await prisma.companyPolicy.upsert({
    where: { slug: "nghi-phep-nam" },
    create: {
      slug: "nghi-phep-nam",
      title: "Quy định nghỉ phép năm",
      category: "Nghỉ phép",
      body:
        "Nhân viên chính thức được hưởng 12 ngày nghỉ phép năm. Đăng ký nghỉ qua Cổng HR, " +
        "quản lý trực tiếp phê duyệt trong 3 ngày làm việc.",
      effectiveFrom: new Date("2024-01-01"),
      status: PublishWorkflowStatus.PUBLISHED,
    },
    update: {
      status: PublishWorkflowStatus.PUBLISHED,
    },
  });

  await prisma.companyPolicy.upsert({
    where: { slug: "bao-hiem-ftel" },
    create: {
      slug: "bao-hiem-ftel",
      title: "Chính sách bảo hiểm FPT Telecom",
      category: "Bảo hiểm",
      body:
        "FPT Telecom thực hiện đóng BHXH, BHYT, BHTN theo quy định pháp luật. " +
        "Chi tiết chế độ thai sản theo QĐ 1069/QĐ-FTEL.",
      effectiveFrom: new Date("2023-10-01"),
      status: PublishWorkflowStatus.PUBLISHED,
    },
    update: {
      status: PublishWorkflowStatus.PUBLISHED,
    },
  });

  console.log("CMS/HR seed completed: users, HRIS sync, policies.");
}
