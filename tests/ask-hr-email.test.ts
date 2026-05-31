import { describe, expect, it } from "vitest";
import { askHrSendSchema } from "@/lib/validators/ask-hr.schema";

describe("askHrSendSchema", () => {
  it("accepts valid payload with optional reply email", () => {
    const parsed = askHrSendSchema.safeParse({
      question: "Em nghỉ không lương có ảnh hưởng BHXH không?",
      topic: "bhxh",
      urgent: "normal",
      replyEmail: "nhanvien@fpt.com",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects short questions", () => {
    const parsed = askHrSendSchema.safeParse({
      question: "hi",
      topic: "bhxh",
      urgent: "normal",
      replyEmail: "nhanvien@fpt.com",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing reply email", () => {
    const parsed = askHrSendSchema.safeParse({
      question: "Em nghỉ không lương có ảnh hưởng BHXH không?",
      topic: "bhxh",
      urgent: "normal",
    });
    expect(parsed.success).toBe(false);
  });
});
