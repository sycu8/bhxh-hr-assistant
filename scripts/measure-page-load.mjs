#!/usr/bin/env node
/**
 * Repeatable page-load benchmark: server response time (TTFB proxy) per route.
 * Same conditions: production `next start`, warm-up then N timed GETs.
 */
import { spawn, execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const port = Number(process.env.BENCH_PORT ?? "3198");
const host = "127.0.0.1";
const base = `http://${host}:${port}`;
const targetMs = Number(process.env.BENCH_TARGET_MS ?? "50");
const samples = Number(process.env.BENCH_SAMPLES ?? "3");
const warmup = Number(process.env.BENCH_WARMUP ?? "1");

function loadAllRoutes() {
  const raw = execSync("pnpm exec tsx scripts/list-all-page-routes.ts", {
    cwd: root,
    encoding: "utf8",
  });
  return JSON.parse(raw.trim());
}

function freePort() {
  try {
    execSync(`fuser -k ${port}/tcp 2>/dev/null || lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
      stdio: "ignore",
      shell: true,
    });
  } catch {
    // ignore
  }
}

function startServer() {
  freePort();
  const child = spawn(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["exec", "next", "start", "-H", host, "-p", String(port)],
    { cwd: root, stdio: "pipe", env: process.env },
  );
  return child;
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

async function fetchWithTimeout(url, ms = 10_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      headers: { "Cache-Control": "no-cache" },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function measureRoute(route) {
  const url = `${base}${route}`;
  const times = [];

  for (let i = 0; i < warmup + samples; i++) {
    const t0 = performance.now();
    try {
      const res = await fetchWithTimeout(url);
      await res.arrayBuffer();
      const ms = performance.now() - t0;
      if (i >= warmup) times.push(ms);
      if (!res.ok && res.status >= 500) {
        return {
          route,
          error: `HTTP ${res.status}`,
          p50: Infinity,
          p95: Infinity,
          pass: false,
        };
      }
    } catch (err) {
      return {
        route,
        error: err instanceof Error ? err.message : String(err),
        p50: Infinity,
        p95: Infinity,
        pass: false,
      };
    }
  }

  times.sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)] ?? Infinity;
  const p95 = times[Math.floor(times.length * 0.95)] ?? Infinity;

  return {
    route,
    p50: Math.round(p50 * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    samples: times.length,
    pass: p50 < targetMs,
  };
}

async function main() {
  if (!process.env.BENCH_SKIP_BUILD) {
    console.log("Building production bundle…");
    execSync("pnpm build", { cwd: root, stdio: "inherit" });
  }

  console.log(`Starting server on ${base}…`);
  const server = startServer();
  const ready = await waitForServer();
  if (!ready) {
    server.kill("SIGTERM");
    console.error("Server failed to start");
    process.exit(1);
  }

  console.log(
    `\nBenchmark: target p50 < ${targetMs}ms, ${samples} samples after ${warmup} warm-up\n`,
  );

  const ROUTES = loadAllRoutes();
  console.log(`Routes to measure: ${ROUTES.length}\n`);

  const results = [];
  let slowest = { route: "", p50: 0 };
  for (const route of ROUTES) {
    const r = await measureRoute(route);
    results.push(r);
    if (r.p50 > slowest.p50) slowest = { route: r.route, p50: r.p50 };
    if (!r.pass || r.error) {
      const line = r.error
        ? `${route} — ERROR ${r.error}`
        : `${route} — p50=${r.p50}ms p95=${r.p95}ms [FAIL]`;
      console.log(line);
    }
  }
  console.log(`Slowest: ${slowest.route} p50=${slowest.p50}ms`);

  server.kill("SIGTERM");

  const passed = results.filter((r) => r.pass).length;
  const report = {
    measuredAt: new Date().toISOString(),
    conditions: {
      base,
      targetMs,
      samples,
      warmup,
      node: process.version,
      databaseUrl: process.env.DATABASE_URL ? "set" : "unset",
    },
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed,
      allPass: passed === results.length,
    },
    results,
  };

  const outPath = path.join(root, "docs/page-load-benchmark.json");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`\n${passed}/${results.length} routes under ${targetMs}ms (p50)`);
  console.log(`Report: ${outPath}`);

  process.exit(report.summary.allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
