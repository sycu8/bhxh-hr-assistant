import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight, Calculator, ReceiptText, Wallet } from "lucide-react";

const TOOLS = [
  {
    title: "Lương gộp → thực nhận",
    description: "Ước tính lương thực nhận sau bảo hiểm và thuế TNCN.",
    example: "35.000.000 gross → khoảng 30,84 triệu thực nhận",
    href: "/cong-cu-luong-thue?mode=gross-to-net",
    icon: Wallet,
  },
  {
    title: "Thực nhận → lương gộp",
    description: "Tìm mức gross để chốt offer hoặc rà soát payroll.",
    example: "30.000.000 net → nội suy gross tương ứng",
    href: "/cong-cu-luong-thue?mode=net-to-gross",
    icon: ArrowLeftRight,
  },
  {
    title: "Thực nhận chi tiết",
    description: "Xem rõ từng khoản BHXH, BHYT, BHTN, thuế và giảm trừ.",
    example: "Có cả bảng bậc thuế và căn cứ đóng bảo hiểm",
    href: "/cong-cu-luong-thue?mode=take-home",
    icon: ReceiptText,
  },
] as const;

export function HomeSalaryTools() {
  return (
    <section className="overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 px-4 py-6 text-white shadow-xl sm:rounded-3xl sm:px-7 sm:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/75">
            Ưu tiên tiện ích
          </p>
          <h2 className="mt-3 text-balance text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            Công cụ lương và thuế cho HR/C&B
          </h2>
          <p className="mt-3 max-w-prose text-pretty text-sm leading-6 text-blue-100/82 sm:text-base">
            Tính nhanh thực nhận, kiểm tra căn cứ đóng bảo hiểm và đối chiếu thuế
            thu nhập cá nhân theo cấu hình pháp lý đang áp dụng.
          </p>
        </div>
        <Button
          asChild
          variant="cta"
          size="touch"
          className="w-full bg-white text-blue-950 shadow-lg hover:bg-blue-50 sm:w-auto"
        >
          <Link href="/cong-cu-luong-thue">
            <Calculator className="h-4 w-4" />
            Mở công cụ đầy đủ
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:mt-6 md:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.title}
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
                <div className="rounded-xl border border-white/12 bg-black/10 px-3 py-2 text-xs leading-5 text-blue-50/85">
                  {tool.example}
                </div>
                <Button
                  asChild
                  variant="cta"
                  size="touch"
                  className="w-full bg-white text-blue-950 shadow-md hover:bg-blue-50"
                >
                  <Link href={tool.href}>Tính ngay</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
