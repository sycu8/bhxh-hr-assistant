import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEffectiveDate, formatVnd } from "@/lib/format/currency";
import {
  FTEL_MATERNITY_FORMULA,
  FTEL_MATERNITY_SUPPORT_2025,
  POPULATION_LAW_2026_BRIEF,
} from "@/lib/data/ftel-company-policies";
import { EMPLOYEE_TOOLS_SECTION_TITLE } from "@/lib/navigation/employee-tools";

export const metadata: Metadata = {
  title: "Chế độ thai sản",
  description:
    "Luật Dân số 2025, Nghị định 168/2026, chính sách hỗ trợ FPT Telecom và công thức trợ cấp Công ty cho CBNV FPT Telecom.",
};

export default function MaternityBenefitsReferencePage() {
  const pop = POPULATION_LAW_2026_BRIEF;

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
          Chế độ thai sản
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Tóm tắt quy định Nhà nước và chính sách nội bộ FPT Telecom. Đối chiếu hồ sơ cá nhân với HR/C&amp;B trước khi
          chốt.
        </p>
      </header>

      <div className="space-y-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Luật Dân số 2025 &amp; Nghị định 168/2026</CardTitle>
            <CardDescription>
              Hiệu lực từ {formatEffectiveDate(pop.effectiveFrom)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Lao động nữ: nghỉ <strong>{pop.femaleLeaveMonths} tháng</strong> khi sinh
                con.
              </li>
              <li>
                Lao động nam: nghỉ <strong>{pop.maleLeaveWorkingDays} ngày làm việc</strong>{" "}
                khi vợ sinh con.
              </li>
              <li>
                Sinh con thứ hai: cần có một con đẻ còn sống tại thời điểm sinh; thủ tục
                hưởng theo quy định BHXH.
              </li>
              <li>
                Từ {formatEffectiveDate(pop.screeningSupportFrom)}: hỗ trợ sàng lọc thai
                nghén tối đa {formatVnd(pop.screeningMaxVnd)}/trường hợp (
                {pop.screeningConditions.join(", ")}).
              </li>
            </ul>
            <Button asChild variant="outline" size="sm">
              <Link href="/legal-updates/nghi-dinh-168-2026-nd-cp-luat-dan-so">
                Xem văn bản tóm tắt
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Chính sách hỗ trợ thai sản FPT (2025)</CardTitle>
            <CardDescription>
              Chính sách nội bộ FPT Telecom — chi một lần khi sinh, cộng thêm BHXH và
              chế độ FTEL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border text-sm">
              {FTEL_MATERNITY_SUPPORT_2025.map((row) => (
                <li
                  key={row.level}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0"
                >
                  <span className="font-medium">CBNV Level {row.level}</span>
                  <span className="tabular-nums font-semibold">
                    {formatVnd(row.amountVnd)}/lần sinh
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Chi kỳ lương gần nhất sau khi nộp giấy chứng sinh/khai sinh. Thu nhập chịu
              thuế TNCN. Tra cứu Foxpro: {FTEL_MATERNITY_FORMULA.foxproPath}.
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-3">
              <Link href="/legal-updates/ftel-ho-tro-thai-san-level-2025">
                Chi tiết chính sách FTEL
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Trợ cấp bổ sung từ Công ty ({FTEL_MATERNITY_FORMULA.decisionNumber})
            </CardTitle>
            <CardDescription>
              Hiệu lực từ {formatEffectiveDate(FTEL_MATERNITY_FORMULA.effectiveFrom)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p className="rounded-lg bg-muted/60 p-3 font-mono text-xs leading-relaxed">
              {FTEL_MATERNITY_FORMULA.companyAllowanceFormula}
            </p>
            <p>{FTEL_MATERNITY_FORMULA.totalBenefitFormula}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                Nhóm CTL: trần 75% lương TB = {formatVnd(FTEL_MATERNITY_FORMULA.ctlCapVnd)}
              </li>
              <li>
                Nhóm khác: trần theo mức lương tối đa đóng BHXH (×20 lương cơ sở)
              </li>
              <li>Trợ cấp bổ sung gồm phần BHTN Công ty đóng thay khi nghỉ thai sản</li>
            </ul>
            <Button asChild variant="outline" size="sm">
              <Link href="/legal-updates/1069-qd-ftel-phu-luc-2-tro-cap-thai-san">
                Phụ lục 2 — toàn văn tóm tắt
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-amber-200/80 bg-amber-50/40">
          <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Mức hưởng BHXH phụ thuộc thời gian đóng, lương đóng và hồ sơ thực tế. Dùng
              công cụ tính lương để ước tính mức đóng bảo hiểm; hỏi HR khi cần xác nhận
              riêng.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/hoi-dap?category=thai-san">FAQ thai sản</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/ask-hr">Hỏi HR</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
