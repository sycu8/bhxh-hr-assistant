import { assertCronAuthorized } from "@/lib/api/cron-auth";
import { withApiHandler, ok } from "@/lib/api/response";
import { runFullHrisSync } from "@/lib/services/hris-sync.service";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  assertCronAuthorized(req);
  const result = await runFullHrisSync();
  return ok(result);
});
