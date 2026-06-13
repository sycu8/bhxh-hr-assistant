import { ApiError } from "@/lib/api/errors";
import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";
import { getClientIp } from "@/lib/security/request-client-ip";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function turnstileSecret(): string | undefined {
  const env = tryGetCloudflareEnv();
  return (
    env?.TURNSTILE_SECRET_KEY?.trim() ||
    process.env.TURNSTILE_SECRET_KEY?.trim() ||
    undefined
  );
}

/** Bật xác minh server khi đã cấu hình secret. */
export function isTurnstileVerificationRequired(): boolean {
  return Boolean(turnstileSecret());
}

export function readTurnstileTokenFromBody(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const value = (raw as Record<string, unknown>).turnstileToken;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

type SiteVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  action?: string;
  hostname?: string;
};

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = turnstileSecret();
  if (!secret) return true;

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  const res = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) return false;

  const json = (await res.json()) as SiteVerifyResponse;
  return json.success === true;
}

/** Ném ApiError khi Turnstile bắt buộc nhưng token thiếu/không hợp lệ. */
export async function assertTurnstileVerified(
  req: Request,
  token: string | undefined,
): Promise<void> {
  if (!isTurnstileVerificationRequired()) return;

  if (!token) {
    throw ApiError.badRequest(
      "Vui lòng hoàn thành xác minh Turnstile trước khi gửi.",
    );
  }

  const ok = await verifyTurnstileToken(token, getClientIp(req));
  if (!ok) {
    throw ApiError.forbidden(
      "Xác minh Turnstile không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
    );
  }
}
