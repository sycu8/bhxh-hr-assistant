"use client";

import { Play } from "lucide-react";
import { useAdminActionPending } from "@/components/admin/admin-action-form";
import { Button } from "@/components/ui/button";

type CrawlSubmitButtonProps = {
  idleLabel: string;
  pendingLabel?: string;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
};

export function CrawlSubmitButton({
  idleLabel,
  pendingLabel = "Đang thu thập…",
  className,
  variant = "outline",
  size = "sm",
  fullWidth = false,
}: CrawlSubmitButtonProps) {
  const pending = useAdminActionPending();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={fullWidth ? `w-full ${className ?? ""}` : className}
      disabled={pending}
    >
      <Play className="mr-2 h-4 w-4" />
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
