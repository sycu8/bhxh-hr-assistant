import { redirect } from "next/navigation";
import { TOPICS } from "@/lib/data/topics";
import { topicHref } from "@/lib/navigation/topic-href";

type Props = { params: Promise<{ slug: string }> };

export default async function TopicSlugPage({ params }: Props) {
  const { slug } = await params;
  const topic = TOPICS.find((t) => t.slug === slug);
  if (!topic) redirect("/topics");
  redirect(topicHref(topic.slug, topic.title));
}
