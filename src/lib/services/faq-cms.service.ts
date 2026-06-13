import { FaqStatus, PublishWorkflowStatus } from "@prisma/client";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";
import { getDb } from "@/lib/db/prisma";

export async function publishFaq(params: {
  faqId: string;
  actorId: string;
}) {
  const db = getDb();
  const faq = await db.fAQ.findUnique({ where: { id: params.faqId } });
  if (!faq) {
    throw new Error("FAQ not found");
  }

  const latest = await db.contentVersion.findFirst({
    where: { entityType: "FAQ", entityId: params.faqId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const updated = await db.fAQ.update({
    where: { id: params.faqId },
    data: { status: FaqStatus.APPROVED },
  });

  await db.contentVersion.create({
    data: {
      entityType: "FAQ",
      entityId: params.faqId,
      version: nextVersion,
      snapshot: updated,
      status: PublishWorkflowStatus.PUBLISHED,
      publishedAt: new Date(),
      createdById: params.actorId,
    },
  });

  await writeCmsAuditLog({
    actorId: params.actorId,
    action: "faq.publish",
    entityType: "FAQ",
    entityId: updated.id,
    metadata: { version: nextVersion, slug: updated.slug },
  });

  return { faq: updated, version: nextVersion };
}
