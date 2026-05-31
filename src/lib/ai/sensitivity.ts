/**
 * Phát hiện câu hỏi có khả năng phụ thuộc hồ sơ cá nhân / cần HR xác minh.
 * MVP: từ khóa đơn giản — có thể mở rộng bằng classifier sau.
 */
const SENSITIVE_PATTERNS =
  /\b(cccd|cmnd|mst|mã\s*số\s*thuế|lương\s*của\s*tôi|hợp\s*đồng\s*của\s*tôi|stk|số\s*tài\s*khoản|định\s*danh)\b/i;

export function questionLikelyNeedsHrContext(question: string): boolean {
  return SENSITIVE_PATTERNS.test(question.trim());
}
