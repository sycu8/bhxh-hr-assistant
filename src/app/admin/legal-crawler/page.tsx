import Link from "next/link";
import type { Metadata } from "next";
import {
  Archive,
  CheckCircle2,
  ExternalLink,
  Play,
  Plus,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getLegalCrawlerAdminData,
  type CrawlAdminItemRow,
} from "@/lib/db/crawl-queries";
import {
  addCrawlKeywordAction,
  approveCrawlItemAction,
  archiveCrawlItemAction,
  crawlManualUrlAction,
  rejectCrawlItemAction,
  runCrawlAllSourcesAction,
  runCrawlForSourceAction,
  toggleCrawlKeywordAction,
  toggleCrawlSourceAction,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thu thập văn bản pháp luật",
  description: "Thu thập và duyệt nguồn pháp luật chính thống.",
};

const IMPACT_LABEL_VI: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

const CRAWL_STATUS_VI: Record<string, string> = {
  NEW: "Mới",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  ARCHIVED: "Đã lưu trữ",
};

const GROUP_LABEL_VI: Record<string, string> = {
  EMPLOYEE: "Người lao động",
  HR: "Bộ phận HR",
  EMPLOYER: "Người sử dụng lao động",
  PROBATION: "Thử việc",
  OFFICIAL: "Văn bản chính thống",
  MANAGER: "Quản lý",
};

const impactOptions = ["LOW", "MEDIUM", "HIGH"] as const;
const affectedGroups = ["EMPLOYEE", "HR", "EMPLOYER", "PROBATION", "OFFICIAL", "MANAGER"];

function formatDate(d: Date | null) {
  if (!d) return "Chưa chạy";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function ReviewCard({ item }: { item: CrawlAdminItemRow }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{item.sourceName}</Badge>
              <Badge>{CRAWL_STATUS_VI[item.status] ?? item.status}</Badge>
              {item.legalDocumentType ? (
                <Badge variant="secondary">{item.legalDocumentType}</Badge>
              ) : null}
            </div>
            <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
            <CardDescription>
              Thu thập lúc {formatDate(item.crawledAt)}
              {item.documentNumber ? ` · ${item.documentNumber}` : ""}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Mở nguồn
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.summary ?? "Chưa có tóm tắt."}
        </p>
        <div className="flex flex-wrap gap-2">
          {item.detectedKeywords.slice(0, 10).map((keyword) => (
            <Badge key={keyword} variant="outline">
              {keyword}
            </Badge>
          ))}
          {item.detectedTopics.map((topic) => (
            <Badge key={topic} variant="secondary">
              {topic}
            </Badge>
          ))}
        </div>

        <form action={approveCrawlItemAction} className="space-y-4 rounded-md border p-4">
          <input type="hidden" name="itemId" value={item.id} />
          <div className="grid gap-3 md:grid-cols-[160px_1fr]">
            <label className="text-sm font-medium" htmlFor={`impact-${item.id}`}>
              Mức ảnh hưởng
            </label>
            <select
              id={`impact-${item.id}`}
              name="impactLevel"
              defaultValue="MEDIUM"
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              {impactOptions.map((impact) => (
                <option key={impact} value={impact}>
                  {IMPACT_LABEL_VI[impact] ?? impact}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-[160px_1fr]">
            <span className="text-sm font-medium">Nhóm ảnh hưởng</span>
            <div className="flex flex-wrap gap-3 text-sm">
              {affectedGroups.map((group) => (
                <label key={group} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="affectedGroups"
                    value={group}
                    defaultChecked={group === "HR"}
                  />
                  {GROUP_LABEL_VI[group] ?? group}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="hrActionRequired" />
            Cần HR/C&amp;B xử lý
          </label>
          <Input
            name="hrActionSummary"
            placeholder="Tóm tắt việc HR cần làm, nếu có"
          />
          <Input name="note" placeholder="Ghi chú duyệt" />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Duyệt và xuất bản
            </Button>
            <Button formAction={rejectCrawlItemAction} variant="outline" size="sm">
              <XCircle className="mr-2 h-4 w-4" />
              Từ chối
            </Button>
            <Button formAction={archiveCrawlItemAction} variant="ghost" size="sm">
              <Archive className="mr-2 h-4 w-4" />
              Lưu trữ
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function LegalCrawlerAdminPage() {
  const data = await getLegalCrawlerAdminData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Thu thập văn bản pháp luật
          </h1>
          <p className="mt-1 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Nội dung từ nguồn chính thống luôn vào hàng chờ duyệt. Chỉ bản đã duyệt mới được
            xuất bản và đưa vào kho phục vụ AI. Hệ thống tự quét các nguồn chính thống mỗi
            ngày lúc 06:00 (giờ Việt Nam).
          </p>
        </div>
        <form action={runCrawlAllSourcesAction}>
          <Button type="submit">
            <Play className="mr-2 h-4 w-4" />
            Thu thập từ mọi nguồn đang bật
          </Button>
        </form>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Chờ duyệt", data.metrics.pendingReview],
          ["Đã duyệt", data.metrics.approved],
          ["Đã từ chối", data.metrics.rejected],
          ["Đã xuất bản", data.metrics.publishedLegalUpdates],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <section className="min-w-0 space-y-4">
          <h2 className="text-lg font-semibold">Hàng chờ duyệt</h2>
          {data.items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                Chưa có mục thu thập nào cần duyệt.
              </CardContent>
            </Card>
          ) : (
            data.items.map((item) => <ReviewCard key={item.id} item={item} />)
          )}
        </section>

        <aside className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nhập URL thủ công</CardTitle>
              <CardDescription>
                Dùng khi website khó crawl hoặc cần kiểm tra một văn bản cụ thể.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={crawlManualUrlAction} className="space-y-3">
                <select
                  name="sourceId"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  required
                >
                  {data.sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
                <Input name="url" type="url" placeholder="https://…" required />
                <Button type="submit" className="w-full">
                  Tải về và đưa vào hàng chờ
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nguồn thu thập</CardTitle>
              <CardDescription>Bật/tắt nguồn chính thống hoặc chạy từng nguồn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.sources.map((source) => (
                <div key={source.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.domain} · {source.sourceType} · {source.trustLevel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lần thu thập gần nhất: {formatDate(source.lastCrawledAt)}
                      </p>
                    </div>
                    <form action={toggleCrawlSourceAction}>
                      <input type="hidden" name="sourceId" value={source.id} />
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={source.active}
                        />
                        Kích hoạt
                      </label>
                      <Button type="submit" variant="ghost" size="sm">
                        Lưu
                      </Button>
                    </form>
                  </div>
                  <form action={runCrawlForSourceAction}>
                    <input type="hidden" name="sourceId" value={source.id} />
                    <Button type="submit" variant="outline" size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Thu thập từ nguồn này
                    </Button>
                  </form>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Từ khóa theo dõi</CardTitle>
              <CardDescription>
                Quản trị viên có thể tắt/bật hoặc thêm từ khóa mới.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={addCrawlKeywordAction} className="flex gap-2">
                <Input name="keyword" placeholder="Thêm từ khóa" className="min-h-11 flex-1" />
                <Button type="submit" size="icon" aria-label="Thêm từ khóa">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
              <div className="max-h-96 space-y-2 overflow-auto pr-1">
                {data.keywords.map((keyword) => (
                  <form
                    action={toggleCrawlKeywordAction}
                    key={keyword.id}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <input type="hidden" name="keywordId" value={keyword.id} />
                    <div>
                      <p className="text-sm">{keyword.keyword}</p>
                      {keyword.categoryName ? (
                        <p className="text-xs text-muted-foreground">
                          {keyword.categoryName}
                        </p>
                      ) : null}
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={keyword.active}
                      />
                      Kích hoạt
                    </label>
                    <Button type="submit" variant="ghost" size="sm">
                      Lưu
                    </Button>
                  </form>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
