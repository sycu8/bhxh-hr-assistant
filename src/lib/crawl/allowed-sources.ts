import {
  CrawlFrequency,
  CrawlSourceType,
  CrawlTrustLevel,
} from "@prisma/client";

/** Nguồn bộ/ngành tổng hợp — không thu thập tự động. */
export const DISALLOWED_CRAWL_DOMAINS = [
  "chinhphu.vn",
  "www.chinhphu.vn",
  "moj.gov.vn",
  "moha.gov.vn",
] as const;

export type CrawlSourceSeed = {
  name: string;
  baseUrl: string;
  domain: string;
  sourceType: CrawlSourceType;
  trustLevel: CrawlTrustLevel;
  active: boolean;
  crawlFrequency: CrawlFrequency;
};

/** Chỉ nguồn BHXH/BHYT/BHTN, lao động và quyền lợi người lao động. */
export const INSURANCE_CRAWL_SOURCES: CrawlSourceSeed[] = [
  {
    name: "Cổng thông tin điện tử Bảo hiểm xã hội Việt Nam",
    baseUrl: "https://baohiemxahoi.gov.vn",
    domain: "baohiemxahoi.gov.vn",
    sourceType: CrawlSourceType.OFFICIAL,
    trustLevel: CrawlTrustLevel.HIGH,
    active: true,
    crawlFrequency: CrawlFrequency.DAILY,
  },
  {
    name: "Danh mục văn bản BHXH Việt Nam",
    baseUrl: "https://baohiemxahoi.gov.vn/vanban/pages/default.aspx",
    domain: "baohiemxahoi.gov.vn",
    sourceType: CrawlSourceType.OFFICIAL,
    trustLevel: CrawlTrustLevel.HIGH,
    active: true,
    crawlFrequency: CrawlFrequency.DAILY,
  },
  {
    name: "Bộ Lao động - Thương binh và Xã hội",
    baseUrl: "https://molisa.gov.vn",
    domain: "molisa.gov.vn",
    sourceType: CrawlSourceType.OFFICIAL,
    trustLevel: CrawlTrustLevel.HIGH,
    active: true,
    crawlFrequency: CrawlFrequency.WEEKLY,
  },
  {
    name: "Cơ sở dữ liệu quốc gia về văn bản pháp luật",
    baseUrl: "https://vbpl.vn",
    domain: "vbpl.vn",
    sourceType: CrawlSourceType.LEGAL_DATABASE,
    trustLevel: CrawlTrustLevel.HIGH,
    active: true,
    crawlFrequency: CrawlFrequency.WEEKLY,
  },
  {
    name: "LuatVietnam — CSDL văn bản pháp luật",
    baseUrl: "https://luatvietnam.vn",
    domain: "luatvietnam.vn",
    sourceType: CrawlSourceType.LEGAL_DATABASE,
    trustLevel: CrawlTrustLevel.HIGH,
    active: true,
    crawlFrequency: CrawlFrequency.WEEKLY,
  },
];

export function isDisallowedCrawlDomain(domain: string): boolean {
  const normalized = domain.replace(/^www\./, "").toLowerCase();
  return DISALLOWED_CRAWL_DOMAINS.some(
    (blocked) =>
      normalized === blocked.replace(/^www\./, "") ||
      normalized.endsWith(`.${blocked.replace(/^www\./, "")}`),
  );
}
