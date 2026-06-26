import Link from "next/link";
import { EMPLOYEE_TOOL_GROUPS } from "@/lib/navigation/employee-tools";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Công cụ lương" };

export default function PayCalculatorsPage() {
  const payrollGroup = EMPLOYEE_TOOL_GROUPS.find((g) => g.id === "payroll");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Công cụ lương &amp; thuế</h1>
        <p className="text-sm text-muted-foreground">
          Ước tính lương gross/net theo quy định hiện hành.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {payrollGroup?.tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
          >
            <p className="font-medium">{tool.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
