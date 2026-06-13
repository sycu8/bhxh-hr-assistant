import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CuratedFaq } from "@/lib/data/curated-faqs";
import { SOURCE_LABEL_COPY } from "@/lib/copy/source-labels";

type Props = {
  faq: CuratedFaq;
  topicTitle?: string;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="mt-3 text-base leading-relaxed">{children}</div>
    </section>
  );
}

export function FaqDetailView({ faq, topicTitle }: Props) {
  const sourceLabel = faq.sourceLabel ?? "HR_APPROVED";
  const related = faq.relatedSlugs ?? [];

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">FAQ đã soạn sẵn</Badge>
          <Badge variant="outline">{SOURCE_LABEL_COPY[sourceLabel]}</Badge>
          {topicTitle ? <Badge variant="outline">{topicTitle}</Badge> : null}
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {faq.question}
        </h1>
      </header>

      <Card className="border-sky-100 bg-sky-50/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-sky-950">Trả lời ngắn</CardTitle>
        </CardHeader>
        <CardContent className="text-base leading-relaxed text-sky-950">
          {faq.answer}
        </CardContent>
      </Card>

      <Section title="Điều kiện / đối tượng">
        {faq.eligibility ? <p>{faq.eligibility}</p> : null}
      </Section>

      <Section title="Quyền lợi / mức hưởng">
        {faq.benefits ? <p>{faq.benefits}</p> : null}
      </Section>

      <Section title="Hồ sơ cần chuẩn bị">
        {faq.requiredDocs ? <p>{faq.requiredDocs}</p> : null}
      </Section>

      <Section title="Thời hạn / mốc quan trọng">
        {faq.deadlineNote ? <p>{faq.deadlineNote}</p> : null}
      </Section>

      {faq.steps && faq.steps.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Các bước thực hiện
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-relaxed">
            {faq.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {faq.hrEscalation ? (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-950">
              Khi nào cần HR/C&amp;B
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-amber-950/90">
            {faq.hrEscalation}
          </CardContent>
        </Card>
      ) : null}

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
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Câu hỏi liên quan
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((slug) => (
              <li key={slug}>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/hoi-dap/${slug}`}>{slug}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="rounded-xl">
          <Link href={`/search?q=${encodeURIComponent(faq.question)}`}>
            Tra cứu câu hỏi tương tự
          </Link>
        </Button>
        <Button asChild variant="cta" className="rounded-xl">
          <Link
            href={`/ask-hr?question=${encodeURIComponent(faq.question)}&detail=${encodeURIComponent(
              "Đã đọc FAQ nhưng cần HR xác minh thêm cho trường hợp cá nhân.",
            )}`}
          >
            Tạo ticket HR
          </Link>
        </Button>
      </div>
    </article>
  );
}
