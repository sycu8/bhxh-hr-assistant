import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedAnswerText } from "@/components/portal/formatted-answer-text";
import { getPublishedPolicyBySlug } from "@/lib/services/company-policy.service";

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = await getPublishedPolicyBySlug(slug);
  if (!policy) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/my-hr/policies"
        className="text-sm text-primary hover:underline"
      >
        ← Danh sách chính sách
      </Link>
      <div>
        <p className="text-sm text-muted-foreground">
          {policy.category ?? "Chính sách"}
        </p>
        <h1 className="text-2xl font-semibold">{policy.title}</h1>
        {policy.effectiveFrom ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Hiệu lực từ{" "}
            {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(
              policy.effectiveFrom,
            )}
          </p>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nội dung</CardTitle>
        </CardHeader>
        <CardContent>
          <FormattedAnswerText text={policy.body} />
        </CardContent>
      </Card>
    </div>
  );
}
