import { Suspense } from "react";
import { EmployeePortalHeader } from "@/components/hr/employee-portal-header";
import { EmployeeLoginForm } from "@/components/hr/employee-login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập nhân viên",
  description: "Đăng nhập Cổng HR FPT Telecom bằng email công ty và mã OTP.",
};

export default function EmployeeLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[linear-gradient(180deg,hsl(var(--sidebar))_0%,hsl(214_72%_20%)_42%,hsl(var(--background))_100%)]">
      <EmployeePortalHeader />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-6 text-center text-[hsl(var(--sidebar-foreground))] sm:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Chào mừng trở lại
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Dùng email công ty để nhận mã OTP và truy cập self-service HR.
          </p>
        </div>
        <Suspense fallback={<p className="text-center text-sm">Đang tải…</p>}>
          <EmployeeLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
