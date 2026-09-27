import {
  Camera,
  Check,
  ImageIcon,
  Link2,
  RotateCcw,
  ScanSearch,
  Shirt,
  Footprints,
  Crown,
  Wallet,
  Watch,
  Smartphone,
  Gem,
  ShoppingBag,
  FileSearch,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";
import { ReportView } from "@/components/report-view";
import { Button } from "@/components/ui/button";
import { CATEGORIES, getCategory } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const ICONS: Record<CategoryId, LucideIcon> = {
  odziez: Shirt,
  obuwie: Footprints,
  czapki: Crown,
  akcesoria: Wallet,
  zegarki: Watch,
  elektronika: Smartphone,
  bizuteria: Gem,
  torebki: ShoppingBag,
};

export function ScannerView() {
  const categoryId = useAppStore((s) => s.categoryId);
  const photos = useAppStore((s) => s.photos);
  const phase = useAppStore((s) => s.phase);
  const error = useAppStore((s) => s.error);
  const interrupted = useAppStore((s) => s.interrupted);
  const analyzeLabel = useAppStore((s) => s.analyzeLabel);
  const listingUrl = useAppStore((s) => s.listingUrl);
  const listing = useAppStore((s) => s.listing);
  const listingBusy = useAppStore((s) => s.listingBusy);
  const setCategory = useAppStore((s) => s.setCategory);
  const setListingUrl = useAppStore((s) => s.setListingUrl);
  const loadListing = useAppStore((s) => s.loadListing);
  const clearListing = useAppStore((s) => s.clearListing);
  const openCamera = useAppStore((s) => s.openCamera);
  const addFiles = useAppStore((s) => s.addFiles);
  const removePhoto = useAppStore((s) => s.removePhoto);
  const runAnalysis = useAppStore((s) => s.runAnalysis);
  const resetScan = useAppStore((s) => s.resetScan);
  const galleryRef = useRef<HTMLInputElement>(null);
  const category = getCategory(categoryId);

  if (phase === "report") return <ReportView />;

  if (phase === "analyzing") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="relative w-full max-w-xs overflow-hidden rounded-xl bg-elevated p-6" style={{ boxShadow: "var(--shadow-border)" }}>
          <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-xl bg-surface">
            <div className="absolute inset-x-0 h-8 bg-accent/40" style={{ animation: "scan-line 1.6s ease-in-out infinite" }} />
          </div>
          <p className="mt-5 font-display text-2xl tracking-tight text-fg">Analiza w toku</p>
          <p className="mt-2 text-sm text-muted">{analyzeLabel}</p>
          <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-surface">
            <div className="absolute inset-y-0 w-1/3 bg-accent" style={{ animation: "scan-line 1.6s ease-in-out infinite" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stagger-in space-y-4 pb-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Skaner</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-fg">Nowy łup</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Zdjęcia z lumpeksu albo wklej link z OLX / Vinted / Amazon.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Link oferty</h2>
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              onBlur={() => {
                if (listingUrl.trim()) void loadListing();
              }}
              placeholder="https://www.olx.pl/…  albo vinted.pl"
              className="h-11 w-full rounded-lg bg-elevated pl-10 pr-3 text-sm text-fg placeholder:text-subtle"
              style={{ boxShadow: "var(--shadow-border)" }}
            />
          </label>
          {listingUrl && (
            <Button variant="secondary" size="icon" onClick={clearListing} aria-label="Wyczyść link">
              <X />
            </Button>
          )}
        </div>
        {listingBusy && <p className="text-xs text-muted">Czytam ogłoszenie…</p>}
        {listing && !listingBusy && (
          <div className="rounded-lg bg-elevated p-2.5" style={{ boxShadow: "var(--shadow-border)" }}>
            <p className="text-xs text-muted">{listing.host}</p>
            <p className="truncate text-sm font-medium text-fg">{listing.title || "Oferta"}</p>
            {listing.priceText && <p className="text-xs text-legit-fg">{listing.priceText}</p>}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">Kategoria</h2>
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.id];
            const active = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex min-h-12 items-center gap-2 rounded-lg bg-elevated px-2.5 py-2 text-left transition-[box-shadow,background-color] duration-150 ease-out enabled:active:scale-[0.98]",
                  active ? "bg-accent text-accent-fg" : "text-fg hover:bg-elevated/80",
                )}
                style={!active ? { boxShadow: "var(--shadow-border)" } : undefined}
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{cat.label}</span>
                  <span className={cn("block truncate text-xs", active ? "text-accent-fg/70" : "text-muted")}>
                    {cat.blurb}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {category && (
        <section className="space-y-2">
          <div className="flex items-end justify-between">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Checklista</h2>
            <span className="font-mono text-xs tabular-nums text-muted">
              {Math.min(photos.filter((p) => p.shotId).length, 4)} / 4
            </span>
          </div>
          <ol className="space-y-1.5">
            {category.shots.map((shot, i) => {
              const taken = photos.some((p) => p.shotId === shot.id);
              return (
                <li key={shot.id}>
                  <button
                    type="button"
                    onClick={() => openCamera(shot.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg bg-elevated p-2.5 text-left transition-transform duration-150 ease-out enabled:active:scale-[0.98]"
                    style={{ boxShadow: "var(--shadow-border)" }}
                  >
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md text-xs font-medium",
                        taken ? "bg-legit/20 text-legit-fg" : "bg-surface text-muted",
                      )}
                    >
                      {taken ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">{shot.label}</span>
                      <span className="block truncate text-xs text-muted">{shot.hint}</span>
                    </span>
                    <Camera className="size-4 text-muted" />
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {category && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Zdjęcia</h2>
          <div className="grid grid-cols-4 gap-1.5">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden rounded-md bg-elevated">
                <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-md bg-bg/80 text-fg"
                  aria-label="Usuń zdjęcie"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <>
                <button
                  type="button"
                  onClick={() => openCamera(category.shots[photos.length]?.id)}
                  className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md bg-elevated text-muted"
                  style={{ boxShadow: "var(--shadow-border)" }}
                >
                  <Camera className="size-4" />
                  <span className="text-xs">Aparat</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md bg-elevated text-muted"
                  style={{ boxShadow: "var(--shadow-border)" }}
                >
                  <ImageIcon className="size-4" />
                  <span className="text-xs">Galeria</span>
                </button>
              </>
            )}
          </div>
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </section>
      )}

      {interrupted && (
        <div className="rounded-lg bg-warn/10 p-2.5 text-xs text-warn-fg" style={{ boxShadow: "var(--shadow-border)" }}>
          Analiza przerwana. Szkic ze zdjęciami został.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-fake/10 p-2.5 text-xs text-fake-fg" style={{ boxShadow: "var(--shadow-border)" }}>
          {error}
        </div>
      )}

      {category && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button className="flex-1" size="lg" onClick={() => void runAnalysis()}>
              <ScanSearch />
              Analizuj
            </Button>
            <Button variant="secondary" size="lg" onClick={resetScan} aria-label="Wyczyść skan">
              <RotateCcw />
            </Button>
          </div>
          <Button variant="secondary" className="w-full" onClick={() => void runAnalysis({ demo: true })}>
            <FileSearch />
            Przykładowy raport
          </Button>
        </div>
      )}
    </div>
  );
}
