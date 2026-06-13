import type { Metadata } from "next";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { AskHrForm } from "@/components/marketing/AskHrForm";
import { AskHrToolsSection } from "@/components/marketing/AskHrToolsSection";
import { HR_CONTACT_EMAIL } from "@/lib/copy/hr-contact";

export const metadata: Metadata = {
  title: "Hỏi HR/C&B",
  description:
    "Gửi câu hỏi khi tra cứu chưa đủ căn cứ hoặc tình huống phụ thuộc hồ sơ cá nhân.",
};

type Props = {
  searchParams?: Promise<{
    question?: string;
    detail?: string;
    topic?: string;
  }>;
};

export default async function AskHrPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Hỏi HR/C&amp;B
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
            Đây là bước cuối khi câu trả lời chưa đủ căn cứ, mức tin cậy thấp,
            hoặc tình huống phụ thuộc hồ sơ cá nhân. Tạo ticket HR — HR/C&amp;B (
            {HR_CONTACT_EMAIL}) sẽ xử lý và phản hồi qua email công ty bạn nhập.
          </p>
        </div>
        <EmployeeJourney current="hr" compact />
      </header>
      <AskHrForm
        initialQuestion={params?.question}
        initialDetail={params?.detail}
        initialTopic={params?.topic}
      />
      <AskHrToolsSection />
    </div>
  );
}
