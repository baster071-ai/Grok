import { Camera, Check, CircleMinus, RotateCcw, ShieldAlert, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategory, getShot } from "@/lib/categories";
import { marketplaceLinks } from "@/lib/marketplace";
import type { FlagNote, Verdict } from "@/lib/types";
import { cn, formatPln } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

function verdictCopy(v: Verdict) {
  if (v === "LEGIT" || v === "LIKELY_LEGIT") {
    return { label: v === "LEGIT" ? "Legit · autentyk" : "Raczej autentyczny", tone: "legit" as const };
  }
  if (v === "FAKE" || v === "LIKELY_FAKE") {
    return { label: v === "FAKE" ? "Fake · podróbka" : "Prawdopodobna podróbka", tone: "fake" as const };
  }
  return { label: "Niejednoznaczny", tone: "warn" as const };
}

export function ReportView() {
  const report = useAppStore((s) => s.report);
  const resetScan = useAppStore((s) => s.resetScan);
  const openCamera = useAppStore((s) => s.openCamera);
  const openWebview = useAppStore((s) => s.openWebview);
  const runAnalysis = useAppStore((s) => s.runAnalysis);
  const openSell = useAppStore((s) => s.openSell);
  const photos = useAppStore((s) => s.photos);
  const phase = useAppStore((s) => s.phase);

  if (!report) return null;

  const v = verdictCopy(report.verdict);
  const category = getCategory(report.categoryId);
  const links = marketplaceLinks(report.searchQuery || report.itemName);
  const condPct = Math.round((report.conditionScore / 10) * 100);

  return (
    <div className="stagger-in space-y-3 pb-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Raport</p>
          <h1 className="mt-1 font-display text-2xl tracking-tight text-fg">{report.itemName}</h1>
        </div>
        <Button variant="secondary" size="icon" className="size-10" onClick={resetScan} aria-label="Nowy skan">
          <RotateCcw />
        </Button>
      </div>

      {photos.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {photos.map((p) => (
            <img key={p.id} src={p.preview} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
          ))}
        </div>
      )}

      {report.isDemo && (
        <div className="rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn-fg" style={{ boxShadow: "var(--shadow-border)" }}>
          Raport wzorcowy dla tej kategorii — do nauki przepływu. Twoje zdjęcia zostają w albumie Historii.
        </div>
      )}

      <section className="rounded-xl bg-elevated p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-14 shrink-0 flex-col items-center justify-center rounded-xl font-mono text-lg tabular-nums",
              v.tone === "legit" && "bg-legit/15 text-legit-fg",
              v.tone === "fake" && "bg-fake/15 text-fake-fg",
              v.tone === "warn" && "bg-warn/15 text-warn-fg",
            )}
          >
            {report.legitScore}%
          </div>
          <div className="min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                v.tone === "legit" && "bg-legit/15 text-legit-fg",
                v.tone === "fake" && "bg-fake/15 text-fake-fg",
                v.tone === "warn" && "bg-warn/15 text-warn-fg",
              )}
            >
              {v.tone === "fake" ? <ShieldAlert className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
              {v.label}
            </span>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{report.confidenceNote}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-elevated p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Wycena PLN</h2>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <PriceCell label="Rynek" value={`${formatPln(report.marketMinPln)}–${formatPln(report.marketMaxPln)}`} accent />
          <PriceCell label="Nowy" value={report.retailPricePln ? formatPln(report.retailPricePln) : "n/d"} />
          <PriceCell label="Replika" value={`~${formatPln(report.replicaCostPln)}`} warn />
        </div>
        {report.valuationNote && <p className="mt-2 text-xs leading-relaxed text-muted">{report.valuationNote}</p>}
      </section>

      <section className="rounded-xl bg-elevated p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Stan przedmiotu</h2>
          <span className="font-mono text-sm tabular-nums text-legit-fg">
            {report.conditionScore.toFixed(1)}/10
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-fg">{report.conditionLabel}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-legit" style={{ width: `${condPct}%` }} />
        </div>
        {report.conditionDetails.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {report.conditionDetails.map((line) => (
              <li key={line} className="flex gap-2 text-xs leading-relaxed text-fg/90">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted" />
                {line}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">Komplet: {report.accessories}</p>
      </section>

      <section className="space-y-2">
        {report.greenFlags.length > 0 && (
          <div className="rounded-xl bg-legit/10 p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-legit-fg">Green flagi</h2>
            <div className="mt-2 space-y-2.5">
              {report.greenFlags.map((flag) => (
                <FlagBlock key={flag.title} flag={flag} />
              ))}
            </div>
          </div>
        )}
        {report.redFlags.length > 0 && (
          <div className="rounded-xl bg-fake/10 p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-fake-fg">Uwagi</h2>
            <div className="mt-2 space-y-2.5">
              {report.redFlags.map((flag) => (
                <FlagBlock key={flag.title} flag={flag} />
              ))}
            </div>
          </div>
        )}
      </section>

      {(report.identificationNotes || report.checks.length > 0) && (
        <section className="rounded-xl bg-elevated p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Metki, kody i identyfikacja</h2>
          {report.identificationNotes && (
            <p className="mt-2 text-sm leading-relaxed text-muted">{report.identificationNotes}</p>
          )}
          {report.checks.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {report.checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs text-fg">
                  {c.ok ? (
                    <Check className="size-3.5 text-legit-fg" />
                  ) : (
                    <CircleMinus className="size-3.5 text-fake-fg" />
                  )}
                  {c.label}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {report.missingShots.length > 0 && (
        <section className="rounded-xl bg-elevated p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Dociągnij ujęcie</h2>
          <div className="mt-2 space-y-2">
            {report.missingShots.map((shot) => (
              <button
                key={shot.id + shot.label}
                type="button"
                onClick={() => {
                  const known = getShot(report.categoryId, shot.id);
                  openCamera(known?.id ?? category?.shots[0]?.id);
                }}
                className="flex w-full items-center gap-3 rounded-lg bg-surface p-2.5 text-left"
                style={{ boxShadow: "var(--shadow-border)" }}
              >
                <Camera className="size-4 text-accent" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg">{shot.label}</span>
                  <span className="block text-xs text-muted">{shot.reason}</span>
                </span>
              </button>
            ))}
          </div>
          {photos.some((p) => p.data.length > 80) && (
            <Button className="mt-2 w-full" size="sm" disabled={phase === "analyzing"} onClick={() => void runAnalysis()}>
              Analizuj ponownie
            </Button>
          )}
        </section>
      )}

      <Button className="w-full" size="lg" onClick={openSell}>
        <Store />
        Wystaw na OLX / Vinted
      </Button>

      <section className="pt-1">
        <h2 className="mb-1.5 px-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">Porównaj ceny</h2>
        <div className="flex flex-wrap gap-1.5">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => openWebview(link.label, link.url)}
              className="rounded-full bg-elevated px-3 py-1.5 text-xs text-fg"
              style={{ boxShadow: "var(--shadow-border)" }}
            >
              {link.label}
            </button>
          ))}
          {report.sourceUrl && (
            <button
              type="button"
              onClick={() => openWebview("Oferta", report.sourceUrl!)}
              className="rounded-full bg-elevated px-3 py-1.5 text-xs text-fg"
              style={{ boxShadow: "var(--shadow-border)" }}
            >
              Źródło
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function PriceCell({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface p-2 text-center">
      <span className="block text-xs text-muted">{label}</span>
      <span
        className={cn(
          "mt-0.5 block text-xs font-semibold leading-snug tabular-nums",
          accent && "text-legit-fg",
          warn && "text-warn-fg",
          !accent && !warn && "text-fg",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function FlagBlock({ flag }: { flag: FlagNote }) {
  return (
    <div>
      <p className="text-sm font-medium text-fg">{flag.title}</p>
      {flag.detail && <p className="mt-0.5 text-xs leading-relaxed text-muted">{flag.detail}</p>}
    </div>
  );
}
