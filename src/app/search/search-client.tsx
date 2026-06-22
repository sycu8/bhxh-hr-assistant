"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2, Search } from "lucide-react";
import { AnswerCard } from "@/components/portal/answer-card";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { SearchHitsPaginated } from "@/components/portal/SearchHitsPaginated";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnswerCardDto, SearchHitDto } from "@/lib/types/answer-card";

type SearchApiSuccess = {
  success: true;
  data: {
    query: string;
    hits: SearchHitDto[];
    answer: AnswerCardDto;
  };
};

type SearchApiError = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

function buildAskHrHref(query: string, reason: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("question", query.trim());
  params.set("detail", reason);
  return `/ask-hr?${params.toString()}`;
}

export function SearchClient() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<SearchHitDto[] | null>(null);
  const [answer, setAnswer] = useState<AnswerCardDto | null>(null);

  const runSearch = useCallback(
    async (query: string, cat?: string) => {
      setError(null);
      setLoading(true);
      setHits(null);
      setAnswer(null);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            employeeGroup: "OFFICIAL",
            categorySlug: cat || undefined,
            hitLimit: 12,
          }),
        });
        const json = (await res.json()) as SearchApiSuccess | SearchApiError;
        if (!json.success) {
          setError(json.error.message);
          return;
        }
        setHits(json.data.hits);
        setAnswer(json.data.answer);
      } catch {
        setError("Không kết nối được máy chủ. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const fromQ = searchParams.get("q")?.trim() ?? "";
    const fromCat = searchParams.get("category")?.trim();
    queueMicrotask(() => {
      setQ(fromQ);
      setCategorySlug(fromCat || undefined);
    });
    if (fromQ.length >= 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL query should hydrate search results on direct visits.
      void runSearch(fromQ, fromCat || undefined);
    }
  }, [searchParams, runSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2) {
      setError("Vui lòng nhập ít nhất 2 ký tự.");
      return;
    }
    void runSearch(q.trim(), categorySlug);
  };

  const askHrHref = buildAskHrHref(
    q,
    answer?.needsHrReview
      ? "Kết quả cần HR/C&B xác minh trước khi áp dụng."
      : "Tôi cần HR/C&B kiểm tra thêm vì chưa đủ căn cứ để áp dụng.",
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <header className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Đọc câu trả lời
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
            Bắt đầu bằng câu trả lời ngắn, sau đó kiểm tra mức tin cậy, nguồn
            căn cứ và bước tiếp theo nếu cần HR/C&amp;B xác minh.
          </p>
          {categorySlug ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Đang lọc theo chủ đề:{" "}
              <span className="font-medium text-foreground">{categorySlug}</span>
            </p>
          ) : null}
        </div>
        <EmployeeJourney current="answer" compact />
      </header>

      <Card className="mb-6 border-sky-100 shadow-sm sm:mb-8">
        <CardHeader className="space-y-1 pb-3 sm:pb-4">
          <CardTitle className="text-base">Đặt hoặc sửa câu hỏi</CardTitle>
          <CardDescription className="text-pretty leading-relaxed">
            Viết như đang hỏi HR: tình huống, loại bảo hiểm, thời điểm và điều
            bạn cần quyết định.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ví dụ: Nghỉ thai sản được hưởng chế độ như thế nào?"
                className="h-12 min-h-12 rounded-xl pl-10 text-base sm:text-sm"
                aria-label="Từ khóa tra cứu"
              />
            </div>
            <Button
              type="submit"
              variant="cta"
              size="touch"
              disabled={loading}
              className="w-full shrink-0 sm:w-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tìm
                </>
              ) : (
                "Tra cứu"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Không thực hiện được yêu cầu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading && hits === null && !error ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : null}

      {!loading && hits && answer ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="space-y-6">
            <AnswerCard answer={answer} />
            <SearchHitsPaginated hits={hits} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20">
            <Card className="border-sky-100 bg-sky-50/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bước tiếp theo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Nếu câu trả lời đủ rõ, hãy mở nguồn để đối chiếu. Nếu tình
                  huống phụ thuộc hồ sơ cá nhân, chuyển sang hỏi HR/C&amp;B.
                </p>
                <Button
                  asChild
                  variant="ctaSecondary"
                  size="touch"
                  className="w-full justify-between"
                >
                  <Link href="/nguon-phap-luat">
                    Kiểm tra nguồn
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/80">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-amber-950">
                  <AlertCircle className="h-4 w-4" aria-hidden />
                  Cần HR xác minh?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-amber-950/90">
                <p>
                  Dùng bước này khi kết quả có mức tin cậy thấp, thiếu nguồn,
                  hoặc cần kiểm tra theo hồ sơ cá nhân.
                </p>
                <Button asChild variant="cta" size="touch" className="w-full">
                  <Link href={askHrHref}>Soạn câu hỏi cho HR</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
