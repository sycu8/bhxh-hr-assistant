/**
 * Crawl FAQ Bảo hiểm từ LuatVietnam (luat-su-tu-van/bao-hiem-57.html).
 *
 *   pnpm run faq:crawl-luatvietnam-bao-hiem
 *   pnpm run faq:crawl-luatvietnam-bao-hiem -- --limit=5
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as cheerio from "cheerio";

const BASE = "https://luatvietnam.vn";
const LIST_URL = `${BASE}/luat-su-tu-van/bao-hiem-57.html`;
const OUT_FILE = resolve(
  process.cwd(),
  "src/lib/data/luatvietnam-bao-hiem-faqs.ts",
);

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
};

type ListItem = { question: string; path: string; sourceUrl: string };

type CrawledFaq = {
  slug: string;
  categorySlug: string;
  question: string;
  answer: string;
  keywords: string[];
  citations: Array<{ title: string; sourceUrl: string }>;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (res.ok) return res.text();
    if (res.status === 403 || res.status === 429) {
      await sleep(1500 * (i + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  throw new Error(`Failed after retries: ${url}`);
}

function slugFromPath(path: string): string {
  const name = path.replace(/^\/luat-su-tu-van\//, "").replace(/-faqs\.html$/, "");
  return name.slice(0, 80);
}

function normalizeText(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function summarizeAnswer(text: string, maxLen = 520): string {
  const clean = normalizeText(text);
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 200 ? lastSpace : maxLen).trim()}…`;
}

function inferCategory(question: string, answer: string): string {
  const hay = `${question} ${answer}`.toLocaleLowerCase("vi-VN");
  if (/thai sản|sinh con|nghỉ sinh|mang thai|dưỡng sức sau sinh/.test(hay)) {
    return "thai-san";
  }
  if (/bhyt|bảo hiểm y tế|thẻ bh|khám chữa|chuyển tuyến|tái khám/.test(hay)) {
    return "bhyt";
  }
  if (/bhtn|thất nghiệp|trợ cấp thất nghiệp/.test(hay)) {
    return "bhtn";
  }
  if (/hưu trí|lương hưu|nghỉ hưu/.test(hay)) return "huu-tri";
  if (/ốm|bệnh|nghỉ việc hưởng/.test(hay)) return "om-dau";
  if (/tử tuất|mai táng|chết/.test(hay)) return "tu-tang";
  if (/tai nạn|tnld|bệnh nghề/.test(hay)) return "tai-nan";
  return "bhxh";
}

function keywordsFromQuestion(question: string): string[] {
  const words = question
    .toLocaleLowerCase("vi-VN")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2);
  return [...new Set(words)].slice(0, 8);
}

function parseListPage(html: string): ListItem[] {
  const $ = cheerio.load(html);
  const items: ListItem[] = [];
  const seen = new Set<string>();

  $('a[href*="-faqs.html"]').each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href || !href.includes("-faqs.html")) return;
    const path = href.startsWith("http") ? new URL(href).pathname : href;
    if (seen.has(path)) return;

    let question = normalizeText($(el).text());
    question = question.replace(/^#\d+\s*/, "").trim();
    if (question.length < 8) return;

    seen.add(path);
    items.push({
      question,
      path,
      sourceUrl: `${BASE}${path}`,
    });
  });

  return items;
}

function parsePaginationUrls(html: string): string[] {
  const urls = new Set<string>([LIST_URL]);

  // Chỉ dùng ?page=N — các pattern khác (trang-N, PageIndex) trả về FAQ lẫn lĩnh vực.
  for (let p = 2; p <= 10; p++) {
    urls.add(`${LIST_URL}?page=${p}`);
  }

  return [...urls];
}

function isInsuranceListPage(html: string): boolean {
  return (
    html.includes("Luật sư tư vấn Bảo hiểm") ||
    html.includes("Bảo hiểm (114)") ||
    html.includes("bao-hiem-57")
  );
}

function parseDetailPage(html: string, item: ListItem): string {
  const $ = cheerio.load(html);
  const bodyText = normalizeText($("body").text());

  const aIdx = bodyText.indexOf("Trả lời:");
  if (aIdx >= 0) {
    let answer = bodyText.slice(aIdx + "Trả lời:".length);
    const stopMarkers = [
      "Được tư vấn bởi:",
      "Lưu ý: Nội dung tư vấn",
      "Câu hỏi cùng lĩnh vực",
      "Quý khách có bất kỳ",
    ];
    for (const marker of stopMarkers) {
      const pos = answer.indexOf(marker);
      if (pos > 80) answer = answer.slice(0, pos);
    }
    return summarizeAnswer(answer);
  }

  const blocks = $("p, li, div")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter((t) => t.length > 40);
  const fallback = blocks.find((t) => t.includes("Luật") || t.includes("quy định"));
  return summarizeAnswer(
    fallback ?? `Xem tư vấn chi tiết tại LuatVietnam: ${item.question}`,
  );
}

async function crawlAll(limit?: number) {
  console.log("Fetching list:", LIST_URL);
  const firstHtml = await fetchHtml(LIST_URL);
  const pageUrls = parsePaginationUrls(firstHtml);
  const allItems = new Map<string, ListItem>();

  for (const pageUrl of pageUrls) {
    try {
      const html = pageUrl === LIST_URL ? firstHtml : await fetchHtml(pageUrl);
      if (!isInsuranceListPage(html)) continue;
      const items = parseListPage(html);
      if (items.length === 0) continue;
      console.log(`  ${pageUrl} → ${items.length} links`);
      for (const item of items) allItems.set(item.path, item);
      await sleep(400);
    } catch {
      // Trang phân trang không tồn tại
    }
  }

  let items = [...allItems.values()];
  // Loại trùng câu hỏi (phân trang đôi khi lặp tiêu đề)
  const seenQ = new Set<string>();
  items = items.filter((item) => {
    const key = item.question.toLocaleLowerCase("vi-VN");
    if (seenQ.has(key)) return false;
    seenQ.add(key);
    return true;
  });
  console.log(`Total unique FAQ links: ${items.length}`);
  if (limit && limit > 0) items = items.slice(0, limit);

  const faqs: CrawledFaq[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    process.stdout.write(`\r[${i + 1}/${items.length}] ${item.question.slice(0, 50)}…`);
    try {
      const html = await fetchHtml(item.sourceUrl);
      const answer = parseDetailPage(html, item);
      const categorySlug = inferCategory(item.question, answer);
      faqs.push({
        slug: `lvn-${slugFromPath(item.path)}`,
        categorySlug,
        question: item.question,
        answer,
        keywords: keywordsFromQuestion(item.question),
        citations: [
          {
            title: "LuatVietnam — Luật sư tư vấn Bảo hiểm",
            sourceUrl: item.sourceUrl,
          },
          {
            title: "Danh mục hỏi đáp Bảo hiểm",
            sourceUrl: LIST_URL,
          },
        ],
      });
    } catch (err) {
      console.warn(
        `\nSkip ${item.sourceUrl}:`,
        err instanceof Error ? err.message : err,
      );
    }
    await sleep(350);
  }
  console.log(`\nCrawled ${faqs.length} FAQs`);
  return faqs;
}

function emitTs(faqs: CrawledFaq[]) {
  const header = `/** Tự sinh — pnpm run faq:crawl-luatvietnam-bao-hiem. Nguồn: ${LIST_URL} */
import type { CuratedFaq } from "@/lib/data/curated-faqs";

export const LUATVIETNAM_BAO_HIEM_FAQS: CuratedFaq[] = `;
  writeFileSync(OUT_FILE, `${header}${JSON.stringify(faqs, null, 2)};\n`, "utf8");
  console.log("Wrote", OUT_FILE);
}

function parseLimit(): number | undefined {
  const eq = process.argv.find((a) => a.startsWith("--limit="));
  if (eq) return Number(eq.split("=")[1]);
  const idx = process.argv.indexOf("--limit");
  if (idx >= 0 && process.argv[idx + 1]) return Number(process.argv[idx + 1]);
  return undefined;
}

async function main() {
  const limit = parseLimit();
  const faqs = await crawlAll(limit && limit > 0 ? limit : undefined);
  emitTs(faqs);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
