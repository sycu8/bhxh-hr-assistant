import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api/errors";
import { openAiGenerateImageUrl } from "@/lib/media/openai-image-generate";
import { optimizeImageFetchUrl, guessExtensionFromContentType } from "@/lib/media/optimize-fetch-url";
import type { R2Bucket } from "@/lib/media/media-bucket";
import { unsplashSearchPhotoUrls } from "@/lib/media/unsplash-search";
import type { MediaIngestBody } from "@/lib/validators/media-ingest.schema";

export type IngestedAsset = {
  key: string;
  publicPath: string;
  bytes: number;
  contentType: string;
  title?: string;
};

export class MediaIngestService {
  constructor(
    private readonly bucket: R2Bucket,
    private readonly secrets: {
      unsplashAccessKey?: string;
      openaiApiKey?: string;
    },
  ) {}

  async ingest(body: MediaIngestBody): Promise<IngestedAsset[]> {
    const maxW = body.maxWidth;
    const urls: Array<{ url: string; title?: string; prefix: string }> = [];

    if (body.mode === "url") {
      urls.push({ url: body.sourceUrl!, title: "remote", prefix: "url" });
    } else if (body.mode === "search") {
      const key = this.secrets.unsplashAccessKey;
      if (!key) {
        throw ApiError.serviceUnavailable(
          "Chưa cấu hình UNSPLASH_ACCESS_KEY (wrangler secret) để tìm ảnh.",
        );
      }
      const hits = await unsplashSearchPhotoUrls(key, body.query!, body.limit);
      for (const h of hits) {
        if (!h.downloadUrl) continue;
        urls.push({
          url: h.downloadUrl,
          title: h.title,
          prefix: `search/${h.id}`,
        });
      }
    } else {
      const key = this.secrets.openaiApiKey;
      if (!key) {
        throw ApiError.serviceUnavailable(
          "Chưa cấu hình OPENAI_API_KEY (wrangler secret) để generate ảnh.",
        );
      }
      const gen = await openAiGenerateImageUrl(key, body.prompt!);
      urls.push({
        url: gen.url,
        title: gen.revisedPrompt ?? body.prompt!,
        prefix: "gen",
      });
    }

    const out: IngestedAsset[] = [];
    for (const item of urls) {
      const fetchUrl = optimizeImageFetchUrl(item.url, maxW);
      const imgRes = await fetch(fetchUrl);
      if (!imgRes.ok) {
        throw ApiError.internal(`Không tải được ảnh nguồn (${imgRes.status}).`);
      }
      const buf = await imgRes.arrayBuffer();
      const ct =
        imgRes.headers.get("content-type") ?? "application/octet-stream";
      const ext = guessExtensionFromContentType(ct);
      const id = randomUUID();
      const safePrefix = item.prefix.replace(/[^a-zA-Z0-9/_-]/g, "_").slice(0, 80);
      const key = `media/${safePrefix}-${id}.${ext}`;

      await this.bucket.put(key, buf, {
        httpMetadata: {
          contentType: ct,
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: {
          sourceMode: body.mode,
          title: (item.title ?? "").slice(0, 500),
        },
      });

      out.push({
        key,
        publicPath: `/api/media/asset/${key}`,
        bytes: buf.byteLength,
        contentType: ct,
        title: item.title,
      });
    }

    return out;
  }
}
