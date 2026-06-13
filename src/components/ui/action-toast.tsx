"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActionToastVariant = "success" | "error";

export function ActionToast({
  visible,
  message = "Lưu thành công",
  variant = "success",
}: {
  visible: boolean;
  message?: string;
  variant?: ActionToastVariant;
}) {
  if (!visible) return null;

  const isError = variant === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2",
        "flex max-w-[min(90vw,28rem)] items-center gap-2 rounded-lg border bg-background px-4 py-3",
        "text-sm font-medium text-foreground shadow-lg ring-1 ring-black/5",
        isError ? "border-red-200" : "border-emerald-200",
      )}
    >
      {isError ? (
        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      )}
      {message}
    </div>
  );
}
