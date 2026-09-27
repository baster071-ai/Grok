import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategory } from "@/lib/categories";
import type { Verdict } from "@/lib/types";
import { cn, formatPln } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

function tone(v: Verdict) {
  if (v === "LEGIT" || v === "LIKELY_LEGIT") return "legit";
  if (v === "FAKE" || v === "LIKELY_FAKE") return "fake";
  return "warn";
}

export function HistoryView() {
  const history = useAppStore((s) => s.history);
  const openHistoryItem = useAppStore((s) => s.openHistoryItem);
  const deleteHistoryItem = useAppStore((s) => s.deleteHistoryItem);
  const clearHistory = useAppStore((s) => s.clearHistory);

  return (
    <div className="stagger-in space-y-4 pb-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Album</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight">Historia</h1>
          <p className="mt-1.5 text-sm text-muted">15 łupów ze zdjęciami. Starsze spadają same, albo usuń palcem.</p>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="icon" className="size-10" onClick={clearHistory} aria-label="Wyczyść historię">
            <Trash2 />
          </Button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-elevated px-6 py-14 text-center" style={{ boxShadow: "var(--shadow-border)" }}>
          <History className="size-7 text-muted" />
          <p className="mt-3 text-sm text-muted">Pusto. Zrób pierwszy skan — zdjęcia zostaną przy raporcie.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {history.map((item) => {
            const t = tone(item.verdict);
            const cat = getCategory(item.categoryId);
            const thumb = item.photos[0]?.preview;
            return (
              <li key={item.id}>
                <div className="flex items-stretch gap-1 rounded-xl bg-elevated" style={{ boxShadow: "var(--shadow-border)" }}>
                  <button
                    type="button"
                    onClick={() => openHistoryItem(item.id)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 p-2 text-left"
                  >
                    {thumb ? (
                      <img src={thumb} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                    ) : (
                      <span
                        className={cn(
                          "flex size-12 shrink-0 items-center justify-center rounded-md font-mono text-xs tabular-nums",
                          t === "legit" && "bg-legit/15 text-legit-fg",
                          t === "fake" && "bg-fake/15 text-fake-fg",
                          t === "warn" && "bg-warn/15 text-warn-fg",
                        )}
                      >
                        {item.legitScore}%
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-fg">{item.itemName}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {item.photos.length} zdj. · {cat?.label ?? item.categoryId}
                        {item.report.isDemo ? " · demo" : ""}
                      </span>
                    </span>
                    <span className="text-right text-xs tabular-nums text-muted">
                      {formatPln(item.marketMinPln)}
                      <span className="block">–{formatPln(item.marketMaxPln)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteHistoryItem(item.id)}
                    className="flex w-10 shrink-0 items-center justify-center text-muted hover:text-fake-fg"
                    aria-label="Usuń z albumu"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
