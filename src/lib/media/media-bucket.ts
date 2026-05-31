import { getCloudflareContext } from "@opennextjs/cloudflare";

type R2HttpMetadata = { contentType?: string; cacheControl?: string };
type R2PutOptions = {
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
};
type R2ObjectBody = { arrayBuffer(): Promise<ArrayBuffer> };
export type R2Object = {
  body: R2ObjectBody | null;
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
  size: number;
};
export type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string | ReadableStream | Blob | null,
    options?: R2PutOptions,
  ): Promise<unknown>;
  get(key: string): Promise<R2Object | null>;
  head(key: string): Promise<R2Object | null>;
};

export type MediaWorkerEnv = {
  MEDIA_BUCKET?: R2Bucket;
  MEDIA_INGEST_TOKEN?: string;
  UNSPLASH_ACCESS_KEY?: string;
  OPENAI_API_KEY?: string;
  MEDIA_DEFAULT_MAX_WIDTH?: string;
};

export function getOptionalMediaBucket(): R2Bucket | null {
  try {
    const { env } = getCloudflareContext();
    const e = env as MediaWorkerEnv;
    return e.MEDIA_BUCKET ?? null;
  } catch {
    return null;
  }
}

export function getMediaWorkerEnv(): MediaWorkerEnv {
  const { env } = getCloudflareContext();
  return env as MediaWorkerEnv;
}
