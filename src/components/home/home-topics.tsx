import { TOPICS } from "@/lib/data/topics";
import { topicHref } from "@/lib/navigation/topic-href";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CtaTextLink } from "@/components/ui/cta-link";

export function HomeTopics() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Danh mục chủ đề
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn chủ đề để mở trang tra cứu với bộ lọc phù hợp.
          </p>
        </div>
        <CtaTextLink href="/topics">Xem tất cả chủ đề</CtaTextLink>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.slug} href={topicHref(t.slug, t.title)} className="group">
              <Card className="h-full transition-colors hover:border-accent/40 hover:bg-muted/30">
                <CardHeader className="p-4 pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {t.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                    {t.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
