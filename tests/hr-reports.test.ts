import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/services/reports/hr-reports.service";

describe("hr reports", () => {
  it("exports csv rows", () => {
    const csv = toCsv([
      { department: "HR", count: 5 },
      { department: "IT", count: 10 },
    ]);
    expect(csv).toContain('"department"');
    expect(csv).toContain('"HR"');
    expect(csv.split("\n")).toHaveLength(3);
  });

  it("returns empty string for no rows", () => {
    expect(toCsv([])).toBe("");
  });
});
