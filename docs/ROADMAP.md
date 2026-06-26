# Roadmap — Cổng HR FPT Telecom

Cập nhật: **2026-06-26**  
Production / UAT: https://bhxh.orangecloud.vn/  
Repo: [github.com/sycu8/bhxh-hr-assistant](https://github.com/sycu8/bhxh-hr-assistant)

Tài liệu liên quan: [QA-INVENTORY.md](QA-INVENTORY.md) · [TEST-REPORT.md](TEST-REPORT.md)

---

## Trạng thái hiện tại

| Hạng mục | Trạng thái |
|----------|------------|
| Deploy UAT/Prod (Worker `vn-insurance-fti`) | ✓ Live |
| Cổng HR (OTP, my-hr, pay, hr, admin) | ✓ Trên UAT |
| API docs `/developers` + OpenAPI | ✓ |
| Vitest | ✓ 153/153 (chạy từ `%TEMP%\vn-insurance-fti-deploy`) |
| E2E public | ✓ 31/31 |
| E2E portal/auth/admin | ⏸ 11 skip — cần Postgres local |
| UAT streak | ✓ 10/10 (mục tiêu **15/15**) |
| Git `main` = code deploy | ⚠ Cần PR merge HR portal |

---

## P0 — Tuần 1 (ổn định)

**Mục tiêu:** Một nhánh `main` sạch, CI xanh, QA portal unblock.

| # | Việc | Owner | Done khi |
|---|------|-------|----------|
| P0-1 | PR merge HR portal → `main` | Dev | CI pass, deploy từ `main` |
| P0-2 | `docker compose up -d` + `pnpm qa:setup` | Dev | Seed 80 NV, DB schema OK |
| P0-3 | E2E **42/42** local | Dev | `pnpm qa:run` exit 0 |
| P0-4 | UAT streak **15/15** | Dev | `STREAK_TARGET=15 pnpm test:uat-streak` |
| P0-5 | Pilot sign-off (1 NV, 1 manager, 1 HR) | HR/IT | Checklist trong QA-INVENTORY |
| P0-6 | Secrets & email deliverability | IT | OTP + Ask-HR tới `@fpt.com` |

**Lệnh P0:**

```bash
docker compose up -d
cp .env.e2e.example .env.e2e
pnpm qa:setup
pnpm qa:run
STREAK_TARGET=15 pnpm test:uat-streak
```

**Không làm không hỏi:** `db-schema-sync` / `hris-sync` trên production, force-push `main`.

---

## P1 — Tháng 1 (vận hành)

| # | Việc | Mô tả |
|---|------|--------|
| P1-1 | HRIS production | `HRIS_SOURCE` + cron `hris-sync` hàng ngày |
| P1-2 | Microsoft CSV import | Pilot `/hr/employees` + `pnpm hr:import-microsoft` |
| P1-3 | Turnstile production keys | Thay test key `1x000…` trên UAT cuối |
| P1-4 | Runbooks | OTP fail, schema lệch, Error 1101, cron fail |
| P1-5 | Wrangler tail + alert | Spike 5xx, OTP 503, cron 401 |
| P1-6 | API consumers | Chatbot → `/api/search`; payroll → `/api/calculators/salary-tax` |

---

## P2 — Tháng 2–3 (chất lượng & scale)

| # | Việc | Mô tả |
|---|------|--------|
| P2-1 | Crawl CMS E2E | Bulk approve/reject legal crawler |
| P2-2 | Content hygiene cron | `purge-irrelevant`, `superseded-pending` |
| P2-3 | BHYT/BHTN curated refresh | Quy trình cập nhật từ nguồn chính thống |
| P2-4 | Perf / cache | KV FAQ/legal; đo TTFB `/search` |
| P2-5 | Visual regression | Playwright screenshots hero/login/search |
| P2-6 | Load test OTP | Staging only, 10–50 concurrent |

---

## P3 — Quý sau (chiến lược)

| # | Việc | Ghi chú |
|---|------|---------|
| P3-1 | SSO Entra ID | Thay/thêm OTP email |
| P3-2 | PWA / mobile | Payslip, leave, nav mobile |
| P3-3 | SLA dashboards | Ticket SLA, search analytics cho HR |
| P3-4 | Tách UAT / Prod | Worker + domain riêng |
| P3-5 | DR | Backup Postgres, rollback Worker version |

---

## Definition of Done — Production-ready

- [ ] `main` = code trên UAT, mỗi push qua CI (`test` + `e2e` với Postgres service)
- [ ] E2E 42/42 local + UAT streak 15/15
- [ ] 3 pilot users sign-off (checklist QA-INVENTORY § Pilot)
- [ ] OTP + Ask-HR email verified trên `@fpt.com`
- [ ] Cron crawl + HRIS ổn 7 ngày
- [ ] README + ROADMAP + runbook cập nhật; không secret trong repo
- [ ] Release tag `vYYYY.MM.DD` sau go-live rộng

---

## Quyết định cần từ stakeholder

| # | Câu hỏi | Tác động |
|---|---------|----------|
| D-1 | Merge `main` ngay hay chờ pilot? | P0-1 timing |
| D-2 | UAT = Prod hay tách worker? | P3-4 |
| D-3 | HRIS: CSV đủ hay cần Graph API? | P1-1 |
| D-4 | OTP email vs Entra SSO ưu tiên? | P3-1 |
| D-5 | Go-live rộng: bao nhiêu NV pilot? | P0-5 |

---

## Theo dõi tiến độ

| Sprint | Ngày | Ghi chú |
|--------|------|---------|
| P0 kickoff | 2026-06-26 | ROADMAP, docker-compose, qa:run, CI test workflow |
| P0 complete | _TBD_ | E2E 42/42 + PR merged |
| P1 kickoff | _TBD_ | Sau P0 sign-off |
