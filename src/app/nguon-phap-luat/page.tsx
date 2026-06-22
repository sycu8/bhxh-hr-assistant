import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import {
  THUVIEN_BHXH_20866_SECTIONS,
  THUVIEN_BHXH_20866_SOURCE,
} from "@/lib/data/thuvien-bhxh-20866";

export const metadata = {
  title: "Nguồn tham khảo BHXH",
  description:
    "Liên kết văn bản theo bài tổng hợp Thư viện Pháp Luật, dùng để đối chiếu nguồn khi tra cứu nội bộ.",
};

export default function LegalSourceIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Kiểm tra nguồn trước khi áp dụng
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
            Mục này gom các liên kết tham khảo để đối chiếu với câu trả lời.
            Khi cần quyết định chính thức, HR/C&amp;B vẫn cần kiểm tra văn bản
            gốc và chỉ đạo của cơ quan có thẩm quyền.
          </p>
        </div>
        <EmployeeJourney current="evidence" compact />
      </header>

      <Alert className="mt-6 text-pretty border-sky-100 bg-sky-50/60">
        <AlertTitle>Phạm vi sử dụng</AlertTitle>
        <AlertDescription className="text-sm leading-relaxed">
          Đồng bộ liên kết từ bài{" "}
          <Link
            href={THUVIEN_BHXH_20866_SOURCE.url}
            className="font-medium text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {THUVIEN_BHXH_20866_SOURCE.title}
          </Link>{" "}
          ({THUVIEN_BHXH_20866_SOURCE.publisher}). Đây là mục lục tra cứu nhanh,
          không phải văn bản quy phạm pháp luật.
        </AlertDescription>
      </Alert>

      <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-2">
        {THUVIEN_BHXH_20866_SECTIONS.map((sec) => (
          <section
            key={sec.id}
            className="rounded-2xl border border-sky-100 bg-card p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-foreground">
              {sec.heading}
            </h2>
            <ul className="mt-3 list-outside list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-accent sm:pl-6">
              {sec.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
