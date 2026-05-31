import { describe, expect, it } from "vitest";
import { paginateItems, parsePageParam } from "@/lib/pagination/paginate";

describe("paginateItems", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it("returns first page slice", () => {
    const r = paginateItems(items, 1, 10);
    expect(r.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r.totalPages).toBe(3);
    expect(r.page).toBe(1);
  });

  it("clamps invalid page", () => {
    const r = paginateItems(items, 99, 10);
    expect(r.page).toBe(3);
    expect(r.items[0]).toBe(21);
  });
});

describe("parsePageParam", () => {
  it("parses valid page", () => {
    expect(parsePageParam("2")).toBe(2);
  });
  it("falls back for invalid", () => {
    expect(parsePageParam("x")).toBe(1);
  });
});
