import type { Metadata } from "next";
import { FaqDbListPaginated } from "@/components/faq/FaqDbListPaginated";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { getApprovedFaqListForPublic } from "@/lib/db/faq-public-queries";
import { FAQ_PAGE_SIZE } from "@/lib/pagination/constants";

export const revalidate = 90;

export const metadata: Metadata = {
  title: "FAQ đã duyệt",
  description:
    "Danh sách câu hỏi thường gặp đã duyệt, kèm trích nguồn để đối chiếu khi tra cứu nội bộ FPT Telecom.",
};

export default async function FaqListPage() {
  const rows = await getApprovedFaqListForPublic();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            FAQ là lớp nguồn đã duyệt
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
            Nhấn vào <span className="font-medium text-foreground">câu hỏi</span> để xem trang
            trả lời ({FAQ_PAGE_SIZE} mục/trang). Dùng tra cứu khi cần so khớp ngữ cảnh tự nhiên.
          </p>
        </div>
        <EmployeeJourney current="evidence" compact />
      </header>

      <FaqDbListPaginated items={rows} />
    </div>
  );
}
