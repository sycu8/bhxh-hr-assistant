# Báo cáo kiểm thử

Cập nhật lần chạy gần nhất: **2026-05-31** — `pnpm test:all` + deploy `vn-insurance-fti` version `dcccfa9b-a08b-4eae-8187-d1c2fdba7c2a`.

## Lệnh chạy

```bash
pnpm test              # 62 unit/API tests (Vitest)
pnpm build             # bắt buộc trước E2E
pnpm test:e2e          # Playwright (tự khởi động `pnpm start`, port 3000)
# hoặc server sẵn:
$env:PLAYWRIGHT_SKIP_WEBSERVER="1"
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3001"
pnpm test:e2e
```

## Phạm vi

| Lớp | File | Nội dung |
|-----|------|----------|
| Unit | `tests/*.test.ts` | Logic lương, FAQ, phân trang, form HR, crawler… |
| API | `tests/api-calculator.route.test.ts` | POST `/api/calculators/salary-tax` |
| Catalog | `tests/employee-tools.test.ts`, `tests/site-nav.test.ts` | Link công cụ & menu hợp lệ |
| E2E | `e2e/*.spec.ts` | Trang public, hub công cụ, nav, tính lương, form HR |

## Kết quả tổng hợp (lần chạy gần nhất)

| Bộ | Passed | Failed | Skipped | Ghi chú |
|----|--------|--------|---------|---------|
| Vitest | 62 | 0 | 0 | |
| Playwright E2E | 22 | 0* | 2 | *Sau sửa selector form Hỏi HR |

### E2E — trang đã smoke

`/`, `/search`, `/hoi-dap`, `/ask-hr`, `/calculators` (+ con), `/cong-cu-luong-thue`, `/nguon-phap-luat`, `/topics`, `/legal-updates`, redirect `/cap-nhat-phap-luat`, `/topics/bhtn`, `/topics/nguoi-phu-thuoc`.

### Bỏ qua có chủ đích

- `/admin`, `/admin/legal-crawler` — **skipped** khi không có `DATABASE_URL` (trang động Prisma).

## Lỗi đã phát hiện và xử lý

### 1. E2E — Form Hỏi HR (đã sửa)

- **Triệu chứng:** `getByLabel(/Email/i)` match nhiều phần tử (form + section công cụ).
- **Cách xử lý:** Scope locator vào `form` có `#replyEmail`; đổi tiêu đề nhóm công cụ thành “Tra cứu & căn cứ”; `aria-label` trên form.
- **File:** `e2e/navigation-and-forms.spec.ts`, `AskHrForm.tsx`, `AskHrToolsSection.tsx`

### 2. Playwright `webServer` timeout (môi trường)

- **Triệu chứng:** `Timed out waiting 120000ms from config.webServer` khi port 3000 bận hoặc `pnpm start` chậm.
- **Cách xử lý:** Tăng timeout 180s; chạy server thủ công + `PLAYWRIGHT_SKIP_WEBSERVER=1`; hoặc `PORT=3001`.

## Không phát hiện lỗi (trong phạm vi test)

- Build production (`pnpm build`) — OK
- Hub **Công cụ cho Nhân viên** — 13 CTA, mọi link &lt; 500
- Nút **Tính ngay** — hiển thị kết quả thực nhận
- Menu Tra cứu / FAQ / Hỏi HR / Công cụ — điều hướng đúng
- API tính lương gross→net, net→gross — 200 + payload hợp lệ

## Việc nên làm thêm (ngoài phạm vi hiện tại)

- E2E gửi email HR thật (mock API `/api/ask-hr/send`)
- Test `/faq`, `/hoi-dap/[slug]` với slug cụ thể
- Admin E2E khi có DB test (Docker/CI)
- Visual regression (tùy chọn)
