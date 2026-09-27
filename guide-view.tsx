import { BookOpen, Camera, Link2, Store } from "lucide-react";

const STEPS = [
  {
    icon: Camera,
    title: "Złap 4 ujęcia, nie jedno ładne",
    body: "Metka, szwy, okucia, spód. Obrys na aparacie trzyma kąt. Zdjęcia zostają w albumie Historii (max 15 łupów), dopóki nie spadną albo ich nie skasujesz.",
  },
  {
    icon: Link2,
    title: "Albo wklej ogłoszenie",
    body: "Link z OLX, Vinted, Allegro, Amazon albo eBay. Aplikacja zczytuje tytuł i cenę, potem robi ten sam check i wycenę co ze zdjęć z lumpeksu.",
  },
  {
    icon: Store,
    title: "Rozbieramy ofertę i wystawiasz",
    body: "Raport składa tytuł, stan, flagi i cenę szybką vs cierpliwą. Kopiujesz ogłoszenie i skaczesz na Vinted albo OLX — wklejasz w formularz. Amazon służy do porównania detalu.",
  },
];

export function GuideView() {
  return (
    <div className="stagger-in space-y-5 pb-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Poradnik</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight">Dla łowcy z lumpeksu</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Szybki check, konkretna wycena, gotowiec na sprzedaż. Bez konta, bez klucza API — działa na tym telefonie.
        </p>
      </header>

      <ol className="space-y-2.5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="rounded-xl bg-elevated p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-surface text-accent">
                <step.icon className="size-4" />
              </span>
              <div>
                <p className="font-mono text-xs tabular-nums text-muted">0{i + 1}</p>
                <h2 className="text-sm font-medium text-fg">{step.title}</h2>
              </div>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="rounded-xl bg-elevated p-3.5" style={{ boxShadow: "var(--shadow-border)" }}>
        <div className="flex items-center gap-2 text-fg">
          <BookOpen className="size-4 text-accent" />
          <h2 className="text-sm font-medium">Czego to nie jest</h2>
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">
          Opinia na zdjęciach, nie certyfikat. Zegarki, torebki lux i elektronika zestawiaj z numerem seryjnym. OLX i Vinted
          nie dają wpisać ogłoszenia za Ciebie — kopiujemy tekst, Ty wklejasz. Sklepy na dole raportu są małe, bo służą do
          porównania, nie do oglądania.
        </p>
      </section>
    </div>
  );
}
