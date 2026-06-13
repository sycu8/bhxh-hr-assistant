"use client";

import { Archive, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  approveCrawlItemAction,
  archiveCrawlItemAction,
  rejectCrawlItemAction,
} from "@/app/admin/legal-crawler/actions";
import { ActionToast } from "@/components/ui/action-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TOAST_MS = 1500;

const IMPACT_LABEL_VI: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
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
const affectedGroups = [
  "EMPLOYEE",
  "HR",
  "EMPLOYER",
  "PROBATION",
  "OFFICIAL",
  "MANAGER",
] as const;

type CrawlReviewActionsProps = {
  itemId: string;
};

export function CrawlReviewActions({ itemId }: CrawlReviewActionsProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(
    () => () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    },
    [],
  );

  const scheduleRefresh = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      router.refresh();
      refreshTimerRef.current = null;
    }, 2500);
  };

  const runAction = (
    action: (formData: FormData) => Promise<void>,
    successMessage: string,
  ) => {
    const form = formRef.current;
    if (!form) return;
    setError(null);
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await action(formData);
        setHidden(true);
        setToast(successMessage);
        scheduleRefresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thực hiện được thao tác.",
        );
      }
    });
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <ActionToast visible={Boolean(toast)} message={toast ?? "Lưu thành công"} />
      <form
        ref={formRef}
        className="space-y-4 rounded-md border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          runAction(approveCrawlItemAction, "Đã duyệt và xuất bản");
        }}
      >
        <input type="hidden" name="itemId" value={itemId} />
        <div className="grid gap-3 md:grid-cols-[160px_1fr]">
          <label className="text-sm font-medium" htmlFor={`impact-${itemId}`}>
            Mức ảnh hưởng
          </label>
          <select
            id={`impact-${itemId}`}
            name="impactLevel"
            defaultValue="MEDIUM"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            disabled={pending}
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
                  disabled={pending}
                />
                {GROUP_LABEL_VI[group] ?? group}
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="hrActionRequired" disabled={pending} />
          Cần HR/C&amp;B xử lý
        </label>
        <Input
          name="hrActionSummary"
          placeholder="Tóm tắt việc HR cần làm, nếu có"
          disabled={pending}
        />
        <Input name="note" placeholder="Ghi chú duyệt" disabled={pending} />
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {pending ? "Đang xử lý…" : "Duyệt và xuất bản"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => runAction(rejectCrawlItemAction, "Đã từ chối")}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Từ chối
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => runAction(archiveCrawlItemAction, "Đã lưu trữ")}
          >
            <Archive className="mr-2 h-4 w-4" />
            Lưu trữ
          </Button>
        </div>
      </form>
    </>
  );
}
