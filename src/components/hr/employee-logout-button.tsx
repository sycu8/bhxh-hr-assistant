"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EmployeeLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/v1/auth/otp/verify", { method: "DELETE" });
          router.push("/login");
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Đang đăng xuất…" : "Đăng xuất"}
    </Button>
  );
}
