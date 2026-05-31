import { z } from "zod";

export const mediaIngestBodySchema = z
  .object({
    mode: z.enum(["search", "generate", "url"]),
    /** Từ khóa tìm ảnh (Unsplash) khi mode = search */
    query: z.string().min(1).max(200).optional(),
    /** Prompt tiếng Việt/Anh khi mode = generate (OpenAI DALL·E 3) */
    prompt: z.string().min(1).max(4000).optional(),
    /** URL ảnh nguồn khi mode = url */
    sourceUrl: z.string().url().max(2048).optional(),
    maxWidth: z.coerce.number().int().min(320).max(4096).default(1280),
    /** Số ảnh tối đa lưu khi search (1–5) */
    limit: z.coerce.number().int().min(1).max(5).default(3),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "search" && !val.query?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thiếu query cho mode search.",
        path: ["query"],
      });
    }
    if (val.mode === "generate" && !val.prompt?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thiếu prompt cho mode generate.",
        path: ["prompt"],
      });
    }
    if (val.mode === "url" && !val.sourceUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thiếu sourceUrl cho mode url.",
        path: ["sourceUrl"],
      });
    }
  });

export type MediaIngestBody = z.infer<typeof mediaIngestBodySchema>;
