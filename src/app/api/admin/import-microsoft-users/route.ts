import { assertCronAuthorized } from "@/lib/api/cron-auth";
import { ApiError } from "@/lib/api/errors";
import { withApiHandler, ok } from "@/lib/api/response";
import { importMicrosoftUserExportCsv } from "@/lib/services/hris-sync.service";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  assertCronAuthorized(req);

  const contentType = req.headers.get("content-type") ?? "";
  let csvContent: string;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw ApiError.badRequest("Thiếu file CSV (field: file).");
    }
    csvContent = await file.text();
  } else if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
    csvContent = await req.text();
  } else {
    throw ApiError.badRequest(
      "Gửi file CSV qua multipart/form-data (file) hoặc text/csv body.",
    );
  }

  const result = await importMicrosoftUserExportCsv(csvContent);
  return ok(result);
});
