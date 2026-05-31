import { z } from "zod";
import { employeeGroupSchema } from "./common";

export const askBodySchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Câu hỏi quá ngắn.")
    .max(2000, "Câu hỏi vượt quá độ dài cho phép."),
  employeeGroup: employeeGroupSchema,
  categorySlug: z.string().trim().min(1).max(120).optional(),
});

export type AskBody = z.infer<typeof askBodySchema>;
