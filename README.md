# Cổng HR & tra cứu bảo hiểm — FPT Telecom

Ứng dụng web nội bộ: **Cổng HR self-service** (hồ sơ, nghỉ phép, phiếu lương, giấy tờ, ticket) và **kho kiến thức BHXH/BHYT/BHTN** theo nguồn đã duyệt, có trích dẫn, mức tin cậy và lối chuyển sang HR khi thiếu căn cứ.

**Production / UAT:** https://bhxh.orangecloud.vn/ (Workers: `vn-insurance-fti.sycu-lee.workers.dev`)

**Release (2026-07-01):** `main` @ `f90f9d2` — sửa layout mobile (overflow ngang, header/nav thu gọn). Worker version `474caa28-5c75-4f70-b545-80240ee02aac`.

**Release (2026-07-01):** `main` @ `db9b180` — luật lao động hiệu lực 01/7/2026: lương cơ sở **2,53 triệu**, trần BHXH/BHYT **50,6 triệu**, NĐ 168 thai sản, NĐ 337 HĐLĐ điện tử, VBHN 18. Worker version `872c49a2-6e12-49f4-a3c9-5b4ccaa8cdd5`.

**Release (2026-06-26):** `main` @ `4b12a67` — HR portal + QA roadmap + CI test workflows. Worker version `3b287ff3-25cc-491e-8123-26e76d41ba91`. Cổng HR (OTP `/login`, `/my-hr`, `/hr`), `/developers` + OpenAPI, `docker-compose` QA, UAT streak 15.

**SEO note:** `/sitemap.xml` hardened for 200 responses; canonical site URL `https://bhxh.orangecloud.vn`.

Repository: [github.com/sycu8/bhxh-hr-assistant](https://github.com/sycu8/bhxh-hr-assistant)

---

## Tính năng chính

### Cổng HR (nhân viên — đăng nhập OTP `/login`)

| Module | Route | Mô tả |
|--------|-------|--------|
| **Hồ sơ** | `/my-hr/profile` | Thông tin đồng bộ HRIS, quản lý trực tiếp |
| **Nghỉ phép** | `/time/leave` | Số dư, đăng ký nghỉ, phê duyệt quản lý |
| **Phiếu lương** | `/pay/payslips` | Xem kỳ lương + chi tiết (audit khi mở) |
| **Giấy tờ** | `/my-hr/documents` | Xác nhận công tác / thu nhập / bảo hiểm |
| **Chính sách** | `/my-hr/policies` | Thư viện chính sách nội bộ đã publish |
| **Ticket** | `/my-hr/tickets` | Theo dõi ticket HR (liên kết khi đăng nhập) |
| **Phê duyệt** | `/approvals` | Hộp thư manager/HR |
| **Lịch sử BH** | `/bao-hiem/history` | Tham gia BHXH/BHYT/BHTN từ HRIS |

### Bảo hiểm & tra cứu (công khai)

| Module | Mô tả |
|--------|--------|
| **Hub BHXH** (`/bao-hiem`) | Điểm vào module bảo hiểm trong Cổng HR |
| **Tra cứu** (`/search`) | Hỏi bằng ngôn ngữ tự nhiên; trả lời kèm nguồn |
| **FAQ** (`/hoi-dap`) | Câu hỏi thường gặp đã duyệt — gồm **BHYT/BHTN chính thống** + LuatVietnam crawl |
| **Chủ đề BHYT/BHTN** (`/topics/bhyt`, `/topics/bhtn`) | FAQ theo chủ đề, trích nguồn BHXH VN / TLPL / Bộ LĐ-TB&XH |
| **Nguồn tham khảo** (`/nguon-phap-luat`) | Mục lục liên kết văn bản Thư viện Pháp Luật |
| **Cập nhật pháp luật** (`/legal-updates`) | Văn bản đã publish |
| **Hỏi HR** (`/ask-hr`) | Form ticket + email HR |
| **Công cụ lương** (`/calculators`, `/cong-cu-luong-thue`) | Gross/net, thai sản, v.v. |
| **SEO / GEO** | `/sitemap.xml`, `/robots.txt`, JSON-LD — `pnpm audit:seo-geo` |

### HR Console (`/hr`) & CMS (`/admin`)

| Khu vực | Mô tả |
|---------|--------|
| **HR Console** | Dashboard, nhân viên, ticket SLA, chính sách, báo cáo headcount/ticket/leave |
| **CMS** | FAQ, chủ đề, crawl pháp luật, công thức tính, analytics, audit |
| **RBAC** | `EMPLOYEE`, `MANAGER`, `HR`, `CB`, `RECRUITER`, `ADMIN`, `SUPER_ADMIN` |
| **HRIS sync** | `pnpm hr:sync` hoặc `POST /api/cron/hris-sync` (Bearer cron secret) |
| **Import Microsoft 365** | CSV export Users → `pnpm hr:import-microsoft ./users.csv` hoặc upload tại `/hr/employees` |
| **Cron** | Crawl pháp luật **06:00 ICT** (`0 23 * * *` UTC) |

### Nguyên tắc trả lời

- Ưu tiên **FAQ curated** → **FAQ đã duyệt có citation** → **chunk văn bản**.
- Không có đủ nguồn → thông báo cố định, gợi ý **Hỏi HR**.
- Không hiển thị mục “Giải thích thêm” — một đoạn trả lời ngắn, đủ ý.

---

## Công nghệ

- **Next.js 16** (App Router) + **React 19**
- **Prisma 6** + PostgreSQL (Hyperdrive trên Cloudflare)
- **OpenNext** (`@opennextjs/cloudflare`) → **Cloudflare Workers**
- **KV** (cache công khai: FAQ, legal list/detail, admin queue 30s), **D1** (cờ vận hành), **R2** (media), **Email Sending**
- **Vitest** (unit), **Playwright** (E2E), **Zod** (validation API)

---

## Cấu trúc thư mục

```
src/
  app/              # Routes (search, hoi-dap, legal-updates, sitemap, robots, api/...)
  components/       # UI (portal, marketing, layout, brand, faq, legal-updates)
  lib/
    services/       # AiAnswerService, SearchService, LegalCrawler, salary-tax-rules, ...
    repositories/   # Prisma / DB access
    data/           # FAQ curated, LuatVietnam crawl, legal updates, topics
    sitemap/        # buildSitemapEntries()
    navigation/     # Menu site (Tra cứu, FAQ, Hỏi HR, Khác…)
    pagination/
  hooks/
tests/
cloudflare/         # Worker entry (cron)
prisma/
migrations/d1/
scripts/            # Import FAQ, crawl LuatVietnam, logo, OCR PDF
public/             # Logo FPT Telecom (ngang/dọc), fti-logo (legacy)
wrangler.jsonc      # Mẫu binding — điền ID thật trước deploy
```

---

## Yêu cầu

- Node.js **20+** (khuyến nghị 22)
- [pnpm](https://pnpm.io/) 9+
- PostgreSQL (local hoặc remote)
- Tài khoản **Cloudflare** (Workers, Hyperdrive, R2, KV, D1, Email Sending) — nếu deploy production

---

## Cài đặt local

```bash
git clone https://github.com/sycu8/bhxh-hr-assistant.git
cd bhxh-hr-assistant
pnpm install

cp .env.example .env
# Chỉnh DATABASE_URL, HR_CONTACT_EMAIL, ...

cp wrangler.jsonc.example wrangler.jsonc
# Điền YOUR_* bằng ID/bindings Cloudflare (xem mục Deploy)

pnpm exec prisma db push
pnpm db:seed
pnpm dev
```

**UAT / production (sau khi bật Cổng HR):** nếu đăng nhập OTP báo lỗi máy chủ hoặc `Unexpected token '<'`, chạy đồng bộ schema Postgres (một lần):

```bash
curl -X POST https://bhxh.orangecloud.vn/api/cron/db-schema-sync \
  -H "Authorization: Bearer $CACHE_REVALIDATE_SECRET"

curl -X POST https://bhxh.orangecloud.vn/api/cron/hris-sync \
  -H "Authorization: Bearer $CACHE_REVALIDATE_SECRET"
```

Sau đó thử lại `/login` với email `@fpt.com` (ví dụ `employee@fpt.com` sau seed HRIS).

Mở [http://localhost:3000](http://localhost:3000) — tra cứu tại [/search](http://localhost:3000/search).

### Đồng bộ nhân viên từ Microsoft 365 (CSV)

1. **Microsoft 365 Admin** → Users → Active users → **Export users** (hoặc Entra ID → Users → Bulk operations → Download).
2. File CSV cần tối thiểu: **User principal name** (email), **Display name**. Nên có thêm **Department**, **Job title**, **Manager**, **Employee ID**.
3. Import bằng một trong các cách:

```bash
# Một lần từ CLI
pnpm hr:import-microsoft ./data/microsoft-users.csv

# Hoặc đặt file cố định + cron sync nhân viên
# .env: HRIS_SOURCE=microsoft-csv
#       HRIS_EMPLOYEE_CSV_PATH=./data/microsoft-users.csv
pnpm hr:sync
```

4. Hoặc đăng nhập **HR Console** → **Nhân viên** → upload file CSV.

Mẫu file: [`data/microsoft-users.example.csv`](data/microsoft-users.example.csv).

**Lưu ý:** Email nhân viên dùng domain **`@fpt.com`** (UPN Microsoft 365). Export Microsoft chỉ có danh sách user (email, phòng ban, quản lý). Phiếu lương, số dư nghỉ phép, lịch sử BHXH vẫn cần nguồn HRIS/payroll riêng. Tài khoản **disabled** trong CSV sẽ bị bỏ qua. User đã có vai trò HR/Admin trong hệ thống **không bị ghi đè** khi import lại.

### Dữ liệu pháp luật & FAQ (tuỳ chọn)

| Lệnh | Mô tả |
|------|--------|
| `pnpm faq:crawl-luatvietnam-bao-hiem` | Crawl FAQ từ luatvietnam.vn → `luatvietnam-bao-hiem-faqs.ts` |
| `pnpm faq:import-official` | Import FAQ nguồn chính thống (mẫu) |
| `pnpm faq:import-official-bhyt-bhtn` | Import gói FAQ BHYT/BHTN từ nguồn chính thống (`official-bhyt-bhtn-faqs.ts`) |
| `pnpm faq:import-thuvien` | Import FAQ từ Thư viện Pháp Luật vào DB |
| `pnpm pdf:ocr-import` | OCR PDF quét và import |

File `src/lib/data/bhxh-published-legal-updates.json` có thể rất lớn. Nếu thiếu: chạy crawl qua **Admin → Legal crawler** hoặc dọn kho bằng:

```bash
pnpm run crawl:hygiene-legal
```

Lệnh trên lọc văn bản không liên quan BHXH, bỏ bản đã có văn bản thay thế mới hơn, và chuẩn hóa `issuedDate` từ metadata trang BHXH.

### Logo & favicon

| Lệnh | Mô tả |
|------|--------|
| `pnpm assets:fpt-telecom-logos` | Chuẩn hóa logo ngang/dọc + favicon từ `public/fpt-telecom-logo-*-src.png` |
| `pnpm assets:fti-logo` | Tạo logo từ khối F/P/T (legacy) |

Logo chính thức: `public/fpt-telecom-logo-horizontal.png`, `public/fpt-telecom-logo-vertical.png`.

---

## Biến môi trường & bí mật

**Không commit** file `.env`, token API, email cá nhân, hay ID tài khoản thật vào Git.

| Biến / Secret | Mô tả |
|---------------|--------|
| `DATABASE_URL` | Postgres (local dev) |
| `HR_CONTACT_EMAIL` | Email HR nhận form (wrangler `vars` hoặc `.env`) |
| `HR_EMAIL_FROM` | Địa chỉ From đã xác minh trên Cloudflare Email |
| `CACHE_REVALIDATE_SECRET` | Bearer cron + `POST /api/admin/revalidate-cache` |
| `SESSION_SECRET` | **Bắt buộc production** — ký cookie CMS (`cms_session`); không dùng chung với cron |
| `CLOUDFLARE_EMAIL_API_TOKEN` | Secret — REST gửi email (fallback) |
| `CLOUDFLARE_ACCOUNT_ID` | Account Cloudflare |
| `CRON_WORKER_BASE_URL` | URL Worker sau deploy (cron tự gọi API) |
| `NEXT_PUBLIC_SITE_URL` | URL công khai cho sitemap/metadata (mặc định = `CRON_WORKER_BASE_URL`) |
| `ADMIN_ACTION_RATE_LIMIT_MAX` | Giới hạn thao tác CMS (duyệt/từ chối server action) trong một cửa sổ — mặc định **120** |
| `ADMIN_ACTION_RATE_WINDOW_SEC` | Cửa sổ rate limit CMS (giây) — mặc định **600** (10 phút) |
| `LOGIN_RATE_LIMIT_MAX` | Giới hạn đăng nhập CMS / IP — mặc định **10** / 15 phút |
| `PUBLIC_API_RATE_LIMIT_MAX` | Giới hạn `/api/search`, `/api/ask` — mặc định **30**/phút/IP |
| `ASK_HR_RATE_LIMIT_MAX` | Giới hạn `/api/ask-hr/send` — mặc định **5**/15 phút/IP |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key Turnstile (widget client) |
| `TURNSTILE_SECRET_KEY` | Secret key Turnstile — **wrangler secret** |
| `HRIS_SOURCE` | `mock` (mặc định) hoặc `microsoft-csv` |
| `HRIS_EMPLOYEE_CSV_PATH` | Đường dẫn file CSV export Microsoft khi `HRIS_SOURCE=microsoft-csv` |
| `BHXH_EMPLOYEE_RATE` | Tuỳ chọn — tỷ lệ BHXH NLĐ (mặc định 8%) |
| `BHYT_EMPLOYEE_RATE` | Tuỳ chọn — tỷ lệ BHYT NLĐ (mặc định 1,5%) |
| `BHTN_EMPLOYEE_RATE` | Tuỳ chọn — tỷ lệ BHTN NLĐ (mặc định 1%) |

### Công cụ tính lương (`salary-tax-rules.ts`)

Từ **01/7/2026** hệ thống áp dụng:

| Tham số | Giá trị | Căn cứ |
|---------|---------|--------|
| Lương cơ sở | 2.530.000 đ/tháng | Nghị định 161/2026/NĐ-CP |
| Trần BHXH + BHYT | 50.600.000 đ/tháng (×20) | Khoản 13 Điều 141 Luật BHXH |
| Giảm trừ bản thân | 15.500.000 đ/tháng | Kỳ thuế 2026 |
| Giảm trừ người phụ thuộc | 6.200.000 đ/tháng | Kỳ thuế 2026 |

CMS có thể ghi đè qua bảng `CalculatorConfig` (key `salary-tax-2026`, `effectiveFrom` ≥ 2026-07-01). Trang tham chiếu: `/calculators/luong-co-ban`, API: `POST /api/calculators/salary-tax`.

- **Security headers** (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) qua `next.config.ts`.
- **Rate limit** (KV): đăng nhập CMS, API tra cứu/AI/Hỏi HR, thao tác admin server action.
- **SESSION_SECRET** riêng — không fallback sang secret cron trên production.
- **SSRF**: crawl URL thủ công và media ingest URL chỉ HTTPS, chặn IP nội bộ/metadata.
- **Turnstile** (Cloudflare): widget trên tra cứu, Hỏi HR, đăng nhập CMS; server verify qua `TURNSTILE_SECRET_KEY`.
- **Bearer token** so sánh constant-time cho cron, revalidate; media ingest automation (tuỳ chọn — UI admin dùng session CMS).

### Cloudflare Turnstile

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Turnstile** → **Add site** — chọn widget *Managed*.
2. Thêm hostname production (và `localhost` cho dev).
3. Cấu hình:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → **Site Key** (wrangler `vars` hoặc `.env`)
   - `TURNSTILE_SECRET_KEY` → **Secret Key** (`wrangler secret put TURNSTILE_SECRET_KEY`)
4. Dev/test dùng key Cloudflare luôn pass:
   - Site: `1x00000000000000000000AA`
   - Secret: `1x0000000000000000000000000000000AA`

Khi **không** cấu hình secret, server bỏ qua verify (local dev). Production nên bật cả hai key.

**Turnstile khi duyệt văn bản:** Dùng duyệt hàng loạt (1 server action) và debounce refresh. Tránh rule WAF *Skip* rộng cho `/admin/*` — ưu tiên rate limit app + Turnstile trên login.

| `MEDIA_INGEST_TOKEN` | Bearer tuỳ chọn cho automation/CI — **UI admin dùng session CMS** (`media:write`) |

Đặt secret trên Worker:

```bash
pnpm exec wrangler secret put SESSION_SECRET
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
pnpm exec wrangler secret put CACHE_REVALIDATE_SECRET
pnpm exec wrangler secret put CLOUDFLARE_EMAIL_API_TOKEN
```

---

## Deploy Cloudflare

1. Sao chép cấu hình:

   ```bash
   cp wrangler.jsonc.example wrangler.jsonc
   ```

2. Tạo trên Cloudflare: Worker, **Hyperdrive** (Postgres), **KV**, **D1**, **R2**, bật **Email Sending** cho domain From.

3. Tạo `wrangler.local.jsonc` (gitignore) — tự sinh từ env:

   ```bash
   export CLOUDFLARE_ACCOUNT_ID="your-account-id"
   node scripts/generate-wrangler-local.mjs
   ```

   Hoặc sao chép `wrangler.jsonc.example` → `wrangler.local.jsonc` và điền `YOUR_*` bằng ID/bindings Cloudflare.

4. D1 migration:

   ```bash
   pnpm run db:d1:apply
   ```

5. Deploy:

   ```bash
   pnpm exec wrangler login
   export CLOUDFLARE_ACCOUNT_ID="your-account-id"
   pnpm run deploy
   ```

   `pnpm run deploy` gọi `scripts/generate-wrangler-local.mjs` rồi OpenNext + Wrangler (config `wrangler.local.jsonc`).

6. Cập nhật `CRON_WORKER_BASE_URL` và (tuỳ chọn) `NEXT_PUBLIC_SITE_URL` trong `vars` cho khớp URL production.

### Cron quét pháp luật

- Lịch: **06:00 giờ Việt Nam** (23:00 UTC).
- Endpoint: `POST /api/cron/daily-official-crawl` với `Authorization: Bearer <CACHE_REVALIDATE_SECRET>`.

### CI (GitHub Actions)

| Workflow | Trigger | Mô tả |
|----------|---------|--------|
| `test.yml` | PR + push `main` | Vitest + Playwright (Postgres service) |
| `uat-streak.yml` | Nightly 01:00 ICT + manual | 15 kịch bản UAT trên `bhxh.orangecloud.vn` |
| `deploy-cloudflare.yml` | Push `main` | Deploy OpenNext + Wrangler |

`pnpm/action-setup` lấy version từ `package.json#packageManager` (không pin `version` trong workflow — tránh `ERR_PNPM_BAD_PM_VERSION`).

**Secrets (bắt buộc deploy):** `CLOUDFLARE_API_TOKEN` (Wrangler deploy; nếu thiếu `CLOUDFLARE_ACCOUNT_ID`, workflow tự lấy account ID qua API token).

**Secrets / variables (tuỳ chọn):** `CLOUDFLARE_ACCOUNT_ID`, `HR_CONTACT_EMAIL`, `HR_EMAIL_FROM`.

Binding KV / D1 / Hyperdrive / R2 mặc định theo stack production `vn-insurance-fti`; override bằng env `WRANGLER_KV_NAMESPACE_ID`, `WRANGLER_D1_DATABASE_ID`, `WRANGLER_HYPERDRIVE_ID`, `WRANGLER_R2_BUCKET` nếu cần.

Nếu workflow fail vì thiếu token: thêm **`CLOUDFLARE_API_TOKEN`** tại [GitHub → Settings → Secrets → Actions](https://github.com/sycu8/bhxh-hr-assistant/settings/secrets/actions), rồi chạy lại workflow **Deploy Cloudflare Workers**.

**Roadmap & QA:** [docs/ROADMAP.md](docs/ROADMAP.md) · [docs/QA-INVENTORY.md](docs/QA-INVENTORY.md)

---

## Kiểm thử

```bash
docker compose up -d
cp .env.e2e.example .env.e2e
pnpm qa:setup
pnpm qa:run            # Full inventory: vitest + e2e + UAT streak 15
pnpm qa:run:lite       # Không Postgres — vitest + UAT streak only

pnpm test              # Vitest (logic, API, sitemap, FAQ, crawler…)
pnpm build && pnpm test:e2e   # Playwright — trang, nút, form
pnpm test:uat-streak   # 15 kịch bản UAT liên tiếp
pnpm test:all          # Vitest + e2e
pnpm test:scenarios    # 5 kịch bản năng lực chính → docs/scenario-evidence.json
pnpm bench:pages       # đo tải trang → docs/page-load-benchmark.json
pnpm audit:seo-geo     # SEO/GEO audit → docs/seo-geo-audit.json
```

Kế hoạch tiêu chí pass/fail: [docs/SCENARIO-TEST-PLAN.md](docs/SCENARIO-TEST-PLAN.md). Hiệu năng tải trang: [docs/PAGE-LOAD-BENCHMARK.md](docs/PAGE-LOAD-BENCHMARK.md). SEO/GEO: [docs/SEO-GEO-AUDIT.md](docs/SEO-GEO-AUDIT.md). Chi tiết và lỗi đã ghi nhận: [docs/TEST-REPORT.md](docs/TEST-REPORT.md).

**Tài liệu tích hợp:** [`/developers`](/developers) — mô tả endpoint, auth, ví dụ cURL.  
**OpenAPI 3.1:** `GET /api/openapi.json` — import Postman/Insomnia.

| Method | Path | Ghi chú |
|--------|------|---------|
| `POST` | `/api/search` | Tra cứu + answer card |
| `POST` | `/api/ask` | Ghi log câu hỏi |
| `POST` | `/api/ask-hr/send` | Gửi email HR |
| `POST` | `/api/calculators/salary-tax` | Tính lương & thuế — trần BHXH/BHYT 50,6M từ 01/7/2026 |
| `POST` | `/api/cron/daily-official-crawl` | Cron (Bearer) |
| `POST` | `/api/cron/db-schema-sync` | Đồng bộ schema HR (Bearer, một lần sau deploy) |
| `POST` | `/api/cron/hris-sync` | Đồng bộ nhân viên mock/HRIS (Bearer) |
| `POST` | `/api/v1/auth/otp/request` | Gửi OTP đăng nhập nhân viên |
| `POST` | `/api/v1/auth/otp/verify` | Xác minh OTP + cookie `employee_session` |
| `POST` | `/api/admin/revalidate-cache` | Xóa KV cache |
| `GET` | `/api/openapi.json` | OpenAPI spec |

Body JSON validate bằng **Zod**; lỗi trả `{ success: false, error: { code, message } }`.

---

## API chính

Menu chính: **Tra cứu** · **FAQ** · **Hỏi HR** · **Công cụ** · **Khác** (pháp luật, nguồn tham khảo, quản trị…).

- CTA màu cam FPT Telecom (`--fti-orange`), nút chạm **≥ 48px** trên mobile.
- Logo FPT Telecom: ngang (desktop), dọc (mobile).
- Favicon từ khối F/P/T.

---

## Bảo mật & tuân thủ

- Không lưu mật khẩu/token trong repository.
- Form HR: không khuyến khích nhập CCCD, mã BHXH, lương chi tiết nếu không cần.
- Nội dung mang tính **tham khảo nội bộ**, không thay tư vấn pháp lý hay quyết định chính thức của HR/C&B.

---

## Giấy phép & liên hệ

Dự án nội bộ **FPT Telecom**. Vấn đề vận hành: liên hệ đội HR/C&B hoặc maintainer repository.

---

## Lịch sử tên

- Package/Worker: `vn-insurance-fti`
- GitHub: `bhxh-hr-assistant`
- Branding hiển thị: **Bảo hiểm FPT Telecom** (trước đây FTI / FPT Telecom International)

---

## Quy trình bảo trì

Mỗi lần đổi tính năng hoặc cấu hình:

1. Sửa code → cập nhật **README** (phần liên quan).
2. Không commit secret (xem `.env.example`, `wrangler.jsonc.example`).
3. `pnpm test` → commit → `git push origin main`.

Rule Cursor cho agent: `.cursor/rules/sync-readme-github.mdc`.
