import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { listCuratedFaqs } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";
import { topicHref } from "@/lib/navigation/topic-href";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const topic = TOPICS.find((t) => t.slug === slug);
  if (!topic) return { title: "Chủ đề" };
  return {
    title: topic.title,
    description: topic.description,
  };
}

export default async function TopicLandingPage({ params }: Props) {
  const { slug } = await params;
  const topic = TOPICS.find((t) => t.slug === slug);
  if (!topic) notFound();

  const Icon = topic.icon;
  const faqs = listCuratedFaqs(slug).slice(0, 8);
  const searchHref = topicHref(topic.slug, topic.title);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">
              Chủ đề
            </Badge>
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {topic.title}
            </h1>
            <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {topic.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="cta" size="touch">
              <Link href={searchHref}>Tra cứu chủ đề này</Link>
            </Button>
            <Button asChild variant="outline" size="touch">
              <Link href="/hoi-dap">Xem FAQ</Link>
            </Button>
          </div>
        </div>
        <EmployeeJourney current="question" compact />
      </header>

      {faqs.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold">Câu hỏi thường gặp</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {faqs.map((faq) => (
              <li key={faq.slug}>
                <Link
                  href={`/hoi-dap/${faq.slug}`}
                  className="block rounded-xl border border-border bg-card p-4 text-sm font-medium shadow-sm transition hover:border-primary/30 hover:bg-muted/30"
                >
                  {faq.question}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-950">
              Cần HR xác minh theo hồ sơ?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-amber-950/90">
            <p className="mb-3">
              Gửi ticket HR nếu tình huống phụ thuộc hợp đồng, thời gian đóng
              hoặc hồ sơ cá nhân.
            </p>
            <Button asChild variant="cta" size="touch">
              <Link
                href={`/ask-hr?topic=${encodeURIComponent(slug)}&question=${encodeURIComponent(
                  `Tư vấn về ${topic.title}`,
                )}`}
              >
                Tạo ticket HR
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
