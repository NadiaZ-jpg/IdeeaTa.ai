/**
 * F1 — single Romanian currency label: RON (ISO).
 * Legacy plans may still store "LEI"; normalize on read/display.
 */

export type AppPlanCurrency = "RON" | "EUR";

export function defaultCurrencyForLocale(locale: string): AppPlanCurrency {
  return locale === "en" || locale === "es" ? "EUR" : "RON";
}

/** Map LEI → RON; pass through EUR; empty → locale default. */
export function normalizePlanCurrency(
  raw: string | null | undefined,
  locale: string = "ro"
): AppPlanCurrency {
  const u = String(raw ?? "").trim().toUpperCase();
  if (!u) return defaultCurrencyForLocale(locale);
  if (u === "EUR" || u.includes("EUR") || u.includes("€")) return "EUR";
  if (u === "LEI" || u === "RON" || u.includes("LEI") || u.includes("RON")) return "RON";
  return defaultCurrencyForLocale(locale);
}

export function isRonLikeCurrency(raw: string | null | undefined): boolean {
  return normalizePlanCurrency(raw, "ro") === "RON";
}
