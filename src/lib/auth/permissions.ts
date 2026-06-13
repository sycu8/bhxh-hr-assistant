import type { UserRole } from "@prisma/client";

export const PERMISSIONS = [
  "admin:access",
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
  "media:read",
  "media:write",
  "user:read",
  "user:write",
  "audit:read",
  "search:read",
  "checklist:read",
  "checklist:write",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const HR_PERMISSIONS: Permission[] = [
  "admin:access",
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
  "media:read",
  "media:write",
  "audit:read",
  "search:read",
  "checklist:read",
  "checklist:write",
];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  EMPLOYEE: [],
  HR: HR_PERMISSIONS,
  ADMIN: PERMISSIONS,
};

export function hasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed.includes(permission);
}

export function canAccessAdmin(role: UserRole): boolean {
  return hasPermission(role, "admin:access");
}
