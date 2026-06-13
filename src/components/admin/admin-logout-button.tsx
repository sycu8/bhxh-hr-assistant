"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="mt-4 w-full justify-start px-3 text-muted-foreground"
      onClick={async () => {
        await fetch("/api/auth/login", { method: "DELETE" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Đăng xuất
    </Button>
  );
}
