import { LeaveRequestStatus } from "@prisma/client";
import { getDb } from "@/lib/db/prisma";
import { createApprovalRequest } from "@/lib/services/approval.service";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";

function businessDaysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((end.getTime() - start.getTime()) / msPerDay);
  return Math.max(1, diff + 1);
}

export async function listLeaveBalancesForUser(userId: string) {
  const db = getDb();
  const profile = await db.employeeProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const year = new Date().getFullYear();
  return db.leaveBalance.findMany({
    where: { employeeId: profile.id, year },
    include: { leaveType: true },
    orderBy: { leaveType: { name: "asc" } },
  });
}

export async function listLeaveRequestsForUser(userId: string) {
  const db = getDb();
  return db.leaveRequest.findMany({
    where: { userId },
    include: { leaveType: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createLeaveRequest(params: {
  userId: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  const db = getDb();
  const profile = await db.employeeProfile.findUnique({
    where: { userId: params.userId },
    include: { user: true },
  });
  if (!profile) {
    throw new Error("Chưa có hồ sơ nhân viên. Vui lòng liên hệ HR.");
  }

  const leaveType = await db.leaveType.findUnique({
    where: { code: params.leaveTypeCode },
  });
  if (!leaveType) {
    throw new Error("Loại nghỉ phép không hợp lệ.");
  }

  const start = new Date(params.startDate);
  const end = new Date(params.endDate);
  if (end < start) {
    throw new Error("Ngày kết thúc phải sau ngày bắt đầu.");
  }

  const totalDays = businessDaysBetween(start, end);
  const year = start.getFullYear();
  const balance = await db.leaveBalance.findFirst({
    where: {
      employeeId: profile.id,
      leaveTypeId: leaveType.id,
      year,
    },
  });

  if (balance && balance.remaining < totalDays) {
    throw new Error("Số ngày nghỉ vượt quá số dư còn lại.");
  }

  const managerId = profile.user.managerId;
  if (!managerId) {
    throw new Error("Chưa có quản lý trực tiếp. Vui lòng liên hệ HR.");
  }

  const approval = await createApprovalRequest({
    templateCode: "leave_request",
    requesterId: params.userId,
    approverId: managerId,
    payload: {
      leaveTypeCode: params.leaveTypeCode,
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays,
    },
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });

  const leaveRequest = await db.leaveRequest.create({
    data: {
      employeeId: profile.id,
      userId: params.userId,
      leaveTypeId: leaveType.id,
      startDate: start,
      endDate: end,
      totalDays,
      reason: params.reason?.trim() || null,
      status: LeaveRequestStatus.PENDING,
      approvalId: approval.id,
    },
  });

  await writeCmsAuditLog({
    actorId: params.userId,
    action: "leave.request",
    entityType: "LeaveRequest",
    entityId: leaveRequest.id,
    metadata: { totalDays, leaveTypeCode: params.leaveTypeCode },
  });

  return leaveRequest;
}
