import type { AnalysisReport } from "./types";
import { formatPln } from "./utils";

export function buildListing(report: AnalysisReport) {
  const askPln = round10(report.marketMinPln);
  const patiencePln = round10(report.marketMaxPln);
  const title = `${report.brand} ${report.model}`.replace(/\s+/g, " ").trim().slice(0, 68);
  const flagsGreen = report.greenFlags.map((f) => f.detail ? `${f.title}: ${f.detail}` : f.title);
  const flagsRed = report.redFlags.map((f) => f.detail ? `${f.title}: ${f.detail}` : f.title);
  const condition = report.conditionDetails.map((line) => `• ${line}`).join("\n");
  const body = [
    `${report.itemName}`,
    "",
    `Stan: ${report.conditionLabel} (${report.conditionScore.toFixed(1)}/10)`,
    `Komplet: ${report.accessories}`,
    report.sourceUrl ? `Źródło oględzin: ${report.sourceUrl}` : "",
    "",
    report.identificationNotes,
    "",
    condition ? `Stan przedmiotu:\n${condition}` : "",
    flagsGreen.length ? `Zalety:\n${flagsGreen.map((l) => `• ${l}`).join("\n")}` : "",
    flagsRed.length ? `Uwagi:\n${flagsRed.map((l) => `• ${l}`).join("\n")}` : "",
    "",
    `Sugerowana cena szybkiej sprzedaży: ${formatPln(askPln)}`,
    `Górna półka rynku: ${formatPln(patiencePln)}`,
    `Detal nowy: ${report.retailPricePln ? formatPln(report.retailPricePln) : "n/d"}`,
    "",
    "Ogłoszenie przygotowane w LegitCheck Pro. To nie jest certyfikat autentyczności.",
  ]
    .filter((line) => line !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  const q = encodeURIComponent(report.searchQuery || report.itemName);
  return {
    title,
    askPln,
    patiencePln,
    body,
    vintedNewUrl: "https://www.vinted.pl/items/new",
    olxNewUrl: "https://www.olx.pl/d/adding/",
    vintedSearch: `https://www.vinted.pl/catalog?search_text=${q}`,
    olxSearch: `https://www.olx.pl/oferty/q-${encodeURIComponent((report.searchQuery || report.itemName).replace(/\s+/g, "-"))}/`,
    amazonSearch: `https://www.amazon.pl/s?k=${q}`,
    ebaySearch: `https://www.ebay.pl/sch/i.html?_nkw=${q}`,
    googleSearch: `https://www.google.com/search?tbm=shop&q=${q}`,
  };
}

function round10(n: number) {
  if (!n || n < 0) return 0;
  return Math.round(n / 10) * 10;
}
