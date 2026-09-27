import type { AnalysisReport, HistoryItem, HistoryPhoto, Photo } from "./types";

const HISTORY_KEY = "lc-history-v2";
const DRAFT_KEY = "lc-draft-v1";
const ONBOARDING_KEY = "lc-onboarding-v1";
const MAX_HISTORY = 15;

export function photosToHistory(photos: Photo[]): HistoryPhoto[] {
  return photos.slice(0, 6).map((p) => ({
    id: p.id,
    shotId: p.shotId,
    preview: p.preview,
  }));
}

export function historyToPhotos(photos: HistoryPhoto[] | undefined): Photo[] {
  return (photos ?? []).map((p) => ({
    id: p.id,
    shotId: p.shotId,
    mime: "image/jpeg",
    data: "",
    preview: p.preview,
  }));
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY) ?? localStorage.getItem("lc-history-v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_HISTORY).map((item) => ({
      ...item,
      photos: Array.isArray(item.photos) ? item.photos : [],
    }));
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  const clipped = items.slice(0, MAX_HISTORY);
  const write = (payload: HistoryItem[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(payload));
  };
  try {
    write(clipped);
    return;
  } catch {
    /* quota */
  }
  try {
    write(
      clipped.map((item, i) => ({
        ...item,
        photos: i === 0 ? item.photos.slice(0, 4) : item.photos.slice(0, 1),
      })),
    );
    return;
  } catch {
    /* still too big */
  }
  try {
    write(clipped.map((item) => ({ ...item, photos: [] })));
  } catch {
    /* ignore */
  }
}

export function reportToHistory(report: AnalysisReport, photos: Photo[]): HistoryItem {
  return {
    id: report.reportId,
    createdAt: report.createdAt,
    categoryId: report.categoryId,
    itemName: report.itemName,
    verdict: report.verdict,
    legitScore: report.legitScore,
    marketMinPln: report.marketMinPln,
    marketMaxPln: report.marketMaxPln,
    report,
    photos: photosToHistory(photos),
    sourceUrl: report.sourceUrl,
  };
}

export function prependHistory(items: HistoryItem[], report: AnalysisReport, photos: Photo[]) {
  const next = [reportToHistory(report, photos), ...items.filter((h) => h.id !== report.reportId)];
  return next.slice(0, MAX_HISTORY);
}

export type DraftState = {
  categoryId: string | null;
  photos: Photo[];
  interruptedAnalysis?: boolean;
  listingUrl?: string;
};

export function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftState;
  } catch {
    return null;
  }
}

export function saveDraft(draft: DraftState) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          categoryId: draft.categoryId,
          photos: [],
          interruptedAnalysis: draft.interruptedAnalysis,
          listingUrl: draft.listingUrl,
        }),
      );
    } catch {
      /* ignore */
    }
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function loadOnboardingDone() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, "1");
}
