import type { Metadata } from "next";
import Link from "next/link";
import { HoiDapFaqSections } from "@/components/faq/HoiDapFaqSections";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { CURATED_FAQS } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";
import { FAQ_PAGE_SIZE } from "@/lib/pagination/constants";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description:
    "FAQ bảo hiểm đã soạn sẵn, ngắn gọn, có trích nguồn chính thống — BHXH, BHYT, BHTN và chế độ lao động.",
};

const topicTitleBySlug = Object.fromEntries(TOPICS.map((t) => [t.slug, t.title]));

export default function HoiDapListPage() {
  const entries = CURATED_FAQS.map((faq) => ({
    ...faq,
    topicTitle: topicTitleBySlug[faq.categorySlug] ?? faq.categorySlug,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Câu hỏi thường gặp
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
            Nhấn vào <span className="font-medium text-foreground">câu hỏi</span> để mở trang
            trả lời đầy đủ và nguồn tham chiếu ({FAQ_PAGE_SIZE} câu/trang, thuận tiện trên
            mobile). Bạn cũng có thể{" "}
            <Link href="/search" className="font-medium text-accent hover:underline">
              tra cứu bằng câu hỏi tự nhiên
            </Link>
            .
          </p>
        </div>
        <EmployeeJourney current="evidence" compact />
      </header>

      <HoiDapFaqSections entries={entries} />
    </div>
  );
}
