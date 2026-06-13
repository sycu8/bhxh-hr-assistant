import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqDetailView } from "@/components/faq/FaqDetailView";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { getCuratedFaqBySlug, listCuratedFaqs } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listCuratedFaqs().map((faq) => ({ slug: faq.slug }));
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

      <div className="mb-8 lg:hidden">
        <EmployeeJourney current="answer" compact />
      </div>

      <FaqDetailView faq={faq} topicTitle={topic?.title} />
    </div>
  );
}
