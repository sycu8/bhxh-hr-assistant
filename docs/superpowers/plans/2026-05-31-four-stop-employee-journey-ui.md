# Four-Stop Employee Journey UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement and deploy the approved Four-Stop Employee Journey UI across the employee-facing insurance portal.

**Architecture:** Add one shared journey copy/model and one reusable journey component, then wire it into the existing App Router pages. Keep data fetching and current route structure intact.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS 4 tokens, existing shadcn-style UI primitives, Vitest, OpenNext Cloudflare deploy.

---

### Task 1: Shared Journey Model

**Files:**
- Create: `src/lib/copy/employee-journey.ts`
- Create: `tests/employee-journey.test.ts`

- [ ] Add tests proving the journey has four ordered stops and active state selection.
- [ ] Implement the shared model and helper.
- [ ] Run `pnpm test tests/employee-journey.test.ts`.

### Task 2: Shared Journey Component

**Files:**
- Create: `src/components/portal/employee-journey.tsx`

- [ ] Build a reusable responsive journey indicator using existing tokens and lucide icons.
- [ ] Support full and compact variants.

### Task 3: Employee-Facing Pages

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/marketing/MarketingHeroSection.tsx`
- Modify: `src/app/search/search-client.tsx`
- Modify: `src/components/portal/answer-card.tsx`
- Modify: `src/components/portal/search-hits.tsx`
- Modify: `src/app/faq/page.tsx`
- Modify: `src/app/legal-updates/page.tsx`
- Modify: `src/app/legal-updates/[slug]/page.tsx`
- Modify: `src/app/nguon-phap-luat/page.tsx`
- Modify: `src/app/ask-hr/page.tsx`
- Modify: `src/components/marketing/AskHrForm.tsx`

- [ ] Update global navigation labels to match the four stops.
- [ ] Make the homepage the guided entry point.
- [ ] Make search the answer workspace with a visible path to evidence and HR.
- [ ] Make FAQ/legal/source pages read as the evidence layer.
- [ ] Make Ask HR the final guided handoff.

### Task 4: Verification And Deploy

**Files:**
- No source changes expected.

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Start local app and validate desktop and mobile rendering with Playwright.
- [ ] Run `npx wrangler whoami`.
- [ ] Run `pnpm deploy`.
