import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./search-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Tra cứu",
  description:
    "Tìm kiếm câu hỏi về BHXH, BHYT, BHTN và chế độ lao động theo tài liệu đã duyệt.",
};

function SearchFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:max-w-5xl">
      <Skeleton className="mb-4 h-8 w-2/3 max-w-md" />
      <Skeleton className="mb-8 h-4 w-full max-w-lg" />
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-28" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchClient />
    </Suspense>
  );
}
