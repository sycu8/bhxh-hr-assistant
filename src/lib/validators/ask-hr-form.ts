import {
  askHrSendSchema,
  type AskHrSendInput,
} from "@/lib/validators/ask-hr.schema";

export const ASK_HR_TOPIC_VALUES = [
  "bhxh",
  "bhyt",
  "bhtn",
  "thai-san",
  "khac",
] as const;

export const ASK_HR_URGENT_VALUES = ["normal", "soon", "urgent"] as const;

export type AskHrTopicValue = (typeof ASK_HR_TOPIC_VALUES)[number];
export type AskHrUrgentValue = (typeof ASK_HR_URGENT_VALUES)[number];

export function isValidHrReplyEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isAskHrTopicValue(value: string): value is AskHrTopicValue {
  return (ASK_HR_TOPIC_VALUES as readonly string[]).includes(value);
}

export function isAskHrUrgentValue(value: string): value is AskHrUrgentValue {
  return (ASK_HR_URGENT_VALUES as readonly string[]).includes(value);
}

/** Đủ 4 trường bắt buộc + đồng ý điều khoản → có thể gửi. */
export function isAskHrFormReady(input: {
  question: string;
  replyEmail: string;
  topic: string;
  urgent: string;
  agree: boolean;
}): boolean {
  return (
    input.agree &&
    input.question.trim().length >= 5 &&
    isValidHrReplyEmail(input.replyEmail) &&
    isAskHrTopicValue(input.topic) &&
    isAskHrUrgentValue(input.urgent)
  );
}

export function parseAskHrSendPayload(raw: unknown) {
  return askHrSendSchema.safeParse(raw);
}

export type { AskHrSendInput };
