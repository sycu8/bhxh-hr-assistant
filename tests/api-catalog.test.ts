import { describe, expect, it } from "vitest";
import {
  API_ENDPOINTS,
  absoluteApiUrl,
  groupEndpointsByAudience,
} from "@/lib/api/api-catalog";
import { buildOpenApiDocument } from "@/lib/api/openapi-document";

describe("api catalog", () => {
  it("lists unique endpoint ids and paths", () => {
    const ids = API_ENDPOINTS.map((e) => e.id);
    const paths = API_ENDPOINTS.map((e) => `${e.method} ${e.path}`);
    expect(new Set(ids).size).toBe(ids.length);
    expect(API_ENDPOINTS.length).toBeGreaterThanOrEqual(10);
    expect(paths.some((p) => p.includes("/api/search"))).toBe(true);
    expect(paths.some((p) => p.includes("/api/openapi.json"))).toBe(true);
  });

  it("groups endpoints by audience without losing entries", () => {
    const grouped = groupEndpointsByAudience();
    const total = Object.values(grouped).reduce((n, list) => n + list.length, 0);
    expect(total).toBe(API_ENDPOINTS.length);
  });

  it("builds absolute API URLs", () => {
    expect(absoluteApiUrl("/api/search")).toMatch(/^https?:\/\//);
    expect(absoluteApiUrl("/api/search")).toContain("/api/search");
  });
});

describe("openapi document", () => {
  it("returns OpenAPI 3.1 with public search path", () => {
    const doc = buildOpenApiDocument();
    expect(doc.openapi).toBe("3.1.0");
    expect(doc.paths["/api/search"]?.post).toBeDefined();
    expect(doc.paths["/api/openapi.json"]).toBeUndefined();
    expect(doc.info.contact.url).toContain("/developers");
  });

  it("includes security schemes for automation", () => {
    const doc = buildOpenApiDocument();
    expect(doc.components.securitySchemes.CronBearer).toBeDefined();
    expect(doc.paths["/api/cron/hris-sync"]?.post).toBeDefined();
  });
});
