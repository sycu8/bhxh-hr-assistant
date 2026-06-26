# QA Inventory — Cổng HR FPT Telecom

Cập nhật: **2026-06-26** — inventory đầy đủ cho QA local production-like.

**Roadmap:** [ROADMAP.md](ROADMAP.md)

## Thiết lập QA local

```bash
docker compose up -d
cp .env.e2e.example .env.e2e
# Chỉnh DATABASE_URL nếu khác mặc định

pnpm qa:setup          # db push + seed + 80 NV synthetic
pnpm qa:run            # vitest + e2e + UAT streak 15 (full inventory)
pnpm qa:run:lite       # vitest + UAT streak (bỏ E2E portal khi chưa có Postgres)

pnpm build
pnpm test              # Vitest only
pnpm test:e2e          # Playwright (port 3199, NODE_ENV=production via .env.e2e)
pnpm test:uat-streak   # 15 kịch bản thực tế liên tiếp trên UAT (https://bhxh.orangecloud.vn)
```

**Biến QA:** `E2E_TEST_MODE=1`, `E2E_FIXED_OTP=424242`, Turnstile test keys, `SESSION_SECRET` local.

**Dữ liệu:** `nv0001@fpt.com` … `nv0072@fpt.com`, `employee@fpt.com`, `manager@fpt.com`, `admin@fpt.com` / `Admin@123456`.

---

## Ma trận vai trò

| Role | Login | Portal | HR Console | Admin CMS |
|------|-------|--------|------------|-----------|
| EMPLOYEE | OTP | ✓ | — | — |
| MANAGER | OTP | ✓ + approvals | ✓ | — |
| HR | OTP | ✓ | ✓ | ✓ |
| CB | OTP | ✓ | ✓ | — |
| ADMIN / SUPER_ADMIN | Password CMS | ✓ | ✓ | ✓ |

---

## 1. Public / Marketing

### 1.1 Trang chủ `/`

| AC | Mô tả |
|----|--------|
| AC-1.1.1 | HTTP 200, hero + CTA Cổng HR hiển thị |
| AC-1.1.2 | Link `/login`, `/bao-hiem`, `/search` hoạt động |

**Edge:** Mobile viewport — nav không overflow; không console fatal.

### 1.2 Tra cứu `/search`

| AC | Mô tả |
|----|--------|
| AC-1.2.1 | Form tìm kiếm + POST `/api/search` trả JSON |
| AC-1.2.2 | Kết quả hoặc thông báo không có kết quả |

**Edge:** Query rỗng → validation; rate limit 429 → thông báo tiếng Việt.

### 1.3 FAQ `/hoi-dap`, `/faq`

| AC | Mô tả |
|----|--------|
| AC-1.3.1 | Danh sách FAQ render, phân trang |
| AC-1.3.2 | Chi tiết slug/id hiển thị câu trả lời |

### 1.4 Hỏi HR `/ask-hr`

| AC | Mô tả |
|----|--------|
| AC-1.4.1 | Submit disabled cho đến khi đủ field + consent |
| AC-1.4.2 | POST `/api/ask-hr/send` trả JSON success |

**Edge:** Email không hợp lệ → 400; Turnstile thiếu (prod) → 400.

### 1.5 Công cụ tính lương `/cong-cu-luong-thue`

| AC | Mô tả |
|----|--------|
| AC-1.5.1 | Nút **Tính ngay** hiển thị thực nhận |
| AC-1.5.2 | Query `?mode=gross-to-net` load đúng mode |

### 1.6 Hub công cụ `/calculators` + trang con

| AC | Mô tả |
|----|--------|
| AC-1.6.1 | Mọi CTA trong hub HTTP &lt; 500 |
| AC-1.6.2 | Trang tham chiếu (lương cơ sở, thai sản, miễn giảm) có nội dung |

### 1.7 Pháp luật `/legal-updates`, `/nguon-phap-luat`, `/topics`

| AC | Mô tả |
|----|--------|
| AC-1.7.1 | Filter tìm kiếm cập nhật URL `?q=` |
| AC-1.7.2 | Redirect `/cap-nhat-phap-luat` → `/legal-updates` |

### 1.8 Hub bảo hiểm `/bao-hiem`

| AC | Mô tả |
|----|--------|
| AC-1.8.1 | Public hub load; link legacy redirect đúng |

---

## 2. Đăng nhập nhân viên `/login`

| AC | Mô tả |
|----|--------|
| AC-2.1 | Form email → OTP step 2 |
| AC-2.2 | API `/api/v1/auth/otp/request` **Content-Type: application/json** |
| AC-2.3 | Verify OTP → cookie `employee_session` → redirect `next` hoặc `/my-hr/profile` |
| AC-2.4 | Email không tồn tại vẫn trả success (không lộ account) |

**Edge cases:**

| ID | Case | Kỳ vọng |
|----|------|---------|
| E-2.1 | OTP sai | 401 JSON, không HTML |
| E-2.2 | OTP hết hạn | 401 |
| E-2.3 | Rate limit login | 429 JSON |
| E-2.4 | DB schema lệch | 500 JSON + message schema (không `Unexpected token '<'`) |
| E-2.5 | User không có `employeeProfile` | Login OK; profile page “chưa đồng bộ” |

**E2E:** `e2e/portal-auth.spec.ts`

---

## 3. Employee portal (session required)

| Route | AC chính |
|-------|----------|
| `/my-hr/profile` | Hiển thị hồ sơ HRIS hoặc thông báo chưa sync |
| `/time/leave` | Form nghỉ; submit server action; validate ngày |
| `/pay/payslips` | Danh sách phiếu lương; không 1101 |
| `/pay/payslips/[period]` | Chi tiết kỳ |
| `/my-hr/policies` | Danh sách chính sách công ty |
| `/my-hr/tickets` | Ticket của user |
| `/my-hr/documents` | Yêu cầu giấy tờ (employment/income/insurance) |
| `/bao-hiem/history` | Lịch sử tham gia BHXH/BHYT/BHTN |
| `/approvals` | MANAGER+ — duyệt/từ chối leave |

**Edge:**

| ID | Case | Kỳ vọng |
|----|------|---------|
| E-3.1 | Nghỉ vượt số dư | Server action error |
| E-3.2 | Không có managerId | “Chưa có quản lý trực tiếp” |
| E-3.3 | EMPLOYEE truy cập `/approvals` | Redirect / denied |
| E-3.4 | Session hết hạn | Redirect `/login?next=` |

**E2E:** `e2e/portal-routes.spec.ts`

---

## 4. HR Console `/hr/*`

| Route | Permission | AC |
|-------|------------|-----|
| `/hr` | `hr:console:access` | Dashboard load |
| `/hr/employees` | `employee:read` | Bảng NV + import CSV |
| `/hr/tickets` | `ticket:read` | Danh sách ticket |
| `/hr/content/policies` | `policy:read` | Policies |
| `/hr/reports` | `report:read` | CSV export có header quoted |

**Edge:** Không session → redirect `/admin/login` hoặc `/login`.

---

## 5. Admin CMS `/admin/*`

| Route | AC |
|-------|-----|
| `/admin/login` | Email/password + Turnstile (prod) |
| `/admin` | Dashboard |
| `/admin/faqs`, `/topics`, `/tickets`, `/legal-crawler`, `/calculators`, `/search-analytics`, `/audit` | Permission-gated load |

**Edge:** Sai password → 401 JSON; logout xóa cookie.

**E2E:** `e2e/portal-routes.spec.ts` (admin smoke)

---

## 6. API contracts (UI-facing)

| Endpoint | Success | Error envelope |
|----------|---------|----------------|
| `POST /api/v1/auth/otp/request` | `{ success, data }` | `{ success:false, error:{code,message} }` |
| `POST /api/v1/auth/otp/verify` | + Set-Cookie | 401 unauthorized |
| `POST /api/auth/login` | + Set-Cookie CMS | 401 |
| `POST /api/search` | Answer card JSON | 400/429/500 JSON |
| `POST /api/ask-hr/send` | success | validation errors |
| `POST /api/calculators/salary-tax` | breakdown | 400 |

**Regression:** `tests/parse-json-response.test.ts`, `tests/api-calculator.route.test.ts`

---

## Bug log (phiên QA 2026-06-22)

| ID | Severity | Mô tả | Repro | Fix | Regression |
|----|----------|-------|-------|-----|------------|
| BUG-001 | P0 | Login OTP 500 — DB thiếu `User.managerId`, `OtpCode` | POST `/api/v1/auth/otp/request` trên UAT | `prisma/sql/hr-portal-schema-sync.sql` + cron `db-schema-sync` | `e2e/portal-auth.spec.ts` OTP JSON |
| BUG-002 | P1 | Client `res.json()` trên HTML → `Unexpected token '<'` | Server 500/404 HTML | `parseJsonResponse` + login forms | `tests/parse-json-response.test.ts` |
| BUG-003 | P2 | CSV export header không quoted | `toCsv()` | Quote headers | `tests/hr-reports.test.ts` |
| BUG-004 | P3 | `site-nav.test` lỗi thời (FAQ chuyển MORE_NAV) | `pnpm test` | Cập nhật test | `tests/site-nav.test.ts` |
| BUG-006 | P2 | `/ask-hr` React #418 hydration — HR email + Turnstile text SSR/client lệch | E2E production mode | `hrContactEmail` prop + `NEXT_PUBLIC_E2E_TEST_MODE` | `e2e/public-pages.spec.ts` |
| BUG-007 | P3 | Streak SC-02: fetch `/login` không thấy nút OTP (client-only) | `node scripts/uat-realistic-streak.mjs` | Assert SSR shell (`Chào mừng trở lại`, `email công ty`) | `tests/uat-realistic-scenarios.test.ts` + `e2e/portal-auth.spec.ts` |
| BUG-008 | P3 | Streak SC-05: assert sai field `netTakeHome` (API trả `netSalary`) | salary-tax API | Sửa assertion streak + vitest | `tests/uat-realistic-scenarios.test.ts` |
| BUG-009 | P3 | Streak SC-06: assert sai `employeeContribution` (API trả `result.employee.total`) | social-insurance API | Sửa assertion | `tests/uat-realistic-scenarios.test.ts` |
| BUG-010 | P3 | Vitest SC-08 flake timeout 5s (OTP + email trên UAT ~4.6s) | `pnpm test` UAT regression | Tăng `testTimeout` 30s cho network tests | `tests/uat-realistic-scenarios.test.ts` |

---

## UAT streak (2026-06-26)

Chạy `pnpm test:uat-streak` — dừng khi **10 case pass liên tiếp** trên https://bhxh.orangecloud.vn.

| # | ID | Kịch bản | Kết quả |
|---|-----|----------|---------|
| 1–10 | SC-01…SC-10 | Public + API + OTP + guard | ✓ (2026-06-26) |
| 11 | SC-11 | `/search` | ✓ UAT |
| 12 | SC-12 | `/ask-hr` | ✓ UAT |
| 13 | SC-13 | redirect `cap-nhat-phap-luat` | ✓ UAT |
| 14 | SC-14 | `/topics/bhyt` | ✓ UAT |
| 15 | SC-15 | `/bao-hiem` | ✓ UAT |

Regression: `tests/uat-realistic-scenarios.test.ts`, `scripts/uat-realistic-streak.mjs`.

---

## QA run (2026-06-26) — blocked handoff

| Bộ | Passed | Failed | Skipped | Ghi chú |
|----|--------|--------|---------|---------|
| Vitest (`%TEMP%\vn-insurance-fti-deploy`) | **153** | 0 | 0 | Gồm UAT regression + unit |
| Playwright E2E (chromium, production-like `.env.e2e`) | **31** | 0 | **11** | Portal/auth/admin — cần Postgres |
| UAT streak | **10/10** | — | — | `pnpm test:uat-streak` |

**Blocked:** Postgres `127.0.0.1:5432` không chạy → không thể `pnpm qa:setup` / seed 80 NV / portal E2E đầy đủ.

**Để unblock:** cài Postgres (hoặc Docker), `cp .env.e2e.example .env.e2e`, `pnpm qa:setup`, rồi `pnpm test:e2e` (kỳ vọng 42 pass).

---

```bash
pnpm qa:setup && pnpm test && pnpm build && pnpm test:e2e
```

**Blocked handoff nếu:** không có Postgres local → chạy public E2E only (`hasDb` skip portal auth); UAT schema sync cần `CACHE_REVALIDATE_SECRET` (hỏi trước khi chạy trên production).

---

## Chưa cover (ghi nhận)

- Gửi email HR/OTP thật (mock trong QA)
- Admin legal-crawler bulk actions E2E
- Visual regression
- Load test / concurrent OTP
