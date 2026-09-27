const KEY = "lc-gemini-key-v1";

export function loadGeminiKey(): string {
  try {
    return (localStorage.getItem(KEY) ?? "").trim();
  } catch {
    return "";
  }
}

export function saveGeminiKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, trimmed);
}

export function clearGeminiKey() {
  localStorage.removeItem(KEY);
}

export function maskGeminiKey(value: string) {
  const v = value.trim();
  if (v.length < 8) return "";
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}
