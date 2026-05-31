import Link from "next/link";
import { BookOpen, Calculator, ReceiptText, Scale, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const HR_TOOLS = [
  {
    title: "Lương & thuế (gross / net)",
    description: "Ước tính thực nhận, BHXH/BHYT/BHTN và thuế TNCN theo cấu hình năm 2026.",
    href: "/cong-cu-luong-thue",
    icon: Calculator,
    cta: "Mở công cụ",
  },
  {
    title: "Thực nhận chi tiết",
    description: "Xem từng khoản bảo hiểm, thuế và giảm trừ trước khi hỏi HR.",
    href: "/cong-cu-luong-thue?mode=take-home",
    icon: ReceiptText,
    cta: "Tính ngay",
  },
  {
    title: "Tra cứu căn cứ",
    description: "Tìm FAQ và câu trả lời có nguồn trước khi chuyển sang HR.",
    href: "/search",
    icon: Search,
    cta: "Tra cứu",
  },
  {
    title: "Cập nhật pháp luật",
    description: "Đối chiếu văn bản BHXH/BHYT/BHTN đã duyệt trong hệ thống.",
    href: "/legal-updates",
    icon: Scale,
    cta: "Xem cập nhật",
  },
  {
    title: "Mục nguồn pháp luật",
    description: "Mở tài liệu gốc và mục lục văn bản để HR đối chiếu nhanh.",
    href: "/nguon-phap-luat",
    icon: BookOpen,
    cta: "Mở nguồn",
  },
] as const;

export function AskHrToolsSection() {
  return (
    <section className="mt-10 space-y-4">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">Công cụ HR/C&amp;B tương đương</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Dùng các tiện ích dưới đây để tự đối chiếu trước — giúp email gửi HR ngắn gọn và có
          căn cứ hơn.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HR_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title} className="flex flex-col border-border/80 shadow-sm">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-950">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <CardDescription className="text-pretty leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button asChild variant="cta" size="touch" className="w-full">
                  <Link href={tool.href}>{tool.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
