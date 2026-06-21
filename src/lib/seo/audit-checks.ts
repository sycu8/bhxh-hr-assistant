import type { PriorityQuery } from "@/lib/seo/priority-queries";
import { searchCuratedFaqs } from "@/lib/faq/curated-faq-search";
import { priorityQueryPath } from "@/lib/seo/priority-queries";

export type AuditSeverity = "critical" | "high" | "medium" | "low";

export type AuditFinding = {
  id: string;
  area:
    | "crawlability"
    | "indexation"
    | "page-intent"
    | "titles"
    | "internal-links"
    | "structured-data"
    | "citations"
    | "answer-first";
  severity: AuditSeverity;
  message: string;
  path?: string;
  queryId?: string;
};

export type HtmlPageAuditInput = {
  path: string;
  html: string;
  status: number;
};

export type QueryBenchmarkInput = {
  query: PriorityQuery;
  html: string;
  status: number;
  resolvedSlug: string | null;
};

const IMPACT_ORDER: Record<AuditSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function rankFindings(findings: AuditFinding[]): AuditFinding[] {
  return [...findings].sort(
    (a, b) => IMPACT_ORDER[b.severity] - IMPACT_ORDER[a.severity],
  );
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1]!.trim()));
    } catch {
      // ignore malformed
    }
  }
  return blocks.flatMap((b) => (Array.isArray(b) ? b : [b]));
}

function hasSchemaType(blocks: unknown[], type: string): boolean {
  return blocks.some((b) => {
    if (!b || typeof b !== "object") return false;
    const t = (b as Record<string, unknown>)["@type"];
    if (t === type) return true;
    if (Array.isArray(t) && t.includes(type)) return true;
    return false;
  });
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function auditHtmlPage(input: HtmlPageAuditInput): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const { path, html, status } = input;

  if (status >= 500) {
    findings.push({
      id: `http-${path}`,
      area: "crawlability",
      severity: "critical",
      message: `HTTP ${status} — crawler cannot index`,
      path,
    });
    return findings;
  }

  if (status >= 400 && status !== 404) {
    findings.push({
      id: `http-${path}`,
      area: "crawlability",
      severity: "high",
      message: `HTTP ${status}`,
      path,
    });
  }

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!titleMatch?.[1]?.trim()) {
    findings.push({
      id: `title-missing-${path}`,
      area: "titles",
      severity: "high",
      message: "Missing <title>",
      path,
    });
  }

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match?.[1]?.trim()) {
    findings.push({
      id: `h1-missing-${path}`,
      area: "page-intent",
      severity: "high",
      message: "Missing H1 — unclear page intent",
      path,
    });
  }

  if (path.startsWith("/hoi-dap/") && path !== "/hoi-dap") {
    const jsonLd = extractJsonLdBlocks(html);
    if (!hasSchemaType(jsonLd, "FAQPage")) {
      findings.push({
        id: `faq-jsonld-${path}`,
        area: "structured-data",
        severity: "critical",
        message: "FAQ detail missing FAQPage JSON-LD (GEO/AI citation gap)",
        path,
      });
    }
    const text = stripTags(html);
    if (!text.includes("Trả lời ngắn") && !text.includes("Nguồn tham chiếu")) {
      findings.push({
        id: `faq-answer-first-${path}`,
        area: "answer-first",
        severity: "high",
        message: "FAQ page missing answer-first block labels",
        path,
      });
    }
    if (!text.includes("Mở liên kết nguồn") && !html.includes("sourceUrl")) {
      findings.push({
        id: `faq-citations-${path}`,
        area: "citations",
        severity: "medium",
        message: "FAQ page may lack visible source citations",
        path,
      });
    }
  }

  if (path.startsWith("/faq/")) {
    const canonical = html.match(
      /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
    );
    const expected = `/hoi-dap/${path.replace("/faq/", "")}`;
    if (
      !canonical?.[1]?.includes(expected.replace(/^\//, "")) &&
      !canonical?.[1]?.endsWith(expected)
    ) {
      findings.push({
        id: `faq-canonical-${path}`,
        area: "indexation",
        severity: "high",
        message: `/faq/* should canonical to /hoi-dap/* to avoid duplicate indexation`,
        path,
      });
    }
  }

  return findings;
}

export function auditQueryBenchmark(input: QueryBenchmarkInput): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const { query, html, status, resolvedSlug } = input;
  const expectedPath = priorityQueryPath(query.expectedSlug);

  if (resolvedSlug !== query.expectedSlug) {
    findings.push({
      id: `query-map-${query.id}`,
      area: "page-intent",
      severity: "critical",
      message: `Query "${query.query}" maps to ${resolvedSlug ?? "null"}, expected ${query.expectedSlug}`,
      queryId: query.id,
      path: expectedPath,
    });
  }

  if (status >= 400) {
    findings.push({
      id: `query-http-${query.id}`,
      area: "crawlability",
      severity: "critical",
      message: `Answer page ${expectedPath} returned HTTP ${status}`,
      queryId: query.id,
      path: expectedPath,
    });
    return findings;
  }

  const text = stripTags(html);
  if (!text.toLocaleLowerCase("vi-VN").includes(query.answerSnippet.toLocaleLowerCase("vi-VN"))) {
    findings.push({
      id: `query-answer-${query.id}`,
      area: "answer-first",
      severity: "high",
      message: `Answer snippet "${query.answerSnippet}" not found for query "${query.query}"`,
      queryId: query.id,
      path: expectedPath,
    });
  }

  const jsonLd = extractJsonLdBlocks(html);
  if (!hasSchemaType(jsonLd, "FAQPage")) {
    findings.push({
      id: `query-jsonld-${query.id}`,
      area: "structured-data",
      severity: "critical",
      message: `Priority query "${query.query}" target lacks FAQPage JSON-LD`,
      queryId: query.id,
      path: expectedPath,
    });
  }

  return findings;
}

export function resolveQuerySlugForBenchmark(query: string): string | null {
  const hits = searchCuratedFaqs({ query, take: 1 });
  return hits[0]?.faq.slug ?? null;
}

export function auditRobotsTxt(body: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  if (!/Disallow:\s*\/admin/i.test(body)) {
    findings.push({
      id: "robots-admin",
      area: "crawlability",
      severity: "critical",
      message: "robots.txt must disallow /admin",
    });
  }
  if (!/Sitemap:/i.test(body)) {
    findings.push({
      id: "robots-sitemap",
      area: "indexation",
      severity: "critical",
      message: "robots.txt missing Sitemap directive",
    });
  }
  return findings;
}

export function auditSitemapXml(body: string, requiredPaths: string[]): AuditFinding[] {
  const findings: AuditFinding[] = [];
  for (const p of requiredPaths) {
    if (!body.includes(p)) {
      findings.push({
        id: `sitemap-missing-${p}`,
        area: "indexation",
        severity: "high",
        message: `Sitemap missing ${p}`,
        path: p,
      });
    }
  }
  if (body.includes("/admin")) {
    findings.push({
      id: "sitemap-admin",
      area: "indexation",
      severity: "critical",
      message: "Sitemap must not include /admin",
    });
  }
  return findings;
}
