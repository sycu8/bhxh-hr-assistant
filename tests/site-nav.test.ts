import { describe, expect, it } from "vitest";
import {
  DESKTOP_EXTRA_NAV,
  FOOTER_NAV,
  MORE_NAV,
  PRIMARY_NAV,
} from "@/lib/navigation/site-nav";

const ALL_NAV = [...PRIMARY_NAV, ...DESKTOP_EXTRA_NAV, ...MORE_NAV, ...FOOTER_NAV];

describe("site navigation", () => {
  it("all links are internal paths", () => {
    for (const item of ALL_NAV) {
      expect(item.href.startsWith("/")).toBe(true);
      expect(item.href.includes("://")).toBe(false);
    }
  });

  it("every item has label", () => {
    for (const item of ALL_NAV) {
      expect(item.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("primary nav includes employee journey entry points", () => {
    const hrefs = PRIMARY_NAV.map((i) => i.href);
    expect(hrefs).toContain("/search");
    expect(hrefs).toContain("/hoi-dap");
    expect(hrefs).toContain("/ask-hr");
  });

  it("desktop extra includes calculators hub", () => {
    expect(DESKTOP_EXTRA_NAV.some((i) => i.href === "/calculators")).toBe(true);
  });

  it("more menu lists employee tool deep links", () => {
    const hrefs = MORE_NAV.map((i) => i.href);
    expect(hrefs).toContain("/calculators/luong-co-ban");
    expect(hrefs).toContain("/calculators/chinh-sach-mien-giam");
  });
});
