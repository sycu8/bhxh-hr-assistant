import { assertCronAuthorized } from "@/lib/api/cron-auth";
import { withApiHandler, ok } from "@/lib/api/response";
import { applyHrPortalSchemaSync } from "@/lib/db/apply-hr-portal-schema";

export const runtime = "nodejs";

/** Đồng bộ schema HR portal (cột User.managerId, OtpCode, …). Chạy một lần sau deploy HR. */
export const POST = withApiHandler(async (req: Request) => {
  assertCronAuthorized(req);
  const result = await applyHrPortalSchemaSync();
  return ok(result);
});
