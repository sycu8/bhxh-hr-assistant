#!/usr/bin/env node
/**
 * Chạy kịch bản thực tế trên UAT/production.
 * Dừng khi đạt STREAK_TARGET pass liên tiếp.
 * Usage: node scripts/uat-realistic-streak.mjs
 */
import dns from "node:dns";

// GitHub Actions runners ưu tiên IPv6 — Cloudflare thường challenge/fail khác IPv4.
dns.setDefaultResultOrder("ipv4first");

const BASE =
  process.env.UAT_BASE_URL?.trim() || "https://bhxh.orangecloud.vn";
const STREAK_TARGET = Number(process.env.STREAK_TARGET ?? 15);
const MAX_ATTEMPTS = Math.max(1, Number(process.env.UAT_RETRY_ATTEMPTS ?? 3));
const RETRY_MS = Math.max(0, Number(process.env.UAT_RETRY_MS ?? 1500));

if (!Number.isFinite(STREAK_TARGET) || STREAK_TARGET < 1) {
  console.error(`Invalid STREAK_TARGET=${process.env.STREAK_TARGET}`);
  process.exit(1);
}

/** @type {{ id: string; title: string; run: () => Promise<void> }[]} */
const SCENARIOS = [
  {
    id: "SC-01",
    title: "Trang chủ — hero + CTA Cổng HR",
    run: async () => {
      const res = await fetch(`${BASE}/`, { headers: defaultHeaders() });
      assertStatus(res, 200);
      const html = await res.text();
      assertNotChallenge(html, res);
      assertIncludes(html, "Cổng HR");
      assertIncludes(html, "Công cụ cho Nhân viên");
    },
  },
  {
    id: "SC-02",
    title: "Đăng nhập OTP — shell trang + mô tả email",
    run: async () => {
      const res = await fetch(`${BASE}/login`, { headers: defaultHeaders() });
      assertStatus(res, 200);
      const html = await res.text();
      assertNotChallenge(html, res);
      assertIncludes(html, "Chào mừng trở lại");
      assertIncludes(html, "email công ty");
      assertIncludes(html, "Đăng nhập nhân viên");
    },
  },
  {
    id: "SC-03",
    title: "API docs /developers",
    run: async () => {
      const res = await fetch(`${BASE}/developers`, { headers: defaultHeaders() });
      assertStatus(res, 200);
      const html = await res.text();
      assertNotChallenge(html, res);
      assertIncludes(html, "API");
      assertIncludes(html, "openapi.json");
    },
  },
  {
    id: "SC-04",
    title: "OpenAPI 3.1 — /api/search",
    run: async () => {
      const res = await fetch(`${BASE}/api/openapi.json`, {
        headers: defaultHeaders(),
      });
      assertStatus(res, 200);
      assertJsonContentType(res);
      const doc = await res.json();
      if (doc.openapi !== "3.1.0") throw new Error(`openapi=${doc.openapi}`);
      if (!doc.paths?.["/api/search"]?.post) {
        throw new Error("missing /api/search POST");
      }
    },
  },
  {
    id: "SC-05",
    title: "Calculator salary-tax gross→net",
    run: async () => {
      const res = await fetch(`${BASE}/api/calculators/salary-tax`, {
        method: "POST",
        headers: { ...defaultHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "gross-to-net",
          grossSalary: 35_000_000,
          insuranceSalaryBase: 35_000_000,
          region: "I",
          dependentCount: 0,
        }),
      });
      assertStatus(res, 200);
      const json = await assertJsonEnvelope(res);
      const net = json.data?.result?.summary?.netSalary;
      if (typeof net !== "number" || net <= 0) {
        throw new Error(`missing netSalary in result (got ${net})`);
      }
    },
  },
  {
    id: "SC-06",
    title: "Calculator BHXH contribution",
    run: async () => {
      const res = await fetch(`${BASE}/api/calculators/social-insurance-contribution`, {
        method: "POST",
        headers: { ...defaultHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ salaryBase: 20_000_000 }),
      });
      assertStatus(res, 200);
      const json = await assertJsonEnvelope(res);
      const total = json.data?.result?.employee?.total;
      if (typeof total !== "number" || total <= 0) {
        throw new Error(`missing employee.total (got ${total})`);
      }
    },
  },
  {
    id: "SC-07",
    title: "OTP request — email không hợp lệ → 400 JSON",
    run: async () => {
      const res = await fetch(`${BASE}/api/v1/auth/otp/request`, {
        method: "POST",
        headers: { ...defaultHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-valid" }),
      });
      assertStatus(res, 400);
      const json = await assertJsonEnvelope(res, false);
      if (json.error?.code !== "VALIDATION_ERROR") {
        throw new Error(`code=${json.error?.code}`);
      }
    },
  },
  {
    id: "SC-08",
    title: "OTP request — email hợp lệ → JSON không HTML",
    run: async () => {
      const res = await fetch(`${BASE}/api/v1/auth/otp/request`, {
        method: "POST",
        headers: { ...defaultHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: "employee@fpt.com" }),
      });
      if (res.status >= 500) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      assertJsonContentType(res);
      const json = await res.json();
      if (json.success !== true) {
        throw new Error(JSON.stringify(json.error ?? json));
      }
    },
  },
  {
    id: "SC-09",
    title: "OTP verify — mã sai → 401 JSON",
    run: async () => {
      const res = await fetch(`${BASE}/api/v1/auth/otp/verify`, {
        method: "POST",
        headers: { ...defaultHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "employee@fpt.com",
          code: "000000",
        }),
      });
      assertStatus(res, 401);
      assertJsonContentType(res);
      const json = await res.json();
      if (json.success !== false) throw new Error("expected success:false");
    },
  },
  {
    id: "SC-10",
    title: "Route guard — /my-hr/profile → login",
    run: async () => {
      const res = await fetch(`${BASE}/my-hr/profile`, {
        redirect: "manual",
        headers: defaultHeaders(),
      });
      if (res.status !== 307 && res.status !== 302) {
        throw new Error(`expected redirect, got ${res.status}`);
      }
      const loc = res.headers.get("location") ?? "";
      if (!loc.includes("/login")) throw new Error(`location=${loc}`);
    },
  },
  {
    id: "SC-11",
    title: "Tra cứu /search",
    run: async () => {
      const res = await fetch(`${BASE}/search`, { headers: defaultHeaders() });
      assertStatus(res, 200);
      const html = await res.text();
      assertNotChallenge(html, res);
      assertIncludes(html, "Tra cứu");
    },
  },
  {
    id: "SC-12",
    title: "Hỏi HR /ask-hr",
    run: async () => {
      const res = await fetch(`${BASE}/ask-hr`, { headers: defaultHeaders() });
      assertStatus(res, 200);
      const html = await res.text();
      assertNotChallenge(html, res);
      assertIncludes(html, "Soạn câu hỏi");
    },
  },
  {
    id: "SC-13",
    title: "Redirect cap-nhat-phap-luat → legal-updates",
    run: async () => {
      const res = await fetch(`${BASE}/cap-nhat-phap-luat`, {
        redirect: "manual",
        headers: defaultHeaders(),
      });
      if (res.status !== 307 && res.status !== 308 && res.status !== 301) {
        throw new Error(`expected redirect, got ${res.status}`);
      }
      const loc = res.headers.get("location") ?? "";
      if (!loc.includes("/legal-updates")) throw new Error(`location=${loc}`);
    },
  },
  {
    id: "SC-14",
    title: "Chủ đề BHYT /topics/bhyt",
    run: async () => {
      const res = await fetch(`${BASE}/topics/bhyt`, {
        headers: defaultHeaders(),
      });
      assertStatus(res, 200);
      const html = await res.text();
      assertNotChallenge(html, res);
      assertIncludes(html, "BHYT");
    },
  },
  {
    id: "SC-15",
    title: "Hub bảo hiểm /bao-hiem",
    run: async () => {
      const res = await fetch(`${BASE}/bao-hiem`, { headers: defaultHeaders() });
      assertStatus(res, 200);
      const html = await res.text();
      assertNotChallenge(html, res);
      assertIncludes(html, "Bảo hiểm");
    },
  },
];

function defaultHeaders() {
  return {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
    // UA ổn định — tránh undici mặc định bị WAF/bot score thấp trên CI
    "User-Agent":
      process.env.UAT_USER_AGENT?.trim() ||
      "bhxh-hr-assistant-uat/1.0 (+https://github.com/sycu8/bhxh-hr-assistant; CI streak)",
  };
}

function assertStatus(res, expected) {
  if (res.status !== expected) {
    throw new Error(
      `HTTP ${res.status}, expected ${expected} (cf-ray=${res.headers.get("cf-ray") ?? "-"})`,
    );
  }
}

function assertIncludes(haystack, needle) {
  if (!haystack.includes(needle)) {
    throw new Error(`missing text: ${needle}`);
  }
}

function assertNotChallenge(html, res) {
  // Không dùng /cdn-cgi/challenge-platform/ (precursor script có trên HTML bình thường).
  const interstitial =
    /<title[^>]*>\s*Just a moment|<title[^>]*>\s*Attention Required|cf-browser-verification|Enable JavaScript and cookies to continue/i.test(
      html,
    );
  if (interstitial) {
    throw new Error(
      `Cloudflare challenge/block (status=${res.status}, cf-ray=${res.headers.get("cf-ray") ?? "-"}, len=${html.length})`,
    );
  }
}

function assertJsonContentType(res) {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error(`content-type=${ct}`);
  }
}

async function assertJsonEnvelope(res, expectSuccess = true) {
  assertJsonContentType(res);
  const json = await res.json();
  if (expectSuccess && json.success !== true) {
    throw new Error(JSON.stringify(json.error ?? json));
  }
  if (!expectSuccess && json.success !== false) {
    throw new Error("expected success:false");
  }
  return json;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithRetry(scenario) {
  let lastError = /** @type {unknown} */ (null);
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await scenario.run();
      return;
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      if (attempt < MAX_ATTEMPTS) {
        console.log(`  ↻ retry ${attempt}/${MAX_ATTEMPTS}: ${msg}`);
        await sleep(RETRY_MS * attempt);
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function main() {
  console.log(`UAT base: ${BASE}`);
  console.log(`Target streak: ${STREAK_TARGET}`);
  console.log(`Retries/scenario: ${MAX_ATTEMPTS} (backoff ${RETRY_MS}ms)\n`);

  let streak = 0;
  let round = 0;

  while (streak < STREAK_TARGET) {
    round += 1;
    console.log(`--- Round ${round} (streak ${streak}/${STREAK_TARGET}) ---`);

    for (const scenario of SCENARIOS) {
      const label = `${scenario.id} ${scenario.title}`;
      try {
        await runWithRetry(scenario);
        streak += 1;
        console.log(`✓ PASS [${streak}] ${label}`);
        if (streak >= STREAK_TARGET) {
          console.log(`\n🎯 Streak ${STREAK_TARGET} reached. Done.`);
          process.exit(0);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`✗ FAIL [streak reset] ${label}`);
        console.log(`  → ${msg}`);
        streak = 0;
        process.exitCode = 1;
        /** Caller (CI/agent) handles fix + rerun */
        process.exit(2);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
