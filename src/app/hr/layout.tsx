import { EmployeePortalHeader } from "@/components/hr/employee-portal-header";
import { HrConsoleShell } from "@/components/hr/hr-console-shell";
import { requireHrConsoleUser } from "@/lib/auth/require-hr";

export default async function HrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireHrConsoleUser();
  return (
    <>
      <EmployeePortalHeader />
      <HrConsoleShell user={user}>{children}</HrConsoleShell>
    </>
  );
}
