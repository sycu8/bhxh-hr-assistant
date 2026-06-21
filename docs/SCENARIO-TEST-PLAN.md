# Kế hoạch kiểm thử 5 kịch bản năng lực chính

Định nghĩa **trước khi chạy** — cập nhật kết quả tại [TEST-REPORT.md](./TEST-REPORT.md) và `docs/scenario-evidence.json` sau mỗi lần chạy.

## Phương pháp đánh giá

| Hạng mục | Quy tắc |
|----------|---------|
| **Rubrik** | Nhị phân **pass/fail** cho từng check (`S*-V*` Vitest, `S*-E*` E2E) |
| **Kịch bản** | Pass khi **mọi** check của kịch bản pass |
| **Bộ đầy đủ** | Pass khi **5/5** kịch bản pass |
| **Bằng chứng** | JSON (`docs/scenario-evidence.json`) + log Vitest/Playwright |

## Điều kiện chạy thống nhất

- Node 20+, `pnpm install`
- **Vitest:** `pnpm exec vitest run tests/scenarios-major-capabilities.test.ts`
- **E2E:** `pnpm build` rồi `pnpm exec playwright test e2e/scenarios-major-capabilities.spec.ts` (port **3199**, server qua `scripts/start-e2e-server.mjs`)
- `TURNSTILE_SECRET_KEY` **không** set → server bỏ qua verify (giống local dev)
- `DATABASE_URL` tuỳ chọn — kịch bản này **không** phụ thuộc DB (search E2E mock `/api/search`; logic thật qua curated FAQ ở Vitest)

Lệnh gộp: `pnpm test:scenarios`

---

## S1 — Tra cứu ngôn ngữ tự nhiên (BHXH)

**Persona:** Nhân viên mới hỏi *“có bắt buộc đóng BHXH không?”*

**Năng lực:** Tra cứu, AI answer card, curated FAQ

| Check | Layer | Tiêu chí pass |
|-------|-------|----------------|
| S1-V1 | Vitest | `searchCuratedFaqs` trả ≥1 hit, score > 0.3, slug `bat-buoc-tham-gia-bhxh` |
| S1-V2 | Vitest | `AiAnswerService.ask` trả `shortAnswer` có nội dung, có citations, không phải thông báo thiếu nguồn |
| S1-E1 | E2E | `/search` gửi câu hỏi → hiển thị answer card, không 5xx / Application error |

---

## S2 — FAQ và chủ đề

**Persona:** Nhân viên đọc FAQ và chủ đề BHTN

**Năng lực:** `/hoi-dap`, trang chi tiết SSG, `/topics`

| Check | Layer | Tiêu chí pass |
|-------|-------|----------------|
| S2-V1 | Vitest | `listCuratedFaqs()` > 10 mục, slug duy nhất, question/answer không rỗng |
| S2-E1 | E2E | `/hoi-dap` có link FAQ; trang chi tiết đầu tiên HTTP < 500 |
| S2-E2 | E2E | `/topics/bhtn` hiển thị nội dung BHTN |

---

## S3 — Pháp luật, nguồn tham khảo, SEO

**Persona:** HR/C&B tìm văn bản và kiểm tra index công khai

**Năng lực:** `/legal-updates`, `/nguon-phap-luat`, `/sitemap.xml`, `/robots.txt`

| Check | Layer | Tiêu chí pass |
|-------|-------|----------------|
| S3-E1 | E2E | Tìm “BHXH” trên legal updates → URL có `q=BHXH` |
| S3-E2 | E2E | `/nguon-phap-luat` có link HTTPS ngoài |
| S3-V1 | Vitest | Sitemap có `/search`, `/legal-updates`; không có `/admin`, `/api` |
| S3-E3 | E2E | `robots.txt` disallow `/admin`; `sitemap.xml` chứa `/search` |

---

## S4 — Công cụ lương & hub nhân viên

**Persona:** Nhân viên tính lương gross-to-net 35 triệu

**Năng lực:** `/calculators`, `/cong-cu-luong-thue`, API salary-tax

| Check | Layer | Tiêu chí pass |
|-------|-------|----------------|
| S4-V1 | Vitest | POST `/api/calculators/salary-tax` → `0 < net < gross` |
| S4-E1 | E2E | Nút “Tính ngay” hiển thị “thực nhận” |
| S4-E2 | E2E | Mọi CTA trên hub `/calculators` load < 500 |

---

## S5 — Hỏi HR & guardrails vận hành

**Persona:** Nhân viên soạn email HR; vận hành kiểm tra RBAC/cron/SSRF

**Năng lực:** `/ask-hr`, Admin RBAC, cron Bearer, SSRF, validation form

| Check | Layer | Tiêu chí pass |
|-------|-------|----------------|
| S5-E1 | E2E | Form HR bật submit khi đủ trường bắt buộc |
| S5-V1 | Vitest | `EMPLOYEE` không vào admin; `HR` có `faq:write` |
| S5-V2 | Vitest | Cron từ chối Bearer sai khi `CACHE_REVALIDATE_SECRET` set |
| S5-V3 | Vitest | SSRF chặn URL private/metadata |
| S5-V4 | Vitest | `isAskHrFormReady` từ chối payload thiếu/không hợp lệ |

---

## Phạm vi năng lực được phủ

| Module README | Kịch bản |
|---------------|----------|
| Tra cứu | S1 |
| FAQ | S2 |
| Nguồn tham khảo | S3 |
| Cập nhật pháp luật | S3 |
| Hỏi HR | S5 |
| Công cụ | S4 |
| Admin (RBAC) | S5 |
| Cron (auth) | S5 |
| SEO | S3 |

**Admin UI / cron crawl thực tế / gửi email HR thật** — ngoài phạm vi (cần DB + secret production); logic được kiểm tra qua Vitest/helpers.
