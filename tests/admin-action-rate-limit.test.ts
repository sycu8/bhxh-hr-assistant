import { describe, expect, it } from "vitest";
import {
  checkAdminActionRateLimit,
  DEFAULT_ADMIN_ACTION_RATE_LIMIT,
} from "@/lib/security/admin-action-rate-limit";

describe("admin action rate limit", () => {
  it("allows bursts up to the configured max", async () => {
    const config = { max: 5, windowSec: 60 };
    const now = 1_700_000_000_000;

    for (let i = 0; i < 5; i += 1) {
      const result = await checkAdminActionRateLimit({
        key: "user-1",
        config,
        now: now + i,
      });
      expect(result.allowed).toBe(true);
    }

    const blocked = await checkAdminActionRateLimit({
      key: "user-1",
      config,
      now: now + 5,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("defaults to a high threshold for CMS review workflows", () => {
    expect(DEFAULT_ADMIN_ACTION_RATE_LIMIT.max).toBeGreaterThanOrEqual(40);
    expect(DEFAULT_ADMIN_ACTION_RATE_LIMIT.windowSec).toBeGreaterThanOrEqual(300);
  });
});
