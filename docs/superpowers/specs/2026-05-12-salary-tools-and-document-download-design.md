# Salary Tools And Document Download Design

Date: 2026-05-12
Project: vn-insurance-fti
Scope: Home UI refresh for document download actions and new salary/tax calculator surfaces

## Summary

This design adds two related improvements to the existing insurance knowledge portal:

1. Make document download actions more visible, more trustworthy, and more useful for HR/C&B users by moving them toward a stronger deep-blue visual language and clearer action hierarchy.
2. Introduce a salary and tax tools experience in two places:
   - a quick-access section on the home page
   - a dedicated full calculator page for detailed salary, insurance, and tax estimation

The implementation should preserve the current structure of the portal and fit into the existing Next.js App Router, shadcn UI, Tailwind, and service-driven backend layout.

## Goals

- Make legal/document download buttons visually stronger and easier to identify.
- Use a darker blue palette that communicates reliability and official guidance.
- Add calculator tools for:
  - employee mandatory social insurance contribution
  - gross to net salary
  - net to gross salary
  - take-home pay after insurance, personal income tax, and family deductions
- Show a detailed step-by-step result breakdown, not only the final number.
- Keep calculator business logic centralized in services and validators, not embedded in React components.

## Non-goals

- Payroll export, PDF export, or spreadsheet download in this iteration.
- Support for every edge-case allowance or every special tax exemption.
- Full payroll engine behavior for all contract types or all labor scenarios.
- Multi-year legal-rule version switching in the UI.

## Users

- HR/C&B staff who need fast salary estimation and legal document access.
- Managers or employees who need a self-service explanation of how take-home pay is formed.
- Admin or content managers who want the portal to feel more credible and more operationally useful.

## Legal And Policy Baseline

This calculator set will use the legal baseline applicable to salary income for tax year 2026.

### Personal income tax baseline

Official sources used for this design:

- Law `109/2025/QH15`, issued on `2025-12-10`, effective `2026-07-01`, with salary-income rules applicable from tax year `2026`.
- Official policy guidance confirming the 2026 salary-income application and the 5-bracket progressive schedule.
- Resolution `110/2025/UBTVQH15`, effective from `2026-01-01`, applied from tax year `2026`, adjusting family deductions.

### Family deduction values

- Taxpayer personal deduction: `15,500,000 VND/month`
- Each dependent deduction: `6,200,000 VND/month`

### Progressive salary tax schedule for resident individuals

Monthly taxable income brackets:

1. Up to `10,000,000`: `5%`
2. Over `10,000,000` to `30,000,000`: `10%`
3. Over `30,000,000` to `60,000,000`: `20%`
4. Over `60,000,000` to `100,000,000`: `30%`
5. Over `100,000,000`: `35%`

### Insurance assumptions for this iteration

Employee-side mandatory rates remain configurable through centralized service configuration:

- BHXH: `8%`
- BHYT: `1.5%`
- BHTN: `1%`

The calculators will support insurance caps:

- BHXH and BHYT cap based on `20 x base salary`
- BHTN cap based on `20 x regional minimum wage`

The service must expose the rule inputs clearly so they can be updated in one place when law or company policy changes.

### 2026 cap reference defaults

For MVP legal-rule configuration:

- Base salary default: `2,340,000 VND/month`
- Regional minimum wage defaults from 2026 decree:
  - Region I: `5,310,000`
  - Region II: `4,730,000`
  - Region III: `4,140,000`
  - Region IV: `3,700,000`

Derived caps:

- BHXH/BHYT max insurance salary base: `46,800,000`
- BHTN max insurance salary base depends on region:
  - Region I: `106,200,000`
  - Region II: `94,600,000`
  - Region III: `82,800,000`
  - Region IV: `74,000,000`

## Product Direction

The chosen visual direction is the previously approved "B" concept:

- utility-first
- stronger deep-blue action styling
- more prominent document actions
- calculators feel like operational tools rather than passive content cards

The home page remains a portal, but it will become more task-oriented.

## Information Architecture

### Home page additions

The home page will gain a new "salary and tax tools" section and a stronger document-action treatment.

Recommended order:

1. hero search
2. topics
3. popular FAQ
4. salary and tax tools quick-access section
5. legal updates with stronger document download actions

This keeps search and knowledge first, while still surfacing the new utilities before the legal update cards.

### Dedicated calculator page

Add a full page route for the calculator suite.

Recommended route:

- `/cong-cu-luong-thue`

This page becomes the detailed workspace for all salary-related calculations.

## UI Design

### Document download buttons

Current issue:

- Download links are visually light and easy to miss.
- The "open page / open PDF" action feels like a text link rather than an important trusted action.

Target design:

- Use deep blue as the primary action color.
- Differentiate actions:
  - primary filled button for `Tai PDF`
  - secondary outline or pale-blue button for `Xem van ban goc`
- Add short trust signals near the buttons:
  - `Nguon chinh thong`
  - `Da duoc HR/C&B xac nhan`
  - `Ngay hieu luc` when available
- Use icon-backed buttons and stronger spacing.

Expected outcome:

- Users immediately see where to download the document.
- Buttons feel official and dependable.

### Home quick tools section

Add a section with three strong calculator entry cards:

1. `Gross -> Net`
2. `Net -> Gross`
3. `Thuc nhan sau bao hiem va thue`

Each card should include:

- a short label
- a one-line promise of what it calculates
- a compact example figure
- a strong CTA button

This section should feel more like a utility tray than a content list.

### Dedicated calculator page layout

Use a two-zone layout on desktop:

- left: input controls
- right: calculated results and breakdown

On mobile:

- stack input first
- show final result summary next
- show breakdown table below

Recommended interaction model:

- segmented control or tabs at the top for calculator mode
- live recalculation or explicit "Tinh ngay" button
- clear labels and helper text

### Result presentation

For each calculator mode, show:

- final result
- insurance deductions
- taxable income
- family deductions
- personal income tax
- final take-home amount

The result area should also include a compact explanation block:

- legal basis summary
- assumptions used
- disclaimer that HR/C&B confirmation is required for real payroll cases

## Calculator Modes

### 1. Social insurance contribution

Purpose:

- compute employee-side BHXH, BHYT, and BHTN from the insurance salary base

Inputs:

- salary insurance base
- region for BHTN cap
- optional legal rule profile if later extended

Outputs:

- BHXH amount
- BHYT amount
- BHTN amount
- total employee deduction
- applied caps explanation

### 2. Gross to net

Purpose:

- estimate actual take-home salary from gross salary

Inputs:

- gross salary
- insurance salary base
- region
- dependent count
- optional extra pre-tax deduction fields are out of scope for this iteration

Logic:

- compute insurance from insurance salary base with caps
- taxable salary income = gross - mandatory insurance - family deductions
- apply 2026 progressive tax schedule
- net = gross - insurance - personal income tax

Outputs:

- final net
- detailed breakdown by line item

### 3. Net to gross

Purpose:

- infer required gross salary to achieve a target take-home pay

Inputs:

- target net salary
- insurance salary base behavior
- region
- dependent count

Logic:

- use a bounded search or binary search in the service layer
- repeatedly evaluate the gross-to-net function until the resulting net matches target within an accepted tolerance

Outputs:

- estimated gross
- insurance deductions
- tax amount
- final matched net
- explanation that the result is an estimate based on configured assumptions

### 4. Take-home after insurance and tax

Purpose:

- support users who want a breakdown-first view rather than conversion framing

Inputs:

- gross salary
- insurance salary base
- region
- dependent count

Outputs:

- a payroll-like statement:
  - gross salary
  - BHXH
  - BHYT
  - BHTN
  - total mandatory insurance
  - family deduction amount
  - taxable income
  - tax by bracket or total tax
  - final take-home pay

This mode may internally reuse the same service as gross-to-net, but the UI language should emphasize explanation rather than conversion.

## Architecture

### Service layer

Expand the existing calculator service into a central salary/tax calculation module.

Recommended responsibilities:

- legal-rule configuration
- insurance cap handling
- progressive tax calculation
- gross-to-net computation
- net-to-gross reverse solving
- formatting-friendly result shape

Recommended internal decomposition:

- legal rule constants
- tax bracket helpers
- insurance helper
- salary calculator service methods

### Validator layer

Extend calculator validators to support:

- salary base
- gross salary
- target net salary
- dependent count
- region enum
- insurance salary base

Validation should enforce:

- positive currency values
- realistic upper bounds
- non-negative dependent count
- valid region values

### API layer

Preferred shape:

- keep the existing social insurance endpoint if needed for backward compatibility
- add a new calculator route for salary tax tools, either:
  - one unified endpoint with mode switching
  - or multiple endpoints by calculator mode

Recommended direction:

- one unified endpoint for the salary/tax suite

Example conceptual modes:

- `social-insurance`
- `gross-to-net`
- `net-to-gross`
- `take-home`

### UI layer

Keep all formulas out of components.

Components should:

- collect input
- call route or server action
- render result cards and breakdown tables

## Data Model Changes

No database persistence is required for the calculator MVP.

The calculators can remain stateless for now.

If analytics are later added, logs should be introduced separately rather than bundled into this change.

## Error Handling

The calculator page should gracefully handle:

- invalid inputs
- target net values that cannot be matched under current assumptions
- temporary API failures

User-facing error copy should be plain and specific.

Example:

- `Muc luong nhap vao khong hop le.`
- `Khong the noi suy gross tu net voi bo gia tri hien tai.`

## Testing Strategy

Use test-first implementation for the core logic.

Required test groups:

1. insurance contribution with caps
2. gross-to-net with zero tax case
3. gross-to-net across each tax bracket boundary
4. dependent deduction effect on tax
5. net-to-gross inversion accuracy
6. validator behavior for invalid values

Important edge cases:

- taxable income less than or equal to zero
- salary above BHXH/BHYT cap
- salary above BHTN cap for each region
- exact threshold values at 10m, 30m, 60m, 100m taxable income

## Rollout Plan

Implementation should be done in this order:

1. extend calculator tests
2. implement service logic
3. add validators and API route
4. build dedicated calculator page
5. add home quick tools section
6. restyle document action buttons on legal cards and any other relevant document links
7. verify desktop and mobile rendering

## Risks

- Legal values may change again after 2026. The service must isolate them in one rule object.
- Net-to-gross can become fragile if assumptions are scattered. The reverse solver must depend only on the same forward function used by gross-to-net.
- If button restyling is applied inconsistently, the portal may feel fragmented. The document-action pattern should be reused, not reinvented per component.

## Success Criteria

This design is successful when:

- document download actions are clearly more visible and more trustworthy
- the home page offers obvious access to salary tools
- the dedicated calculator page supports all approved modes
- users can see a detailed breakdown, not just one final number
- legal values for 2026 salary tax and family deductions are represented correctly in the calculation logic
- the implementation stays service-driven and test-covered
