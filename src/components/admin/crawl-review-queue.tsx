"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { bulkReviewCrawlItemsAction } from "@/app/admin/legal-crawler/actions";
import { CrawlReviewActions } from "@/components/admin/crawl-review-actions";
import { ActionToast } from "@/components/ui/action-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BULK_CRAWL_REVIEW_MAX } from "@/lib/services/crawl-review.service";

const CRAWL_STATUS_VI: Record<string, string> = {
  NEW: "Mới",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  ARCHIVED: "Đã lưu trữ",
};

const TOAST_MS = 2500;

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

type CrawlReviewQueueProps = {
  items: CrawlAdminItemRow[];
};

export function CrawlReviewQueue({ items }: CrawlReviewQueueProps) {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleItems = items.filter((item) => !hiddenIds.has(item.id));
  const allVisibleSelected =
    visibleItems.length > 0 &&
    visibleItems.every((item) => selected.has(item.id));

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(
    () => () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    },
    [],
  );

  const scheduleRefresh = () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      router.refresh();
      refreshTimerRef.current = null;
    }, 2500);
  };

  const toggleItem = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= BULK_CRAWL_REVIEW_MAX) return prev;
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(visibleItems.slice(0, BULK_CRAWL_REVIEW_MAX).map((i) => i.id)));
  };

  const runBulk = (bulkAction: "approve" | "reject" | "archive") => {
    if (selected.size === 0) return;
    setError(null);
    const formData = new FormData();
    for (const id of selected) {
      formData.append("itemIds", id);
    }
    formData.set("bulkAction", bulkAction);
    formData.set("impactLevel", "MEDIUM");
    formData.append("affectedGroups", "HR");

    startTransition(async () => {
      try {
        const feedback = await bulkReviewCrawlItemsAction(formData);
        setToast(feedback.message);
        if (feedback.variant === "error") {
          setError(feedback.message);
        } else {
          setHiddenIds((prev) => new Set([...prev, ...selected]));
          setSelected(new Set());
          scheduleRefresh();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thực hiện được thao tác.",
        );
      }
    });
  };

  if (visibleItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Chưa có mục thu thập nào cần duyệt.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ActionToast visible={Boolean(toast)} message={toast ?? "Đã lưu"} />
      <div className="sticky top-16 z-10 mb-4 space-y-3 rounded-lg border bg-background/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAll}
              disabled={pending}
            />
            Chọn tất cả ({visibleItems.length})
          </label>
          {selected.size > 0 ? (
            <Badge variant="secondary">{selected.size} đã chọn</Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pending || selected.size === 0}
            onClick={() => runBulk("approve")}
          >
            {pending ? "Đang xử lý…" : `Duyệt ${selected.size || ""} mục`}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || selected.size === 0}
            onClick={() => runBulk("reject")}
          >
            Từ chối hàng loạt
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending || selected.size === 0}
            onClick={() => runBulk("archive")}
          >
            Lưu trữ hàng loạt
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Duyệt/từ chối tối đa {BULK_CRAWL_REVIEW_MAX} mục trong một lần — một
          thao tác server, tránh Turnstile.
        </p>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {visibleItems.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.has(item.id)}
                  onChange={(event) => toggleItem(item.id, event.target.checked)}
                  disabled={pending}
                  aria-label={`Chọn ${item.title}`}
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{item.sourceName}</Badge>
                    <Badge>{CRAWL_STATUS_VI[item.status] ?? item.status}</Badge>
                    {item.legalDocumentType ? (
                      <Badge variant="secondary">{item.legalDocumentType}</Badge>
                    ) : null}
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {item.title}
                  </CardTitle>
                  <CardDescription>
                    Thu thập lúc {formatDate(item.crawledAt)}
                    {item.documentNumber ? ` · ${item.documentNumber}` : ""}
                  </CardDescription>
                </div>
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
            <CrawlReviewActions itemId={item.id} />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
