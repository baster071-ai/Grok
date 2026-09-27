# LegitCheck Pro

Aplikacja webowa (mobile-first) do sprawdzania autentyczności rzeczy z second-handu / lumpeksu.

Użytkownik robi 4 kluczowe zdjęcia (metki, szwy, hologramy…), opcjonalnie wkleja link z OLX/Vinted i dostaje raport AI: ocena autentyczności, stan, widełki cenowe w PLN oraz gotowy tekst ogłoszenia.

---

## Szybki start

```bash
npm install
# opcjonalnie – bez klucza działa tryb demo
export XAI_API_KEY=your_xai_key
npm run dev
```

Otwórz http://localhost:8080

---

## Stack

- Vite + TanStack Start / React 19 / TypeScript
- Tailwind CSS v4 + Radix
- Zustand + localStorage
- xAI vision (z fallbackiem demo)

Auth i baza danych są **wyłączone** (lokalna historia).

---

## Struktura (skrót)

| Ścieżka | Opis |
|---------|------|
| `src/components/scanner-view.tsx` | Główny flow skanowania |
| `src/components/report-view.tsx` | Raport z wynikami |
| `src/store/app-store.ts` | Cały stan klienta |
| `src/lib/analyze.ts` | Analiza AI (server function) |
| `src/lib/categories.ts` | Kategorie + wymagane ujęcia |
| `src/lib/types.ts` | Typy (Verdict, AnalysisReport…) |
| `PROJECT_STATE.md` | **Pełny stan projektu dla AI** |

---

## Kontynuacja przez AI

1. Przeczytaj najpierw **`PROJECT_STATE.md`**.
2. Nie włączaj auth ani bazy bez wyraźnej prośby.
3. UI pozostaje po polsku.
4. Po każdej większej zmianie zaktualizuj tabelę statusu w `PROJECT_STATE.md`.

---

## Licencja / pochodzenie

Wyekstrahowane z workspace Grok App Builder (wrzesień 2026).  
Kod aplikacji produktowej jest gotowy do dalszego rozwoju w dowolnym środowisku.
