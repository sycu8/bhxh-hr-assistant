import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEffectiveDate, formatVnd } from "@/lib/format/currency";
import { EMPLOYEE_TOOLS_SECTION_TITLE } from "@/lib/navigation/employee-tools";
import {
  getBhxhBhytCap,
  getBhtnCapByRegion,
  SALARY_TAX_RULES_2026,
} from "@/lib/services/salary-tax-rules";

export const metadata: Metadata = {
  title: "Cập nhật lương cơ bản",
  description:
    "Lương cơ sở, lương tối thiểu vùng và trần đóng BHXH/BHYT/BHTN theo cấu hình đang áp dụng.",
};

export default function BaseSalaryReferencePage() {
  const { baseSalary, baseSalaryEffectiveFrom, regionalMinimumWages, regionalMinimumWageEffectiveFrom } =
    SALARY_TAX_RULES_2026;
  const bhxhBhytCap = getBhxhBhytCap();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link href="/calculators">
          <ArrowLeft className="h-4 w-4" />
          {EMPLOYEE_TOOLS_SECTION_TITLE}
        </Link>
      </Button>

      <header className="mb-8 max-w-2xl">
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Cập nhật lương cơ bản
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Các mức dưới đây lấy từ cấu hình tính lương trong hệ thống (kỳ thuế{" "}
          {SALARY_TAX_RULES_2026.taxYear}). Đối chiếu thêm văn bản gốc trước khi áp dụng cho
          hồ sơ thật.
        </p>
      </header>

      <div className="space-y-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Lương cơ sở</CardTitle>
            <CardDescription>
              Căn cứ tính mức trần đóng BHXH, BHYT (thường = lương cơ sở × 20).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold tabular-nums">{formatVnd(baseSalary)}</p>
            <p className="text-sm text-muted-foreground">
              Hiệu lực từ: {formatEffectiveDate(baseSalaryEffectiveFrom)}
            </p>
            <p className="text-sm text-muted-foreground">
              Trần đóng BHXH + BHYT (×20):{" "}
              <span className="font-medium text-foreground">{formatVnd(bhxhBhytCap)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Lương tối thiểu vùng</CardTitle>
            <CardDescription>
              Hiệu lực từ {formatEffectiveDate(regionalMinimumWageEffectiveFrom)} — dùng cho trần
              BHTN (×20 theo vùng).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border text-sm">
              {(Object.keys(regionalMinimumWages) as Array<keyof typeof regionalMinimumWages>).map(
                (region) => (
                  <li key={region} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <span className="font-medium">Vùng {region}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatVnd(regionalMinimumWages[region])}
                      <span className="mx-2 text-border">·</span>
                      trần BHTN {formatVnd(getBhtnCapByRegion(region))}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-dashed border-amber-200/80 bg-amber-50/40">
          <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Khi Nhà nước điều chỉnh lương cơ sở hoặc lương tối thiểu, HR/C&amp;B cập nhật cấu
              hình — bạn có thể đối chiếu thêm tại mục pháp luật.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/legal-updates?q=lương+cơ+sở">Văn bản lương cơ sở</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/cong-cu-luong-thue">
                  Tính lương
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
