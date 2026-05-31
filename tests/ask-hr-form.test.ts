import { describe, expect, it } from "vitest";
import { isAskHrFormReady } from "@/lib/validators/ask-hr-form";

describe("isAskHrFormReady", () => {
  const base = {
    replyEmail: "nhanvien@fpt.com",
    topic: "bhxh",
    urgent: "normal",
    question: "Em có bắt buộc đóng BHXH không?",
    agree: true,
  };

  it("is false when any required field is missing", () => {
    expect(isAskHrFormReady({ ...base, replyEmail: "" })).toBe(false);
    expect(isAskHrFormReady({ ...base, topic: "" })).toBe(false);
    expect(isAskHrFormReady({ ...base, urgent: "" })).toBe(false);
    expect(isAskHrFormReady({ ...base, question: "hi" })).toBe(false);
    expect(isAskHrFormReady({ ...base, agree: false })).toBe(false);
  });

  it("is true when all required fields are valid", () => {
    expect(isAskHrFormReady(base)).toBe(true);
  });
});
