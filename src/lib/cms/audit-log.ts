import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db/prisma";

export type AuditLogInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
};

export async function writeCmsAuditLog(input: AuditLogInput): Promise<void> {
  const db = getDb();
  try {
    await db.cmsAuditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error("[cms-audit]", error);
  }
}
