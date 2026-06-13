# Báo cáo kiểm thử

Cập nhật lần chạy gần nhất: **2026-05-31** — `pnpm build` + `pnpm test` + `pnpm test:e2e`.

## Lệnh chạy

```bash
pnpm test              # 63 unit/API tests (Vitest)
pnpm build             # bắt buộc trước E2E
pnpm test:e2e          # Playwright (port 3199, tự build server qua scripts/start-e2e-server.mjs)
pnpm test:all          # test + build + e2e
# hoặc server sẵn:
$env:PLAYWRIGHT_SKIP_WEBSERVER="1"
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3199"
pnpm test:e2e
```

## Phạm vi

| Lớp | File | Nội dung |
|-----|------|----------|
| Unit | `tests/*.test.ts` | Logic lương, FAQ, phân trang, form HR, crawler… |
| API | `tests/api-calculator.route.test.ts` | POST `/api/calculators/salary-tax` |
| Catalog | `tests/employee-tools.test.ts`, `tests/site-nav.test.ts` | Link công cụ & menu hợp lệ |
| E2E | `e2e/*.spec.ts` | Trang public, hub công cụ, nav, tính lương, form HR, footer LinkedIn |

## Kết quả tổng hợp (lần chạy gần nhất)

| Bộ | Passed | Failed | Skipped | Ghi chú |
|----|--------|--------|---------|---------|
| Vitest | 63 | 0 | 0 | |
| ESLint | 0 errors | — | 3 warnings | unrelated scripts |
| `pnpm build` | OK | 0 | — | |
| Playwright E2E | 23 | 0 | 2 | admin khi không có `DATABASE_URL` |

### E2E — trang đã smoke

`/`, `/search`, `/hoi-dap`, `/ask-hr`, `/calculators` (+ con), `/cong-cu-luong-thue`, `/nguon-phap-luat`, `/topics`, `/legal-updates`, redirect `/cap-nhat-phap-luat`, `/topics/bhtn`, `/topics/nguoi-phu-thuoc`, footer LinkedIn.

### Bỏ qua có chủ đích

- `/admin`, `/admin/legal-crawler` — **skipped** khi không có `DATABASE_URL` (trang động Prisma).

## Lỗi đã phát hiện và xử lý

### 1. `/cong-cu-luong-thue` HTTP 500 (đã sửa)

- **Nguyên nhân:** Server page import hàm từ file `"use client"` (`salary-tax-tool.tsx`) — Next.js 16 ném lỗi khi render.
- **Cách xử lý:** Tách `parseCalculatorMode` sang `src/lib/calculators/salary-tax-modes.ts`; server page truyền `initialMode` prop; bỏ `Suspense` + `useSearchParams` trên server boundary.
- **File:** `src/app/cong-cu-luong-thue/page.tsx`, `src/lib/calculators/salary-tax-modes.ts`, `src/components/calculators/salary-tax-tool.tsx`

### 2. ESLint `react-hooks/refs` (đã sửa)

- **SiteHeader:** reset menu “Khác” bằng `key={pathname}` thay vì setState trong render.
- **Pagination:** reset trang bằng wrapper `key` trên `FaqListPaginated`, `HoiDapFaqSections`, `SearchHitsPaginated`.
- **pagination-controls:** tách `PaginationNavButton` ra top-level.

### 3. E2E — server cũ / port bận (đã sửa)

- **Triệu chứng:** Playwright hit server `next start` cũ (port 3099) → trang tính lương chỉ skeleton, footer thiếu LinkedIn, nav timeout.
- **Cách xử lý:** Port E2E **3199**; `scripts/start-e2e-server.mjs` giải phóng port trước khi start; health check `/cong-cu-luong-thue`; helper `e2e/helpers.ts`.

### 4. E2E — Form / nav (đã sửa)

- Scope locator vào `nav[aria-label="Điều hướng chính"]` + `aria-label` trên link nav.
- Form HR: `#replyEmail`, `#topic`, `#urgent`; legal updates: `#Tìm văn bản` + nút “Tìm kiếm”.

## Không phát hiện lỗi (trong phạm vi test)

- Hub **Công cụ cho Nhân viên** — mọi CTA &lt; 500
- Nút **Tính ngay** — hiển thị kết quả thực nhận
- Menu Tra cứu / FAQ / Hỏi HR / Công cụ — điều hướng đúng
- Footer **Lê Sỹ Cường** → LinkedIn

## Việc nên làm thêm (ngoài phạm vi hiện tại)

- E2E gửi email HR thật (mock API `/api/ask-hr/send`)
- Admin E2E khi có DB test (Docker/CI)
- Visual regression (tùy chọn)
