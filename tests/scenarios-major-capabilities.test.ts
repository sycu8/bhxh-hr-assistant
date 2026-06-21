import { describe, expect, it, vi } from "vitest";
import { POST as postSalaryTax } from "@/app/api/calculators/salary-tax/route";
import { assertCronAuthorized } from "@/lib/api/cron-auth";
import { ApiError } from "@/lib/api/errors";
import { INSUFFICIENT_SOURCE_MESSAGE } from "@/lib/ai/constants";
import type {
  ChunkWithDocument,
  FaqWithCitations,
  IDocumentChunkReadRepository,
  IFaqReadRepository,
} from "@/lib/repositories/contracts";
import { AiAnswerService } from "@/lib/services/ai-answer.service";
import { listCuratedFaqs } from "@/lib/data/curated-faqs";
import { searchCuratedFaqs } from "@/lib/faq/curated-faq-search";
import {
  canAccessAdmin,
  hasPermission,
} from "@/lib/auth/permissions";
import { assertSafeOutboundUrl, UnsafeOutboundUrlError } from "@/lib/security/ssrf";
import { isAskHrFormReady } from "@/lib/validators/ask-hr-form";
import { buildSitemapEntries } from "@/lib/sitemap/entries";
import type { VectorSearchProvider } from "@/lib/vector/vector-search.types";
import { MAJOR_CAPABILITY_SCENARIOS } from "./scenarios/definitions";

function emptyRepos(): {
  faqRepo: IFaqReadRepository;
  chunkRepo: IDocumentChunkReadRepository;
  vector: VectorSearchProvider;
} {
  return {
    faqRepo: {
      searchApproved: vi.fn().mockResolvedValue([]),
    },
    chunkRepo: {
      findByIds: vi.fn().mockResolvedValue([]),
      listApprovedForRetrieval: vi.fn().mockResolvedValue([]),
    },
    vector: {
      search: vi.fn().mockResolvedValue([]),
    },
  };
}

describe("Major capability scenarios (Vitest layer)", () => {
  describe("S1 — Natural-language BHXH search", () => {
    const scenario = MAJOR_CAPABILITY_SCENARIOS.find((s) => s.id === "S1")!;

    it("[S1-V1] curated FAQ search returns grounded hit", () => {
      const hits = searchCuratedFaqs({
        query: "có bắt buộc tham gia bhxh không",
        take: 3,
      });
      expect(hits.length, scenario.checks[0].description).toBeGreaterThan(0);
      expect(hits[0]?.score).toBeGreaterThan(0.3);
      expect(hits[0]?.faq.slug).toBe("bat-buoc-tham-gia-bhxh");
    });

    it("[S1-V2] AiAnswerService answers from curated FAQ with citations", async () => {
      const { faqRepo, chunkRepo, vector } = emptyRepos();
      const svc = new AiAnswerService(faqRepo, chunkRepo, vector);
      const { card } = await svc.ask({
        question: "Tôi có bắt buộc phải tham gia BHXH không?",
        employeeGroup: "OFFICIAL",
      });

      expect(card.shortAnswer.trim().length).toBeGreaterThan(20);
      expect(card.shortAnswer).not.toBe(INSUFFICIENT_SOURCE_MESSAGE);
      expect(card.citations.length).toBeGreaterThan(0);
      expect(card.confidenceLevel).toBe("HIGH");
    });
  });

  describe("S2 — FAQ hub and topic browsing", () => {
    it("[S2-V1] curated FAQ catalog is non-empty with unique slugs", () => {
      const faqs = listCuratedFaqs();
      expect(faqs.length).toBeGreaterThan(10);
      const slugs = faqs.map((f) => f.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const faq of faqs) {
        expect(faq.question.trim().length).toBeGreaterThan(5);
        expect(faq.answer.trim().length).toBeGreaterThan(10);
      }
    });
  });

  describe("S3 — Legal updates, sources, and SEO", () => {
    it("[S3-V1] sitemap includes public hubs and excludes admin/api", () => {
      const urls = buildSitemapEntries().map((e) => e.url);
      expect(urls.some((u) => u.endsWith("/search"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/legal-updates"))).toBe(true);
      expect(urls.some((u) => u.includes("/admin"))).toBe(false);
      expect(urls.some((u) => u.includes("/api/"))).toBe(false);
    });
  });

  describe("S4 — Salary and employee tools", () => {
    it("[S4-V1] salary-tax API returns net between 0 and gross", async () => {
      const req = new Request("http://localhost/api/calculators/salary-tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "gross-to-net",
          grossSalary: 35_000_000,
          insuranceSalaryBase: 35_000_000,
          region: "I",
          dependentCount: 0,
        }),
      });
      const res = await postSalaryTax(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      const { grossSalary, netSalary } = json.data.result.summary;
      expect(netSalary).toBeGreaterThan(0);
      expect(netSalary).toBeLessThan(grossSalary);
    });
  });

  describe("S5 — HR escalation and platform guardrails", () => {
    it("[S5-V1] RBAC allows HR CMS but not employee admin", () => {
      expect(canAccessAdmin("EMPLOYEE")).toBe(false);
      expect(canAccessAdmin("HR")).toBe(true);
      expect(hasPermission("HR", "faq:write")).toBe(true);
      expect(hasPermission("EMPLOYEE", "faq:write")).toBe(false);
    });

    it("[S5-V2] cron bearer auth rejects invalid token when secret configured", () => {
      const prev = process.env.CACHE_REVALIDATE_SECRET;
      process.env.CACHE_REVALIDATE_SECRET = "scenario-test-secret";

      const badReq = new Request("http://localhost/api/cron/daily-official-crawl", {
        method: "POST",
        headers: { authorization: "Bearer wrong-token" },
      });
      expect(() => assertCronAuthorized(badReq)).toThrow(ApiError);

      const goodReq = new Request("http://localhost/api/cron/daily-official-crawl", {
        method: "POST",
        headers: { authorization: "Bearer scenario-test-secret" },
      });
      expect(() => assertCronAuthorized(goodReq)).not.toThrow();

      process.env.CACHE_REVALIDATE_SECRET = prev;
    });

    it("[S5-V3] SSRF helper blocks private and metadata URLs", () => {
      expect(() => assertSafeOutboundUrl("http://example.com")).toThrow(
        UnsafeOutboundUrlError,
      );
      expect(() => assertSafeOutboundUrl("https://127.0.0.1/admin")).toThrow(
        UnsafeOutboundUrlError,
      );
      expect(() =>
        assertSafeOutboundUrl("https://169.254.169.254/latest/meta-data"),
      ).toThrow(UnsafeOutboundUrlError);
    });

    it("[S5-V4] Ask HR form readiness rejects incomplete payloads", () => {
      const valid = {
        replyEmail: "nhanvien@fpt.com",
        topic: "bhxh",
        urgent: "normal",
        question: "Em muốn hỏi về mức đóng BHXH bắt buộc?",
        agree: true,
      };
      expect(isAskHrFormReady(valid)).toBe(true);
      expect(isAskHrFormReady({ ...valid, agree: false })).toBe(false);
      expect(isAskHrFormReady({ ...valid, question: "hi" })).toBe(false);
    });
  });
});
