export class UnsafeOutboundUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeOutboundUrlError";
  }
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "169.254.169.254",
]);

/** IPv4 private/link-local ranges — chặn SSRF tới mạng nội bộ. */
function isBlockedIpv4(host: string): boolean {
  const parts = host.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export type SafeOutboundUrlOptions = {
  /** Chỉ cho phép hostname khớp suffix (vd. nguồn crawl). */
  allowedHostSuffix?: string;
};

export function assertSafeOutboundUrl(
  input: string,
  options: SafeOutboundUrlOptions = {},
): URL {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new UnsafeOutboundUrlError("URL không hợp lệ.");
  }

  if (url.protocol !== "https:") {
    throw new UnsafeOutboundUrlError("Chỉ cho phép URL HTTPS.");
  }

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || isBlockedIpv4(hostname)) {
    throw new UnsafeOutboundUrlError("URL nội bộ hoặc metadata bị chặn.");
  }

  if (url.username || url.password) {
    throw new UnsafeOutboundUrlError("URL không được chứa thông tin đăng nhập.");
  }

  if (options.allowedHostSuffix) {
    const suffix = options.allowedHostSuffix.toLowerCase().replace(/^\./, "");
    const allowed =
      hostname === suffix || hostname.endsWith(`.${suffix}`);
    if (!allowed) {
      throw new UnsafeOutboundUrlError(
        `URL phải thuộc miền ${options.allowedHostSuffix}.`,
      );
    }
  }

  return url;
}
