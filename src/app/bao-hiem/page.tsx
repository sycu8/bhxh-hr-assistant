import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HrPageHeader } from "@/components/hr/hr-page-header";
import { EMPLOYEE_TOOL_GROUPS } from "@/lib/navigation/employee-tools";
import { TOPICS } from "@/lib/data/topics";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảo hiểm & phúc lợi",
  description:
    "Kho kiến thức BHXH, BHYT, BHTN và công cụ tra cứu cho nhân viên FPT Telecom.",
};

const BHXH_LINKS = [
  {
    href: "/search",
    title: "Tra cứu AI",
    desc: "Hỏi đáp có trích dẫn nguồn và mức tin cậy",
  },
  { href: "/hoi-dap", title: "FAQ", desc: "Câu hỏi thường gặp đã duyệt" },
  { href: "/topics", title: "Chủ đề", desc: "BHXH, BHYT, BHTN, thai sản…" },
  {
    href: "/legal-updates",
    title: "Cập nhật pháp luật",
    desc: "Văn bản mới đã publish",
  },
  {
    href: "/nguon-phap-luat",
    title: "Nguồn pháp luật",
    desc: "Liên kết chính thức",
  },
  {
    href: "/ask-hr",
    title: "Hỏi HR/C&B",
    desc: "Escalation khi cần xử lý cá nhân",
  },
  {
    href: "/bao-hiem/history",
    title: "Lịch sử tham gia",
    desc: "Đăng nhập để xem hồ sơ BH",
  },
] as const;

export default function BaoHiemHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <HrPageHeader
        title="Bảo hiểm & phúc lợi"
        description="Module tra cứu BHXH/BHYT/BHTN trong Cổng HR — mọi câu trả lời kèm nguồn, mức tin cậy và hướng dẫn khi nào cần hỏi HR."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BHXH_LINKS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full border-sky-100 transition hover:border-primary/30 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Công cụ lương & chế độ</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EMPLOYEE_TOOL_GROUPS.flatMap((g) => g.tools)
            .filter((t) =>
              ["/cong-cu-luong-thue", "/calculators/che-do-thai-san"].includes(
                t.href.split("?")[0]!,
              ),
            )
            .map((tool) => (
              <Link key={tool.href} href={tool.href}>
                <Card className="transition hover:bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-base">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Chủ đề phổ biến</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="rounded-full border bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
            >
              {topic.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
