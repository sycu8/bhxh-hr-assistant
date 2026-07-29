import { redirect } from "next/navigation";
import type { Permission } from "@/lib/auth/permissions";
import { canAccessHrConsole, hasPermission } from "@/lib/auth/permissions";
import { getEmployeeSessionUser, type EmployeeAuthUser } from "@/lib/auth/employee-session";
import { getSessionUser, type AuthUser } from "@/lib/auth/session";

export type HrConsoleUser = AuthUser | EmployeeAuthUser;

async function resolveHrConsoleUser(): Promise<HrConsoleUser | null> {
  const cmsUser = await getSessionUser();
  if (cmsUser && canAccessHrConsole(cmsUser.role)) {
    return cmsUser;
  }
  const employeeUser = await getEmployeeSessionUser();
  if (employeeUser && canAccessHrConsole(employeeUser.role)) {
    return employeeUser;
  }
  return null;
}

export async function requireHrConsoleUser(): Promise<HrConsoleUser> {
  const user = await resolveHrConsoleUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireHrPermission(
  permission: Permission,
): Promise<HrConsoleUser> {
  const user = await requireHrConsoleUser();
  if (!hasPermission(user.role, permission)) {
    redirect("/hr?denied=1");
  }
  return user;
}
