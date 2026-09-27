import { createServerFn } from "@tanstack/react-start";
import type { ListingPreview } from "./types";

const ROOTS = [
  "olx.pl",
  "vinted.pl",
  "allegro.pl",
  "amazon.pl",
  "amazon.com",
  "amazon.de",
  "ebay.pl",
  "ebay.com",
  "grailed.com",
  "stockx.com",
  "facebook.com",
  "fb.com",
  "depop.com",
  "klekt.com",
];

function hostAllowed(host: string) {
  const h = host.toLowerCase().replace(/^www\./, "");
  return ROOTS.some((root) => h === root || h.endsWith(`.${root}`));
}

function isPrivateHost(host: string) {
  return (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function attr(html: string, key: string) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const a = html.match(re);
  if (a?.[1]) return decode(a[1]);
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
    "i",
  );
  const b = html.match(re2);
  return b?.[1] ? decode(b[1]) : "";
}

function decode(value: string) {
  return value
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromPath(url: URL) {
  const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
  return decodeURIComponent(last)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 120);
}

function priceFromHtml(html: string) {
  const og = attr(html, "product:price:amount") || attr(html, "og:price:amount");
  if (og) return og;
  const json = html.match(/"price"\s*:\s*"?(\d[\d\s.,]*)"?/i);
  if (json?.[1]) return json[1];
  const zl = html.match(/(\d[\d\s]{0,6})\s*(?:zł|PLN)/i);
  return zl?.[0] ?? "";
}

export function previewFromUrl(raw: string): ListingPreview | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (isPrivateHost(url.hostname)) return null;
    if (!hostAllowed(url.hostname)) return null;
    return {
      url: url.toString(),
      host: url.hostname.replace(/^www\./, ""),
      title: titleFromPath(url),
      description: "",
      priceText: "",
    };
  } catch {
    return null;
  }
}

export const fetchListing = createServerFn({ method: "POST" })
  .validator((input: { url: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true; listing: ListingPreview } | { ok: false; error: string }> => {
    const local = previewFromUrl(data.url);
    if (!local) {
      return { ok: false, error: "Wklej link z OLX, Vinted, Allegro, Amazon albo eBay." };
    }
    try {
      const res = await fetch(local.url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "Mozilla/5.0 (compatible; LegitCheck/1.0)",
        },
      });
      if (!res.ok) return { ok: true, listing: local };
      const html = (await res.text()).slice(0, 350000);
      const title = attr(html, "og:title") || html.match(/<title>([^<]+)<\/title>/i)?.[1] || local.title;
      const description = attr(html, "og:description") || attr(html, "description");
      const image = attr(html, "og:image");
      return {
        ok: true,
        listing: {
          ...local,
          title: decode(title).slice(0, 160) || local.title,
          description: description.slice(0, 500),
          priceText: priceFromHtml(html).slice(0, 40),
          image: image.startsWith("http") ? image : undefined,
        },
      };
    } catch {
      return { ok: true, listing: local };
    }
  });
