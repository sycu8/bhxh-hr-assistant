import {
  ApprovalDecision,
  ApprovalStatus,
  type Prisma,
  type UserRole,
} from "@prisma/client";
import { canApproveForEmployee } from "@/lib/auth/access-control";
import { getDb } from "@/lib/db/prisma";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";

export async function countPendingApprovalsForUser(userId: string) {
  const db = getDb();
  return db.approvalStep.count({
    where: {
      approverId: userId,
      decision: null,
      request: { status: ApprovalStatus.PENDING_APPROVAL },
    },
  });
}

export async function listPendingApprovalsForUser(userId: string) {
  const db = getDb();
  const steps = await db.approvalStep.findMany({
    where: {
      approverId: userId,
      decision: null,
      request: { status: ApprovalStatus.PENDING_APPROVAL },
    },
    include: {
      request: {
        include: {
          requester: { select: { id: true, name: true, email: true } },
          leaveRequest: {
            include: { leaveType: true, employee: true },
          },
          documentRequest: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return steps.map((step) => ({
    stepId: step.id,
    requestId: step.requestId,
    templateCode: step.request.templateCode,
    requester: step.request.requester,
    payload: step.request.payload,
    dueAt: step.request.dueAt,
    leaveRequest: step.request.leaveRequest,
    documentRequest: step.request.documentRequest,
  }));
}

export async function decideApproval(params: {
  stepId: string;
  actorId: string;
  actorRole: UserRole;
  decision: ApprovalDecision;
  comment?: string;
}) {
  const db = getDb();
  const step = await db.approvalStep.findUnique({
    where: { id: params.stepId },
    include: {
      request: {
        include: {
          requester: true,
          leaveRequest: { include: { employee: { include: { user: true } } } },
          documentRequest: true,
        },
      },
    },
  });

  if (!step || step.decision) {
    throw new Error("Bước phê duyệt không hợp lệ.");
  }

  if (step.approverId !== params.actorId) {
    const managerId = step.request.leaveRequest?.employee.user.managerId;
    const subjectUserId = step.request.requesterId;
    if (
      !canApproveForEmployee(
        { id: params.actorId, role: params.actorRole },
        subjectUserId,
        managerId,
      )
    ) {
      throw new Error("Không có quyền phê duyệt.");
    }
  }

  await db.approvalStep.update({
    where: { id: step.id },
    data: {
      decision: params.decision,
      comment: params.comment?.trim() || null,
      decidedAt: new Date(),
    },
  });

  const approved = params.decision === ApprovalDecision.APPROVED;
  const newStatus = approved
    ? ApprovalStatus.APPROVED
    : ApprovalStatus.REJECTED;

  await db.approvalRequest.update({
    where: { id: step.requestId },
    data: { status: newStatus },
  });

  if (step.request.leaveRequest) {
    await db.leaveRequest.update({
      where: { id: step.request.leaveRequest.id },
      data: { status: approved ? "APPROVED" : "REJECTED" },
    });

    if (approved) {
      const lr = step.request.leaveRequest;
      const year = lr.startDate.getFullYear();
      const balance = await db.leaveBalance.findFirst({
        where: {
          employeeId: lr.employeeId,
          leaveTypeId: lr.leaveTypeId,
          year,
        },
      });
      if (balance) {
        await db.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: balance.used + lr.totalDays,
            remaining: Math.max(0, balance.remaining - lr.totalDays),
          },
        });
      }
    }
  }

  if (step.request.documentRequest && approved) {
    await db.documentRequest.update({
      where: { id: step.request.documentRequest.id },
      data: { status: "APPROVED" },
    });
  }

  if (step.request.documentRequest && !approved) {
    await db.documentRequest.update({
      where: { id: step.request.documentRequest.id },
      data: { status: "REJECTED" },
    });
  }

  await writeCmsAuditLog({
    actorId: params.actorId,
    action: `approval.${params.decision.toLowerCase()}`,
    entityType: "ApprovalRequest",
    entityId: step.requestId,
    metadata: { stepId: step.id, comment: params.comment },
  });

  return { requestId: step.requestId, status: newStatus };
}

export async function createApprovalRequest(params: {
  templateCode: string;
  requesterId: string;
  approverId: string;
  payload: Record<string, unknown>;
  dueAt?: Date;
}) {
  const db = getDb();
  const request = await db.approvalRequest.create({
    data: {
      templateCode: params.templateCode,
      requesterId: params.requesterId,
      status: ApprovalStatus.PENDING_APPROVAL,
      currentStep: 0,
      payload: params.payload as Prisma.InputJsonValue,
      dueAt: params.dueAt,
      steps: {
        create: {
          stepIndex: 0,
          approverId: params.approverId,
        },
      },
    },
  });
  return request;
}
