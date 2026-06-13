import { describe, expect, it } from "vitest";
import { isExpiredPendingCrawlItem } from "@/lib/crawl/pending-queue-hygiene";

describe("pending crawl queue expiry", () => {
  const now = new Date("2026-06-06T12:00:00.000Z");

  it("marks items with past expiryDate as expired", () => {
    expect(
      isExpiredPendingCrawlItem(
        {
          expiryDate: new Date("2026-01-01"),
          issuedDate: null,
          crawledAt: new Date("2026-06-01"),
        },
        now,
      ),
    ).toBe(true);
  });

  it("does not auto-expire old issued docs without replacement logic", () => {
    expect(
      isExpiredPendingCrawlItem(
        {
          expiryDate: null,
          issuedDate: new Date("2020-05-01"),
          crawledAt: new Date("2026-06-01"),
        },
        now,
      ),
    ).toBe(false);
  });

  it("keeps fresh pending items in queue", () => {
    expect(
      isExpiredPendingCrawlItem(
        {
          expiryDate: null,
          issuedDate: new Date("2026-01-01"),
          crawledAt: new Date("2026-06-05"),
        },
        now,
      ),
    ).toBe(false);
  });
});
