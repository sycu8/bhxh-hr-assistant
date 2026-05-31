import Link from "next/link";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EMPLOYEE_TOOLS_SECTION_TITLE,
  HOME_QUICK_LOOKUP_TOOLS,
  HOME_SALARY_TOOL_SHORTCUTS,
  PAYROLL_EMPLOYEE_TOOLS,
} from "@/lib/navigation/employee-tools";

export function HomeSalaryTools() {
  return (
    <section className="overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 px-4 py-6 text-white shadow-xl sm:rounded-3xl sm:px-7 sm:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/75">
            Tiện ích nhân viên
          </p>
          <h2 className="mt-3 text-balance text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            {EMPLOYEE_TOOLS_SECTION_TITLE}
          </h2>
          <p className="mt-3 max-w-prose text-pretty text-sm leading-6 text-blue-100/82 sm:text-base">
            Tính lương, xem lương cơ bản và chính sách miễn giảm theo cấu hình mới nhất trong hệ
            thống.
          </p>
        </div>
        <Button
          asChild
          variant="cta"
          size="touch"
          className="w-full bg-white text-blue-950 shadow-lg hover:bg-blue-50 sm:w-auto"
        >
          <Link href="/calculators">
            <Calculator className="h-4 w-4" />
            Xem tất cả công cụ
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:mt-6 md:grid-cols-3">
        {PAYROLL_EMPLOYEE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.href}
              className="border-white/12 bg-white/10 text-white shadow-none backdrop-blur"
            >
              <CardHeader className="pb-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/12 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-blue-100/82">{tool.description}</p>
                <Button
                  asChild
                  variant="cta"
                  size="touch"
                  className="w-full bg-white text-blue-950 shadow-md hover:bg-blue-50"
                >
                  <Link href={tool.href}>{tool.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
        {HOME_QUICK_LOOKUP_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.href}
              asChild
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link href={tool.href}>
                <Icon className="h-3.5 w-3.5" />
                {tool.title}
              </Link>
            </Button>
          );
        })}
      </div>

      <details className="mt-5 group">
        <summary className="cursor-pointer text-sm font-medium text-blue-100/90 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-blue-200/50 underline-offset-4 group-open:no-underline">
            Lối tắt tính lương chi tiết
          </span>
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {HOME_SALARY_TOOL_SHORTCUTS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-white/12 bg-black/15 px-3 py-3 text-sm text-blue-50/90 transition-colors hover:bg-black/25"
            >
              <span className="font-medium text-white">{tool.title}</span>
              <span className="mt-1 block text-xs leading-5 text-blue-100/75">{tool.example}</span>
            </Link>
          ))}
        </div>
      </details>
    </section>
  );
}
