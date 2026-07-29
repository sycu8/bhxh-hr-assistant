import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatCloudflareEmailError,
  isPlaceholderHrEmailFrom,
  resolveHrEmailFrom,
  sendCloudflareEmail,
} from "@/lib/email/cloudflare-email-transport";

describe("HR email from validation", () => {
  afterEach(() => {
    delete process.env.HR_EMAIL_FROM;
  });

  it("rejects placeholder HR_EMAIL_FROM", () => {
    process.env.HR_EMAIL_FROM = "noreply@your-verified-domain.com";
    expect(isPlaceholderHrEmailFrom(process.env.HR_EMAIL_FROM)).toBe(true);
    expect(() => resolveHrEmailFrom()).toThrow(/HR_EMAIL_FROM không hợp lệ/);
  });

  it("maps Cloudflare invalid sender errors", () => {
    expect(
      formatCloudflareEmailError("email.sending.error.email.invalid"),
    ).toMatch(/HR_EMAIL_FROM/);
  });
});

describe("sendCloudflareEmail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.HR_EMAIL_FROM;
    delete process.env.CLOUDFLARE_EMAIL_API_TOKEN;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
  });

  it("calls Cloudflare Email Sending API (not routing)", async () => {
    process.env.HR_EMAIL_FROM = "noreply@orangecloud.vn";
    process.env.CLOUDFLARE_EMAIL_API_TOKEN = "test-token";
    process.env.CLOUDFLARE_ACCOUNT_ID = "acct-123";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: { delivered: ["employee@fpt.com"] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await sendCloudflareEmail({
      to: "employee@fpt.com",
      fromName: "Cổng HR FPT Telecom",
      subject: "OTP",
      text: "123456",
      html: "<p>123456</p>",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://api.cloudflare.com/client/v4/accounts/acct-123/email/sending/send",
    );
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body));
    expect(body.to).toBe("employee@fpt.com");
    expect(body.from).toEqual({
      address: "noreply@orangecloud.vn",
      name: "Cổng HR FPT Telecom",
    });
  });
});
