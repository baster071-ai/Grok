import { BookOpen, History, ScanSearch, Shield } from "lucide-react";
import { useLayoutEffect } from "react";
import { GhostCamera } from "@/components/ghost-camera";
import { GuideView } from "@/components/guide-view";
import { HistoryView } from "@/components/history-view";
import { ListingSheet } from "@/components/listing-sheet";
import { Onboarding } from "@/components/onboarding";
import { ScannerView } from "@/components/scanner-view";
import { WebviewSheet } from "@/components/webview-sheet";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const NAV = [
  { id: "scanner" as const, label: "Skaner", icon: ScanSearch },
  { id: "history" as const, label: "Historia", icon: History },
  { id: "guide" as const, label: "Poradnik", icon: BookOpen },
];

export function AppShell() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const tab = useAppStore((s) => s.tab);
  const hydrate = useAppStore((s) => s.hydrate);
  const setTab = useAppStore((s) => s.setTab);

  useLayoutEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <span className="flex size-12 items-center justify-center rounded-xl bg-elevated text-accent" style={{ boxShadow: "var(--shadow-border)" }}>
          <Shield className="size-5" />
        </span>
      </div>
    );
  }

  if (!onboardingDone) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col border-x border-border">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-bg/90 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-elevated text-accent" style={{ boxShadow: "var(--shadow-border)" }}>
              <Shield className="size-3.5" />
            </span>
            <div>
              <p className="text-sm font-medium leading-none">LegitCheck Pro</p>
              <p className="mt-0.5 text-xs text-muted">Lumpeks → check → sprzedaż</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-legit" />
            Gotowy
          </div>
        </header>

        <main className="flex-1 px-4 pt-1 pb-24">
          {tab === "scanner" && <ScannerView />}
          {tab === "history" && <HistoryView />}
          {tab === "guide" && <GuideView />}
        </main>

        <nav className="sticky bottom-0 z-20 border-t border-border bg-bg/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md">
          <div className="grid grid-cols-3">
            {NAV.map((item) => {
              const active = tab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs transition-colors duration-150",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
      <GhostCamera />
      <WebviewSheet />
      <ListingSheet />
    </div>
  );
}
