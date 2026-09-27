import type { CategoryId, ShotSpec } from "./types";

export type Category = {
  id: CategoryId;
  label: string;
  blurb: string;
  shots: ShotSpec[];
};

export const CATEGORIES: Category[] = [
  {
    id: "odziez",
    label: "Odzież",
    blurb: "Metki, wash tag, szwy, haft",
    shots: [
      { id: "neck", label: "Metka karkowa", hint: "Wyraźnie, na wprost, bez cienia", outline: "neck-tag" },
      { id: "wash", label: "Wash tag", hint: "Skład, kody i kraj pochodzenia", outline: "wash-tag" },
      { id: "seam", label: "Szwy wewnętrzne", hint: "Overlock i ścieg wzdłuż szwu", outline: "inner-seam" },
      { id: "logo", label: "Naszywka / haft", hint: "Logo z zewnątrz, pełna klatka", outline: "outer-logo" },
    ],
  },
  {
    id: "obuwie",
    label: "Obuwie",
    blurb: "Pudełko, język, podeszwa, cholewka",
    shots: [
      { id: "box", label: "Pudełko / SKU", hint: "Etykieta z kodem i rozmiarem", outline: "box-label" },
      { id: "tongue", label: "Metka na języku", hint: "Rozmiar, kod i czcionka", outline: "tongue-tag" },
      { id: "sole", label: "Podeszwa", hint: "Bieżnik na wprost, ostre światło", outline: "sole" },
      { id: "upper", label: "Szwy cholewki", hint: "Proporcje, skóra i panel", outline: "upper" },
    ],
  },
  {
    id: "czapki",
    label: "Czapki",
    blurb: "Haft, taśmy, hologram, zapięcie",
    shots: [
      { id: "front", label: "Haft z przodu", hint: "Logo na wprost, wypełnij kadr", outline: "hat-front" },
      { id: "tape", label: "Taśmy wewnętrzne", hint: "Szew i nadruk pod daszkiem", outline: "hat-tape" },
      { id: "holo", label: "Hologram / naklejka", hint: "Zbliżenie na naklejkę", outline: "hat-holo" },
      { id: "clasp", label: "Zapięcie z tyłu", hint: "Klamra, nity i grawer", outline: "hat-clasp" },
    ],
  },
  {
    id: "akcesoria",
    label: "Paski / portfele",
    blurb: "Wzór, stamp, okucia, krawędzie",
    shots: [
      { id: "mono", label: "Monogram / wzór", hint: "Równomierne ujęcie skóry", outline: "mono" },
      { id: "stamp", label: "Heat stamp / SN", hint: "Numer i odcisk na wprost", outline: "stamp" },
      { id: "hw", label: "Okucia i zamki", hint: "YKK, Lampo, grawer na suwaku", outline: "hardware" },
      { id: "edge", label: "Krawędzie", hint: "Glazing i wykończenie brzegu", outline: "edge" },
    ],
  },
  {
    id: "zegarki",
    label: "Zegarki",
    blurb: "Tarcza, dekiel, pasek, koronka",
    shots: [
      { id: "dial", label: "Cyferblat", hint: "Czcionka, indeksy, wskazówki", outline: "dial" },
      { id: "back", label: "Dekiel", hint: "Grawer, szkło i numer", outline: "caseback" },
      { id: "band", label: "Bransoleta / pasek", hint: "Ogniwa, zapięcie, szwy", outline: "bracelet" },
      { id: "crown", label: "Koronka", hint: "Logo i spasowanie z kopertą", outline: "crown" },
    ],
  },
  {
    id: "elektronika",
    label: "Elektronika",
    blurb: "IMEI, porty, spasowanie, pudełko",
    shots: [
      { id: "plate", label: "Tabliczka / IMEI", hint: "SN i IMEI w ostrości", outline: "nameplate" },
      { id: "ports", label: "Porty ładowania", hint: "Krawędzie i wykończenie", outline: "ports" },
      { id: "fit", label: "Spasowanie obudowy", hint: "Szczeliny i przyciski", outline: "fit" },
      { id: "box", label: "Oryginalne pudełko", hint: "Naklejki, kody, komplet", outline: "ebox" },
    ],
  },
  {
    id: "bizuteria",
    label: "Biżuteria",
    blurb: "Punce, grawer, zapięcie, powierzchnia",
    shots: [
      { id: "punc", label: "Punce / próba", hint: "S925, 750, znaki probiercze", outline: "hallmark" },
      { id: "brand", label: "Grawer marki", hint: "Zbliżenie na logo", outline: "engrave" },
      { id: "clasp", label: "Zapięcie", hint: "Ogniwka i mechanizm", outline: "clasp" },
      { id: "surface", label: "Wykończenie", hint: "Poler, rysy, kamienie", outline: "finish" },
    ],
  },
  {
    id: "torebki",
    label: "Torebki lux",
    blurb: "Skóra, okucia, metka, paski",
    shots: [
      { id: "skin", label: "Materiał / monogram", hint: "Faktura i wyrównanie wzoru", outline: "bag-skin" },
      { id: "hw", label: "Okucia i zamki", hint: "Nity, grawer, kolor metalu", outline: "bag-hw" },
      { id: "tag", label: "Metka wewnętrzna", hint: "Skóra, RFID, date code", outline: "bag-tag" },
      { id: "strap", label: "Uchwyty i paski", hint: "Szwy, klamry, długość", outline: "bag-strap" },
    ],
  },
];

export function getCategory(id: CategoryId | null) {
  return CATEGORIES.find((c) => c.id === id) ?? null;
}

export function getShot(categoryId: CategoryId | null, shotId?: string) {
  const cat = getCategory(categoryId);
  if (!cat || !shotId) return null;
  return cat.shots.find((s) => s.id === shotId) ?? null;
}
