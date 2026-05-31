import { describe, expect, it } from "vitest";
import {
  compareByIssuanceDesc,
  getLegalUpdateIssuanceDate,
  isWithinIssuanceRange,
  matchesLegalUpdateSearch,
} from "@/lib/legal-updates/list-utils";

describe("legal-updates list-utils", () => {
  it("prefers issuedDate over effectiveDate", () => {
    const d = getLegalUpdateIssuanceDate({
      issuedDate: "2018-01-01",
      effectiveDate: "2019-01-01",
    });
    expect(d?.getFullYear()).toBe(2018);
  });

  it("sorts by issuance descending", () => {
    const newer = { issuedDate: "2020-05-01" };
    const older = { issuedDate: "2017-01-01" };
    expect(compareByIssuanceDesc(newer, older)).toBeLessThan(0);
    expect(compareByIssuanceDesc(older, newer)).toBeGreaterThan(0);
  });

  it("filters by issuance date range", () => {
    const row = { issuedDate: "2017-06-15" };
    expect(
      isWithinIssuanceRange(row, new Date("2017-01-01"), new Date("2017-12-31")),
    ).toBe(true);
    expect(
      isWithinIssuanceRange(row, new Date("2018-01-01"), new Date("2018-12-31")),
    ).toBe(false);
  });

  it("matches search in title and document number", () => {
    expect(
      matchesLegalUpdateSearch(
        { title: "376/Ctr-BHXH: Chương trình", documentNumber: "376/Ctr-BHXH" },
        "376",
      ),
    ).toBe(true);
    expect(
      matchesLegalUpdateSearch({ title: "Khác", documentNumber: null }, "376"),
    ).toBe(false);
  });
});
