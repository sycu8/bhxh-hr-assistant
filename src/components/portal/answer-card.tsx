import Link from "next/link";
import type { AnswerCardDto, ConfidenceLevelDto } from "@/lib/types/answer-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  BookMarked,
  ExternalLink,
  Scale,
  ShieldCheck,
} from "lucide-react";

const confidenceBadge: Record<
  ConfidenceLevelDto,
  { label: string; variant: "success" | "warning" | "danger" | "secondary" }
> = {
  HIGH: { label: "Tin cậy cao", variant: "success" },
  MEDIUM: { label: "Cần đối chiếu thêm", variant: "warning" },
  LOW: { label: "Cần HR kiểm tra", variant: "danger" },
};

export function AnswerCard({ answer }: { answer: AnswerCardDto }) {
  const conf = confidenceBadge[answer.confidenceLevel];
  const clauses = answer.citations.filter((c) => c.legalArticle || c.legalClause);
  const readyPageHref = answer.relatedFaqSlug
    ? `/hoi-dap/${answer.relatedFaqSlug}`
    : answer.relatedFaqId
      ? `/faq/${answer.relatedFaqId}`
      : null;

  return (
    <Card className="overflow-hidden border-sky-100 shadow-sm" aria-label="Kết quả trả lời">
      <CardHeader className="space-y-3 border-b border-sky-100 bg-primary px-4 pb-4 pt-5 text-primary-foreground sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Câu trả lời theo nguồn đã duyệt
              </CardTitle>
              <CardDescription className="text-xs text-white/75">
                Tự động tổng hợp từ FAQ và văn bản chính thống — không suy diễn khi thiếu căn cứ.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end sm:text-right">
            <span className="text-[10px] font-medium uppercase tracking-wide text-white/65">
              Mức độ tin cậy
            </span>
            <Badge variant={conf.variant} className="bg-white text-primary hover:bg-white">
              {conf.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-4 pb-6 pt-6 sm:px-6">
        <section>
          {readyPageHref ? (
            <div className="space-y-3">
              <p className="text-base leading-relaxed text-foreground">
                {answer.shortAnswer}
              </p>
              <Button asChild variant="cta" size="touch" className="w-full sm:w-auto">
                <Link href={readyPageHref}>
                  Đọc trang FAQ đầy đủ
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-base leading-relaxed text-foreground">
              {answer.shortAnswer}
            </p>
          )}
        </section>

        <Separator />

        <section>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <BookMarked className="h-3.5 w-3.5" aria-hidden />
            Nguồn tham chiếu
          </div>
          {answer.citations.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {answer.citations.map((c, i) => (
                <li
                  key={`${c.title}-${i}`}
                  className="rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2.5"
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
          ) : (
            <p className="mt-2 rounded-xl border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Chưa có trích dẫn trong kho dữ liệu cho câu hỏi này. Nên chuyển
              sang HR/C&amp;B trước khi áp dụng.
            </p>
          )}
        </section>

        {clauses.length > 0 ? (
          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Scale className="h-3.5 w-3.5" aria-hidden />
              Điều khoản liên quan
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {clauses.map((c, i) => (
                <li key={`clause-${i}`}>
                  {c.legalArticle ? (
                    <span className="font-medium text-foreground">
                      {c.legalArticle}
                    </span>
                  ) : null}
                  {c.legalArticle && c.legalClause ? " · " : null}
                  {c.legalClause ? <span>{c.legalClause}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {answer.needsHrReview ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cần hỏi HR/C&amp;B</AlertTitle>
            <AlertDescription>
              Kết quả có thể phụ thuộc hồ sơ cá nhân hoặc mức tin cậy chưa cao. Không nhập
              dữ liệu nhạy cảm; hãy xác minh với HR/C&amp;B trước khi áp dụng.
            </AlertDescription>
          </Alert>
        ) : null}

        {answer.warnings.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {answer.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
