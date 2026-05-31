import { assertCronAuthorized } from "@/lib/api/cron-auth";
import { ok, withApiHandler } from "@/lib/api/response";
import { runScheduledOfficialSourcesCrawl } from "@/lib/crawl/crawl-runtime";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Quét nguồn chính thống theo lịch (Cloudflare Cron 06:00 ICT).
 * Authorization: Bearer <CACHE_REVALIDATE_SECRET>
 */
export const POST = withApiHandler(async (req: Request) => {
  assertCronAuthorized(req);
  const result = await runScheduledOfficialSourcesCrawl();
  return ok(result);
});
