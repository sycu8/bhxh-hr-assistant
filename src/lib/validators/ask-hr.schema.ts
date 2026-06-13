import { z } from "zod";

const topicValues = ["bhxh", "bhyt", "bhtn", "thai-san", "khac"] as const;
const urgentValues = ["normal", "soon", "urgent"] as const;

export const askHrSendSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "Câu hỏi cần ít nhất 5 ký tự.")
    .max(4000),
  detail: z.string().trim().max(4000).optional(),
  topic: z.enum(topicValues),
  urgent: z.enum(urgentValues),
  replyEmail: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email của bạn.")
    .max(254)
    .email("Email phản hồi không hợp lệ."),
  searchQuery: z.string().trim().max(500).optional(),
  questionLogId: z.string().trim().max(64).optional(),
});

export type AskHrSendInput = z.infer<typeof askHrSendSchema>;
