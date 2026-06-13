# Cổng tra cứu bảo hiểm — FPT Telecom

Ứng dụng web nội bộ giúp nhân viên và HR/C&B tra cứu **BHXH, BHYT, BHTN** và chế độ lao động theo **nguồn đã duyệt**, có trích dẫn, mức tin cậy và lối chuyển sang HR khi thiếu căn cứ.

**Production:** https://vn-insurance-fti.sycu-lee.workers.dev

Repository: [github.com/sycu8/bhxh-hr-assistant](https://github.com/sycu8/bhxh-hr-assistant)

---

## Tính năng chính

| Module | Mô tả |
|--------|--------|
| **Tra cứu** (`/search`) | Hỏi bằng ngôn ngữ tự nhiên; trả lời ngắn gọn kèm nguồn (FAQ curated, FAQ DB, đoạn văn bản pháp lý). |
| **FAQ** (`/hoi-dap`) | **134** câu hỏi thường gặp (HR soạn + crawl LuatVietnam Bảo hiểm), trang chi tiết SSG và trích nguồn. |
| **Nguồn tham khảo** (`/nguon-phap-luat`) | Mục lục liên kết văn bản Thư viện Pháp Luật để đối chiếu căn cứ. |
| **Cập nhật pháp luật** (`/legal-updates`) | Văn bản/chính sách đã publish (NĐ 168, lương cơ sở 2,53M, chính sách FTEL…); tìm kiếm, lọc, phân trang. |
| **Hỏi HR** (`/ask-hr`) | Form gửi email tới HR qua Cloudflare Email Service (không `mailto`). |
| **Công cụ** (`/calculators`) | Lương/thuế, lương cơ bản, miễn giảm, chế độ thai sản, tra cứu nhanh. |
| **Admin** (`/admin`) | Duyệt crawl (hàng loạt tối đa 50/lần), import tài liệu, revalidate cache. |
| **Cron** | Quét nguồn chính thống **06:00 ICT** mỗi ngày (`0 23 * * *` UTC). |
| **SEO** | `/sitemap.xml`, `/robots.txt` — URL công khai, loại trừ `/admin` và `/api`. |

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

Mở [http://localhost:3000](http://localhost:3000) — tra cứu tại [/search](http://localhost:3000/search).

### Dữ liệu pháp luật & FAQ (tuỳ chọn)

| Lệnh | Mô tả |
|------|--------|
| `pnpm faq:crawl-luatvietnam-bao-hiem` | Crawl FAQ từ luatvietnam.vn → `luatvietnam-bao-hiem-faqs.ts` |
| `pnpm faq:import-thuvien` | Import FAQ từ Thư viện Pháp Luật vào DB |
| `pnpm faq:import-official` | Import FAQ nguồn chính thống |
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

### Bảo mật

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

3. Sao chép `wrangler.jsonc.example` → `wrangler.local.jsonc` (gitignore) và điền ID/bindings thật.

4. D1 migration:

   ```bash
   pnpm run db:d1:apply
   ```

5. Deploy:

   ```bash
   pnpm exec wrangler login
   pnpm run deploy
   ```

6. Cập nhật `CRON_WORKER_BASE_URL` và (tuỳ chọn) `NEXT_PUBLIC_SITE_URL` trong `vars` cho khớp URL production.

### Cron quét pháp luật

- Lịch: **06:00 giờ Việt Nam** (23:00 UTC).
- Endpoint: `POST /api/cron/daily-official-crawl` với `Authorization: Bearer <CACHE_REVALIDATE_SECRET>`.

### CI (GitHub Actions)

Workflow `.github/workflows/deploy-cloudflare.yml` — cần secrets repo:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## API chính

| Method | Path | Ghi chú |
|--------|------|---------|
| `POST` | `/api/search` | Tra cứu + answer card |
| `POST` | `/api/ask` | Ghi log câu hỏi |
| `POST` | `/api/ask-hr/send` | Gửi email HR |
| `POST` | `/api/cron/daily-official-crawl` | Cron (Bearer) |
| `POST` | `/api/admin/revalidate-cache` | Xóa KV cache |

Body JSON validate bằng **Zod**; lỗi trả `{ success: false, error: { code, message } }`.

---

## Kiểm thử

```bash
pnpm test              # Vitest (logic, API, sitemap, FAQ, crawler…)
pnpm build && pnpm test:e2e   # Playwright — trang, nút, form
pnpm test:all          # Cả hai
```

Chi tiết và lỗi đã ghi nhận: [docs/TEST-REPORT.md](docs/TEST-REPORT.md).

---

## Menu & UX

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
