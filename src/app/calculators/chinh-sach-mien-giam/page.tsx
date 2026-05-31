import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEffectiveDate, formatVnd } from "@/lib/format/currency";
import { EMPLOYEE_TOOLS_SECTION_TITLE } from "@/lib/navigation/employee-tools";
import { SALARY_TAX_RULES_2026 } from "@/lib/services/salary-tax-rules";

export const metadata: Metadata = {
  title: "Chính sách miễn giảm mới nhất",
  description:
    "Giảm trừ gia cảnh, miễn giảm thuế TNCN và liên kết văn bản cập nhật trong hệ thống.",
};

export default function ExemptionPolicyPage() {
  const {
    taxYear,
    personalDeduction,
    dependentDeduction,
    personalDeductionEffectiveFrom,
    salaryIncomeTaxEffectiveFrom,
  } = SALARY_TAX_RULES_2026;

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
          Chính sách miễn giảm mới nhất
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Tóm tắt mức giảm trừ đang dùng trong công cụ tính lương (kỳ thuế {taxYear}). Tra thêm
          FAQ và văn bản đã duyệt để nắm điều kiện hưởng miễn giảm cụ thể.
        </p>
      </header>

      <div className="space-y-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Giảm trừ gia cảnh (thuế TNCN)</CardTitle>
            <CardDescription>
              Áp dụng khi tính thuế từ tiền lương — hiệu lực từ{" "}
              {formatEffectiveDate(personalDeductionEffectiveFrom)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Giảm trừ bản thân
              </p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatVnd(personalDeduction)}
                <span className="text-sm font-normal text-muted-foreground"> / tháng</span>
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Mỗi người phụ thuộc
              </p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatVnd(dependentDeduction)}
                <span className="text-sm font-normal text-muted-foreground"> / tháng</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Thuế TNCN từ tiền lương</CardTitle>
            <CardDescription>
              Biểu thuế lũy tiến từng phần — cấu hình từ{" "}
              {formatEffectiveDate(salaryIncomeTaxEffectiveFrom)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {SALARY_TAX_RULES_2026.monthlyTaxBrackets.map((bracket, index) => {
                const prev = SALARY_TAX_RULES_2026.monthlyTaxBrackets[index - 1];
                const from = prev ? prev.upTo + 1 : 0;
                const toLabel =
                  bracket.upTo === Number.POSITIVE_INFINITY
                    ? `Trên ${from.toLocaleString("vi-VN")} đ`
                    : `${from.toLocaleString("vi-VN")} – ${bracket.upTo.toLocaleString("vi-VN")} đ`;
                return (
                  <li
                    key={toLabel}
                    className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0"
                  >
                    <span>{toLabel}</span>
                    <span className="font-medium text-foreground">
                      {(bracket.rate * 100).toFixed(0)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-dashed border-sky-200/80 bg-sky-50/40">
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Miễn giảm khác (BHXH, chế độ ốm đau, thai sản…) xem theo từng trường hợp trong FAQ
              và cập nhật pháp luật.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="cta" size="touch">
                <Link href="/legal-updates?q=miễn+giảm">Văn bản miễn giảm</Link>
              </Button>
              <Button asChild variant="secondary" size="touch">
                <Link href="/search?q=giảm+trừ+gia+cảnh">Tra cứu FAQ</Link>
              </Button>
              <Button asChild variant="outline" size="touch">
                <Link href="/cong-cu-luong-thue?mode=take-home">
                  Tính với giảm trừ
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
