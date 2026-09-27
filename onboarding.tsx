import { Camera, ScanSearch, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Sprawdź, zanim kupisz",
    body: "LegitCheck Pro jest dla łowcy z lumpeksu: autentyczność, stan, widełki w złotówkach i gotowiec na OLX / Vinted.",
  },
  {
    icon: Camera,
    title: "Aparat jest narzędziem, nie ozdobą",
    body: "Metki, szwy i hologramy giną na listingach. Dajemy obrys pomocniczy, żeby ujęcie było pod właściwym kątem — stąd prośba o aparat.",
  },
  {
    icon: ScanSearch,
    title: "Cztery kadry, jeden raport",
    body: "Kategoria, checklista, ewentualnie link z ogłoszenia. Zdjęcia zostają w albumie 15 łupów. Analiza składa też tekst sprzedaży.",
  },
];

export function Onboarding() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const current = STEPS[step]!;
  const Icon = current.icon;
  const last = step === STEPS.length - 1;

  async function finish() {
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* gallery fallback still works */
    } finally {
      completeOnboarding();
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col border-x border-border px-6 pb-8 pt-16">
        <div className="flex items-center gap-2 text-muted">
          <ShieldCheck className="size-4" />
          <span className="text-xs font-medium uppercase tracking-[0.18em]">LegitCheck Pro</span>
        </div>
        <div className="mt-14 flex-1">
          <div className="flex size-14 items-center justify-center rounded-xl bg-elevated text-accent" style={{ boxShadow: "var(--shadow-border)" }}>
            <Icon className="size-7" />
          </div>
          <h1 className="mt-8 font-display text-4xl leading-tight tracking-tight text-fg">{current.title}</h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">{current.body}</p>
        </div>
        <div className="flex gap-1.5 pb-6">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i === step ? "bg-accent" : "bg-elevated"}`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {!last && (
            <Button variant="ghost" className="flex-1" onClick={completeOnboarding}>
              Pomiń
            </Button>
          )}
          {last && (
            <Button variant="ghost" className="flex-1" onClick={completeOnboarding}>
              Tylko galeria
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={busy}
            onClick={() => {
              if (last) void finish();
              else setStep((s) => s + 1);
            }}
          >
            {last ? (busy ? "Czekam na aparat…" : "Zezwól na aparat") : "Dalej"}
          </Button>
        </div>
      </div>
    </div>
  );
}
