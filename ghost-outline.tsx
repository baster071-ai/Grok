import type { OutlineKind } from "@/lib/types";

export function GhostOutline({ kind }: { kind: OutlineKind }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 200 260" className="h-full w-full text-accent/70" aria-hidden>
      {kind === "neck-tag" && (
        <>
          <path d="M40 28h120v28H40z" {...common} />
          <rect x="72" y="78" width="56" height="70" rx="4" {...common} />
          <path d="M80 92h40M80 104h32M80 116h24" {...common} />
        </>
      )}
      {kind === "wash-tag" && (
        <>
          <rect x="58" y="46" width="84" height="168" rx="6" {...common} />
          <path d="M72 70h56M72 90h48M72 110h52M72 130h40M72 150h46" {...common} />
        </>
      )}
      {kind === "inner-seam" && (
        <>
          <path d="M46 36c40 18 68 18 108 0" {...common} />
          <path d="M50 70c36 16 64 16 100 0M50 104c36 16 64 16 100 0M50 138c36 16 64 16 100 0" {...common} strokeDasharray="3 6" />
          <path d="M70 36v170M130 36v170" {...common} />
        </>
      )}
      {kind === "outer-logo" && (
        <>
          <rect x="36" y="70" width="128" height="120" rx="10" {...common} />
          <circle cx="100" cy="130" r="28" {...common} />
        </>
      )}
      {kind === "box-label" && (
        <>
          <rect x="28" y="48" width="144" height="164" rx="4" {...common} />
          <rect x="48" y="88" width="104" height="72" rx="3" {...common} />
          <path d="M58 108h84M58 124h64" {...common} />
        </>
      )}
      {kind === "tongue-tag" && (
        <>
          <path d="M64 30h72l10 170c-14 22-78 22-92 0z" {...common} />
          <rect x="78" y="108" width="44" height="52" rx="3" {...common} />
        </>
      )}
      {kind === "sole" && (
        <path
          d="M38 90c8-40 36-54 70-54 42 0 62 28 66 62 4 36-8 86-40 102-18 10-48 8-70-10-28-24-34-62-26-100z"
          {...common}
        />
      )}
      {kind === "upper" && (
        <>
          <path d="M30 150c18-62 48-96 86-110 28-10 56 6 64 38 10 42-4 92-28 118" {...common} />
          <path d="M58 148c18-8 40-10 62-2" {...common} />
          <path d="M70 92c16 6 34 8 50 2" {...common} />
        </>
      )}
      {kind === "hat-front" && (
        <>
          <ellipse cx="100" cy="118" rx="70" ry="48" {...common} />
          <path d="M30 128c20 36 120 36 140 0" {...common} />
          <rect x="78" y="96" width="44" height="32" rx="3" {...common} />
        </>
      )}
      {kind === "hat-tape" && (
        <>
          <ellipse cx="100" cy="90" rx="64" ry="28" {...common} />
          <path d="M36 90v70c0 28 128 28 128 0V90" {...common} />
          <path d="M48 132h104" {...common} />
        </>
      )}
      {kind === "hat-holo" && (
        <>
          <rect x="60" y="80" width="80" height="100" rx="6" {...common} />
          <circle cx="100" cy="128" r="22" {...common} />
        </>
      )}
      {kind === "hat-clasp" && (
        <>
          <rect x="40" y="110" width="120" height="36" rx="6" {...common} />
          <circle cx="58" cy="128" r="8" {...common} />
          <circle cx="142" cy="128" r="8" {...common} />
        </>
      )}
      {kind === "mono" && (
        <>
          <rect x="40" y="50" width="120" height="160" rx="8" {...common} />
          <path d="M58 86h20v20H58zm32 0h20v20H90zm32 0h20v20h-20zM58 122h20v20H58zm32 0h20v20H90zm32 0h20v20h-20zM58 158h20v20H58zm32 0h20v20H90zm32 0h20v20h-20z" {...common} />
        </>
      )}
      {kind === "stamp" && (
        <>
          <rect x="46" y="70" width="108" height="120" rx="6" {...common} />
          <path d="M62 118h76M62 138h52" {...common} />
        </>
      )}
      {kind === "hardware" && (
        <>
          <rect x="70" y="40" width="60" height="180" rx="8" {...common} />
          <circle cx="100" cy="70" r="10" {...common} />
          <path d="M88 110h24M88 140h24" {...common} />
        </>
      )}
      {kind === "edge" && (
        <path d="M36 48c40 20 88 20 128 0M36 88c40 20 88 20 128 0M36 128c40 20 88 20 128 0M36 168c40 20 88 20 128 0" {...common} />
      )}
      {kind === "dial" && (
        <>
          <circle cx="100" cy="130" r="72" {...common} />
          <circle cx="100" cy="130" r="6" {...common} />
          <path d="M100 72v28M100 160v28M42 130h28M130 130h28" {...common} />
        </>
      )}
      {kind === "caseback" && (
        <>
          <circle cx="100" cy="130" r="70" {...common} />
          <circle cx="100" cy="130" r="48" {...common} />
          <path d="M78 130h44" {...common} />
        </>
      )}
      {kind === "bracelet" && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={40 + (i % 2) * 8} y={28 + i * 36} width="112" height="28" rx="4" {...common} />
          ))}
        </>
      )}
      {kind === "crown" && (
        <>
          <circle cx="86" cy="130" r="54" {...common} />
          <rect x="138" y="112" width="28" height="36" rx="4" {...common} />
        </>
      )}
      {kind === "nameplate" && (
        <>
          <rect x="36" y="88" width="128" height="84" rx="6" {...common} />
          <path d="M52 116h96M52 136h70" {...common} />
        </>
      )}
      {kind === "ports" && (
        <>
          <rect x="48" y="70" width="104" height="140" rx="16" {...common} />
          <rect x="86" y="188" width="28" height="10" rx="3" {...common} />
        </>
      )}
      {kind === "fit" && (
        <>
          <rect x="52" y="40" width="96" height="180" rx="18" {...common} />
          <path d="M52 90h96M52 150h96" {...common} />
        </>
      )}
      {kind === "ebox" && (
        <>
          <rect x="34" y="58" width="132" height="150" rx="4" {...common} />
          <path d="M34 108h132" {...common} />
        </>
      )}
      {kind === "hallmark" && (
        <>
          <ellipse cx="100" cy="130" rx="54" ry="22" {...common} />
          <path d="M70 130h60" {...common} />
        </>
      )}
      {kind === "engrave" && (
        <>
          <rect x="50" y="80" width="100" height="100" rx="50" {...common} />
          <path d="M78 130h44" {...common} />
        </>
      )}
      {kind === "clasp" && (
        <>
          <rect x="46" y="108" width="108" height="44" rx="10" {...common} />
          <circle cx="68" cy="130" r="8" {...common} />
        </>
      )}
      {kind === "finish" && (
        <ellipse cx="100" cy="130" rx="70" ry="70" {...common} />
      )}
      {kind === "bag-skin" && (
        <>
          <path d="M48 70h104l12 150H36z" {...common} />
          <path d="M70 70c0-22 60-22 60 0" {...common} />
        </>
      )}
      {kind === "bag-hw" && (
        <>
          <rect x="78" y="70" width="44" height="28" rx="4" {...common} />
          <path d="M48 110h104v100H48z" {...common} />
        </>
      )}
      {kind === "bag-tag" && (
        <>
          <rect x="62" y="70" width="76" height="120" rx="6" {...common} />
          <path d="M76 96h48M76 116h36" {...common} />
        </>
      )}
      {kind === "bag-strap" && (
        <>
          <path d="M40 70c0-30 120-30 120 0v140" {...common} />
          <path d="M40 70v140" {...common} />
        </>
      )}
    </svg>
  );
}
