# Báo cáo kiểm thử

Cập nhật lần chạy gần nhất: **2026-06-21** — `pnpm test:scenarios` (5 kịch bản) + `pnpm test` (147 unit) + `pnpm audit:seo-geo` + `pnpm bench:pages`.

## Lệnh chạy

```bash
pnpm test:scenarios    # 5 kịch bản chính → docs/scenario-evidence.json
pnpm test              # Vitest đầy đủ
pnpm build && pnpm test:e2e
pnpm test:all          # test + build + e2e smoke
```

Kế hoạch tiêu chí: [SCENARIO-TEST-PLAN.md](./SCENARIO-TEST-PLAN.md)

## 5 kịch bản năng lực chính (pass/fail)

| ID | Kịch bản | Vitest | E2E | Kết quả |
|----|----------|--------|-----|---------|
| S1 | Tra cứu BHXH (search + AI card) | S1-V1, S1-V2 | S1-E1 | **PASS** |
| S2 | FAQ hub + chủ đề BHTN | S2-V1 | S2-E1, S2-E2 | **PASS** |
| S3 | Pháp luật, nguồn, SEO | S3-V1 | S3-E1–E3 | **PASS** |
| S4 | Công cụ lương & hub | S4-V1 | S4-E1, S4-E2 | **PASS** |
| S5 | Hỏi HR + guardrails | S5-V1–V4 | S5-E1, S5-E2 | **PASS** |

Bằng chứng JSON: [scenario-evidence.json](./scenario-evidence.json) — `suitePass: true`.

**Điều kiện:** Node 22, không `DATABASE_URL`, không `TURNSTILE_SECRET_KEY`, port E2E 3199.

## SEO / GEO (2026-06-21)

```bash
pnpm audit:seo-geo
```

**0 critical / 0 high findings** — 8 priority queries map to answer-ready FAQ pages with FAQPage JSON-LD. Chi tiết: [SEO-GEO-AUDIT.md](./SEO-GEO-AUDIT.md), evidence: [seo-geo-audit.json](./seo-geo-audit.json).

## Page load (2026-06-21)

```bash
pnpm bench:pages   # 308 routes, target p50 < 50 ms
```

**308/308 pass** — evidence: [page-load-benchmark.json](./page-load-benchmark.json), [PAGE-LOAD-BENCHMARK.md](./PAGE-LOAD-BENCHMARK.md).

## Kết quả tổng hợp

| Bộ | Passed | Failed | Ghi chú |
|----|--------|--------|---------|
| Scenario suite (Vitest layer) | 9 | 0 | |
| Scenario suite (E2E) | 11 | 0 | search API mock trong S1-E1 |
| Vitest (toàn bộ) | 147 | 0 | gồm SEO/GEO audit checks |
| `pnpm build` | OK | 0 | đã sửa lỗi TS (xem dưới) |

## Lỗi đã phát hiện và xử lý (2026-06-21)

### Build TypeScript (đã sửa)

1. **`CrawlAdminItemRow` thiếu import** — `crawl-review-queue.tsx` import type từ `crawl-queries.ts`.
2. **`CrawlAdminDataJson.sources`** — dùng `CrawlSourceAdminJson[]` (ISO date string) thay vì `Date`.
3. **KVNamespace vs RateLimitKv** — adapter `asRateLimitKv()` dùng chung cho middleware và edge rate limits.

### Kịch bản — không có lỗi chức năng

Mọi check S1–S5 pass sau khi build thành công. Prisma log “Can't reach database” khi không có Postgres — fallback static/curated vẫn hoạt động.

## Phạm vi (kịch bản cũ + smoke)

| Lớp | File | Nội dung |
|-----|------|----------|
| Scenarios | `tests/scenarios-major-capabilities.test.ts`, `e2e/scenarios-major-capabilities.spec.ts` | 5 kịch bản end-to-end |
| Unit | `tests/*.test.ts` | Logic lương, FAQ, crawler, bảo mật… |
| E2E smoke | `e2e/*.spec.ts` | Trang public, nav, form HR |

## Việc nên làm thêm

- E2E search **không mock** khi có DB test (Docker/CI)
- Admin E2E khi có `DATABASE_URL`
- Gửi email HR thật (mock `/api/ask-hr/send`)
