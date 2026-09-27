# AI Handoff Prompt — LegitCheck Pro

Copy-paste this (or the whole folder) into another AI coding tool to continue the project.

---

## Context

You are continuing development of **LegitCheck Pro**, a Polish mobile-first web app that helps people check authenticity of second-hand fashion items (clothes, shoes, hats, bags, watches, etc.) before buying or when selling on OLX/Vinted.

**Current status:** Core MVP is implemented and functional.
- Onboarding → category selection → guided photo capture (4 shots) → optional listing URL → AI analysis → detailed report → local history.
- Auth and database are intentionally OFF. History lives in localStorage.
- Without `XAI_API_KEY` the app returns rich demo reports.

## Stack
Vite + TanStack Start (React 19) + TypeScript + Tailwind v4 + Zustand + Radix.

## Most important files
- `PROJECT_STATE.md` — full status, inventory, next steps (READ THIS FIRST)
- `src/store/app-store.ts` — all client state
- `src/lib/analyze.ts` — AI server function + demo fallback
- `src/lib/categories.ts` — categories and required shots
- `src/components/scanner-view.tsx`, `report-view.tsx`, `app-shell.tsx`

## Rules for continuation
1. Keep the UI language Polish.
2. Do not enable auth or database unless the user explicitly asks.
3. Prefer small, runnable increments. After each major change update the status table in `PROJECT_STATE.md`.
4. All client state goes through the Zustand store.
5. AI analysis must stay server-side (`createServerFn`); never expose the API key.

## Suggested next tasks (pick one)
A. Improve the vision prompt and error handling in `src/lib/analyze.ts`
B. Polish the report UI and sell-text generation
C. Add better loading / empty / error states
D. PWA install + offline history cache
E. Something the user requests

Start by confirming you read `PROJECT_STATE.md` and summarizing the current stage in one short paragraph.
