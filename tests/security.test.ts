import { describe, expect, it } from "vitest";
import { assertSafeOutboundUrl, UnsafeOutboundUrlError } from "@/lib/security/ssrf";
import { timingSafeEqualString, verifyBearerToken } from "@/lib/security/timing-safe-equal";
import { getSessionSecret } from "@/lib/security/session-secret";
import { checkKvRateLimit } from "@/lib/security/kv-rate-limit";

describe("security helpers", () => {
  it("blocks private and metadata URLs", () => {
    expect(() => assertSafeOutboundUrl("http://example.com")).toThrow(
      UnsafeOutboundUrlError,
    );
    expect(() => assertSafeOutboundUrl("https://127.0.0.1/admin")).toThrow(
      UnsafeOutboundUrlError,
    );
    expect(() =>
      assertSafeOutboundUrl("https://169.254.169.254/latest/meta-data"),
    ).toThrow(UnsafeOutboundUrlError);
  });

  it("allows HTTPS public URLs and enforces crawl domain suffix", () => {
    const url = assertSafeOutboundUrl("https://baohiemxahoi.gov.vn/vanban?id=1", {
      allowedHostSuffix: "baohiemxahoi.gov.vn",
    });
    expect(url.hostname).toBe("baohiemxahoi.gov.vn");

    expect(() =>
      assertSafeOutboundUrl("https://evil.example.com/doc", {
        allowedHostSuffix: "baohiemxahoi.gov.vn",
      }),
    ).toThrow(UnsafeOutboundUrlError);
  });

  it("compares bearer tokens in constant time", () => {
    expect(verifyBearerToken("Bearer secret-token", "secret-token")).toBe(true);
    expect(verifyBearerToken("Bearer wrong", "secret-token")).toBe(false);
    expect(timingSafeEqualString("abc", "abc")).toBe(true);
    expect(timingSafeEqualString("abc", "abd")).toBe(false);
  });

  it("uses dev session secret outside production", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    delete process.env.SESSION_SECRET;
    expect(getSessionSecret()).toContain("dev-session-secret");
    process.env.NODE_ENV = prev;
  });

  it("rate limits after max requests in window", async () => {
    const config = { max: 3, windowSec: 60 };
    const now = 1_700_000_000_000;
    for (let i = 0; i < 3; i += 1) {
      const ok = await checkKvRateLimit({
        storageKey: "test-key",
        config,
        now: now + i,
      });
      expect(ok.allowed).toBe(true);
    }
    const blocked = await checkKvRateLimit({
      storageKey: "test-key",
      config,
      now: now + 3,
    });
    expect(blocked.allowed).toBe(false);
  });
});
