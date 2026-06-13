import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { SaveActivateForm } from "@/components/admin/save-activate-form";
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
import { AdminActionForm } from "@/components/admin/admin-action-form";
import { CrawlSubmitButton } from "@/components/admin/crawl-submit-button";
import { CrawlReviewQueue } from "@/components/admin/crawl-review-queue";
import { requirePermission } from "@/lib/auth/require-admin";
import { getLegalCrawlerAdminData } from "@/lib/db/crawl-queries";
import {
  addCrawlKeywordAction,
  crawlManualUrlAction,
  runCrawlAllSourcesAction,
  runCrawlForSourceAction,
  purgeExpiredCrawlQueueAction,
  toggleCrawlKeywordAction,
  toggleCrawlSourceAction,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thu thập văn bản pháp luật",
  description: "Thu thập và duyệt nguồn pháp luật chính thống.",
};

function formatDate(d: Date | null) {
  if (!d) return "Chưa chạy";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default async function LegalCrawlerAdminPage() {
  await requirePermission("legal:read");
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
        <AdminActionForm action={runCrawlAllSourcesAction}>
          <CrawlSubmitButton
            idleLabel="Thu thập từ mọi nguồn đang bật"
            variant="default"
            size="default"
          />
        </AdminActionForm>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Hàng chờ duyệt</h2>
            <AdminActionForm action={purgeExpiredCrawlQueueAction}>
              <input type="hidden" name="mode" value="superseded" />
              <Button type="submit" variant="outline" size="sm">
                Dọn văn bản đã thay thế
              </Button>
            </AdminActionForm>
          </div>
          {data.items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                Chưa có mục thu thập nào cần duyệt.
              </CardContent>
            </Card>
          ) : (
            <CrawlReviewQueue items={data.items} />
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
              <AdminActionForm action={crawlManualUrlAction} className="space-y-3">
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
                <CrawlSubmitButton
                  idleLabel="Tải về và đưa vào hàng chờ"
                  pendingLabel="Đang tải…"
                  fullWidth
                  variant="default"
                  size="default"
                />
              </AdminActionForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nguồn thu thập</CardTitle>
              <CardDescription>
                Chỉ nguồn BHXH/BHYT/BHTN, lao động và quyền lợi người lao động. Bật/tắt hoặc
                chạy từng nguồn.
              </CardDescription>
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
                    <SaveActivateForm action={toggleCrawlSourceAction}>
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
                    </SaveActivateForm>
                  </div>
                  <AdminActionForm action={runCrawlForSourceAction}>
                    <input type="hidden" name="sourceId" value={source.id} />
                    <CrawlSubmitButton idleLabel="Thu thập từ nguồn này" />
                  </AdminActionForm>
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
                  <SaveActivateForm
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
                  </SaveActivateForm>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
