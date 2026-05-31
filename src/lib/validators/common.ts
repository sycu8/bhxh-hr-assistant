import { z } from "zod";

export const employeeGroupSchema = z
  .enum(["PROBATION", "OFFICIAL", "MANAGER"])
  .optional()
  .default("OFFICIAL");

export const optionalCategorySlug = z.string().trim().min(1).max(120).optional();
