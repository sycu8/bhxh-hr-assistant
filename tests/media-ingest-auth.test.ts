import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { assertMediaIngestAuthorized } from "@/lib/media/assert-ingest-auth";

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/security/timing-safe-equal", () => ({
  verifyBearerToken: vi.fn(),
}));

import { getSessionUser } from "@/lib/auth/session";
import { verifyBearerToken } from "@/lib/security/timing-safe-equal";

describe("assertMediaIngestAuthorized", () => {
  beforeEach(() => {
    vi.mocked(getSessionUser).mockReset();
    vi.mocked(verifyBearerToken).mockReset();
  });

  it("allows CMS session with media:write", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      id: "u1",
      email: "hr@fpt.com",
      name: "HR",
      role: "HR",
    });

    const result = await assertMediaIngestAuthorized(new Request("http://x"), {});
    expect(result.user?.id).toBe("u1");
    expect(result.viaBearer).toBe(false);
  });

  it("allows bearer token when session absent", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    vi.mocked(verifyBearerToken).mockReturnValue(true);

    const result = await assertMediaIngestAuthorized(
      new Request("http://x", {
        headers: { authorization: "Bearer secret" },
      }),
      { MEDIA_INGEST_TOKEN: "secret" },
    );
    expect(result.viaBearer).toBe(true);
  });

  it("rejects unauthenticated requests without bearer", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    vi.mocked(verifyBearerToken).mockReturnValue(false);

    await expect(
      assertMediaIngestAuthorized(new Request("http://x"), {
        MEDIA_INGEST_TOKEN: "secret",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
