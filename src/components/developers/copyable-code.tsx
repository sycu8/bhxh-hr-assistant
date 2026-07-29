"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

type CopyableCodeProps = {
  code: string;
  label?: string;
};

export function CopyableCode({ code, label = "Sao chép" }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [code]);

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed text-foreground sm:text-sm">
        <code>{code}</code>
      </pre>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute right-2 top-2 h-8 bg-background/90 text-xs"
        onClick={onCopy}
      >
        {copied ? "Đã sao chép" : label}
      </Button>
    </div>
  );
}
