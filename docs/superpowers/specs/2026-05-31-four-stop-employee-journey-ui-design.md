# Four-Stop Employee Journey UI Design

Date: 2026-05-31
Project: vn-insurance-fti

## Approved Direction

Use the Employee Guided Assistant direction across the full employee flow. The product should feel like a guided path for employees who need to understand an insurance situation, verify the source, and know when to ask HR/C&B.

## Core Journey

The UI is organized around four visible stops:

1. Dat cau hoi: natural-language employee question entry.
2. Doc cau tra loi: short answer, confidence, explanation, and next action.
3. Kiem tra nguon: source documents, FAQ citations, effective dates, and original documents.
4. Hoi HR: prefilled escalation path when confidence is low, evidence is missing, or the case depends on personal context.

## Scope

Apply the journey system to:

- `/`: guided entry, search, common situations, and route into the rest of the journey.
- `/search`: answer workspace with current-step indicator and HR handoff.
- `/faq` and `/faq/[id]`: evidence layer for approved answers.
- `/legal-updates` and `/legal-updates/[slug]`: evidence layer for legal changes.
- `/nguon-phap-luat`: source index as evidence layer.
- `/ask-hr`: final escalation step, with context-friendly form copy.
- Global navigation: labels should reflect the employee journey without removing admin access.

## Visual System

Keep the existing Tailwind/shadcn tokens and FTI blue palette. Add a softer guided feel through pale blue surfaces, clear step cards, compact trust badges, and restrained rounded cards. Avoid a separate visual framework.

## Behavior

The journey indicator should be reusable and declarative. Each surface chooses its current stop; links take users to the most relevant route for each stop. The HR handoff can remain mailto-based but should feel like the explicit final step in the flow.
