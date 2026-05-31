import { z } from "zod";
import { employeeGroupSchema, optionalCategorySlug } from "./common";

export const searchBodySchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Từ khóa quá ngắn.")
    .max(2000, "Truy vấn quá dài."),
  employeeGroup: employeeGroupSchema,
  categorySlug: optionalCategorySlug,
  /** Số kết quả gợi ý tối đa (FAQ + đoạn văn bản) */
  hitLimit: z.coerce.number().int().min(1).max(30).optional().default(12),
});

export type SearchBody = z.infer<typeof searchBodySchema>;
