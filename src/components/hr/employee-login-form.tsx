"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { parseJsonResponse } from "@/lib/api/parse-json-response";
import {
  TurnstileWidget,
  isTurnstileRequiredOnClient,
  type TurnstileWidgetHandle,
} from "@/components/security/turnstile-widget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function EmployeeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/my-hr/profile";
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileRequired = isTurnstileRequiredOnClient();

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnstileRequired && !turnstileToken) {
      setError("Vui lòng hoàn thành xác minh Turnstile.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      const json = (await parseJsonResponse(res)) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Không gửi được mã OTP.");
      }
      setStep("otp");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setError(err instanceof Error ? err.message : "Không gửi được mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnstileRequired && !turnstileToken) {
      setError("Vui lòng hoàn thành xác minh Turnstile.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      const json = (await parseJsonResponse(res)) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Mã OTP không đúng.");
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setError(err instanceof Error ? err.message : "Mã OTP không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Đăng nhập nhân viên</CardTitle>
        <CardDescription>
          Dùng email công ty để nhận mã OTP và truy cập hồ sơ, nghỉ phép, phiếu
          lương.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email công ty
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="ten.ban@fpt.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <TurnstileWidget
              ref={turnstileRef}
              action="employee_login"
              onToken={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              className="flex justify-center"
            />
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || (turnstileRequired && !turnstileToken)}
            >
              {loading ? "Đang gửi mã…" : "Gửi mã OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mã OTP đã gửi tới <strong>{email}</strong>
            </p>
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Mã OTP
              </label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <TurnstileWidget
              ref={turnstileRef}
              action="employee_otp_verify"
              onToken={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              className="flex justify-center"
            />
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || (turnstileRequired && !turnstileToken)}
            >
              {loading ? "Đang xác minh…" : "Đăng nhập"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
            >
              Đổi email
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            ← Về trang chủ
          </Link>
          {" · "}
          <Link href="/admin/login" className="underline-offset-4 hover:underline">
            CMS HR/Admin
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
