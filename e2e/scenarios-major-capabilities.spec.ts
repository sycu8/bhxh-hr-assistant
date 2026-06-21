import { test, expect } from "@playwright/test";
import { EMPLOYEE_TOOL_GROUPS } from "../src/lib/navigation/employee-tools";
import { MAJOR_CAPABILITY_SCENARIOS } from "../tests/scenarios/definitions";
import { expectPageText, gotoStable, mainNav } from "./helpers";

const MOCK_SEARCH_ANSWER = {
  success: true,
  data: {
    query: "mức đóng BHXH bắt buộc",
    hits: [
      {
        type: "faq" as const,
        id: "curated-bat-buoc",
        title: "Tôi có bắt buộc phải tham gia BHXH, BHYT, BHTN không?",
        snippet: "Trong quan hệ lao động thuộc phạm vi Luật Lao động...",
        score: 0.92,
        categorySlug: "bhxh",
      },
    ],
    answer: {
      shortAnswer:
        "Trong quan hệ lao động thuộc phạm vi Luật Lao động, người lao động phải tham gia BHXH, BHYT, BHTN theo quy định.",
      detailedAnswer: "",
      citations: [
        {
          title: "Luật BHXH (mẫu)",
          documentId: null,
          faqId: null,
          documentChunkId: null,
          sourceUrl: "https://baohiemxahoi.gov.vn",
          legalArticle: "Điều 2",
          legalClause: null,
        },
      ],
      confidenceLevel: "HIGH" as const,
      needsHrReview: false,
      warnings: [],
      suggestedFollowUpQuestions: [],
      relatedFaqSlug: "bat-buoc-tham-gia-bhxh",
    },
  },
};

test.describe("Major capability scenarios (E2E layer)", () => {
  test.describe("S1 — Natural-language BHXH search", () => {
    test("[S1-E1] search UI renders answer card after submit", async ({ page }) => {
      await page.route("**/api/search", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_SEARCH_ANSWER),
        });
      });

      await gotoStable(page, "/search");
      await expectPageText(page, "Tra cứu");

      const input = page.getByLabel("Từ khóa tra cứu");
      await input.fill("mức đóng BHXH bắt buộc");

      await page.getByRole("button", { name: "Tra cứu" }).click();

      await expect(page.getByText(/BHXH, BHYT, BHTN/i).first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByText(/Tin cậy cao|Cần đối chiếu|Cần HR/i).first()).toBeVisible();
      await expect(page.locator("body")).not.toContainText("Application error");
    });
  });

  test.describe("S2 — FAQ hub and topic browsing", () => {
    test("[S2-E1] FAQ list and detail page load", async ({ page }) => {
      await gotoStable(page, "/hoi-dap");
      await expectPageText(page, "Câu hỏi thường gặp");

      const firstFaqLink = page.locator('a[href^="/hoi-dap/"]').first();
      await expect(firstFaqLink).toBeVisible({ timeout: 15_000 });
      const href = await firstFaqLink.getAttribute("href");
      expect(href).toMatch(/^\/hoi-dap\/.+/);

      const res = await page.goto(href!, { waitUntil: "domcontentloaded" });
      expect(res?.status() ?? 500).toBeLessThan(500);
      await expect(page.locator("body")).not.toContainText("Application error");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test("[S2-E2] BHTN topic page renders", async ({ page }) => {
      const res = await gotoStable(page, "/topics/bhtn");
      expect(res?.status() ?? 500).toBeLessThan(500);
      await expectPageText(page, "BHTN");
    });
  });

  test.describe("S3 — Legal updates, sources, and SEO", () => {
    test("[S3-E1] legal updates search updates URL", async ({ page }) => {
      await gotoStable(page, "/legal-updates");
      const search = page.getByLabel("Tìm văn bản");
      await expect(search).toBeVisible({ timeout: 15_000 });
      await search.fill("BHXH");
      await page.getByRole("button", { name: "Tìm kiếm" }).click();
      await expect(page).toHaveURL(/q=BHXH/i);
    });

    test("[S3-E2] legal sources page renders references", async ({ page }) => {
      await gotoStable(page, "/nguon-phap-luat");
      await expectPageText(page, "nguồn");
      const externalLinks = page.locator('a[href^="https://"]');
      await expect(externalLinks.first()).toBeVisible({ timeout: 15_000 });
    });

    test("[S3-E3] robots and sitemap expose public SEO rules", async ({ request }) => {
      const robots = await request.get("/robots.txt");
      expect(robots.status()).toBe(200);
      const robotsBody = await robots.text();
      expect(robotsBody).toMatch(/Disallow:\s*\/admin/i);
      expect(robotsBody).toMatch(/Sitemap:/i);

      const sitemap = await request.get("/sitemap.xml");
      expect(sitemap.status()).toBe(200);
      const sitemapBody = await sitemap.text();
      expect(sitemapBody).toContain("/search");
      expect(sitemapBody).not.toContain("/admin");
    });
  });

  test.describe("S4 — Salary and employee tools", () => {
    test("[S4-E1] gross-to-net calculator shows net pay", async ({ page }) => {
      await gotoStable(page, "/cong-cu-luong-thue?mode=gross-to-net");
      await expect(page.getByRole("button", { name: "Tính ngay" })).toBeVisible({
        timeout: 15_000,
      });

      const moneyInputs = page.getByPlaceholder("Ví dụ: 35.000.000");
      await moneyInputs.first().fill("35000000");
      await moneyInputs.nth(1).fill("35000000");
      await page.getByRole("button", { name: "Tính ngay" }).click();

      await expect(page.getByText(/thực nhận|Thực nhận/i).first()).toBeVisible({
        timeout: 15_000,
      });
    });

    test("[S4-E2] calculators hub CTAs load without 5xx", async ({ page }) => {
      await gotoStable(page, "/calculators");
      const hrefs = [
        ...new Set(EMPLOYEE_TOOL_GROUPS.flatMap((g) => g.tools.map((t) => t.href))),
      ];
      for (const href of hrefs) {
        const res = await page.goto(href, { waitUntil: "domcontentloaded" });
        expect(res?.status() ?? 500, `failed loading ${href}`).toBeLessThan(500);
        await expect(page.locator("body")).not.toContainText("Application error");
      }
    });
  });

  test.describe("S5 — HR escalation and platform guardrails", () => {
    test("[S5-E1] Ask HR form enables submit when valid", async ({ page }) => {
      await gotoStable(page, "/ask-hr");
      const form = page.getByRole("form", { name: "Gửi câu hỏi tới HR" });
      await expect(form).toBeVisible({ timeout: 15_000 });

      const submit = form.getByRole("button", { name: /Gửi email cho HR/ });
      await expect(submit).toBeDisabled();

      await form.locator("#replyEmail").fill("nhanvien@example.com");
      await form.locator("#topic").selectOption("bhxh");
      await form.locator("#urgent").selectOption("normal");
      await form.locator('[name="question"]').fill(
        "Em muốn hỏi về mức đóng BHXH bắt buộc theo hợp đồng chính thức?",
      );
      await form.locator('input[name="agree"]').check();

      await expect(submit).toBeEnabled();
    });

    test("[S5-E2] primary nav covers search, FAQ, HR, tools", async ({ page }) => {
      await gotoStable(page, "/");
      const nav = mainNav(page);
      for (const label of ["Tra cứu", "FAQ", "Hỏi HR"]) {
        await expect(nav.getByRole("link", { name: label })).toBeVisible();
      }
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(nav.getByRole("link", { name: "Công cụ" })).toBeVisible();
    });
  });
});

test("scenario catalog defines five major capability scenarios", () => {
  expect(MAJOR_CAPABILITY_SCENARIOS).toHaveLength(5);
  const capabilityCount = new Set(
    MAJOR_CAPABILITY_SCENARIOS.flatMap((s) => s.capabilities),
  ).size;
  expect(capabilityCount).toBeGreaterThanOrEqual(8);
});
