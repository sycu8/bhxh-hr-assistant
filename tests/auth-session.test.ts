import { describe, expect, it } from "vitest";
import {
  createRawSessionToken,
  hashSessionToken,
  signSessionPayload,
  verifySessionPayload,
} from "@/lib/auth/session-cookie";

describe("session cookie", () => {
  it("signs and verifies payload", async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const signed = await signSessionPayload({
      sessionId: "sess-1",
      userId: "user-1",
      role: "ADMIN",
      exp,
    });
    const payload = await verifySessionPayload(signed);
    expect(payload?.userId).toBe("user-1");
    expect(payload?.role).toBe("ADMIN");
  });

  it("hashes raw session tokens deterministically", async () => {
    const raw = createRawSessionToken();
    const hash = await hashSessionToken(raw);
    expect(hash).toHaveLength(64);
    expect(await hashSessionToken(raw)).toBe(hash);
  });
});
