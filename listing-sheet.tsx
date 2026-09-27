import { Check, Copy, ExternalLink, Store, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildListing } from "@/lib/listing";
import { formatPln } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function ListingSheet() {
  const open = useAppStore((s) => s.sellOpen);
  const closeSell = useAppStore((s) => s.closeSell);
  const report = useAppStore((s) => s.report);
  const photos = useAppStore((s) => s.photos);
  const openWebview = useAppStore((s) => s.openWebview);
  const copyListing = useAppStore((s) => s.copyListing);
  const copied = useAppStore((s) => s.copied);

  if (!open || !report) return null;

  const listing = buildListing(report);
  const pack = `${listing.title}\n${formatPln(listing.askPln)}\n\n${listing.body}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg/80 pt-10">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl bg-surface" style={{ boxShadow: "var(--shadow-border)" }}>
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <Store className="size-4 text-accent" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">Wystaw na sprzedaż</p>
          <Button variant="ghost" size="icon" className="size-10" onClick={closeSell} aria-label="Zamknij">
            <X />
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((p) => (
                <img key={p.id} src={p.preview} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
              ))}
            </div>
          )}

          <div className="rounded-xl bg-elevated p-3" style={{ boxShadow: "var(--shadow-border)" }}>
            <p className="text-xs text-muted">Tytuł ogłoszenia</p>
            <p className="mt-1 text-sm font-medium text-fg">{listing.title}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-surface p-2">
                <p className="text-xs text-muted">Szybka sprzedaż</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-legit-fg">{formatPln(listing.askPln)}</p>
              </div>
              <div className="rounded-lg bg-surface p-2">
                <p className="text-xs text-muted">Cierpliwa</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-fg">{formatPln(listing.patiencePln)}</p>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Opis do wklejenia</span>
            <textarea
              readOnly
              value={listing.body}
              className="mt-2 h-44 w-full resize-none rounded-xl bg-elevated p-3 text-xs leading-relaxed text-fg"
              style={{ boxShadow: "var(--shadow-border)" }}
            />
          </label>

          <Button className="w-full" onClick={() => void copyListing(pack)}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Skopiowane — wklej w OLX / Vinted" : "Kopiuj ogłoszenie"}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                void copyListing(pack);
                openWebview("Vinted — nowe", listing.vintedNewUrl);
              }}
            >
              Vinted
              <ExternalLink />
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void copyListing(pack);
                openWebview("OLX — nowe", listing.olxNewUrl);
              }}
            >
              OLX
              <ExternalLink />
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            OLX i Vinted nie wpuszczają obcych aplikacji do formularza. Kopiujemy tytuł, cenę i opis — wklejasz w nowym ogłoszeniu. Zdjęcia weź z albumu w Historii.
          </p>
        </div>
      </div>
    </div>
  );
}
