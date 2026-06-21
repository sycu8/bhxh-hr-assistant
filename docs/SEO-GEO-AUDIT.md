# SEO / GEO audit

Đánh giá **crawlability, indexation, page intent, titles, internal links, structured data, citations, answer-first content** — lặp fix → rerun cho đến khi không còn gap critical/high.

## Lệnh

```bash
pnpm audit:seo-geo              # build + crawl + 8 priority queries
SEO_SKIP_BUILD=1 pnpm audit:seo-geo
pnpm test tests/seo-geo-audit.test.ts
```

Báo cáo JSON: [seo-geo-audit.json](./seo-geo-audit.json)

## Rubric (impact)

| Severity | Ý nghĩa |
|----------|---------|
| **critical** | Chặn index/GEO (HTTP 5xx, thiếu FAQPage JSON-LD, query không map trang) |
| **high** | Giảm ranking/AI citation (thiếu H1, thiếu answer snippet, sitemap thiếu URL) |
| **medium** | Trích dẫn/UX SEO phụ |
| **low** | Tối ưu tinh |

**Pass:** `critical=0` và `high=0`.

## Engines (mô phỏng)

- **google-crawl-sim** — robots, sitemap, HTML tĩnh
- **bing-crawl-sim** — cùng HTML + canonical
- **ai-answer-sim** — FAQPage JSON-LD, answer-first text, `isBasedOn` citations

## 8 priority queries → trang canonical

| ID | Query | Trang |
|----|-------|-------|
| Q1 | có bắt buộc tham gia BHXH không | `/hoi-dap/bat-buoc-tham-gia-bhxh` |
| Q2 | nghỉ không lương 14 ngày… | `/hoi-dap/nghi-khong-luong-14-ngay` |
| Q3 | mức đóng BHXH… | `/hoi-dap/muc-dong-bhxh-bhyt-bhtn` |
| Q4 | nghỉ thai sản… | `/hoi-dap/che-do-thai-san-tom-tat` |
| Q5 | trợ cấp thất nghiệp BHTN | `/hoi-dap/dieu-kien-tro-cap-that-nghiep` |
| Q6 | người phụ thuộc giảm trừ | `/hoi-dap/nguoi-phu-thuoc-giam-tru` |
| Q7 | lương cơ sở 2026 | `/hoi-dap/luong-co-so-2-53-2026` |
| Q8 | nghỉ ốm có được hưởng BHXH | `/hoi-dap/nghi-om-benh` |

## Gaps đã xếp hạng & xử lý (2026-06-21)

| Impact | Gap | Fix |
|--------|-----|-----|
| 1 Critical | Không có FAQPage JSON-LD trên FAQ detail | `buildFaqPageJsonLd` + `JsonLd` trên `/hoi-dap/[slug]` |
| 2 Critical | Priority query không có machine-readable answer | FAQPage + answer-first block + citations |
| 3 High | Sitemap thiếu ~38 legal slug static | `allPublishedLegalSlugs()` trong sitemap |
| 4 High | `/faq/*` trùng `/hoi-dap/*` | Redirect curated slug → `/hoi-dap/{slug}` |
| 5 High | `/search` thiếu H1 SSR (client-only) | H1 server + popular query links |
| 6 High | Thiếu WebSite/SearchAction | `buildSiteJsonLd()` trong root layout |
| 7 Medium | Related FAQ links hiển thị slug | Hiển thị câu hỏi đầy đủ |
| 8 Medium | Legal detail thiếu Article schema | `buildLegalUpdateJsonLd` |

## Kết quả gần nhất

**0 findings** — 8/8 priority queries pass, robots/sitemap OK.
