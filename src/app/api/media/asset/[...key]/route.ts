import { failFromApiError, failInternal } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { getOptionalMediaBucket } from "@/lib/media/media-bucket";

export const runtime = "nodejs";

function assertSafeR2Key(segments: string[]): string {
  const key = segments.join("/");
  if (!key.startsWith("media/")) {
    throw ApiError.forbidden("Chỉ cho phép đọc key có tiền tố media/.");
  }
  if (segments.some((s) => s === ".." || s === "")) {
    throw ApiError.badRequest("Key không hợp lệ.");
  }
  return key;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key?: string[] }> },
): Promise<Response> {
  try {
    const bucket = getOptionalMediaBucket();
    if (!bucket) {
      throw ApiError.serviceUnavailable("R2 không khả dụng.");
    }
    const { key: keyParts } = await ctx.params;
    const segments = keyParts ?? [];
    const objectKey = assertSafeR2Key(segments);

    const obj = await bucket.get(objectKey);
    if (!obj?.body) {
      throw ApiError.notFound("Không có file trong R2.");
    }

    const ct = obj.httpMetadata?.contentType ?? "application/octet-stream";

    return new Response(obj.body as unknown as ReadableStream, {
      status: 200,
      headers: {
        "content-type": ct,
        "cache-control": "public, max-age=86400, immutable",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return failFromApiError(e);
    console.error(e);
    return failInternal();
  }
}
