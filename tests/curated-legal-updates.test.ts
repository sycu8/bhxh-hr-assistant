import { describe, expect, it } from "vitest";
import { CURATED_LEGAL_UPDATES } from "@/lib/data/curated-legal-updates";
import { getUpcomingBhxhBhytCap, SALARY_TAX_RULES_2026 } from "@/lib/services/salary-tax-rules";

describe("curated FAQ catalog", () => {
  it("includes LuatVietnam Bảo hiểm crawl (114 items)", async () => {
    const { CURATED_FAQS } = await import("@/lib/data/curated-faqs");
    const lvn = CURATED_FAQS.filter((f) => f.slug.startsWith("lvn-"));
    expect(lvn.length).toBeGreaterThanOrEqual(100);
    expect(CURATED_FAQS.length).toBeGreaterThan(120);
  });
});

describe("curated legal updates", () => {
  it("includes Nghị định 168 and base salary briefs", () => {
    const slugs = CURATED_LEGAL_UPDATES.map((u) => u.slug);
    expect(slugs).toContain("nghi-dinh-168-2026-nd-cp-luat-dan-so");
    expect(slugs).toContain("tang-luong-co-so-2-53-trieu-2026");
    expect(slugs).toContain("ftel-ho-tro-thai-san-level-2025");
  });

  it("marks FPT Telecom policies as internal", () => {
    const internal = CURATED_LEGAL_UPDATES.filter((u) => u.isInternalPolicy);
    expect(internal.length).toBeGreaterThanOrEqual(2);
    expect(internal.every((u) => u.sourceName.includes("FPT"))).toBe(true);
  });
});

describe("upcoming base salary 2026-07", () => {
  it("exposes 2.53M base and 50.6M BHXH cap from July 2026", () => {
    expect(SALARY_TAX_RULES_2026.upcomingBaseSalary).toBe(2_530_000);
    expect(getUpcomingBhxhBhytCap()).toBe(50_600_000);
  });
});
