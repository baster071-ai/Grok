export function marketplaceLinks(query: string) {
  const q = encodeURIComponent(query.trim() || "sneaker");
  const slug = encodeURIComponent(query.trim().replace(/\s+/g, "-") || "sneaker");
  return [
    {
      id: "vinted",
      label: "Vinted",
      url: `https://www.vinted.pl/catalog?search_text=${q}`,
    },
    {
      id: "olx",
      label: "OLX",
      url: `https://www.olx.pl/oferty/q-${slug}/`,
    },
    {
      id: "amazon",
      label: "Amazon",
      url: `https://www.amazon.pl/s?k=${q}`,
    },
    {
      id: "ebay",
      label: "eBay",
      url: `https://www.ebay.pl/sch/i.html?_nkw=${q}`,
    },
    {
      id: "google",
      label: "Google",
      url: `https://www.google.com/search?tbm=shop&q=${q}`,
    },
  ] as const;
}
