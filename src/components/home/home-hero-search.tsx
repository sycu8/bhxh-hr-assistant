"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeHeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const submit = () => {
    const q = value.trim();
    if (q.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Card className="mx-auto max-w-3xl border-border/80 shadow-md">
      <CardContent className="p-2 sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Nhập câu hỏi hoặc từ khóa — ví dụ: đóng BHXH khi nghỉ việc giữa tháng"
              className="h-12 border-0 bg-muted/40 pl-11 pr-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-ring sm:h-14"
              aria-label="Ô tìm kiếm trang chủ"
            />
          </div>
          <Button
            type="button"
            variant="cta"
            size="touch"
            className="w-full shrink-0 sm:w-auto"
            onClick={submit}
          >
            <Search className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Tra cứu</span>
            <span className="sm:hidden">Tìm</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
