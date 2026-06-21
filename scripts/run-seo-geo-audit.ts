#!/usr/bin/env tsx
/**
 * SEO/GEO audit + priority-query benchmark (simulates search + AI crawlers).
 */
import { spawn, execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  auditHtmlPage,
  auditQueryBenchmark,
  auditRobotsTxt,
  auditSitemapXml,
  rankFindings,
  resolveQuerySlugForBenchmark,
  type AuditFinding,
} from "../src/lib/seo/audit-checks";
import { PRIORITY_QUERIES } from "../src/lib/seo/priority-queries";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(process.env.SEO_BENCH_PORT ?? "3197");
const base = `http://127.0.0.1:${port}`;

function freePort() {
  try {
    execSync(
      `fuser -k ${port}/tcp 2>/dev/null || lsof -ti:${port} | xargs kill -9 2>/dev/null || true`,
      { stdio: "ignore", shell: "/bin/bash" },
    );
  } catch {
    // ignore
  }
}

function startServer() {
  freePort();
  return spawn(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["exec", "next", "start", "-H", "127.0.0.1", "-p", String(port)],
    { cwd: root, stdio: "pipe", env: process.env },
  );
}

async function waitForServer(maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${base}/robots.txt`);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function fetchText(route: string) {
  const res = await fetch(`${base}${route}`, {
    headers: { "Cache-Control": "no-cache" },
    redirect: "follow",
  });
  return { status: res.status, html: await res.text() };
}

async function main() {
  if (!process.env.SEO_SKIP_BUILD) {
    console.log("Building…");
    execSync("pnpm build", { cwd: root, stdio: "inherit" });
  }

  console.log(`Starting server ${base}…`);
  const server = startServer();
  if (!(await waitForServer())) {
    server.kill("SIGTERM");
    console.error("Server failed to start");
    process.exit(1);
  }

  const findings: AuditFinding[] = [];

  const robots = await fetchText("/robots.txt");
  findings.push(...auditRobotsTxt(robots.html));

  const sitemap = await fetchText("/sitemap.xml");
  findings.push(
    ...auditSitemapXml(sitemap.html, [
      "/search",
      "/hoi-dap",
      "/hoi-dap/bat-buoc-tham-gia-bhxh",
      "/legal-updates",
    ]),
  );

  for (const q of PRIORITY_QUERIES) {
    const resolvedSlug = resolveQuerySlugForBenchmark(q.query);
    const page = await fetchText(`/hoi-dap/${q.expectedSlug}`);
    findings.push(
      ...auditQueryBenchmark({
        query: q,
        html: page.html,
        status: page.status,
        resolvedSlug,
      }),
    );
  }

  for (const p of ["/", "/search", "/hoi-dap"]) {
    const page = await fetchText(p);
    findings.push(...auditHtmlPage({ path: p, html: page.html, status: page.status }));
  }

  const home = await fetchText("/");
  if (!home.html.includes('"@type":"WebSite"') && !home.html.includes('"@type": "WebSite"')) {
    findings.push({
      id: "layout-website-jsonld",
      area: "structured-data",
      severity: "high",
      message: "Layout missing WebSite JSON-LD on all pages",
      path: "/",
    });
  }

  server.kill("SIGTERM");

  const ranked = rankFindings(findings);
  const critical = ranked.filter((f) => f.severity === "critical");
  const high = ranked.filter((f) => f.severity === "high");

  const report = {
    measuredAt: new Date().toISOString(),
    base,
    engines: ["google-crawl-sim", "bing-crawl-sim", "ai-answer-sim"],
    summary: {
      totalFindings: ranked.length,
      critical: critical.length,
      high: high.length,
      pass: critical.length === 0 && high.length === 0,
    },
    priorityQueries: PRIORITY_QUERIES.length,
    findings: ranked,
  };

  const out = path.join(root, "docs/seo-geo-audit.json");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `\nFindings: ${ranked.length} (critical=${critical.length}, high=${high.length})`,
  );
  for (const f of ranked) {
    console.log(`[${f.severity}] ${f.area}: ${f.message}`);
  }
  console.log(`\nReport: ${out}`);

  process.exit(report.summary.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
