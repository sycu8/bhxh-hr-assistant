import type { PopularFaqRow } from "@/lib/db/home-queries";
import { CURATED_FAQS } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CtaTextLink } from "@/components/ui/cta-link";

export function HomePopularFaqs({ faqs }: { faqs: PopularFaqRow[] }) {
  const topicName = Object.fromEntries(TOPICS.map((t) => [t.slug, t.title]));
  const display =
    faqs.length > 0
      ? faqs.map((f) => ({
          id: f.id,
          question: f.question,
          shortAnswer: f.shortAnswer,
          categoryName: f.category?.name ?? null,
          href: `/faq/${f.id}`,
        }))
      : CURATED_FAQS.slice(0, 6).map((f) => ({
          id: f.slug,
          question: f.question,
          shortAnswer: f.answer,
          categoryName: topicName[f.categorySlug] ?? f.categorySlug,
          href: `/hoi-dap/${f.slug}`,
        }));
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Câu hỏi thường gặp
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Các chủ đề được tra cứu nhiều trong nội bộ (theo dữ liệu FAQ đã duyệt).
          </p>
        </div>
        <CtaTextLink href="/hoi-dap" className="w-auto">
          Xem tất cả FAQ
        </CtaTextLink>
      </div>
      {display.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Chưa có FAQ trong kho. Chạy seed hoặc liên hệ quản trị để nhập dữ liệu.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Danh sách nổi bật</CardTitle>
            <CardDescription>
              Nhấn vào câu hỏi để mở trang trả lời đầy đủ.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="divide-y divide-border">
              {display.map((f, i) => (
                <li key={f.id}>
                  <Link
                    href={f.href}
                    className="flex items-start gap-3 py-3 transition-colors first:pt-0 hover:bg-muted/40 sm:items-center sm:px-2"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug text-foreground">
                        {f.question}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {f.shortAnswer}
                      </p>
                      {f.categoryName ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {f.categoryName}
                        </p>
                      ) : null}
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
            <Separator className="mt-2" />
            <p className="pt-3 text-xs text-muted-foreground">
              Nội dung chỉ mang tính tham khảo; áp dụng cụ thể theo hồ sơ và chính
              sách công ty.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
