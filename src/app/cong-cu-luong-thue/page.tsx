import { Suspense } from "react";
import { SalaryTaxTool } from "@/components/calculators/salary-tax-tool";

export const metadata = {
  title: "Tính lương",
  description:
    "Tính lương gộp sang thực nhận, thực nhận sang gộp và bảng chi tiết bảo hiểm, thuế TNCN cho nhân viên.",
};

export default function SalaryTaxToolsPage() {
  return (
    <Suspense fallback={<SalaryTaxToolFallback />}>
      <SalaryTaxTool />
    </Suspense>
  );
}

function SalaryTaxToolFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
      <div className="h-44 rounded-2xl border border-blue-200/70 bg-blue-950/10" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="h-[520px] rounded-2xl border border-border bg-muted/30" />
        <div className="h-[520px] rounded-2xl border border-border bg-muted/30" />
      </div>
    </div>
  );
}
