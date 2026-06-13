import { UserRole } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { getDb } from "../src/lib/db/prisma";
import { TOPICS } from "../src/lib/data/topics";
import { SALARY_TAX_RULES_2026 } from "../src/lib/services/salary-tax-rules";

const ADMIN_EMAIL = "trangtth39@fpt.com";

export async function seedCmsData() {
  const prisma = getDb();

  await prisma.cmsAuditLog.deleteMany();
  await prisma.contentVersion.deleteMany();
  await prisma.hrTicket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.calculatorConfig.deleteMany();
  await prisma.checklistTemplate.deleteMany();
  await prisma.topicPage.deleteMany();
  await prisma.mediaAsset.deleteMany();

  await prisma.user.deleteMany({ where: { email: "admin@fpt.com" } });

  const passwordHash = await hashPassword("ChangeMe123!");

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "CMS Admin",
      role: UserRole.ADMIN,
      passwordHash,
      isActive: true,
    },
    create: {
      name: "CMS Admin",
      email: ADMIN_EMAIL,
      role: UserRole.ADMIN,
      passwordHash,
      isActive: true,
    },
  });

  for (const [index, topic] of TOPICS.entries()) {
    await prisma.topicPage.upsert({
      where: { slug: topic.slug },
      update: {
        title: topic.title,
        description: topic.description,
        heroSummary: topic.description,
        status: "PUBLISHED",
        sortOrder: index,
      },
      create: {
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        heroSummary: topic.description,
        status: "PUBLISHED",
        sortOrder: index,
      },
    });
  }

  await prisma.calculatorConfig.create({
    data: {
      key: "salary-tax-2026",
      name: "Lương & thuế 2026",
      effectiveFrom: new Date("2026-01-01"),
      status: "ACTIVE",
      version: 1,
      createdById: admin.id,
      formulaJson: {
        baseSalary: SALARY_TAX_RULES_2026.baseSalary,
        upcomingBaseSalary: SALARY_TAX_RULES_2026.upcomingBaseSalary,
        bhxhCapMultiplier: 20,
        employeeRates: {
          bhxh: 0.08,
          bhyt: 0.015,
          bhtn: 0.01,
        },
        personalDeduction: SALARY_TAX_RULES_2026.personalDeduction,
        dependentDeduction: SALARY_TAX_RULES_2026.dependentDeduction,
      },
    },
  });

  await prisma.checklistTemplate.create({
    data: {
      title: "Hồ sơ hưởng chế độ thai sản",
      slug: "ho-so-thai-san",
      topicSlug: "thai-san",
      status: "PUBLISHED",
      description: "Checklist tham khảo trước khi nộp HR.",
      items: [
        { label: "Giấy khai sinh con", hint: "Bản sao công chứng nếu HR yêu cầu" },
        { label: "Giấy nghỉ việc hưởng chế độ thai sản", hint: "Theo mẫu BHXH" },
        { label: "Sổ BHXH / tài khoản ngân hàng", hint: "Để nhận trợ cấp" },
      ],
    },
  });

  await prisma.cmsAuditLog.create({
    data: {
      actorId: admin.id,
      action: "seed.cms",
      entityType: "System",
      metadata: { adminEmail: ADMIN_EMAIL },
    },
  });

  console.log(`CMS seed: ${ADMIN_EMAIL} (ADMIN, password: ChangeMe123!)`);
}
