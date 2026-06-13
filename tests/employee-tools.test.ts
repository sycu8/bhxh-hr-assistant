import { describe, expect, it } from "vitest";
import { TOPICS } from "@/lib/data/topics";
import {
  BENEFITS_EMPLOYEE_TOOLS,
  EMPLOYEE_TOOL_GROUPS,
  HOME_QUICK_LOOKUP_TOOLS,
  HOME_SALARY_TOOL_SHORTCUTS,
  LOOKUP_EMPLOYEE_TOOLS,
  PAYROLL_EMPLOYEE_TOOLS,
} from "@/lib/navigation/employee-tools";
import { PUBLIC_ROUTE_SPECS } from "./fixtures/public-routes";

function collectHrefs(tools: { href: string }[]) {
  return tools.map((t) => t.href);
}

function pathnameOf(href: string) {
  return href.split("?")[0];
}

describe("employee tools catalog", () => {
  it("has four tool groups with non-empty tools", () => {
    expect(EMPLOYEE_TOOL_GROUPS).toHaveLength(4);
    for (const group of EMPLOYEE_TOOL_GROUPS) {
      expect(group.tools.length).toBeGreaterThan(0);
      expect(group.title.length).toBeGreaterThan(2);
    }
  });

  it("every tool has title, description, href, and cta", () => {
    for (const group of EMPLOYEE_TOOL_GROUPS) {
      for (const tool of group.tools) {
        expect(tool.title.trim().length).toBeGreaterThan(0);
        expect(tool.description.trim().length).toBeGreaterThan(10);
        expect(tool.href.startsWith("/")).toBe(true);
        expect(tool.cta.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("payroll tools point to known app routes", () => {
    const paths = collectHrefs(PAYROLL_EMPLOYEE_TOOLS).map(pathnameOf);
    expect(paths).toEqual([
      "/cong-cu-luong-thue",
      "/calculators/luong-co-ban",
      "/calculators/chinh-sach-mien-giam",
    ]);
  });

  it("benefits tools point to topic or reference pages", () => {
    const slugs = new Set(TOPICS.map((t) => t.slug));
    for (const tool of BENEFITS_EMPLOYEE_TOOLS) {
      const topicMatch = tool.href.match(/^\/topics\/([^?]+)/);
      const calculatorMatch = tool.href.match(/^\/calculators\/([^?]+)/);
      expect(topicMatch ?? calculatorMatch).not.toBeNull();
      if (topicMatch) {
        expect(slugs.has(topicMatch[1])).toBe(true);
      }
    }
  });

  it("home shortcuts use valid salary tool query modes", () => {
    for (const s of HOME_SALARY_TOOL_SHORTCUTS) {
      expect(s.href).toMatch(/^\/cong-cu-luong-thue\?mode=(gross-to-net|net-to-gross|take-home)$/);
    }
  });

  it("quick lookup tools are subset of catalog", () => {
    const allHrefs = new Set(
      EMPLOYEE_TOOL_GROUPS.flatMap((g) => g.tools.map((t) => t.href)),
    );
    for (const tool of HOME_QUICK_LOOKUP_TOOLS) {
      expect(allHrefs.has(tool.href)).toBe(true);
    }
  });

  it("all static path hrefs appear in public route smoke list or are search/topics", () => {
    const staticPaths = new Set(PUBLIC_ROUTE_SPECS.map((r) => r.path));
    const allTools = EMPLOYEE_TOOL_GROUPS.flatMap((g) => g.tools);
    for (const tool of allTools) {
      const path = pathnameOf(tool.href);
      if (path.startsWith("/search") || path.startsWith("/topics/")) continue;
      expect(staticPaths.has(path), `missing smoke spec for ${path}`).toBe(true);
    }
  });

  it("lookup tools include search, faq, and legal hub", () => {
    const paths = collectHrefs(LOOKUP_EMPLOYEE_TOOLS).map(pathnameOf);
    expect(paths).toContain("/search");
    expect(paths).toContain("/hoi-dap");
    expect(paths).toContain("/legal-updates");
  });
});
