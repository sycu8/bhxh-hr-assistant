import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { getCuratedFaqBySlug } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const faq = getCuratedFaqBySlug(slug);
  if (!faq) return { title: "Không tìm thấy" };
  return {
    title: faq.question.slice(0, 72),
    description: faq.answer.slice(0, 160),
  };
}

export default async function HoiDapDetailPage({ params }: Props) {
  const { slug } = await params;
  const faq = getCuratedFaqBySlug(slug);
  if (!faq) notFound();

  const topic = TOPICS.find((t) => t.slug === faq.categorySlug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/hoi-dap" className="font-medium text-accent hover:underline">
          ← Câu hỏi thường gặp
        </Link>
      </div>

      <article className="space-y-8">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">FAQ đã soạn sẵn</Badge>
              {topic ? <Badge variant="outline">{topic.title}</Badge> : null}
            </div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {faq.question}
            </h1>
          </div>
          <EmployeeJourney current="answer" compact />
        </header>

        <Card className="border-sky-100 bg-sky-50/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-sky-950">Câu trả lời</CardTitle>
          </CardHeader>
          <CardContent className="text-base leading-relaxed text-sky-950">
            {faq.answer}
          </CardContent>
        </Card>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Nguồn tham chiếu
          </h2>
          <ul className="mt-3 space-y-2">
            {faq.citations.map((c, i) => (
              <li
                key={`${c.title}-${i}`}
                className="rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2.5"
              >
                <p className="text-sm font-medium text-foreground">{c.title}</p>
                {c.sourceUrl ? (
                  <a
                    href={c.sourceUrl}
                    className="mt-1 inline-block text-xs font-medium text-accent underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở liên kết nguồn
                  </a>
                ) : null}
                {c.legalArticle || c.legalClause ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.legalArticle}
                    {c.legalArticle && c.legalClause ? " · " : null}
                    {c.legalClause}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-xl">
            <Link href={`/search?q=${encodeURIComponent(faq.question)}`}>
              Tra cứu câu hỏi tương tự
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link
              href={`/ask-hr?question=${encodeURIComponent(faq.question)}&detail=${encodeURIComponent(
                "Đã đọc FAQ nhưng cần HR xác minh thêm cho trường hợp cá nhân.",
              )}`}
            >
              Hỏi HR/C&amp;B
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
