import type { RateLimitKv } from "@/lib/security/kv-rate-limit";

/** Adapt Cloudflare KVNamespace to the narrow RateLimitKv interface. */
export function asRateLimitKv(
  kv: KVNamespace | undefined,
): RateLimitKv | undefined {
  if (!kv) return undefined;
  return {
    get: async (key) => {
      const value = await kv.get(key, "text");
      return typeof value === "string" ? value : null;
    },
    put: (key, value, options) => kv.put(key, value, options),
  };
}
