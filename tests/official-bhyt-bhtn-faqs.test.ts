import { describe, expect, it } from "vitest";
import {
  countOfficialBhytBhtnFaqs,
  OFFICIAL_BHYT_BHTN_FAQS,
} from "@/lib/data/official-bhyt-bhtn-faqs";
import { CURATED_FAQS, listCuratedFaqs } from "@/lib/data/curated-faqs";
import { CURATED_LEGAL_UPDATES } from "@/lib/data/curated-legal-updates";

describe("official BHYT/BHTN FAQs", () => {
  it("includes curated pack from official sources", () => {
    const counts = countOfficialBhytBhtnFaqs();
    expect(counts.bhyt).toBeGreaterThanOrEqual(8);
    expect(counts.bhtn).toBeGreaterThanOrEqual(6);
    expect(OFFICIAL_BHYT_BHTN_FAQS.every((f) => f.citations.length > 0)).toBe(
      true,
    );
  });

  it("merges into CURATED_FAQS with BHYT/BHTN coverage", () => {
    const bhyt = listCuratedFaqs("bhyt");
    const bhtn = listCuratedFaqs("bhtn");
    expect(bhyt.length).toBeGreaterThanOrEqual(25);
    expect(bhtn.length).toBeGreaterThanOrEqual(18);
    expect(CURATED_FAQS.some((f) => f.slug.startsWith("official-bhyt-"))).toBe(
      true,
    );
    expect(CURATED_FAQS.some((f) => f.slug.startsWith("official-bhtn-"))).toBe(
      true,
    );
  });

  it("adds curated legal updates for BHYT/BHTN framework", () => {
    const slugs = CURATED_LEGAL_UPDATES.map((u) => u.slug);
    expect(slugs).toContain("luat-bao-hiem-y-te-2008");
    expect(slugs).toContain("nghi-dinh-146-2018-bhyt-kcb");
    expect(slugs).toContain("luat-viec-lam-tro-cap-that-nghiep");
    expect(slugs).toContain("nghi-dinh-274-2025-bhtn-cham-dong");
  });
});
