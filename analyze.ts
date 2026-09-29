import { createServerFn } from "@tanstack/react-start";
import { CATEGORIES } from "./categories";
import { buildDemoReport } from "./demo-report";
import type { AnalysisReport, CategoryId, CheckItem, FlagNote, ValuationSource, Verdict } from "./types";

type PhotoInput = {
  shotId?: string;
  mime: string;
  data: string;
};

type AnalyzeInput = {
  categoryId: CategoryId;
  photos: PhotoInput[];
  listing?: { url: string; title: string; description: string; priceText: string };
};

const VERDICTS: Verdict[] = ["LEGIT", "LIKELY_LEGIT", "UNCERTAIN", "LIKELY_FAKE", "FAKE"];
const SOURCES: ValuationSource[] = ["live", "historical", "estimate"];
const API_BLOCK_TTL_MS = 5 * 60 * 1000;

/** Per API key: a single 401/402/403 only blocks that key for a short cooldown. */
const apiBlockedUntil = new Map<string, number>();

function isApiBlocked(apiKey: string): boolean {
  const until = apiBlockedUntil.get(apiKey) ?? 0;
  return Date.now() < until;
}

function markApiBlocked(apiKey: string): void {
  apiBlockedUntil.set(apiKey, Date.now() + API_BLOCK_TTL_MS);
}

const reportJsonSchema = {
  name: "legit_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "itemName",
      "brand",
      "model",
      "legitScore",
      "verdict",
      "confidenceNote",
      "conditionScore",
      "conditionLabel",
      "accessories",
      "retailPricePln",
      "marketMinPln",
      "marketMaxPln",
      "replicaCostPln",
      "valuationSource",
      "valuationNote",
      "greenFlags",
      "redFlags",
      "missingShots",
      "searchQuery",
    ],
    properties: {
      itemName: { type: "string" },
      brand: { type: "string" },
      model: { type: "string" },
      legitScore: { type: "integer" },
      verdict: { type: "string", enum: VERDICTS },
      confidenceNote: { type: "string" },
      conditionScore: { type: "number" },
      conditionLabel: { type: "string" },
      accessories: { type: "string" },
      retailPricePln: { type: "integer" },
      marketMinPln: { type: "integer" },
      marketMaxPln: { type: "integer" },
      replicaCostPln: { type: "integer" },
      valuationSource: { type: "string", enum: SOURCES },
      valuationNote: { type: "string" },
      greenFlags: { type: "array", items: { type: "string" } },
      redFlags: { type: "array", items: { type: "string" } },
      missingShots: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "label", "reason"],
          properties: {
            id: { type: "string" },
            label: { type: "string" },
            reason: { type: "string" },
          },
        },
      },
      searchQuery: { type: "string" },
    },
  },
} as const;

export const analyzeItem = createServerFn({ method: "POST" })
  .validator((input: AnalyzeInput) => input)
  .handler(async ({ data }): Promise<{ ok: true; report: AnalysisReport } | { ok: false; error: string }> => {
    const categoryId = data?.categoryId;
    const photos = (data?.photos ?? []).slice(0, 4).filter((p) => p.data && p.data.length > 80);
    try {
      const category = CATEGORIES.find((c) => c.id === categoryId);
      if (!category || !categoryId) return { ok: false, error: "Nieznana kategoria." };

      const apiKey = process.env.XAI_API_KEY ?? "";
      if (!apiKey || isApiBlocked(apiKey)) {
        return {
          ok: true,
          report: buildDemoReport(categoryId, Math.max(photos.length, 1), listingExtra(data.listing)),
        };
      }

      if (photos.length === 0) {
        return { ok: true, report: buildDemoReport(categoryId, 1, listingExtra(data.listing)) };
      }

      const usable = await probeApi(apiKey);
      if (!usable) {
        return { ok: true, report: buildDemoReport(categoryId, photos.length) };
      }

      const shotList = category.shots
        .map((s) => `- ${s.id}: ${s.label} (${s.hint})`)
        .join("\n");

      const content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string; detail: "low" } }
      > = [
        {
          type: "text",
          text: `Kategoria: ${category.label} (${category.id}).
Checklist ekspercka:
${shotList}

Przeanalizuj załączone zdjęcia jak rzeczoznawca autentyczności.
Odpowiedz wyłącznie JSON-em zgodnym ze schematem.

Zasady:
- Język pól tekstowych: polski.
- legitScore: 0–100. Brak kluczowych ujęć obniża pewność.
- verdict: LEGIT ≥ 85; FAKE przy oczywistych wadach; UNCERTAIN gdy za mało dowodów.
- Ceny w PLN, liczby całkowite.
- valuationSource: live | historical | estimate.
- greenFlags i redFlags: 2–5 krótkich obserwacji ze zdjęć.
- missingShots: braki z checklisty.
- searchQuery: marka + model + kolorówka.
- conditionScore 1–10. accessories: pudełko/metki lub "brak danych".`,
        },
      ];

      for (const photo of photos) {
        const mime = photo.mime === "image/png" ? "image/png" : "image/jpeg";
        const label = photo.shotId ? `Ujęcie checklisty: ${photo.shotId}` : "Ujęcie dodatkowe";
        content.push({ type: "text", text: label });
        content.push({
          type: "image_url",
          image_url: {
            url: `data:${mime};base64,${photo.data}`,
            detail: "low",
          },
        });
      }

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.2,
          max_tokens: 1400,
          response_format: { type: "json_schema", json_schema: reportJsonSchema },
          messages: [
            {
              role: "system",
              content:
                "Jesteś starszym ekspertem autentyczności i wyceny rynku wtórnego w Polsce. Nie spekuluj ponad zdjęcia. Zwracasz wyłącznie poprawny JSON.",
            },
            { role: "user", content },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("xAI error", res.status, errText.slice(0, 400));
        if (res.status === 401 || res.status === 402 || res.status === 403) {
          markApiBlocked(apiKey);
        }
        return { ok: true, report: buildDemoReport(categoryId, photos.length) };
      }

      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = body.choices?.[0]?.message?.content ?? "";
      const parsed = parseReport(raw);
      if (!parsed) {
        return { ok: true, report: buildDemoReport(categoryId, photos.length) };
      }

      const report: AnalysisReport = {
        ...parsed,
        legitScore: clamp(Math.round(parsed.legitScore), 0, 100),
        conditionScore: clamp(Number(parsed.conditionScore) || 0, 1, 10),
        retailPricePln: Math.max(0, Math.round(parsed.retailPricePln)),
        marketMinPln: Math.max(0, Math.round(parsed.marketMinPln)),
        marketMaxPln: Math.max(0, Math.round(parsed.marketMaxPln)),
        replicaCostPln: Math.max(0, Math.round(parsed.replicaCostPln)),
        greenFlags: parsed.greenFlags.slice(0, 6),
        redFlags: parsed.redFlags.slice(0, 6),
        missingShots: parsed.missingShots.slice(0, 4),
        reportId: `LC-${Date.now().toString(36).toUpperCase()}-PL`,
        createdAt: new Date().toISOString(),
        categoryId,
        photoCount: photos.length,
        isDemo: false,
        engine: "grok",
        sourceUrl: data.listing?.url,
      };

      return { ok: true, report };
    } catch (err) {
      console.error("analyzeItem failed", err);
      return { ok: true, report: buildDemoReport(categoryId ?? "obuwie", Math.max(photos.length, 1)) };
    }
  });

async function probeApi(apiKey: string): Promise<boolean> {
  if (isApiBlocked(apiKey)) return false;
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 8,
        messages: [{ role: "user", content: "ok" }],
      }),
    });
    if (res.status === 401 || res.status === 402 || res.status === 403) {
      markApiBlocked(apiKey);
      const errText = await res.text().catch(() => "");
      console.error("xAI probe blocked", res.status, errText.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.error("xAI probe failed", err);
    return false;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function listingExtra(listing?: AnalyzeInput["listing"]) {
  if (!listing) return undefined;
  return {
    itemName: listing.title || undefined,
    searchQuery: listing.title || undefined,
    sourceUrl: listing.url,
    identificationNotes: listing.description || undefined,
    valuationNote: listing.priceText ? `Cena z ogłoszenia: ${listing.priceText}` : undefined,
  };
}

function parseReport(raw: string): Omit<
  AnalysisReport,
  "reportId" | "createdAt" | "categoryId" | "photoCount" | "isDemo" | "engine"
> | null {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  try {
    const json = JSON.parse(cleaned) as Record<string, unknown>;
    const verdict = String(json.verdict ?? "UNCERTAIN") as Verdict;
    const source = String(json.valuationSource ?? "estimate") as ValuationSource;
    return {
      itemName: String(json.itemName ?? "Nierozpoznany przedmiot"),
      brand: String(json.brand ?? "—"),
      model: String(json.model ?? "—"),
      legitScore: Number(json.legitScore ?? 50),
      verdict: VERDICTS.includes(verdict) ? verdict : "UNCERTAIN",
      confidenceNote: String(json.confidenceNote ?? ""),
      conditionScore: Number(json.conditionScore ?? 7),
      conditionLabel: String(json.conditionLabel ?? "Brak oceny"),
      conditionDetails: asStringArray(json.conditionDetails).slice(0, 6),
      accessories: String(json.accessories ?? "brak danych"),
      retailPricePln: Number(json.retailPricePln ?? 0),
      marketMinPln: Number(json.marketMinPln ?? 0),
      marketMaxPln: Number(json.marketMaxPln ?? 0),
      replicaCostPln: Number(json.replicaCostPln ?? 0),
      valuationSource: SOURCES.includes(source) ? source : "estimate",
      valuationNote: String(json.valuationNote ?? ""),
      greenFlags: asFlags(json.greenFlags),
      redFlags: asFlags(json.redFlags),
      checks: asChecks(json.checks),
      identificationNotes: String(json.identificationNotes ?? ""),
      missingShots: asMissing(json.missingShots),
      searchQuery: String(json.searchQuery ?? ""),
    };
  } catch {
    return null;
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v)).filter(Boolean);
}

function asFlags(value: unknown): FlagNote[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { title: item };
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      const title = String(rec.title ?? rec.text ?? "").trim();
      if (!title) return null;
      const detail = String(rec.detail ?? rec.body ?? "").trim();
      return { title, detail: detail || undefined };
    })
    .filter((f): f is FlagNote => Boolean(f))
    .slice(0, 6);
}

function asChecks(value: unknown): CheckItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      const label = String(rec.label ?? "").trim();
      if (!label) return null;
      return { label, ok: Boolean(rec.ok) };
    })
    .filter((c): c is CheckItem => Boolean(c))
    .slice(0, 8);
}

function asMissing(value: unknown): AnalysisReport["missingShots"] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      return {
        id: String(rec.id ?? ""),
        label: String(rec.label ?? ""),
        reason: String(rec.reason ?? ""),
      };
    })
    .filter((s): s is AnalysisReport["missingShots"][number] => Boolean(s && s.label));
}

