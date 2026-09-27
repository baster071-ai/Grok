import { create } from "zustand";
import { analyzeItem } from "@/lib/analyze";
import { getCategory } from "@/lib/categories";
import { buildDemoReport } from "@/lib/demo-report";
import {
  clearDraft,
  historyToPhotos,
  loadDraft,
  loadHistory,
  loadOnboardingDone,
  prependHistory,
  saveDraft,
  saveHistory,
  saveOnboardingDone,
} from "@/lib/history";
import { compressFile } from "@/lib/images";
import { fetchListing, previewFromUrl } from "@/lib/listing-fetch";
import type { AnalysisReport, CategoryId, HistoryItem, ListingPreview, Photo, TabId } from "@/lib/types";
import { uid } from "@/lib/utils";

const ANALYZE_LABELS = [
  "Skanuję szwy i proporcje…",
  "Porównuję z cechami oryginału…",
  "Szukam wyceny rynkowej…",
  "Składam raport i ogłoszenie…",
];

type CameraState = { open: boolean; shotId?: string };
type WebviewState = { title: string; url: string } | null;

type AppStore = {
  hydrated: boolean;
  onboardingDone: boolean;
  tab: TabId;
  categoryId: CategoryId | null;
  photos: Photo[];
  phase: "capture" | "analyzing" | "report";
  report: AnalysisReport | null;
  analyzeLabel: string;
  error: string | null;
  interrupted: boolean;
  camera: CameraState;
  webview: WebviewState;
  history: HistoryItem[];
  listingUrl: string;
  listing: ListingPreview | null;
  listingBusy: boolean;
  sellOpen: boolean;
  copied: boolean;
  hydrate: () => void;
  completeOnboarding: () => void;
  setTab: (tab: TabId) => void;
  setCategory: (id: CategoryId) => void;
  setListingUrl: (url: string) => void;
  loadListing: () => Promise<void>;
  clearListing: () => void;
  addCompressedPhoto: (input: { mime: string; data: string; preview: string; shotId?: string }) => void;
  addFiles: (files: FileList | File[], shotId?: string) => Promise<void>;
  removePhoto: (id: string) => void;
  openCamera: (shotId?: string) => void;
  closeCamera: () => void;
  openWebview: (title: string, url: string) => void;
  closeWebview: () => void;
  openSell: () => void;
  closeSell: () => void;
  copyListing: (text: string) => Promise<void>;
  runAnalysis: (opts?: { demo?: boolean }) => Promise<void>;
  openHistoryItem: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  resetScan: () => void;
  clearHistory: () => void;
};

function persistDraft(state: Pick<AppStore, "categoryId" | "photos" | "phase" | "listingUrl">) {
  if (!state.categoryId && state.photos.length === 0 && !state.listingUrl) {
    clearDraft();
    return;
  }
  saveDraft({
    categoryId: state.categoryId,
    photos: state.photos,
    interruptedAnalysis: state.phase === "analyzing",
    listingUrl: state.listingUrl,
  });
}

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  onboardingDone: false,
  tab: "scanner",
  categoryId: null,
  photos: [],
  phase: "capture",
  report: null,
  analyzeLabel: ANALYZE_LABELS[0],
  error: null,
  interrupted: false,
  camera: { open: false },
  webview: null,
  history: [],
  listingUrl: "",
  listing: null,
  listingBusy: false,
  sellOpen: false,
  copied: false,

  hydrate: () => {
    const onboardingDone = loadOnboardingDone();
    const history = loadHistory();
    const draft = loadDraft();
    const listingUrl = draft?.listingUrl ?? "";
    set({
      hydrated: true,
      onboardingDone,
      history,
      categoryId: (draft?.categoryId as CategoryId | null) ?? null,
      photos: draft?.photos ?? [],
      interrupted: Boolean(draft?.interruptedAnalysis),
      phase: "capture",
      listingUrl,
      listing: listingUrl ? previewFromUrl(listingUrl) : null,
    });
  },

  completeOnboarding: () => {
    saveOnboardingDone();
    set({ onboardingDone: true });
  },

  setTab: (tab) => set({ tab, sellOpen: false }),

  setCategory: (id) => {
    const prev = get().categoryId;
    if (prev === id) return;
    set({
      categoryId: id,
      photos: [],
      report: null,
      phase: "capture",
      error: null,
      interrupted: false,
    });
    persistDraft({ categoryId: id, photos: [], phase: "capture", listingUrl: get().listingUrl });
  },

  setListingUrl: (url) => {
    set({ listingUrl: url, listing: previewFromUrl(url) });
    persistDraft({
      categoryId: get().categoryId,
      photos: get().photos,
      phase: get().phase,
      listingUrl: url,
    });
  },

  loadListing: async () => {
    const url = get().listingUrl.trim();
    const local = previewFromUrl(url);
    if (!local) {
      set({ error: "Wklej link z OLX, Vinted, Allegro, Amazon albo eBay.", listing: null });
      return;
    }
    set({ listingBusy: true, error: null, listing: local });
    try {
      const result = await fetchListing({ data: { url } });
      if (!result.ok) {
        set({ error: result.error, listingBusy: false, listing: local });
        return;
      }
      set({ listing: result.listing, listingBusy: false });
    } catch {
      set({ listingBusy: false, listing: local });
    }
  },

  clearListing: () => {
    set({ listingUrl: "", listing: null });
    persistDraft({
      categoryId: get().categoryId,
      photos: get().photos,
      phase: get().phase,
      listingUrl: "",
    });
  },

  addCompressedPhoto: (input) => {
    const photos = get().photos;
    if (photos.length >= 6) return;
    const next = [
      ...photos,
      {
        id: uid("ph"),
        shotId: input.shotId,
        mime: input.mime,
        data: input.data,
        preview: input.preview,
      },
    ];
    set({ photos: next, error: null, interrupted: false });
    persistDraft({ categoryId: get().categoryId, photos: next, phase: get().phase, listingUrl: get().listingUrl });
  },

  addFiles: async (files, shotId) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const file of list) {
      if (get().photos.length >= 6) break;
      const compressed = await compressFile(file);
      get().addCompressedPhoto({ ...compressed, shotId });
    }
  },

  removePhoto: (id) => {
    const next = get().photos.filter((p) => p.id !== id);
    set({ photos: next });
    persistDraft({ categoryId: get().categoryId, photos: next, phase: get().phase, listingUrl: get().listingUrl });
  },

  openCamera: (shotId) => set({ camera: { open: true, shotId } }),
  closeCamera: () => set({ camera: { open: false } }),
  openWebview: (title, url) => set({ webview: { title, url } }),
  closeWebview: () => set({ webview: null }),
  openSell: () => set({ sellOpen: true, copied: false }),
  closeSell: () => set({ sellOpen: false }),
  copyListing: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      set({ copied: true });
      window.setTimeout(() => set({ copied: false }), 2200);
    } catch {
      set({ error: "Nie udało się skopiować. Zaznacz tekst ręcznie." });
    }
  },

  runAnalysis: async (opts) => {
    const { categoryId, photos, listing } = get();
    const demo = Boolean(opts?.demo);
    if (!categoryId) {
      set({ error: "Wybierz kategorię." });
      return;
    }
    const hasListing = Boolean(listing);
    const useLocalDemo = demo || (photos.length === 0 && !hasListing);
    set({
      phase: "analyzing",
      error: null,
      analyzeLabel: ANALYZE_LABELS[0],
      tab: "scanner",
      sellOpen: false,
    });
    persistDraft({ categoryId, photos, phase: "analyzing", listingUrl: get().listingUrl });

    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      set({ analyzeLabel: ANALYZE_LABELS[tick % ANALYZE_LABELS.length] });
    }, 1600);

    const finish = (report: AnalysisReport) => {
      const history = prependHistory(get().history, report, photos);
      saveHistory(history);
      clearDraft();
      set({
        phase: "report",
        report,
        history,
        interrupted: false,
        listingUrl: "",
        listing: null,
      });
    };

    const overlay = listing
      ? {
          itemName: listing.title || undefined,
          searchQuery: listing.title || undefined,
          sourceUrl: listing.url,
          identificationNotes: listing.description || undefined,
          valuationNote: listing.priceText ? `Cena z ogłoszenia: ${listing.priceText}` : undefined,
        }
      : undefined;

    try {
      if (useLocalDemo) {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        finish(buildDemoReport(categoryId, Math.max(photos.length, 1), overlay));
        return;
      }

      const withData = photos.filter((p) => p.data.length > 80).slice(0, 4);
      if (withData.length === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        finish(buildDemoReport(categoryId, Math.max(photos.length, 1), overlay));
        return;
      }

      const result = await analyzeItem({
        data: {
          categoryId,
          photos: withData.map((p) => ({
            shotId: p.shotId,
            mime: p.mime,
            data: p.data,
          })),
          listing: listing
            ? {
                url: listing.url,
                title: listing.title,
                description: listing.description,
                priceText: listing.priceText,
              }
            : undefined,
        },
      });
      if (!result.ok) {
        finish(buildDemoReport(categoryId, photos.length, overlay));
        return;
      }
      finish(result.report);
    } catch {
      finish(buildDemoReport(categoryId, Math.max(photos.length, 1), overlay));
    } finally {
      window.clearInterval(timer);
    }
  },

  openHistoryItem: (id) => {
    const item = get().history.find((h) => h.id === id);
    if (!item) return;
    const cat = getCategory(item.categoryId);
    set({
      tab: "scanner",
      categoryId: item.categoryId,
      report: item.report,
      phase: "report",
      photos: historyToPhotos(item.photos),
      error: null,
      sellOpen: false,
    });
    if (!cat) return;
  },

  deleteHistoryItem: (id) => {
    const history = get().history.filter((h) => h.id !== id);
    saveHistory(history);
    const report = get().report;
    set({
      history,
      ...(report && report.reportId === id
        ? { report: null, phase: "capture" as const, photos: [] }
        : {}),
    });
  },

  resetScan: () => {
    clearDraft();
    set({
      photos: [],
      report: null,
      phase: "capture",
      error: null,
      interrupted: false,
      camera: { open: false },
      listingUrl: "",
      listing: null,
      sellOpen: false,
    });
  },

  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },
}));
