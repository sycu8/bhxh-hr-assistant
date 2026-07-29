import { DocumentRequestType } from "@prisma/client";
import { getDb } from "@/lib/db/prisma";
import { createApprovalRequest } from "@/lib/services/approval.service";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";

const AUTO_APPROVE_TYPES = new Set<DocumentRequestType>([
  DocumentRequestType.EMPLOYMENT_CONFIRM,
]);

export async function listDocumentRequestsForUser(userId: string) {
  const db = getDb();
  return db.documentRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createDocumentRequest(params: {
  userId: string;
  type: DocumentRequestType;
  purpose?: string;
  language?: string;
}) {
  const db = getDb();
  const profile = await db.employeeProfile.findUnique({
    where: { userId: params.userId },
    include: { user: true },
  });
  if (!profile) {
    throw new Error("Chưa có hồ sơ nhân viên.");
  }

  const needsHrApproval = !AUTO_APPROVE_TYPES.has(params.type);
  let approvalId: string | undefined;
  let status: "SUBMITTED" | "PENDING_HR" | "APPROVED" = needsHrApproval
    ? "PENDING_HR"
    : "APPROVED";

  if (needsHrApproval) {
    const hrUser = await db.user.findFirst({
      where: { role: { in: ["HR", "ADMIN", "SUPER_ADMIN"] }, isActive: true },
    });
    if (!hrUser) {
      throw new Error("Chưa có HR phụ trách phê duyệt.");
    }
    const approval = await createApprovalRequest({
      templateCode: "document_request",
      requesterId: params.userId,
      approverId: hrUser.id,
      payload: { type: params.type, purpose: params.purpose },
    });
    approvalId = approval.id;
    status = "PENDING_HR";
  }

  const request = await db.documentRequest.create({
    data: {
      employeeId: profile.id,
      userId: params.userId,
      type: params.type,
      purpose: params.purpose?.trim() || null,
      language: params.language ?? "vi",
      status,
      approvalId,
      outputStorageKey:
        status === "APPROVED"
          ? `generated/${profile.employeeCode}-${params.type.toLowerCase()}.pdf`
          : null,
    },
  });

  await writeCmsAuditLog({
    actorId: params.userId,
    action: "document.request",
    entityType: "DocumentRequest",
    entityId: request.id,
    metadata: { type: params.type },
  });

  return request;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentRequestType, string> = {
  EMPLOYMENT_CONFIRM: "Xác nhận công tác",
  INCOME_CONFIRM: "Xác nhận thu nhập",
  INSURANCE_CONFIRM: "Xác nhận bảo hiểm",
};
