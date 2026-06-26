import type { UserRole } from "@prisma/client";
import { hasPermission } from "@/lib/auth/permissions";

export type AccessActor = {
  id: string;
  role: UserRole;
};

export function canReadEmployeeRecord(
  actor: AccessActor,
  targetUserId: string,
  managerId?: string | null,
): boolean {
  if (actor.id === targetUserId) {
    return hasPermission(actor.role, "profile:read:self");
  }
  if (hasPermission(actor.role, "employee:read")) {
    return true;
  }
  if (
    managerId === actor.id &&
    hasPermission(actor.role, "approval:read:team")
  ) {
    return true;
  }
  return false;
}

export function canApproveForEmployee(
  actor: AccessActor,
  subjectUserId: string,
  managerId?: string | null,
): boolean {
  if (!hasPermission(actor.role, "approval:write:team")) {
    return false;
  }
  if (hasPermission(actor.role, "employee:write")) {
    return true;
  }
  return managerId === actor.id && subjectUserId !== actor.id;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "***";
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}
