import { describe, expect, it } from "vitest";
import { parseJsonResponse } from "@/lib/api/parse-json-response";

describe("parseJsonResponse", () => {
  it("parses valid JSON", async () => {
    const res = new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
    const json = await parseJsonResponse(res);
    expect(json).toEqual({ success: true });
  });

  it("rejects HTML error pages with friendly message", async () => {
    const res = new Response("<!DOCTYPE html><html><body>Error</body></html>", {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
    await expect(parseJsonResponse(res)).rejects.toThrow(
      /trang lỗi thay vì JSON/i,
    );
  });

  it("rejects malformed JSON", async () => {
    const res = new Response("{not-json", {
      headers: { "Content-Type": "application/json" },
    });
    await expect(parseJsonResponse(res)).rejects.toThrow(
      /Không đọc được phản hồi JSON/i,
    );
  });
});
