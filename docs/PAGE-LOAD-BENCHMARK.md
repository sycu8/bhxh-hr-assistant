# Page load benchmark (< 50 ms)

Đo **thời gian phản hồi server** (TTFB + tải HTML) trên production `next start`, cùng điều kiện mỗi lần chạy.

## Lệnh

```bash
pnpm bench:pages              # build + đo 308 route
BENCH_SKIP_BUILD=1 pnpm bench:pages   # dùng build sẵn
```

Báo cáo JSON: [page-load-benchmark.json](./page-load-benchmark.json)

## Tiêu chí

| Hạng mục | Quy tắc |
|----------|---------|
| Metric | **p50** thời gian GET (ms) |
| Pass | p50 **< 50 ms** |
| Route | Toàn bộ public + admin login + FAQ/FAQ detail curated + sitemap |

## Điều kiện cố định

- Port **3198**, `127.0.0.1`
- 1 warm-up + 3 mẫu / route
- `DATABASE_URL` unset (fallback curated/static, không chờ Postgres)
- `Cache-Control: no-cache` trên mỗi request

## Kết quả gần nhất (2026-06-21)

**308/308 pass** — chậm nhất `/ask-hr` p50 ≈ **20.6 ms**, `/` p50 ≈ **8.4 ms**.

## Tối ưu đã áp dụng

1. **`isDatabaseConfigured()`** — bỏ default `127.0.0.1:5432`, tránh timeout khi không có DB.
2. **Fallback curated** — home popular FAQ, `/faq`, legal updates static JSON (cache module).
3. **ISR `revalidate = 90`** — `/`, `/legal-updates`, `/faq` (static shell + curated data).
4. **`generateStaticParams`** — legal detail + FAQ detail curated slugs.
5. **`FaqDbListPaginated`** — props serializable (sửa lỗi 500 render-prop trên `/faq`).
