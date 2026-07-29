"use server";

import { revalidatePath } from "next/cache";
import { ApprovalDecision } from "@prisma/client";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import { decideApproval } from "@/lib/services/approval.service";
import { createDocumentRequest } from "@/lib/services/document-request.service";
import { createLeaveRequest } from "@/lib/services/leave.service";
import type { DocumentRequestType } from "@prisma/client";

export async function submitLeaveRequestAction(formData: FormData) {
  const user = await requireEmployeeUser();
  await createLeaveRequest({
    userId: user.id,
    leaveTypeCode: String(formData.get("leaveTypeCode") || "ANNUAL"),
    startDate: String(formData.get("startDate")),
    endDate: String(formData.get("endDate")),
    reason: String(formData.get("reason") || ""),
  });
  revalidatePath("/time/leave");
  revalidatePath("/approvals");
}

export async function submitDocumentRequestAction(formData: FormData) {
  const user = await requireEmployeeUser();
  await createDocumentRequest({
    userId: user.id,
    type: String(formData.get("type")) as DocumentRequestType,
    purpose: String(formData.get("purpose") || ""),
    language: String(formData.get("language") || "vi"),
  });
  revalidatePath("/my-hr/documents");
}

export async function decideApprovalAction(formData: FormData) {
  const user = await requireEmployeeUser();
  const stepId = String(formData.get("stepId"));
  const decision = String(formData.get("decision")) as ApprovalDecision;
  const comment = String(formData.get("comment") || "");
  await decideApproval({
    stepId,
    actorId: user.id,
    actorRole: user.role,
    decision,
    comment,
  });
  revalidatePath("/approvals");
  revalidatePath("/time/leave");
}
