import type { Metadata } from "next";
import Link from "next/link";
import { TOPICS } from "@/lib/data/topics";
import { topicHref } from "@/lib/navigation/topic-href";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Chủ đề",
  description: "Chọn chủ đề để bắt đầu tra cứu nhanh về bảo hiểm.",
};

export default function TopicsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Chủ đề tra cứu</h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Mỗi chủ đề mở trang tra cứu với từ khóa gợi ý phù hợp.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.slug} href={topicHref(t.slug, t.title)} className="group">
              <Card className="h-full transition-all hover:border-sky-200 hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-900">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{t.title}</CardTitle>
                  <CardDescription className="line-clamp-3 text-pretty">{t.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
