import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, PiggyBank, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Công cụ tính",
  description: "Ước tính bảo hiểm và các chế độ liên quan — mang tính minh họa, cần HR/C&B đối chiếu.",
};

const TOOLS = [
  {
    title: "Lương & thuế (gross / net)",
    description: "Ước tính thực nhận, BHXH/BHYT/BHTN và thuế TNCN theo cấu hình năm 2026.",
    href: "/cong-cu-luong-thue",
    icon: Calculator,
    cta: "Mở công cụ",
  },
  {
    title: "Chỉ xem phần đóng BHXH/BHYT/BHTN",
    description: "Đang hoàn thiện giao diện riêng — tạm thời xem trong công cụ lương & thuế (tab thông số).",
    href: "/cong-cu-luong-thue",
    icon: PiggyBank,
    cta: "Đi tới công cụ",
  },
  {
    title: "Trợ cấp thất nghiệp / thai sản / ốm đau",
    description: "Ước tính theo từng case cần hồ sơ — dùng tra cứu để lấy căn cứ FAQ đã duyệt.",
    href: "/search?q=trợ cấp thất nghiệp",
    icon: Scale,
    cta: "Tra cứu nhanh",
  },
] as const;

export default function CalculatorsHubPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Công cụ tính</h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Các công cụ mang tính minh họa theo quy định đang cấu hình. Luôn đối chiếu với HR/C&B trước khi áp
          dụng cho hồ sơ thật.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.title} className="flex flex-col border-border/80 shadow-sm">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-900">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="text-base">{t.title}</CardTitle>
                <CardDescription className="text-pretty leading-relaxed">{t.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button asChild variant="secondary" className="w-full">
                  <Link href={t.href}>{t.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
