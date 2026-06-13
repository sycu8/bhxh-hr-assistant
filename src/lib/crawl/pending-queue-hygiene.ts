/** Số ngày tối đa một mục được giữ trong hàng chờ duyệt. */
export const PENDING_CRAWL_QUEUE_MAX_AGE_DAYS = 30;

export type CrawlQueueExpiryInput = {
  expiryDate: Date | null;
  issuedDate?: Date | null;
  effectiveDate?: Date | null;
  crawledAt: Date;
};

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Văn bản ban hành trước mốc này chỉ loại khi có văn bản thay thế từ 2025 (xem superseded-pending). */
export const EXPIRED_ISSUED_BEFORE = new Date("2023-01-01T00:00:00.000Z");

export function isExpiredPendingCrawlItem(
  item: CrawlQueueExpiryInput,
  now = new Date(),
): boolean {
  const today = startOfTodayUtc();

  if (item.expiryDate && item.expiryDate < today) {
    return true;
  }

  const maxAgeMs = PENDING_CRAWL_QUEUE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  if (now.getTime() - item.crawledAt.getTime() > maxAgeMs) {
    return true;
  }

  return false;
}

export const EXPIRED_PENDING_CRAWL_NOTE =
  "Tự động lưu trữ — văn bản đã hết hạn hoặc quá hạn duyệt.";
