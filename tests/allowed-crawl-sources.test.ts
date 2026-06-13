import { describe, expect, it } from "vitest";
import {
  DISALLOWED_CRAWL_DOMAINS,
  INSURANCE_CRAWL_SOURCES,
  isDisallowedCrawlDomain,
} from "@/lib/crawl/allowed-sources";

describe("allowed crawl sources", () => {
  it("blocks general government ministry portals", () => {
    expect(isDisallowedCrawlDomain("chinhphu.vn")).toBe(true);
    expect(isDisallowedCrawlDomain("www.chinhphu.vn")).toBe(true);
    expect(isDisallowedCrawlDomain("moj.gov.vn")).toBe(true);
    expect(isDisallowedCrawlDomain("moha.gov.vn")).toBe(true);
  });

  it("allows insurance and labor-related domains", () => {
    for (const domain of [
      "baohiemxahoi.gov.vn",
      "molisa.gov.vn",
      "vbpl.vn",
      "luatvietnam.vn",
    ]) {
      expect(isDisallowedCrawlDomain(domain)).toBe(false);
    }
  });

  it("does not seed disallowed domains", () => {
    for (const source of INSURANCE_CRAWL_SOURCES) {
      expect(isDisallowedCrawlDomain(source.domain)).toBe(false);
    }
    for (const blocked of DISALLOWED_CRAWL_DOMAINS) {
      expect(
        INSURANCE_CRAWL_SOURCES.some((s) => s.domain.includes(blocked)),
      ).toBe(false);
    }
  });
});
