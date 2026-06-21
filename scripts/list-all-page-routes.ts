/** All public page paths for load benchmarks (stdout JSON array). */
import { CURATED_LEGAL_UPDATES } from "../src/lib/data/curated-legal-updates";
import { listCuratedFaqs } from "../src/lib/data/curated-faqs";
import { TOPICS } from "../src/lib/data/topics";

const STATIC = [
  "/",
  "/search",
  "/hoi-dap",
  "/ask-hr",
  "/calculators",
  "/calculators/luong-co-ban",
  "/calculators/chinh-sach-mien-giam",
  "/calculators/che-do-thai-san",
  "/cong-cu-luong-thue",
  "/cong-cu-luong-thue?mode=gross-to-net",
  "/nguon-phap-luat",
  "/topics",
  "/legal-updates",
  "/cap-nhat-phap-luat",
  "/faq",
  "/robots.txt",
  "/sitemap.xml",
];

const ADMIN = [
  "/admin/login",
  "/admin",
  "/admin/faqs",
  "/admin/topics",
  "/admin/tickets",
  "/admin/calculators",
  "/admin/audit",
  "/admin/search-analytics",
  "/admin/legal-crawler",
];

const paths = [
  ...STATIC,
  ...listCuratedFaqs().map((f) => `/hoi-dap/${f.slug}`),
  ...TOPICS.map((t) => `/topics/${t.slug}`),
  ...CURATED_LEGAL_UPDATES.map((u) => `/legal-updates/${u.slug}`),
  ...listCuratedFaqs().map((f) => `/faq/${f.slug}`),
  ...ADMIN,
];

process.stdout.write(`${JSON.stringify(paths)}\n`);
