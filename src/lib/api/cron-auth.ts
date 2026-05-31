import { ApiError } from "@/lib/api/errors";
import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";

export function assertCronAuthorized(req: Request) {
  const env = tryGetCloudflareEnv();
  const secret =
    env?.CACHE_REVALIDATE_SECRET ?? process.env.CACHE_REVALIDATE_SECRET;
  if (!secret) {
    throw ApiError.serviceUnavailable(
      "Chưa cấu hình CACHE_REVALIDATE_SECRET cho cron.",
    );
  }
  if (req.headers.get("authorization")?.trim() !== `Bearer ${secret}`) {
    throw ApiError.unauthorized("Token cron không hợp lệ.");
  }
}
