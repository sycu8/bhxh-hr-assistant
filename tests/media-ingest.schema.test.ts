import { describe, expect, it } from "vitest";
import { mediaIngestBodySchema } from "@/lib/validators/media-ingest.schema";

describe("mediaIngestBodySchema", () => {
  it("accepts search with query", () => {
    const v = mediaIngestBodySchema.parse({
      mode: "search",
      query: "bảo hiểm",
      limit: 2,
    });
    expect(v.mode).toBe("search");
    expect(v.limit).toBe(2);
  });

  it("rejects search without query", () => {
    expect(() =>
      mediaIngestBodySchema.parse({ mode: "search" }),
    ).toThrow();
  });

  it("accepts url with sourceUrl", () => {
    const v = mediaIngestBodySchema.parse({
      mode: "url",
      sourceUrl: "https://images.unsplash.com/photo-1",
    });
    expect(v.mode).toBe("url");
  });
});
