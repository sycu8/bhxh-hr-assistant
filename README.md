# BHXH HR Assistant — Cổng tra cứu bảo hiểm FTI

Ứng dụng web nội bộ giúp nhân viên và HR/C&B tra cứu **BHXH, BHYT, BHTN** và chế độ lao động theo **nguồn đã duyệt**, có trích dẫn, mức tin cậy và lối chuyển sang HR khi thiếu căn cứ.

Repository: [github.com/sycu8/bhxh-hr-assistant](https://github.com/sycu8/bhxh-hr-assistant)

---

## Tính năng chính

| Module | Mô tả |
|--------|--------|
| **Tra cứu** (`/search`) | Hỏi bằng ngôn ngữ tự nhiên; trả lời ngắn gọn kèm nguồn (FAQ curated, FAQ DB, đoạn văn bản pháp lý). |
| **FAQ** (`/hoi-dap`) | Câu hỏi thường gặp soạn sẵn, có trang chi tiết và trích nguồn. |
| **Cập nhật pháp luật** (`/legal-updates`) | Danh sách văn bản đã publish; tìm kiếm, lọc ngày ban hành, **phân trang** (tối ưu mobile). |
| **Hỏi HR** (`/ask-hr`) | Form gửi email tới HR qua Cloudflare Email Service (không `mailto`). |
| **Công cụ** (`/calculators`, `/cong-cu-luong-thue`) | Ước tính lương, BHXH/BHYT/BHTN, thuế TNCN. |
| **Admin** (`/admin`) | Duyệt crawl, import tài liệu, revalidate cache. |
| **Cron** | Quét nguồn chính thống **06:00 ICT** mỗi ngày (`0 23 * * *` UTC). |

### Nguyên tắc trả lời

- Ưu tiên **FAQ curated** → **FAQ đã duyệt có citation** → **chunk văn bản**.
- Không có đủ nguồn → thông báo cố định, gợi ý **Hỏi HR**.
- Không hiển thị mục “Giải thích thêm” — một đoạn trả lời ngắn, đủ ý.

---

## Công nghệ

- **Next.js 16** (App Router) + **React 19**
- **Prisma 6** + PostgreSQL (Hyperdrive trên Cloudflare)
- **OpenNext** (`@opennextjs/cloudflare`) → **Cloudflare Workers**
- **KV** (cache công khai), **D1** (cờ vận hành), **R2** (media), **Email Sending**
- **Vitest** (unit tests), **Zod** (validation API)

---

## Cấu trúc thư mục

```
src/
  app/              # Routes (search, hoi-dap, legal-updates, ask-hr, api/...)
  components/       # UI (portal, marketing, layout, faq, legal-updates)
  lib/
    services/       # AiAnswerService, SearchService, LegalCrawler, ...
    repositories/   # Prisma / DB access
    data/           # FAQ curated, dữ liệu tĩnh (legal JSON lớn — xem bên dưới)
    navigation/     # Cấu hình menu site
    pagination/     # Phân trang dùng chung
  hooks/
tests/
cloudflare/         # Worker entry (cron)
prisma/
migrations/d1/      # D1 schema app_config
scripts/            # Import FAQ, crawl, dọn dữ liệu
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
# Điền YOUR_* bằng ID/bindings Cloudflare của bạn (xem mục Deploy)

pnpm exec prisma db push
pnpm db:seed
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) — tra cứu tại [/search](http://localhost:3000/search).

### Dữ liệu pháp luật tĩnh (tuỳ chọn)

File `src/lib/data/bhxh-published-legal-updates.json` có thể rất lớn. Nếu không có trong clone:

- Chạy crawl/import qua **Admin → Legal crawler**, hoặc
- Script trong `scripts/` (xem `package.json` scripts).

---

## Biến môi trường & bí mật

**Không commit** file `.env`, token API, email cá nhân, hay ID tài khoản thật vào Git.

| Biến / Secret | Mô tả |
|---------------|--------|
| `DATABASE_URL` | Postgres (local dev) |
| `HR_CONTACT_EMAIL` | Email HR nhận form (wrangler `vars` hoặc `.env`) |
| `HR_EMAIL_FROM` | Địa chỉ From đã xác minh trên Cloudflare Email |
| `CACHE_REVALIDATE_SECRET` | Bearer cron + `POST /api/admin/revalidate-cache` |
| `CLOUDFLARE_EMAIL_API_TOKEN` | Secret — REST gửi email (fallback) |
| `CLOUDFLARE_ACCOUNT_ID` | Account Cloudflare |
| `CRON_WORKER_BASE_URL` | URL Worker sau deploy (cron tự gọi API) |
| `MEDIA_INGEST_TOKEN` | Bảo vệ upload media (tuỳ chọn) |

Đặt secret trên Worker:

```bash
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

3. Điền vào `wrangler.jsonc`: `id` KV, D1, Hyperdrive, `HR_CONTACT_EMAIL`, `HR_EMAIL_FROM`, `CRON_WORKER_BASE_URL`, v.v.

4. D1 migration:

   ```bash
   pnpm run db:d1:apply
   ```

5. Deploy:

   ```bash
   pnpm exec wrangler login
   pnpm run deploy
   ```

6. Ghi nhớ URL Worker → cập nhật `CRON_WORKER_BASE_URL` trong `vars` (hoặc dashboard) cho khớp.

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
pnpm test
```

Gồm test cho: AI answer, FAQ curated, pagination, legal crawler, calculator, ask-hr form, v.v.

---

## Menu & UX

Menu gọn: **Tra cứu** · **FAQ** · **Hỏi HR** · **Thêm** (pháp luật, công cụ, quản trị…).  
CTA dùng kích thước chạm **≥ 48px** trên mobile.

---

## Bảo mật & tuân thủ

- Không lưu mật khẩu/token trong repository.
- Form HR: không khuyến khích nhập CCCD, mã BHXH, lương chi tiết nếu không cần.
- Nội dung mang tính **tham khảo nội bộ**, không thay tư vấn pháp lý hay quyết định chính thức của HR/C&B.

---

## Giấy phép & liên hệ

Dự án nội bộ FTI. Vấn đề vận hành: liên hệ đội HR/C&B hoặc maintainer repository.

---

## Lịch sử tên

- Tên Worker/package có thể là `vn-insurance-fti` hoặc `bhxh-hr-assistant` tùy môi trường — chuẩn hoá dần về **bhxh-hr-assistant** trên GitHub.
