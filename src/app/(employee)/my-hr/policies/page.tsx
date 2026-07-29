import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPublishedPolicies } from "@/lib/services/company-policy.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chính sách công ty" };

export default async function PoliciesPage() {
  let policies: Awaited<ReturnType<typeof listPublishedPolicies>> = [];
  let loadError: string | null = null;
  try {
    policies = await listPublishedPolicies();
  } catch {
    loadError =
      "Không tải được danh sách chính sách. Vui lòng thử lại sau hoặc liên hệ HR.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chính sách công ty</h1>
        <p className="text-sm text-muted-foreground">
          Tài liệu nội bộ đã được HR phê duyệt và công bố.
        </p>
      </div>
      {loadError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {loadError}
          </CardContent>
        </Card>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        {policies.map((policy) => (
          <Link key={policy.id} href={`/my-hr/policies/${policy.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/30">
              <CardHeader>
                <p className="text-xs text-muted-foreground">
                  {policy.category ?? "Chính sách"}
                </p>
                <CardTitle className="text-base">{policy.title}</CardTitle>
              </CardHeader>
              {policy.effectiveFrom ? (
                <CardContent className="text-xs text-muted-foreground">
                  Hiệu lực từ{" "}
                  {new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "medium",
                  }).format(policy.effectiveFrom)}
                </CardContent>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
