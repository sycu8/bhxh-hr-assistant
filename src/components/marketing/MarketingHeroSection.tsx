import Link from "next/link";
import { ArrowRight, BookOpenCheck, MessageSquareText } from "lucide-react";
import { HomeHeroSearch } from "@/components/home/home-hero-search";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { Button } from "@/components/ui/button";
import { HOME_SUGGESTED_QUESTIONS } from "@/lib/copy/home-marketing";

export function MarketingHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-sky-100 bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_58%,hsl(var(--background))_100%)]">
      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:pb-20">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
          <div className="min-w-0">
            <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[3rem] lg:leading-[1.08]">
              Tìm hiểu về bảo hiểm theo cách dễ hiểu
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Nhập tình huống của bạn. Hệ thống trả lời theo tài liệu đã duyệt,
              chỉ rõ mức tin cậy, nguồn căn cứ và khi nào cần hỏi HR/C&amp;B.
            </p>

            <div className="mt-7 max-w-3xl">
              <HomeHeroSearch />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {HOME_SUGGESTED_QUESTIONS.map((q) => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="rounded-full border border-sky-200/80 bg-white/90 px-3 py-1.5 text-left text-xs font-medium leading-snug text-sky-950 shadow-sm transition hover:border-sky-300 hover:bg-white sm:text-sm"
                >
                  {q}
                </Link>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Button asChild variant="cta" size="touch" className="w-full sm:flex-1">
                <Link href="/search">
                  Đến trang câu trả lời
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="ctaSecondary" size="touch" className="w-full sm:flex-1">
                <Link href="/hoi-dap">Xem câu hỏi thường gặp</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="touch"
                className="w-full border-sky-200 bg-white/90 sm:w-auto"
              >
                <Link href="/nguon-phap-luat">Nguồn tham khảo</Link>
              </Button>
            </div>
          </div>

          <aside className="rounded-3xl border border-sky-100 bg-white/90 p-5 shadow-xl shadow-slate-950/10">
            <div className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MessageSquareText className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Câu trả lời trước, căn cứ ngay sau
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Mỗi kết quả được tách thành phần dễ đọc, mức tin cậy và nguồn
                  để đối chiếu.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-sky-100 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-900">
                <BookOpenCheck className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Không đủ căn cứ thì chuyển HR
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Những tình huống phụ thuộc hồ sơ cá nhân được đưa sang bước
                  hỏi HR/C&amp;B.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <EmployeeJourney current="question" className="mt-8 sm:mt-10" />
      </div>
    </section>
  );
}
