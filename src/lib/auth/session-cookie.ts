import { getSessionSecret } from "@/lib/security/session-secret";
import { timingSafeEqualString } from "@/lib/security/timing-safe-equal";

export const CMS_SESSION_COOKIE = "cms_session";
export const CMS_SESSION_MAX_AGE_SEC = 60 * 60 * 12; // 12h

export type SessionCookiePayload = {
  sessionId: string;
  userId: string;
  role: string;
  exp: number;
};

const textEncoder = new TextEncoder();

function sessionSecret(): string {
  return getSessionSecret();
}

function toBase64Url(data: Uint8Array | ArrayBuffer): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSha256Base64Url(
  secret: string,
  message: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, textEncoder.encode(message));
  return toBase64Url(sig);
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", textEncoder.encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createRawSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function hashSessionToken(token: string): Promise<string> {
  return sha256Hex(token);
}

export async function signSessionPayload(
  payload: SessionCookiePayload,
): Promise<string> {
  const body = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const sig = await hmacSha256Base64Url(sessionSecret(), body);
  return `${body}.${sig}`;
}

export async function verifySessionPayload(
  signed: string,
): Promise<SessionCookiePayload | null> {
  const [body, sig] = signed.split(".");
  if (!body || !sig) return null;
  const expected = await hmacSha256Base64Url(sessionSecret(), body);
  if (!timingSafeEqualString(sig, expected)) return null;
  try {
    const decoded = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(decoded) as SessionCookiePayload;
    if (!payload.sessionId || !payload.userId || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
