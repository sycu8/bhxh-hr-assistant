const DEFAULT_SITE_URL = "https://vn-insurance-fti.sycu-lee.workers.dev";

/** URL gốc của site (không slash cuối). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.CRON_WORKER_BASE_URL?.trim() ||
    DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
