"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  Calculator,
  Landmark,
  Loader2,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type CalculatorMode = "gross-to-net" | "net-to-gross" | "take-home";
type SalaryRegion = "I" | "II" | "III" | "IV";

type SalaryTaxResult = {
  mode: CalculatorMode | "social-insurance";
  summary: {
    grossSalary: number;
    insuranceSalaryBase: number;
    netSalary: number;
    totalEmployeeInsurance: number;
    personalIncomeTax: number;
    totalDeductions: number;
    taxableIncome: number;
  };
  breakdown: {
    insurance: {
      salaryBase: number;
      bhxhBase: number;
      bhytBase: number;
      bhtnBase: number;
      bhxh: number;
      bhyt: number;
      bhtn: number;
      total: number;
      bhxhBhytCap: number;
      bhtnCap: number;
    };
    personalDeduction: number;
    dependentDeductionPerPerson: number;
    dependentCount: number;
    familyDeduction: number;
    taxableIncome: number;
    personalIncomeTax: number;
    taxBrackets: Array<{
      label: string;
      taxableAmount: number;
      rate: number;
      tax: number;
    }>;
  };
  legalBasis: {
    taxYear: number;
    personalDeductionEffectiveFrom: string;
    salaryIncomeTaxEffectiveFrom: string;
    regionalMinimumWageEffectiveFrom: string;
    baseSalaryEffectiveFrom: string;
  };
  note: string;
};

type SalaryTaxApiResponse =
  | {
      success: true;
      data: {
        result: SalaryTaxResult;
        relatedLegalHint: string;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const MODE_OPTIONS: Array<{
  id: CalculatorMode;
  label: string;
  description: string;
  icon: typeof Wallet;
}> = [
  {
    id: "gross-to-net",
    label: "Lương gộp → thực nhận",
    description: "Ước tính thực nhận sau bảo hiểm và thuế TNCN.",
    icon: Wallet,
  },
  {
    id: "net-to-gross",
    label: "Thực nhận → lương gộp",
    description: "Tìm mức lương gộp (gross) phù hợp với thực nhận mục tiêu.",
    icon: ArrowLeftRight,
  },
  {
    id: "take-home",
    label: "Thực nhận chi tiết",
    description: "Xem bảng diễn giải từng khoản khấu trừ và giảm trừ.",
    icon: ReceiptText,
  },
];

const REGION_OPTIONS: Array<{
  value: SalaryRegion;
  label: string;
  minimumWage: string;
}> = [
  { value: "I", label: "Vùng I", minimumWage: "5.310.000" },
  { value: "II", label: "Vùng II", minimumWage: "4.730.000" },
  { value: "III", label: "Vùng III", minimumWage: "4.140.000" },
  { value: "IV", label: "Vùng IV", minimumWage: "3.700.000" },
];

const moneyFormatter = new Intl.NumberFormat("vi-VN");

function formatCurrency(value: number) {
  return `${moneyFormatter.format(value)} đ`;
}

function normalizeMoneyInput(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

function formatMoneyInput(value: string) {
  if (!value) {
    return "";
  }

  return moneyFormatter.format(Number(value));
}

function parseMoneyInput(value: string) {
  return Number(value || 0);
}

function isCalculatorMode(value: string | null): value is CalculatorMode {
  return value === "gross-to-net" || value === "net-to-gross" || value === "take-home";
}

export function SalaryTaxTool() {
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const [mode, setMode] = useState<CalculatorMode>(
    isCalculatorMode(requestedMode) ? requestedMode : "gross-to-net",
  );
  const [grossSalary, setGrossSalary] = useState("35000000");
  const [targetNetSalary, setTargetNetSalary] = useState("30000000");
  const [insuranceSalaryBase, setInsuranceSalaryBase] = useState("35000000");
  const [dependentCount, setDependentCount] = useState("1");
  const [region, setRegion] = useState<SalaryRegion>("I");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SalaryTaxResult | null>(null);
  const [legalHint, setLegalHint] = useState<string | null>(null);

  const selectedRegion = useMemo(
    () => REGION_OPTIONS.find((item) => item.value === region) ?? REGION_OPTIONS[0],
    [region],
  );

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload =
        mode === "net-to-gross"
          ? {
              mode,
              targetNetSalary: parseMoneyInput(targetNetSalary),
              insuranceSalaryBase: parseMoneyInput(insuranceSalaryBase),
              dependentCount: Number(dependentCount || 0),
              region,
            }
          : {
              mode,
              grossSalary: parseMoneyInput(grossSalary),
              insuranceSalaryBase: parseMoneyInput(insuranceSalaryBase),
              dependentCount: Number(dependentCount || 0),
              region,
            };

      const response = await fetch("/api/calculators/salary-tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as SalaryTaxApiResponse;

      if (!json.success) {
        setError(json.error.message);
        return;
      }

      setResult(json.data.result);
      setLegalHint(json.data.relatedLegalHint);
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [
    dependentCount,
    grossSalary,
    insuranceSalaryBase,
    mode,
    region,
    targetNetSalary,
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <section className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 px-4 py-6 text-white shadow-xl sm:px-8 sm:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/80">
              Công cụ nghiệp vụ HR/C&B
            </p>
            <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Tính lương thực nhận, thuế và bảo hiểm
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-blue-100/85 sm:text-base sm:leading-6">
              Dùng cùng một lời tính cho gross sang net, net sang gross và bảng
              diễn giải chi tiết theo quy định đang áp dụng cho kỳ tính thuế năm 2026.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-blue-100/70">
                Giảm trừ bản thân
              </p>
              <p className="mt-2 text-xl font-semibold">15.500.000 đ</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-blue-100/70">
                Mỗi người phụ thuộc
              </p>
              <p className="mt-2 text-xl font-semibold">6.200.000 đ</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="border-blue-200/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Thông số tính toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-2">
              {MODE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = mode === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMode(option.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-blue-950 bg-blue-950 text-white shadow-sm"
                        : "border-border bg-background hover:border-blue-300 hover:bg-blue-50/60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-white/14" : "bg-blue-100 text-blue-950",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span
                        className={cn(
                          "mt-1 block text-xs leading-5",
                          active ? "text-blue-100/85" : "text-muted-foreground",
                        )}
                      >
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {mode === "net-to-gross" ? "Lương net mục tiêu" : "Lương gross"}
                </label>
                <Input
                  inputMode="numeric"
                  value={formatMoneyInput(
                    mode === "net-to-gross" ? targetNetSalary : grossSalary,
                  )}
                  onChange={(event) => {
                    const normalized = normalizeMoneyInput(event.target.value);
                    if (mode === "net-to-gross") {
                      setTargetNetSalary(normalized);
                      return;
                    }
                    setGrossSalary(normalized);
                  }}
                  placeholder="Ví dụ: 35.000.000"
                  className="h-11 bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Lương đóng bảo hiểm
                </label>
                <Input
                  inputMode="numeric"
                  value={formatMoneyInput(insuranceSalaryBase)}
                  onChange={(event) =>
                    setInsuranceSalaryBase(normalizeMoneyInput(event.target.value))
                  }
                  placeholder="Ví dụ: 35.000.000"
                  className="h-11 bg-background"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  Dùng khi doanh nghiệp tách lương gross và căn cứ đóng bảo hiểm.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Vùng lương tối thiểu</label>
                <select
                  value={region}
                  onChange={(event) => setRegion(event.target.value as SalaryRegion)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-ring"
                >
                  {REGION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-muted-foreground">
                  {selectedRegion.label} đang có lương tối thiểu tháng{" "}
                  {selectedRegion.minimumWage} đ.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Số người phụ thuộc
                </label>
                <Input
                  inputMode="numeric"
                  value={dependentCount}
                  onChange={(event) =>
                    setDependentCount(event.target.value.replace(/[^\d]/g, "").slice(0, 2))
                  }
                  placeholder="0"
                  className="h-11 bg-background"
                />
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full bg-blue-950 text-white hover:bg-blue-900"
              onClick={() => void submit()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tính
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Tính ngay
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Không thể tính toán</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="border-blue-200/70 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Kết quả thực nhận
                  </p>
                  <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-blue-950">
                    {result ? formatCurrency(result.summary.netSalary) : "Nhập thông số"}
                  </CardTitle>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Theo cấu hình luật đang áp dụng
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-muted/25 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Lương gộp
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {result ? formatCurrency(result.summary.grossSalary) : "0 đ"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/25 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Bảo hiểm NLĐ
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {result
                      ? formatCurrency(result.summary.totalEmployeeInsurance)
                      : "0 đ"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/25 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Thuế TNCN
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {result ? formatCurrency(result.summary.personalIncomeTax) : "0 đ"}
                  </p>
                </div>
              </div>

              <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
                <div className="min-w-0 space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-border">
                    <div className="border-b border-border px-4 py-3">
                      <h2 className="text-sm font-semibold text-foreground">
                        Diễn giải khấu trừ
                      </h2>
                    </div>
                    {result ? (
                      <dl className="min-w-[280px] divide-y divide-border text-sm">
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <dt className="text-muted-foreground">BHXH nhân viên</dt>
                          <dd className="font-medium">{formatCurrency(result.breakdown.insurance.bhxh)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <dt className="text-muted-foreground">BHYT nhân viên</dt>
                          <dd className="font-medium">{formatCurrency(result.breakdown.insurance.bhyt)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <dt className="text-muted-foreground">BHTN nhân viên</dt>
                          <dd className="font-medium">{formatCurrency(result.breakdown.insurance.bhtn)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <dt className="text-muted-foreground">Giảm trừ gia cảnh</dt>
                          <dd className="font-medium">
                            {formatCurrency(result.breakdown.familyDeduction)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <dt className="text-muted-foreground">Thu nhập tính thuế</dt>
                          <dd className="font-medium">
                            {formatCurrency(result.breakdown.taxableIncome)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <dt className="text-muted-foreground">Thuế TNCN phải nộp</dt>
                          <dd className="font-medium">
                            {formatCurrency(result.breakdown.personalIncomeTax)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <dt className="text-muted-foreground">Tổng khấu trừ</dt>
                          <dd className="font-semibold text-blue-950">
                            {formatCurrency(result.summary.totalDeductions)}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <div className="px-4 py-6 text-sm leading-6 text-muted-foreground">
                        Chọn chế độ tính, nhập thông số và bấm Tính ngay để xem bảng
                        khấu trừ chi tiết.
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border">
                    <div className="border-b border-border px-4 py-3">
                      <h2 className="text-sm font-semibold text-foreground">
                        Chi tiết bậc thuế
                      </h2>
                    </div>
                    <div className="space-y-3 overflow-x-auto p-4 sm:space-y-3">
                      {result && result.breakdown.taxBrackets.length > 0 ? (
                        result.breakdown.taxBrackets.map((item) => (
                          <div
                            key={`${item.label}-${item.rate}`}
                            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Thu nhập chịu thuế: {formatCurrency(item.taxableAmount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">
                                {Math.round(item.rate * 100)}%
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatCurrency(item.tax)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-muted-foreground">
                          Chưa phát sinh thuế thu nhập cá nhân ở mức thu nhập hiện tại.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="min-w-0 space-y-4">
                  <div className="rounded-2xl border border-blue-200/70 bg-blue-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-900/80">
                      Căn cứ đóng bảo hiểm
                    </p>
                    <p className="mt-3 text-sm leading-6 text-blue-950">
                      Trần BHXH/BHYT:{" "}
                      <span className="font-semibold">
                        {result
                          ? formatCurrency(result.breakdown.insurance.bhxhBhytCap)
                          : "0 đ"}
                      </span>
                    </p>
                    <p className="mt-2 text-sm leading-6 text-blue-950">
                      Trần BHTN theo {selectedRegion.label.toLowerCase()}:{" "}
                      <span className="font-semibold">
                        {result
                          ? formatCurrency(result.breakdown.insurance.bhtnCap)
                          : "0 đ"}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-foreground">Mốc pháp lý đang dùng</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                      <li>
                        Giảm trừ bản thân từ {result?.legalBasis.personalDeductionEffectiveFrom ?? "2026-01-01"}.
                      </li>
                      <li>
                        Biểu thuế lương áp dụng cho kỳ tính thuế {result?.legalBasis.taxYear ?? 2026}.
                      </li>
                      <li>
                        Lương tối thiểu vùng hiện tại từ{" "}
                        {result?.legalBasis.regionalMinimumWageEffectiveFrom ?? "2026-01-01"}.
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start gap-3">
                      <Landmark className="mt-0.5 h-4 w-4 text-blue-950" />
                      <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                        <p>{legalHint ?? "Đang nạp ghi chú pháp lý..."}</p>
                        <p>{result?.note}</p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
