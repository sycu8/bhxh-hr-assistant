import type { UserRole } from "@prisma/client";

export const PERMISSIONS = [
  "admin:access",
  "hr:console:access",
  "portal:access",
  "faq:read",
  "faq:write",
  "faq:publish",
  "topic:read",
  "topic:write",
  "topic:publish",
  "legal:read",
  "legal:write",
  "legal:publish",
  "calculator:read",
  "calculator:write",
  "ticket:read",
  "ticket:write",
  "ticket:read:self",
  "media:read",
  "media:write",
  "user:read",
  "user:write",
  "audit:read",
  "search:read",
  "checklist:read",
  "checklist:write",
  "profile:read:self",
  "profile:write:self",
  "contract:read:self",
  "document:request:self",
  "document:read:self",
  "leave:read:self",
  "leave:write:self",
  "approval:read:team",
  "approval:write:team",
  "payslip:read:self",
  "payroll:issue:self",
  "insurance:read:self",
  "policy:read",
  "policy:write",
  "employee:read",
  "employee:write",
  "report:read",
  "admin:sync",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const EMPLOYEE_PERMISSIONS: Permission[] = [
  "portal:access",
  "profile:read:self",
  "profile:write:self",
  "contract:read:self",
  "document:request:self",
  "document:read:self",
  "ticket:read:self",
  "leave:read:self",
  "leave:write:self",
  "payslip:read:self",
  "payroll:issue:self",
  "insurance:read:self",
  "policy:read",
];

const MANAGER_PERMISSIONS: Permission[] = [
  ...EMPLOYEE_PERMISSIONS,
  "approval:read:team",
  "approval:write:team",
  "hr:console:access",
  "ticket:read",
  "employee:read",
  "report:read",
];

const HR_PERMISSIONS: Permission[] = [
  "admin:access",
  "hr:console:access",
  "portal:access",
  "faq:read",
  "faq:write",
  "faq:publish",
  "topic:read",
  "topic:write",
  "topic:publish",
  "legal:read",
  "legal:write",
  "legal:publish",
  "calculator:read",
  "calculator:write",
  "ticket:read",
  "ticket:write",
  "ticket:read:self",
  "media:read",
  "media:write",
  "audit:read",
  "search:read",
  "checklist:read",
  "checklist:write",
  "profile:read:self",
  "document:read:self",
  "leave:read:self",
  "policy:read",
  "policy:write",
  "employee:read",
  "employee:write",
  "report:read",
  "admin:sync",
  "approval:read:team",
  "approval:write:team",
];

const CB_PERMISSIONS: Permission[] = [
  "hr:console:access",
  "portal:access",
  ...EMPLOYEE_PERMISSIONS,
  "calculator:read",
  "calculator:write",
  "ticket:read",
  "ticket:write",
  "payslip:read:self",
  "employee:read",
  "report:read",
  "policy:read",
  "audit:read",
];

const RECRUITER_PERMISSIONS: Permission[] = [
  "hr:console:access",
  "portal:access",
  ...EMPLOYEE_PERMISSIONS,
  "employee:read",
  "ticket:read",
  "policy:read",
  "report:read",
];

const ADMIN_PERMISSIONS: Permission[] = [...PERMISSIONS];

const SUPER_ADMIN_PERMISSIONS: Permission[] = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  EMPLOYEE: EMPLOYEE_PERMISSIONS,
  MANAGER: MANAGER_PERMISSIONS,
  HR: HR_PERMISSIONS,
  CB: CB_PERMISSIONS,
  RECRUITER: RECRUITER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
};

const HR_CONSOLE_ROLES: UserRole[] = [
  "MANAGER",
  "HR",
  "CB",
  "RECRUITER",
  "ADMIN",
  "SUPER_ADMIN",
];

export function hasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessAdmin(role: UserRole): boolean {
  return hasPermission(role, "admin:access");
}

export function canAccessHrConsole(role: UserRole): boolean {
  return hasPermission(role, "hr:console:access");
}

export function canAccessEmployeePortal(role: UserRole): boolean {
  return hasPermission(role, "portal:access");
}

export function isHrConsoleRole(role: UserRole): boolean {
  return HR_CONSOLE_ROLES.includes(role);
}
