/**
 * Five end-to-end capability scenarios for vn-insurance-fti.
 * Evaluation: binary pass/fail per check; scenario passes only when every check passes.
 */

export type ScenarioCheck = {
  id: string;
  layer: "vitest" | "e2e";
  description: string;
};

export type MajorCapabilityScenario = {
  id: string;
  title: string;
  persona: string;
  capabilities: string[];
  checks: ScenarioCheck[];
};

/** Same conditions for every run (documented in docs/SCENARIO-TEST-PLAN.md). */
export const SCENARIO_RUN_CONDITIONS = {
  nodeEnv: "test",
  vitestCommand: "pnpm exec vitest run tests/scenarios-major-capabilities.test.ts",
  e2eCommand: "pnpm exec playwright test e2e/scenarios-major-capabilities.spec.ts",
  e2ePort: "3199",
  turnstileSecret: "unset (server skips Turnstile verify)",
  databaseUrl: "optional — admin UI checks skipped when unset",
} as const;

export const MAJOR_CAPABILITY_SCENARIOS: MajorCapabilityScenario[] = [
  {
    id: "S1",
    title: "Natural-language BHXH search",
    persona: "Nhân viên mới hỏi về đóng BHXH bắt buộc",
    capabilities: ["Tra cứu (/search)", "AI answer card", "Curated FAQ grounding"],
    checks: [
      {
        id: "S1-V1",
        layer: "vitest",
        description: "Curated FAQ search returns ≥1 hit with score > 0.3 for BHXH query",
      },
      {
        id: "S1-V2",
        layer: "vitest",
        description:
          "AiAnswerService returns non-empty shortAnswer with citations for strong curated match",
      },
      {
        id: "S1-E1",
        layer: "e2e",
        description: "/search submits query and renders answer card without 5xx or app error",
      },
    ],
  },
  {
    id: "S2",
    title: "FAQ hub and topic browsing",
    persona: "Nhân viên đọc FAQ và chủ đề BHTN",
    capabilities: ["FAQ (/hoi-dap)", "FAQ detail SSG", "Topics (/topics)"],
    checks: [
      {
        id: "S2-V1",
        layer: "vitest",
        description: "Curated FAQ catalog is non-empty with unique slugs",
      },
      {
        id: "S2-E1",
        layer: "e2e",
        description: "/hoi-dap lists FAQs and first detail page loads (<500)",
      },
      {
        id: "S2-E2",
        layer: "e2e",
        description: "/topics/bhtn shows BHTN topic content",
      },
    ],
  },
  {
    id: "S3",
    title: "Legal updates, sources, and SEO",
    persona: "HR/C&B tra văn bản mới và kiểm tra index công khai",
    capabilities: [
      "Cập nhật pháp luật (/legal-updates)",
      "Nguồn tham khảo (/nguon-phap-luat)",
      "SEO (/sitemap.xml, /robots.txt)",
    ],
    checks: [
      {
        id: "S3-E1",
        layer: "e2e",
        description: "Legal updates search updates URL with query param",
      },
      {
        id: "S3-E2",
        layer: "e2e",
        description: "/nguon-phap-luat renders reference links",
      },
      {
        id: "S3-V1",
        layer: "vitest",
        description: "Sitemap includes public hubs and excludes /admin and /api",
      },
      {
        id: "S3-E3",
        layer: "e2e",
        description: "robots.txt disallows admin; sitemap.xml lists /search",
      },
    ],
  },
  {
    id: "S4",
    title: "Salary and employee tools",
    persona: "Nhân viên tính lương gross-to-net",
    capabilities: ["Công cụ (/calculators)", "Tính lương (/cong-cu-luong-thue)", "Calculator API"],
    checks: [
      {
        id: "S4-V1",
        layer: "vitest",
        description: "POST /api/calculators/salary-tax returns net salary between 0 and gross",
      },
      {
        id: "S4-E1",
        layer: "e2e",
        description: "Tính ngay shows thực nhận on salary tool page",
      },
      {
        id: "S4-E2",
        layer: "e2e",
        description: "Every calculators hub CTA loads without 5xx",
      },
    ],
  },
  {
    id: "S5",
    title: "HR escalation and platform guardrails",
    persona: "Nhân viên gửi câu hỏi HR; vận hành kiểm tra bảo mật",
    capabilities: [
      "Hỏi HR (/ask-hr)",
      "Admin RBAC",
      "Cron auth",
      "SSRF / rate-limit helpers",
    ],
    checks: [
      {
        id: "S5-E1",
        layer: "e2e",
        description: "Ask HR form enables submit when required fields are valid",
      },
      {
        id: "S5-V1",
        layer: "vitest",
        description: "RBAC denies EMPLOYEE admin access; HR can publish FAQ",
      },
      {
        id: "S5-V2",
        layer: "vitest",
        description: "Cron bearer auth rejects missing/invalid token when secret set",
      },
      {
        id: "S5-V3",
        layer: "vitest",
        description: "SSRF helper blocks private/metadata URLs",
      },
      {
        id: "S5-V4",
        layer: "vitest",
        description: "Ask HR form readiness validator rejects incomplete payloads",
      },
    ],
  },
];

export function allScenarioIds(): string[] {
  return MAJOR_CAPABILITY_SCENARIOS.map((s) => s.id);
}
