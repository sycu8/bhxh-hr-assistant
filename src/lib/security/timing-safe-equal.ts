const textEncoder = new TextEncoder();

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (x: ArrayBufferView, y: ArrayBufferView) => boolean;
  };
  if (typeof subtle.timingSafeEqual === "function") {
    return subtle.timingSafeEqual(a, b);
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

/** So sánh chuỗi constant-time (tránh timing attack trên HMAC/bearer). */
export function timingSafeEqualString(a: string, b: string): boolean {
  const aa = textEncoder.encode(a);
  const bb = textEncoder.encode(b);
  return timingSafeEqualBytes(aa, bb);
}

/** So sánh Bearer token với secret đã cấu hình. */
export function verifyBearerToken(
  authorizationHeader: string | null,
  secret: string | undefined,
): boolean {
  if (!secret?.trim()) return false;
  const header = authorizationHeader?.trim() ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const token = header.slice(prefix.length);
  return timingSafeEqualString(token, secret.trim());
}
