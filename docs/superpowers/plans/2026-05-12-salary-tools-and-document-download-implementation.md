# Salary Tools And Document Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a home quick-tools section, a dedicated salary/tax calculator page, stronger deep-blue document download actions, and 2026-compliant salary/tax calculation logic with detailed breakdowns.

**Architecture:** Expand the existing calculator service into a centralized salary/tax engine, expose it through a unified API route, then build thin UI layers for home and a dedicated calculator page. Reuse the same forward salary calculation for gross-to-net and take-home modes, and implement net-to-gross as a bounded reverse solve over that same function to keep business logic consistent.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind, shadcn UI, Vitest, existing API helpers and service layer.

---

## File Structure

- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/services/salary-tax-rules.ts`
  - Central legal-rule constants for 2026 deductions, tax brackets, regional minimum wages, base salary, and insurance caps.
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/services/calculator.service.ts`
  - Expand from simple BH contribution math to unified salary/tax calculations.
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/validators/calculator.schema.ts`
  - Add unified calculator request schema and mode-specific validation.
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/api/calculators/salary-tax/route.ts`
  - Unified endpoint for `social-insurance`, `gross-to-net`, `net-to-gross`, and `take-home`.
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/components/calculators/salary-tax-tool.tsx`
  - Client component for the full calculator workspace.
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/components/home/home-salary-tools.tsx`
  - Home quick-tools utility section.
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/cong-cu-luong-thue/page.tsx`
  - Dedicated calculator page.
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/components/home/home-legal-updates.tsx`
  - Restyle document actions to deep-blue CTA buttons with trust metadata.
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/page.tsx`
  - Insert the new home tools section.
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/layout.tsx`
  - Add navigation entry for the calculator page.
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/globals.css`
  - Strengthen deep-blue palette variables and utility styling if needed.
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/server/deps.ts`
  - Ensure the expanded calculator service is injected once.
- Test: `D:/OneDrive/Not important/Documents/vn-insurance-fti/tests/calculator.service.test.ts`
  - Add 2026 tax, cap, dependent, and reverse-solve coverage.

### Task 1: Add 2026 Salary Tax Rule Constants

**Files:**
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/services/salary-tax-rules.ts`
- Test: `D:/OneDrive/Not important/Documents/vn-insurance-fti/tests/calculator.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  SALARY_TAX_RULES_2026,
  getBhtnCapByRegion,
} from "@/lib/services/salary-tax-rules";

describe("salary tax rules 2026", () => {
  it("exposes the 2026 family deductions and region caps", () => {
    expect(SALARY_TAX_RULES_2026.personalDeduction).toBe(15_500_000);
    expect(SALARY_TAX_RULES_2026.dependentDeduction).toBe(6_200_000);
    expect(getBhtnCapByRegion("I")).toBe(106_200_000);
    expect(getBhtnCapByRegion("IV")).toBe(74_000_000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: FAIL because `salary-tax-rules.ts` exports do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export const SALARY_TAX_RULES_2026 = {
  personalDeduction: 15_500_000,
  dependentDeduction: 6_200_000,
  baseSalary: 2_340_000,
  regionalMinimumWages: {
    I: 5_310_000,
    II: 4_730_000,
    III: 4_140_000,
    IV: 3_700_000,
  },
  employeeRates: {
    bhxh: 0.08,
    bhyt: 0.015,
    bhtn: 0.01,
  },
  monthlyTaxBrackets: [
    { upTo: 10_000_000, rate: 0.05 },
    { upTo: 30_000_000, rate: 0.10 },
    { upTo: 60_000_000, rate: 0.20 },
    { upTo: 100_000_000, rate: 0.30 },
    { upTo: Number.POSITIVE_INFINITY, rate: 0.35 },
  ],
} as const;

export type SalaryRegion = keyof typeof SALARY_TAX_RULES_2026.regionalMinimumWages;

export function getBhxhBhytCap() {
  return SALARY_TAX_RULES_2026.baseSalary * 20;
}

export function getBhtnCapByRegion(region: SalaryRegion) {
  return SALARY_TAX_RULES_2026.regionalMinimumWages[region] * 20;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: PASS for the new rule constants assertions.

- [ ] **Step 5: Commit**

```bash
git add tests/calculator.service.test.ts src/lib/services/salary-tax-rules.ts
git commit -m "feat: add 2026 salary tax rule constants"
```

### Task 2: Expand Calculator Service with Insurance Caps and Breakdown Math

**Files:**
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/services/calculator.service.ts`
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/tests/calculator.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("caps BHXH/BHYT and BHTN bases before computing deductions", () => {
  const service = new CalculatorService();
  const result = service.computeSalaryTax({
    mode: "gross-to-net",
    grossSalary: 120_000_000,
    insuranceSalaryBase: 120_000_000,
    region: "I",
    dependentCount: 0,
  });

  expect(result.breakdown.insurance.bhxhBase).toBe(46_800_000);
  expect(result.breakdown.insurance.bhtnBase).toBe(106_200_000);
  expect(result.breakdown.insurance.bhxh).toBe(3_744_000);
  expect(result.breakdown.insurance.bhyt).toBe(702_000);
  expect(result.breakdown.insurance.bhtn).toBe(1_062_000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: FAIL because `computeSalaryTax` and cap-aware breakdown do not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
type CalculatorMode = "social-insurance" | "gross-to-net" | "net-to-gross" | "take-home";

export type SalaryTaxInput = {
  mode: CalculatorMode;
  grossSalary?: number;
  targetNetSalary?: number;
  insuranceSalaryBase: number;
  region: SalaryRegion;
  dependentCount: number;
};

function roundVnd(value: number) {
  return Math.round(value);
}

function computeInsuranceBreakdown(input: {
  insuranceSalaryBase: number;
  region: SalaryRegion;
}) {
  const bhxhBhytBase = Math.min(input.insuranceSalaryBase, getBhxhBhytCap());
  const bhtnBase = Math.min(input.insuranceSalaryBase, getBhtnCapByRegion(input.region));
  const rates = SALARY_TAX_RULES_2026.employeeRates;
  const bhxh = roundVnd(bhxhBhytBase * rates.bhxh);
  const bhyt = roundVnd(bhxhBhytBase * rates.bhyt);
  const bhtn = roundVnd(bhtnBase * rates.bhtn);

  return {
    bhxhBase,
    bhytBase: bhxhBhytBase,
    bhtnBase,
    bhxh,
    bhyt,
    bhtn,
    total: bhxh + bhyt + bhtn,
  };
}
```

Also wire `computeSalaryTax` to call this helper and return the insurance section in its breakdown.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: PASS for the cap assertions.

- [ ] **Step 5: Commit**

```bash
git add tests/calculator.service.test.ts src/lib/services/calculator.service.ts
git commit -m "feat: add cap-aware insurance breakdown"
```

### Task 3: Add 2026 Progressive Tax and Family Deduction Logic

**Files:**
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/services/calculator.service.ts`
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/tests/calculator.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("computes family deductions and 2026 progressive tax for gross to net", () => {
  const service = new CalculatorService();
  const result = service.computeSalaryTax({
    mode: "gross-to-net",
    grossSalary: 35_000_000,
    insuranceSalaryBase: 35_000_000,
    region: "I",
    dependentCount: 1,
  });

  expect(result.breakdown.familyDeduction).toBe(21_700_000);
  expect(result.breakdown.taxableIncome).toBe(9_625_000);
  expect(result.breakdown.personalIncomeTax).toBe(481_250);
  expect(result.summary.netSalary).toBe(31_143_750);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: FAIL because taxable income, family deduction, and PIT are not implemented.

- [ ] **Step 3: Write minimal implementation**

```ts
function computeProgressiveTax(monthlyTaxableIncome: number) {
  if (monthlyTaxableIncome <= 0) return 0;

  const brackets = SALARY_TAX_RULES_2026.monthlyTaxBrackets;
  let remaining = monthlyTaxableIncome;
  let previousCap = 0;
  let total = 0;

  for (const bracket of brackets) {
    const bracketCap = bracket.upTo;
    const taxableSlice = Math.min(remaining, bracketCap - previousCap);
    if (taxableSlice > 0) {
      total += taxableSlice * bracket.rate;
      remaining -= taxableSlice;
    }
    previousCap = bracketCap;
    if (remaining <= 0) break;
  }

  return roundVnd(total);
}

function computeFamilyDeduction(dependentCount: number) {
  return (
    SALARY_TAX_RULES_2026.personalDeduction +
    dependentCount * SALARY_TAX_RULES_2026.dependentDeduction
  );
}

function computeForwardSalaryNet(params: {
  grossSalary: number;
  insuranceSalaryBase: number;
  region: SalaryRegion;
  dependentCount: number;
}) {
  const insurance = computeInsuranceBreakdown(params);
  const familyDeduction = computeFamilyDeduction(params.dependentCount);
  const taxableIncome = Math.max(
    0,
    params.grossSalary - insurance.total - familyDeduction,
  );
  const personalIncomeTax = computeProgressiveTax(taxableIncome);
  const netSalary = params.grossSalary - insurance.total - personalIncomeTax;

  return {
    summary: { grossSalary: params.grossSalary, netSalary: roundVnd(netSalary) },
    breakdown: {
      insurance,
      familyDeduction,
      taxableIncome: roundVnd(taxableIncome),
      personalIncomeTax,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: PASS for the family deduction and PIT assertions.

- [ ] **Step 5: Commit**

```bash
git add tests/calculator.service.test.ts src/lib/services/calculator.service.ts
git commit -m "feat: add 2026 tax and family deduction logic"
```

### Task 4: Add Net-to-Gross Reverse Solve

**Files:**
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/services/calculator.service.ts`
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/tests/calculator.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("solves net to gross by reusing the same forward salary function", () => {
  const service = new CalculatorService();
  const forward = service.computeSalaryTax({
    mode: "gross-to-net",
    grossSalary: 28_000_000,
    insuranceSalaryBase: 28_000_000,
    region: "I",
    dependentCount: 0,
  });

  const reverse = service.computeSalaryTax({
    mode: "net-to-gross",
    targetNetSalary: forward.summary.netSalary,
    insuranceSalaryBase: 28_000_000,
    region: "I",
    dependentCount: 0,
  });

  expect(Math.abs(reverse.summary.grossSalary - 28_000_000)).toBeLessThanOrEqual(2);
  expect(Math.abs(reverse.summary.netSalary - forward.summary.netSalary)).toBeLessThanOrEqual(2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: FAIL because `net-to-gross` mode is not implemented.

- [ ] **Step 3: Write minimal implementation**

```ts
function solveGrossFromNet(params: {
  targetNetSalary: number;
  insuranceSalaryBase: number;
  region: SalaryRegion;
  dependentCount: number;
}) {
  let low = params.targetNetSalary;
  let high = params.targetNetSalary * 2 + 20_000_000;
  let best = high;

  for (let i = 0; i < 80; i++) {
    const mid = Math.round((low + high) / 2);
    const forward = computeForwardSalaryNet({
      grossSalary: mid,
      insuranceSalaryBase: params.insuranceSalaryBase,
      region: params.region,
      dependentCount: params.dependentCount,
    });
    const diff = forward.summary.netSalary - params.targetNetSalary;

    best = mid;
    if (Math.abs(diff) <= 1) {
      return forward;
    }
    if (diff < 0) low = mid + 1;
    else high = mid - 1;
  }

  return computeForwardSalaryNet({
    grossSalary: best,
    insuranceSalaryBase: params.insuranceSalaryBase,
    region: params.region,
    dependentCount: params.dependentCount,
  });
}
```

Update `computeSalaryTax` to route `net-to-gross` through `solveGrossFromNet`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: PASS for the reverse-solve assertions.

- [ ] **Step 5: Commit**

```bash
git add tests/calculator.service.test.ts src/lib/services/calculator.service.ts
git commit -m "feat: add net to gross reverse solver"
```

### Task 5: Add Unified Calculator Request Schema

**Files:**
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/validators/calculator.schema.ts`
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/tests/calculator.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { salaryTaxCalculatorSchema } from "@/lib/validators/calculator.schema";

it("validates unified salary tax calculator input", () => {
  const parsed = salaryTaxCalculatorSchema.parse({
    mode: "gross-to-net",
    grossSalary: 35_000_000,
    insuranceSalaryBase: 35_000_000,
    region: "I",
    dependentCount: 1,
  });

  expect(parsed.mode).toBe("gross-to-net");
  expect(parsed.region).toBe("I");
  expect(parsed.dependentCount).toBe(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: FAIL because `salaryTaxCalculatorSchema` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
const regionSchema = z.enum(["I", "II", "III", "IV"]);

const currencySchema = z.coerce
  .number()
  .positive("Gia tri phai lon hon 0.")
  .max(5_000_000_000, "Gia tri khong hop le.");

export const salaryTaxCalculatorSchema = z
  .object({
    mode: z.enum(["social-insurance", "gross-to-net", "net-to-gross", "take-home"]),
    grossSalary: currencySchema.optional(),
    targetNetSalary: currencySchema.optional(),
    insuranceSalaryBase: currencySchema,
    region: regionSchema,
    dependentCount: z.coerce
      .number()
      .int("So nguoi phu thuoc phai la so nguyen.")
      .min(0, "So nguoi phu thuoc khong duoc am.")
      .max(20, "So nguoi phu thuoc khong hop le."),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "net-to-gross" && !value.targetNetSalary) {
      ctx.addIssue({ code: "custom", message: "Can targetNetSalary." });
    }
    if (value.mode !== "net-to-gross" && !value.grossSalary && value.mode !== "social-insurance") {
      ctx.addIssue({ code: "custom", message: "Can grossSalary." });
    }
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: PASS for schema parsing.

- [ ] **Step 5: Commit**

```bash
git add tests/calculator.service.test.ts src/lib/validators/calculator.schema.ts
git commit -m "feat: add unified salary tax validator"
```

### Task 6: Add Unified Salary Tax API Route

**Files:**
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/api/calculators/salary-tax/route.ts`
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/lib/server/deps.ts`

- [ ] **Step 1: Write the failing test**

Add a service-level test that exercises the input shape used by the route:

```ts
it("returns detailed take-home output from the calculator service", () => {
  const service = new CalculatorService();
  const result = service.computeSalaryTax({
    mode: "take-home",
    grossSalary: 30_000_000,
    insuranceSalaryBase: 30_000_000,
    region: "I",
    dependentCount: 0,
  });

  expect(result.mode).toBe("take-home");
  expect(result.summary.netSalary).toBeGreaterThan(0);
  expect(result.breakdown.personalIncomeTax).toBeGreaterThanOrEqual(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: FAIL because unified mode routing is incomplete.

- [ ] **Step 3: Write minimal implementation**

```ts
import { ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { getServerDeps } from "@/lib/server/deps";
import { salaryTaxCalculatorSchema } from "@/lib/validators/calculator.schema";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  const serverDeps = getServerDeps();
  const raw = (await parseJsonBody<Record<string, unknown>>(req)) ?? {};
  const body = salaryTaxCalculatorSchema.parse(raw);
  const result = serverDeps.calculatorService.computeSalaryTax(body);

  return ok({
    result,
    relatedLegalHint:
      "Ap dung logic luong, giam tru gia canh va thue TNCN cho ky tinh thue nam 2026 theo cau hinh hien hanh.",
  });
});
```

Update `src/lib/server/deps.ts` only if method signatures need to change.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/calculator.service.test.ts`
Expected: PASS for unified mode coverage.

- [ ] **Step 5: Commit**

```bash
git add tests/calculator.service.test.ts src/app/api/calculators/salary-tax/route.ts src/lib/server/deps.ts
git commit -m "feat: add salary tax calculator api"
```

### Task 7: Build the Dedicated Calculator UI

**Files:**
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/components/calculators/salary-tax-tool.tsx`
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/cong-cu-luong-thue/page.tsx`

- [ ] **Step 1: Write the failing test**

Use an existing pattern-based smoke test via build output rather than a new UI test for MVP. First prepare the component contract in code:

```tsx
export default function SalaryTaxToolsPage() {
  return <SalaryTaxTool />;
}
```

Expected failure at build-time before the component exists.

- [ ] **Step 2: Run build to verify it fails**

Run: `pnpm build`
Expected: FAIL because `SalaryTaxTool` component or page route does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MODES = [
  { id: "gross-to-net", label: "Gross -> Net" },
  { id: "net-to-gross", label: "Net -> Gross" },
  { id: "take-home", label: "Thuc nhan" },
] as const;

export function SalaryTaxTool() {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("gross-to-net");
  const [grossSalary, setGrossSalary] = useState("35000000");
  const [insuranceSalaryBase, setInsuranceSalaryBase] = useState("35000000");
  const [targetNetSalary, setTargetNetSalary] = useState("30000000");
  const [dependentCount, setDependentCount] = useState("1");
  const [region, setRegion] = useState("I");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const payload = {
      mode,
      grossSalary: Number(grossSalary),
      targetNetSalary: Number(targetNetSalary),
      insuranceSalaryBase: Number(insuranceSalaryBase),
      dependentCount: Number(dependentCount),
      region,
    };
    const res = await fetch("/api/calculators/salary-tax", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error.message);
      return;
    }
    setResult(json.data.result);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Cong cu luong & thue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={mode === item.id ? "default" : "outline"}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            {mode !== "net-to-gross" ? (
              <Input value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} />
            ) : (
              <Input value={targetNetSalary} onChange={(e) => setTargetNetSalary(e.target.value)} />
            )}
            <Input value={insuranceSalaryBase} onChange={(e) => setInsuranceSalaryBase(e.target.value)} />
            <Input value={dependentCount} onChange={(e) => setDependentCount(e.target.value)} />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="I">Vung I</option>
              <option value="II">Vung II</option>
              <option value="III">Vung III</option>
              <option value="IV">Vung IV</option>
            </select>
            <Button type="button" className="w-full" onClick={submit}>
              Tinh ngay
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ket qua chi tiet</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? <p>{error}</p> : null}
            {result ? <pre className="overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre> : <p>Nhap thong tin de tinh.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

```tsx
import { SalaryTaxTool } from "@/components/calculators/salary-tax-tool";

export const dynamic = "force-dynamic";

export default function SalaryTaxToolsPage() {
  return <SalaryTaxTool />;
}
```

- [ ] **Step 4: Run build to verify it passes**

Run: `pnpm build`
Expected: PASS with the new `/cong-cu-luong-thue` route included.

- [ ] **Step 5: Commit**

```bash
git add src/components/calculators/salary-tax-tool.tsx src/app/cong-cu-luong-thue/page.tsx
git commit -m "feat: add salary tax calculator page"
```

### Task 8: Add Home Quick Tools Section

**Files:**
- Create: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/components/home/home-salary-tools.tsx`
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/page.tsx`

- [ ] **Step 1: Write the failing test**

Use a build-level smoke target:

```tsx
import { HomeSalaryTools } from "@/components/home/home-salary-tools";
```

Expected failure before the component exists.

- [ ] **Step 2: Run build to verify it fails**

Run: `pnpm build`
Expected: FAIL because `HomeSalaryTools` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
import Link from "next/link";
import { Calculator, Landmark, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TOOLS = [
  {
    title: "Gross -> Net",
    body: "Tinh luong thuc nhan sau bao hiem va thue TNCN theo quy tac 2026.",
    icon: WalletCards,
  },
  {
    title: "Net -> Gross",
    body: "Noi suy luong gross de dat muc thuc nhan mong muon.",
    icon: Landmark,
  },
  {
    title: "Thuc nhan chi tiet",
    body: "Xem tung khoan khau tru, giam tru va thue phai nop.",
    icon: Calculator,
  },
] as const;

export function HomeSalaryTools() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Cong cu luong & thue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Uoc tinh thuc nhan, bao hiem bat buoc va thue TNCN theo quy dinh 2026.
          </p>
        </div>
        <Button asChild>
          <Link href="/cong-cu-luong-thue">Mo cong cu day du</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title} className="border-blue-200/70 bg-gradient-to-b from-white to-blue-50/60">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{tool.body}</p>
                <Button asChild variant="outline" className="w-full border-blue-300 text-blue-950 hover:bg-blue-100">
                  <Link href="/cong-cu-luong-thue">Tinh ngay</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
```

Insert `<HomeSalaryTools />` into `src/app/page.tsx` between `HomePopularFaqs` and `HomeLegalUpdates`.

- [ ] **Step 4: Run build to verify it passes**

Run: `pnpm build`
Expected: PASS with the home page rendering the new section.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/home-salary-tools.tsx src/app/page.tsx
git commit -m "feat: add home salary tools section"
```

### Task 9: Restyle Document Download Actions with Deep Blue CTA Hierarchy

**Files:**
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/components/home/home-legal-updates.tsx`
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/globals.css`

- [ ] **Step 1: Write the failing test**

Use a build-time smoke expectation by introducing the stronger action markup:

```tsx
<Button asChild>...</Button>
```

Expected failure before the required imports and styles exist.

- [ ] **Step 2: Run build to verify it fails**

Run: `pnpm build`
Expected: FAIL because the component still uses plain text links and the new imports are missing.

- [ ] **Step 3: Write minimal implementation**

Replace the lightweight text link section with deep-blue CTA actions:

```tsx
import { Scale, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
```

```tsx
<div className="mt-4 flex flex-wrap gap-2">
  {item.documentUrl?.match(/\.pdf($|\?)/i) ? (
    <Button asChild className="bg-blue-950 text-white hover:bg-blue-900">
      <Link
        href={item.documentUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Download className="h-4 w-4" />
        Tai PDF
      </Link>
    </Button>
  ) : null}
  {item.documentUrl ? (
    <Button asChild variant="outline" className="border-blue-200 text-blue-950 hover:bg-blue-50">
      <Link
        href={item.documentUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink className="h-4 w-4" />
        Xem van ban goc
      </Link>
    </Button>
  ) : null}
</div>
<div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-900">
  <ShieldCheck className="h-3.5 w-3.5" />
  Nguon tham khao da duoc HR/C&B xac nhan
</div>
```

In `globals.css`, strengthen the blue palette by adjusting primary and accent variables slightly darker:

```css
--primary: 212 72% 22%;
--accent: 210 78% 34%;
--ring: 210 78% 34%;
--chart-1: 210 78% 34%;
--chart-2: 212 72% 22%;
```

- [ ] **Step 4: Run build to verify it passes**

Run: `pnpm build`
Expected: PASS with refreshed document action styling.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/home-legal-updates.tsx src/app/globals.css
git commit -m "feat: strengthen document download ctas"
```

### Task 10: Wire Navigation and Final Verification

**Files:**
- Modify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/src/app/layout.tsx`
- Verify: `D:/OneDrive/Not important/Documents/vn-insurance-fti/tests/calculator.service.test.ts`

- [ ] **Step 1: Write the failing test**

Use a route visibility check at build-time by adding a nav link target:

```tsx
<Link href="/cong-cu-luong-thue">Cong cu luong</Link>
```

Expected failure if the route or page export is broken.

- [ ] **Step 2: Run build to verify it fails**

Run: `pnpm build`
Expected: FAIL if the calculator page or imports are incomplete.

- [ ] **Step 3: Write minimal implementation**

Update the header nav in `src/app/layout.tsx`:

```tsx
<Link
  href="/cong-cu-luong-thue"
  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
>
  Cong cu luong
</Link>
```

- [ ] **Step 4: Run full verification**

Run: `pnpm test`
Expected: all tests pass

Run: `pnpm lint`
Expected: no errors, at most the existing known warnings

Run: `pnpm build`
Expected: PASS with `/cong-cu-luong-thue` in the route list

Run: `pnpm run deploy`
Expected: successful Cloudflare deploy with a production URL

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add calculator navigation"
```
