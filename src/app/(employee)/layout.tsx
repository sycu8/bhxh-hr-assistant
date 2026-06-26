import { EmployeePortalHeader } from "@/components/hr/employee-portal-header";
import { EmployeeShell } from "@/components/hr/employee-shell";
import { getEmployeeSessionUser } from "@/lib/auth/employee-session";
import { countPendingApprovalsForUser } from "@/lib/services/approval.service";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EmployeePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getEmployeeSessionUser();
  } catch {
    user = null;
  }
  if (!user) {
    redirect("/login");
  }

  let pendingApprovals = 0;
  try {
    pendingApprovals = await countPendingApprovalsForUser(user.id);
  } catch {
    pendingApprovals = 0;
  }

  return (
    <>
      <EmployeePortalHeader />
      <EmployeeShell user={user} pendingApprovals={pendingApprovals}>
        {children}
      </EmployeeShell>
    </>
  );
}
