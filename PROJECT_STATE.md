# LegitCheck Pro — PROJECT STATE (AI Handoff)

**Last updated:** 2026-09-25  
**Status:** MVP nearly complete — core flow works (onboarding → scan → analyze → report → history)  
**Language:** Polish (UI + copy)  
**Target:** Mobile-first PWA / web app for thrift / second-hand authenticity checking

---

## 1. What the app does (one sentence)

User photographs key details of a second-hand fashion item (clothing, shoes, hats, bags, watches…), optionally pastes an OLX/Vinted listing URL, and receives an AI-generated authenticity report with score, red/green flags, condition, and PLN price range — plus ready-to-post sell text.

---

## 2. Current stage in the build process

| Stage | Name | Status |
|-------|------|--------|
| 1 | Discover & Scope | ✅ Done |
| 2 | Choose Stack | ✅ Done |
| 3 | Architecture Sketch | ✅ Done |
| 4 | UI / UX Outline | ✅ Done |
| 5 | Implementation Plan | ✅ Done |
| 6 | Code Generation (core) | ✅ Mostly done |
| 7 | Testing & Quality | ⚠️ Partial (demo mode + some tests) |
| 8 | Deployment | ⚠️ Build artifacts existed; not production-hardened |
| 9 | Documentation & Handover | 🔄 This file |

**MVP is feature-complete for local/demo use.**  
Real AI vision analysis depends on `XAI_API_KEY` (Grok / xAI). Without it the app falls back to rich demo reports.

---

## 3. Tech stack

- **Runtime / framework:** Vite + TanStack Start (React 19) + TanStack Router + TanStack Query
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + CSS variables (dark theme)
- **UI primitives:** Radix UI + custom Button (shadcn-style)
- **State:** Zustand (`src/store/app-store.ts`) + localStorage persistence
- **Server functions:** `@tanstack/react-start` `createServerFn`
- **Auth:** better-auth scaffolding present but **DISABLED** (`VITE_AUTH_ENABLED=false`)
- **Database:** PGlite / Kysely / migrations present but **DISABLED** (`deploy.database=false`)
- **AI:** xAI API (vision) via `process.env.XAI_API_KEY`; fallback `buildDemoReport`

### Important env flags (from `.grok/app-env.json`)

```json
{
  "VITE_AUTH_ENABLED": "false",
  "deploy": { "database": false }
}
```

Do **not** turn auth or DB on unless the product requirements change. Current design is intentionally local-only (history in localStorage).

---

## 4. Feature inventory (what is already built)

### ✅ Done
- Onboarding (3 steps + camera permission probe)
- Category picker (8 categories with 4 required shots each + ghost outlines)
- Camera capture with guided outlines (`GhostCamera` + `GhostOutline`)
- Gallery upload fallback
- Optional listing URL fetch & preview
- AI analysis server function (`analyzeItem`) with structured JSON schema
- Full report view (score, verdict, flags, valuation, missing shots, sell text)
- History album (up to ~15 items, localStorage)
- Guide / poradnik tab
- Sell sheet (copy listing text)
- Dark, mobile-first UI (max-width ~md, bottom nav)
- Demo report generator when no API key
- Image compression / preview handling
- Draft persistence (interrupted scans)

### ⚠️ Partial / needs attention
- Real vision model quality (depends on prompt + XAI_API_KEY)
- Error states & retry UX for failed analysis
- Offline / PWA polish (some Grok PWA scaffolding exists)
- Accessibility (labels, focus, contrast — basic only)
- Unit/integration tests beyond a few script tests
- Production env handling (API key, rate limits)
- Listing fetch reliability (CORS / site changes)

### ❌ Not started / out of MVP
- User accounts / cloud sync
- Real-time multiplayer or sharing
- Push notifications
- Advanced search / brand database
- Payment / premium tier

---

## 5. Project structure (important files only)

```
legitcheck-pro/
├── PROJECT_STATE.md          ← YOU ARE HERE (AI handoff)
├── README.md                 ← human + AI quick start
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── routes/
│   │   ├── __root.tsx        # root layout + styles
│   │   └── index.tsx         # renders <AppShell />
│   ├── components/
│   │   ├── app-shell.tsx     # tabs + onboarding gate
│   │   ├── onboarding.tsx
│   │   ├── scanner-view.tsx  # main capture flow
│   │   ├── report-view.tsx
│   │   ├── history-view.tsx
│   │   ├── guide-view.tsx
│   │   ├── ghost-camera.tsx
│   │   ├── ghost-outline.tsx
│   │   ├── listing-sheet.tsx
│   │   ├── webview-sheet.tsx
│   │   └── ui/button.tsx
│   ├── store/
│   │   └── app-store.ts      # ALL client state
│   ├── lib/
│   │   ├── types.ts          # Verdict, Photo, AnalysisReport…
│   │   ├── categories.ts     # 8 categories + shot specs
│   │   ├── analyze.ts        # server fn + AI call + demo fallback
│   │   ├── demo-report.ts
│   │   ├── history.ts        # localStorage helpers
│   │   ├── images.ts
│   │   ├── listing.ts / listing-fetch.ts
│   │   ├── marketplace.ts
│   │   └── utils.ts
│   ├── styles.css            # Tailwind + design tokens
│   ├── router.tsx
│   └── routeTree.gen.ts
├── public/
├── scripts/                  # Grok/platform helpers (many can be ignored)
├── server/
└── migrations/               # auth schema only (unused)
```

**Ignore for most continuation work:**  
`scripts/*` (except if changing build), `src/lib/auth/*`, `src/lib/app-data/*`, `src/lib/preview-*`, `src/lib/multiplayer/*`, most of `server/`. These are platform scaffolding.

---

## 6. Core data model

```ts
// Verdict
type Verdict = "LEGIT" | "LIKELY_LEGIT" | "UNCERTAIN" | "LIKELY_FAKE" | "FAKE";

// CategoryId
"odziez" | "obuwie" | "czapki" | "akcesoria" | "zegarki" | "elektronika" | "bizuteria" | "torebki"

// AnalysisReport (main output)
{
  itemName, brand, model,
  legitScore: number,          // 0-100
  verdict: Verdict,
  confidenceNote: string,
  conditionScore, conditionLabel,
  accessories,
  retailPricePln, marketMinPln, marketMaxPln, replicaCostPln,
  valuationSource: "live" | "historical" | "estimate",
  valuationNote,
  greenFlags: string[],
  redFlags: string[],
  missingShots: { id, label, reason }[],
  searchQuery: string,
  // + generated sell text in report-view
}
```

Photos are stored as base64 (compressed) in memory + localStorage draft/history.

---

## 7. Main user flows

1. **First launch** → Onboarding (3 slides) → request camera → Scanner
2. **Scan** → pick category → take/upload 1–4 guided shots → optional listing URL → Analyze
3. **Report** → view score + flags + prices → copy sell text / open marketplace search
4. **History** → reopen past reports or delete
5. **Guide** → static tips

Phases in store: `"capture" | "analyzing" | "report"`

---

## 8. How to run (local)

```bash
npm install
# optional: export XAI_API_KEY=...   (without it → demo reports)
npm run dev
# → http://localhost:8080
```

Build:
```bash
npm run build
```

Note: original scripts wrap Vite with `scripts/with-app-env.mjs`. If that fails outside Grok, simplify `package.json` scripts to plain `vite dev` / `vite build`.

---

## 9. Recommended next steps (ordered)

1. **Stabilize AI analysis**
   - Improve system prompt in `src/lib/analyze.ts`
   - Better handling of partial photos / missing shots
   - Rate-limit & clearer error messages when API key missing or quota hit

2. **Polish report & sell flow**
   - Better sell-text template
   - One-tap share / copy improvements
   - Show which photos were used

3. **Quality & resilience**
   - Loading skeletons, empty states, offline message
   - Image size limits & compression quality tuning
   - Basic e2e smoke tests for the main flow

4. **Optional product upgrades**
   - PWA install prompt & offline cache of history
   - More categories or custom shot sets
   - Light mode toggle
   - Export report as image / PDF

5. **Only if required later**
   - Turn on auth + DB for cloud history (follow AGENTS.md rules carefully)

---

## 10. Conventions for continuing work

- Keep UI language **Polish**.
- Prefer small, runnable increments.
- Do not re-enable auth or database unless explicitly requested.
- New features should update this `PROJECT_STATE.md` (status table + inventory).
- Design tokens live in `src/styles.css` (`--color-bg`, `--color-accent`, etc.).
- All client state goes through `useAppStore`.
- Server-side analysis must stay in `createServerFn` (never expose API key to client).

---

## 11. Known quirks / Grok leftovers

- Many files under `scripts/`, `src/lib/auth`, `src/lib/app-data`, `src/lib/preview-*` exist for the original Grok App Builder platform. They are inert when auth/DB are off.
- `AGENTS.md` contains long platform rules — useful reference but not required for pure product work.
- `.project_id` and `.grok/` are metadata; safe to ignore or delete in a clean fork.

---

**Handoff complete.**  
An AI receiving this folder + this file should be able to continue from stage 6/7 without rediscovering the product.  
Start by reading `src/store/app-store.ts`, `src/lib/analyze.ts` and `src/components/scanner-view.tsx`.
