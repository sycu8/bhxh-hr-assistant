import { redirect } from "next/navigation";
import type { Permission } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
import { getSessionUser, type AuthUser } from "@/lib/auth/session";

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireAdminUser();
  if (!hasPermission(user.role, permission)) {
    redirect("/admin?denied=1");
  }
  return user;
}
