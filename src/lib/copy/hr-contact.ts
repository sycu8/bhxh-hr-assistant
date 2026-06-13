/**
 * Email HR/C&B nhận câu hỏi từ form Hỏi HR.
 * Cấu hình qua `HR_CONTACT_EMAIL` (wrangler var / .env) — không hard-code email cá nhân.
 */
export const HR_CONTACT_EMAIL =
  process.env.HR_CONTACT_EMAIL?.trim() || "trangtth39@fpt.com";
