import { PublishWorkflowStatus } from "@prisma/client";
import { getDb } from "@/lib/db/prisma";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";

export async function listPublishedPolicies() {
  const db = getDb();
  return db.companyPolicy.findMany({
    where: { status: PublishWorkflowStatus.PUBLISHED },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });
}

export async function getPublishedPolicyBySlug(slug: string) {
  const db = getDb();
  return db.companyPolicy.findFirst({
    where: { slug, status: PublishWorkflowStatus.PUBLISHED },
  });
}

export async function listAllPoliciesForAdmin() {
  const db = getDb();
  return db.companyPolicy.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function publishPolicy(params: {
  policyId: string;
  actorId: string;
}) {
  const db = getDb();
  const policy = await db.companyPolicy.update({
    where: { id: params.policyId },
    data: { status: PublishWorkflowStatus.PUBLISHED },
  });

  await writeCmsAuditLog({
    actorId: params.actorId,
    action: "policy.publish",
    entityType: "CompanyPolicy",
    entityId: policy.id,
  });

  return policy;
}

export async function upsertPolicy(params: {
  id?: string;
  slug: string;
  title: string;
  body: string;
  category?: string;
  effectiveFrom?: Date;
  actorId: string;
}) {
  const db = getDb();
  const policy = params.id
    ? await db.companyPolicy.update({
        where: { id: params.id },
        data: {
          slug: params.slug,
          title: params.title,
          body: params.body,
          category: params.category,
          effectiveFrom: params.effectiveFrom,
        },
      })
    : await db.companyPolicy.create({
        data: {
          slug: params.slug,
          title: params.title,
          body: params.body,
          category: params.category,
          effectiveFrom: params.effectiveFrom,
          status: PublishWorkflowStatus.DRAFT,
        },
      });

  await writeCmsAuditLog({
    actorId: params.actorId,
    action: params.id ? "policy.update" : "policy.create",
    entityType: "CompanyPolicy",
    entityId: policy.id,
  });

  return policy;
}
