/**
 * Nới rate limit zone orangecloud.vn và thêm skip cho /admin trên bhxh.
 *
 * Cần token có quyền Zone → WAF → Edit:
 *   CLOUDFLARE_API_TOKEN=... pnpm cf:relax-admin-waf
 */
const ZONE_ID = "8b2d9a7c97013a739dcb2d2ce28b084d";
const RATE_LIMIT_RULESET = "c002abdcf0e04baa893741b88065065a";
const ZONE_RL_RULE = "3199c1fad85a41548fcebade852c8391";
const CUSTOM_WAF_RULESET = "d31639ea45504b438a52d3aa95f6ee90";
const WAF_SCORE_CHALLENGE_RULE = "f2eab9cb6a284ccbb08dfab9de242049";

const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
if (!token) {
  console.error(
    "Thiếu CLOUDFLARE_API_TOKEN (cần quyền Zone WAF Edit).",
  );
  process.exit(1);
}

async function cf(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await res.json()) as {
    success: boolean;
    errors?: { message: string }[];
    result?: unknown;
  };
  if (!body.success) {
    throw new Error(
      body.errors?.map((e) => e.message).join("; ") ?? `HTTP ${res.status}`,
    );
  }
  return body.result;
}

async function patchRateLimit() {
  await cf(
    `/zones/${ZONE_ID}/rulesets/${RATE_LIMIT_RULESET}/rules/${ZONE_RL_RULE}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        action: "managed_challenge",
        description: "RL",
        enabled: true,
        expression: '(http.host contains "orangecloud.vn")',
        ratelimit: {
          characteristics: ["cf.unique_visitor_id", "cf.colo.id"],
          mitigation_timeout: 300,
          period: 60,
          requests_per_period: 800,
        },
      }),
    },
  );
  console.log("✓ Rate limit orangecloud.vn: 800 req/60s, mitigation 300s");
}

async function patchWafScoreChallenge() {
  await cf(
    `/zones/${ZONE_ID}/rulesets/${CUSTOM_WAF_RULESET}/rules/${WAF_SCORE_CHALLENGE_RULE}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        action: "managed_challenge",
        description: "waf score",
        enabled: true,
        expression:
          "(cf.waf.score le 28 and cf.waf.score ge 21 and not cf.client.bot)",
      }),
    },
  );
  console.log("✓ WAF score challenge: chỉ 21–28 (trước: 21–40)");
}

async function ensureAdminSkipRule() {
  const ruleset = (await cf(
    `/zones/${ZONE_ID}/rulesets/${CUSTOM_WAF_RULESET}`,
  )) as { rules?: { id: string; description?: string }[] };

  const existing = ruleset.rules?.find(
    (r) => r.description === "skip bhxh admin",
  );
  if (existing) {
    console.log("✓ Skip rule bhxh admin đã tồn tại");
    return;
  }

  await cf(`/zones/${ZONE_ID}/rulesets/${CUSTOM_WAF_RULESET}/rules`, {
    method: "POST",
    body: JSON.stringify({
      action: "skip",
      action_parameters: {
        phases: [
          "http_request_firewall_managed",
          "http_ratelimit",
          "http_request_sbfm",
        ],
        ruleset: "current",
      },
      description: "skip bhxh admin",
      enabled: true,
      expression:
        '(http.host eq "bhxh.orangecloud.vn" and starts_with(http.request.uri.path, "/admin"))',
      logging: { enabled: true },
    }),
  });
  console.log("✓ Đã thêm skip rule cho bhxh.orangecloud.vn/admin");
}

async function main() {
  try {
    await patchRateLimit();
    await patchWafScoreChallenge();
    await ensureAdminSkipRule();
    console.log("\nHoàn tất.");
  } catch (err) {
    console.error(
      "\nKhông cập nhật được qua API:",
      err instanceof Error ? err.message : err,
    );
    console.error(
      "\nCập nhật thủ công trên Cloudflare Dashboard → Security → WAF:",
    );
    console.error(
      "  • Rate limiting (RL): requests_per_period 200 → 800, mitigation 900 → 300",
    );
    console.error("  • Custom rule waf score: le 40 → le 28");
    console.error(
      "  • Thêm Skip: host bhxh.orangecloud.vn + path /admin* (phases: RL + managed WAF)",
    );
    process.exit(1);
  }
}

void main();
