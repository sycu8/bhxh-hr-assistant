# UI/UX Audit — Cổng tra cứu & hỏi đáp bảo hiểm (FTI)

Tài liệu này dựa trên **codebase hiện tại** (`src/app`, `src/components`, `src/lib`), không phải mô tả chung. Ngày khảo sát: 2026-05-12.

---

## 1. Hiện trạng navigation

**Vị trí:** `src/app/layout.tsx`

- Header sticky, logo + chữ “Bảo hiểm FTI”, `nav` cuộn ngang trên mobile, `aria-label="Điều hướng chính"`.
- Các mục chính: **Tra cứu** (`/search`), **Hỏi đáp** (`/faq`), **Chủ đề** (`/topics`), **Cập nhật pháp luật** (`/legal-updates`), **Công cụ** (`/calculators`), **Hỏi HR** (`/ask-hr`), **Nguồn luật** (`/nguon-phap-luat`, ẩn trên mobile rất nhỏ — hiện `md:inline-flex`), **Quản trị** (`/admin`).
- **Cải tiến còn lại:** phân tách rõ “chế độ nhân viên” vs admin (ví dụ ẩn Quản trị theo role — chưa có auth UI); footer vẫn chưa có menu phụ.

---

## 2. Các page hiện có

| Route | File | Mục đích ngắn |
|--------|------|----------------|
| `/` | `src/app/page.tsx` | Trang chủ: hero marketing + trust + chủ đề + cách hoạt động + FAQ nổi bật + công cụ + preview pháp luật (DB) + lưu ý an toàn + quyền riêng tư + nguồn chính thống |
| `/search` | `src/app/search/page.tsx` + `search-client.tsx` | Tra cứu POST `/api/search`, AnswerCard + SearchHits |
| `/faq` | `src/app/faq/page.tsx` | Danh sách FAQ đã duyệt (50), link **Xem chi tiết** → `/faq/[id]` và **Mở tra cứu** |
| `/nguon-phap-luat` | `src/app/nguon-phap-luat/page.tsx` | Mục lục TLPL tĩnh |
| `/cong-cu-luong-thue` | `src/app/cong-cu-luong-thue/page.tsx` | Công cụ lương & thuế (client) |
| `/legal-updates` | `src/app/legal-updates/page.tsx` | Danh sách cập nhật pháp luật đã publish (DB) |
| `/legal-updates/[slug]` | `src/app/legal-updates/[slug]/page.tsx` | Chi tiết bản tin đã publish |
| `/topics` | `src/app/topics/page.tsx` | Danh sách chủ đề |
| `/topics/[slug]` | `src/app/topics/[slug]/page.tsx` | Redirect sang tra cứu có query gợi ý |
| `/calculators` | `src/app/calculators/page.tsx` | Hub công cụ |
| `/ask-hr` | `src/app/ask-hr/page.tsx` | Form gửi HR (mailto) |
| `/faq/[id]` | `src/app/faq/[id]/page.tsx` | Chi tiết FAQ đã duyệt |
| `/cap-nhat-phap-luat` | `src/app/cap-nhat-phap-luat/page.tsx` | Redirect → `/legal-updates` |
| `/admin` | `src/app/admin/page.tsx` | Dashboard + bảng HR review + tài liệu chờ + Media ingest |
| `/admin/legal-crawler` | `src/app/admin/legal-crawler/page.tsx` | Crawl, duyệt, keyword, nguồn |

**Còn theo roadmap dài:** `/calculators/social-insurance-contribution` (UI form), admin tách `/admin/faqs`, `/admin/documents`, …, search empty state & AnswerCard copy/feedback đầy đủ.

---

## 3. Các vấn đề UX chính

1. ~~**Trang chủ không trả lời trong 5 giây**~~ → Đã có hero “Tra cứu bảo hiểm nhanh…”, CTA, chip gợi ý (`MarketingHeroSection`). Vẫn cần đo lường thực tế với người dùng nội bộ.
2. ~~**Luồng FAQ không có URL chi tiết**~~ → Đã thêm `/faq/[id]`; list & popular FAQ trỏ tới đây.
3. ~~**Hai nguồn cập nhật pháp luật**~~ → Trang chủ dùng preview từ DB khi có publish; fallback tĩnh khi rỗng. Route chính `/legal-updates`.
4. **Không có “đường thoát” khi không đủ căn cứ:** `/ask-hr` đã có (mailto); search vẫn cần empty state theo copy spec khi không có hit.
5. **Admin:** một trang gom nhiều việc; thiếu IA phụ (`/admin/faqs`, …) — khó mở rộng và khó onboarding cho reviewer.

---

## 4. Các vấn đề visual design

- **Theme:** `globals.css` dùng palette xanh doanh nghiệp (`--primary` 214°), border/radius chuẩn shadcn — ổn nhưng **hơi “corporate”**, chưa có “soft marketing” như tham chiếu mebauangi (nền ấm, hero rộng, nhiều khoảng trắng có chủ đích).
- **Độ tương phản hero:** block công cụ lương (`home-salary-tools.tsx`) gradient tối xen kẽ section sáng — tốt cho nhấn mạnh nhưng cần kiểm tra **độ đọc** trên màn hình ngoài trời / độ sáng cao.
- **Card:** radius `rounded-xl` mặc định UI — có thể tăng nhẹ (`2xl`) cho “cảm giác an toàn/thân thiện” theo brief.
- **Thiếu design tokens riêng** cho marketing (section spacing, hero max-width, “soft card”) — hiện lặp class Tailwind rải rác.

---

## 5. Các vấn đề content / copywriting

- Một số chỗ vẫn lẫn **thuật ngữ kỹ thuật** (ví dụ metadata template “Bảo hiểm FTI” ổn; nhưng “Mục lục PL” với người mới).
- **Confidence** trong `answer-card.tsx`: đã Việt hóa “Cao / Trung bình / Thấp” — vẫn nên đổi “Thấp” thành **“Cần HR kiểm tra thêm”** khi mapping LOW trong ngữ cảnh nhân viên (theo rule sản phẩm).
- **FAQ list:** badge “Đã duyệt” tốt; cần thêm microcopy “Có trích nguồn trong kho” nếu có `citations_count`.

---

## 6. Mobile / responsive

- Header `overflow-x-auto` — tốt.
- Bảng admin (`admin/page.tsx`) đã bọc `overflow-x-auto` — tốt.
- **Search:** form đã chỉnh `min-h-11`, full-width button mobile — tốt.
- **Trang chủ:** grid topic 2–4 cột — ổn; cần đảm bảo **chip hero** không tràn ngang (wrap).

---

## 7. Accessibility

- Có link “Bỏ qua điều hướng” — tốt.
- Nhiều `aria-label` trên ô tìm kiếm — tốt.
- **Thiếu:** landmark `nav` có `aria-label` tiếng Việt; một số icon-only button admin cần rà lại `aria-label`.
- **AnswerCard:** kết quả dài — cần đảm bảo heading hierarchy (`h1` trang vs `h2` trong card) khi rebuild search page.

---

## 8. Những phần nên giữ

- **Luồng tìm kiếm + API** `/api/search`, schema Zod, `SearchClient` — logic ổn.
- **AnswerCard + citations + needsHrReview** — đúng hướng tin cậy; chỉ cần mở rộng UX (copy, empty state).
- **Prisma + `getPublishedLegalUpdates`** — nền tảng legal updates đúng.
- **Công cụ lương–thuế** (`SalaryTaxTool`, `CalculatorService`) — giữ; bọc lại trong hub `/calculators`.
- **Admin legal crawler** — chức năng cốt lõi; cần IA lại chứ không xóa logic.

---

## 9. Những phần nên rebuild

1. **Trang chủ** — theo hero + trust + how it works + safety/privacy + nguồn chính thống + topic + FAQ + legal preview đồng bộ DB.
2. **Global navigation + footer** — reflect IA mới; thêm “Hỏi HR”, “Cập nhật pháp luật”.
3. **Search results page** — empty state, suggested queries, actions trên AnswerCard.
4. **FAQ** — thêm `/faq/[id]`; filter theo chủ đề (sau).
5. **Legal updates** — URL `/legal-updates`, trang chi tiết theo `slug`.
6. **Design system nhẹ** — `src/components/ui-custom/` (PageShell, TrustBadge, …) để giảm copy-paste class.

---

## 10. Information architecture (đề xuất)

**Khu vực công khai (nhân viên):**

- `/` — Trang chủ (tra cứu nhanh + tin cậy)
- `/search` — Kết quả / trả lời
- `/faq` + `/faq/[id]` — Danh sách + chi tiết
- `/topics` + `/topics/[slug]` — Chủ đề (lọc hoặc deep-link sang search)
- `/legal-updates` + `/legal-updates/[slug]` — Đã publish
- `/calculators` + các route con — Công cụ
- `/ask-hr` — Gửi câu hỏi khi không đủ căn cứ

**Admin (giữ ngắn giai đoạn 1):**

- `/admin` — Dashboard
- `/admin/legal-crawler` — Gom crawl (cho đến khi tách `/admin/crawl-*`)

**Redirect:** `cap-nhat-phap-luat` → `legal-updates` (giữ bookmark nội bộ).

---

## 11. Design system (đề xuất nhẹ)

- **Tokens:** thêm biến `--surface-elevated`, `--radius-card-lg` trong `:root` hoặc dùng `@theme` mở rộng.
- **Components (folder `src/components/ui-custom/`):**
  - `PageShell` — `max-w-6xl mx-auto px-4 py-…`
  - `SectionShell` — tiêu đề section + mô tả + spacing
  - `TrustBadge` — icon + 1 dòng
  - `SoftCard` — card bo lớn, shadow nhẹ
  - `EmptyState` — minh họa + CTA
- **Typography:** giữ `Be Vietnam Pro`; tăng `line-height` cho đoạn marketing.

---

## 12. Implementation tasks (ưu tiên)

| Ưu tiên | Task | Ghi chú |
|--------|------|--------|
| P0 | `docs/ui-ux-audit.md` | Hoàn thành |
| P0 | Redirect `cap-nhat-phap-luat` → `legal-updates` | `next.config.ts` + trang legacy |
| P0 | Trang `/legal-updates` + `/legal-updates/[slug]` | Dùng `getPublishedLegalUpdates` / `getPublishedLegalUpdateDetailBySlug` |
| P0 | Rebuild `/` (hero, trust, how it works, notices, legal preview DB) | `src/components/marketing/*`, `page.tsx` |
| P0 | Nav: Chủ đề, Cập nhật pháp luật, Công cụ hub, Hỏi HR, Nguồn luật | `layout.tsx` |
| P1 | `/faq/[id]` + link từ FAQ list / popular | `lib/db/faq-queries.ts` |
| P1 | `/topics` + `/topics/[slug]` → search | `app/topics/*` |
| P1 | `/calculators` hub | `app/calculators/page.tsx` |
| P1 | `/ask-hr` form (mailto) | `AskHrForm.tsx` |
| P2 | AnswerCard: Copy / feedback / gửi HR | `navigator.clipboard` + toast đơn giản |
| P2 | Search empty state theo copy spec | Khi không có citation / lỗi |
| P2 | Tách admin IA (`/admin/faqs`, …) | Khối lượng lớn — theo sprint |
| P3 | Storybook hoặc page `/design-preview` | Tuỳ team |

---

## Phụ lục — triển khai sprint 1 (2026-05-12)

Đã merge vào `main` (local): các mục P0–P1 ở bảng trên trừ AnswerCard nâng cao & admin tách route. Design system đầy đủ (`ui-custom/*`) **chưa** tạo — dùng folder `components/marketing` làm lớp tạm.


## Ghi chú tham chiếu ngoài repo

- **mebauangi.info / pregnancy-meal-plan:** tinh thần “ít lựa chọn, hero rõ, CTA một ý” — áp dụng được phần layout & nhịp đọc; **không** copy palette y hệt nếu muốn giữ độ tin cậy pháp lý (xanh dương vẫn phù hợp).

---

*Tài liệu sống: cập nhật sau mỗi sprint khi UI thay đổi.*
