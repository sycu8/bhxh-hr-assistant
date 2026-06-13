import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import {
  assertTurnstileVerified,
  isTurnstileVerificationRequired,
  readTurnstileTokenFromBody,
  verifyTurnstileToken,
} from "@/lib/security/turnstile";
import { getTurnstileSiteKey } from "@/lib/security/turnstile-public";

describe("turnstile", () => {
  it("reads token from JSON body", () => {
    expect(readTurnstileTokenFromBody({ turnstileToken: "abc" })).toBe("abc");
    expect(readTurnstileTokenFromBody({})).toBeUndefined();
  });

  it("skips verification when secret is not configured", async () => {
    const prev = process.env.TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(isTurnstileVerificationRequired()).toBe(false);
    await expect(
      assertTurnstileVerified(new Request("http://x"), undefined),
    ).resolves.toBeUndefined();
    process.env.TURNSTILE_SECRET_KEY = prev;
  });

  it("requires token when secret is configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    await expect(
      assertTurnstileVerified(new Request("http://x"), undefined),
    ).rejects.toBeInstanceOf(ApiError);
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  it("returns true from verify when secret missing", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    await expect(verifyTurnstileToken("any")).resolves.toBe(true);
  });

  it("exposes public site key from env", () => {
    const prev = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    expect(getTurnstileSiteKey()).toBe("site-key");
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = prev;
  });

  it("calls Cloudflare siteverify when secret is set", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyTurnstileToken("token-123", "1.2.3.4")).resolves.toBe(
      true,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );

    vi.unstubAllGlobals();
    delete process.env.TURNSTILE_SECRET_KEY;
  });
});
