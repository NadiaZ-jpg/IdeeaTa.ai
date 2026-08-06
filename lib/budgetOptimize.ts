import { parseBudgetCost } from "@/lib/priceHelper";

/** Clamp user percent to a sensible investment-cut range. */
export function parseBudgetReductionPercent(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = parseInt(String(raw).replace(/%/g, "").trim(), 10);
  if (!Number.isFinite(n) || n <= 0 || n > 90) return null;
  return n;
}

function formatReducedCost(
  amount: number,
  originalCost: unknown,
  locale: string,
  currency: string
): string {
  const text = String(originalCost ?? "");
  const upper = text.toUpperCase();
  const preferEur =
    locale === "en" ||
    locale === "es" ||
    currency === "EUR" ||
    upper.includes("EUR") ||
    text.includes("€");
  if (preferEur) return `${amount} EUR`;
  if (upper.includes("LEI") || upper.includes("RON") || currency === "LEI") {
    return `${amount} LEI`;
  }
  return `${amount} LEI`;
}

/**
 * Exact math reduction of buget_investitii costs by percent.
 * AI must not be trusted for the arithmetic — only for explanation text.
 */
export function applyBudgetPercentReduction(
  items: any[] | undefined,
  percent: number,
  locale: string = "ro",
  currency: string = "LEI"
): any[] {
  if (!Array.isArray(items) || items.length === 0) return items || [];
  const factor = Math.max(0, 1 - percent / 100);
  return items.map((item) => {
    const raw = item?.cost !== undefined ? item.cost : item?.suma_lei;
    const oldNum = parseBudgetCost(raw);
    const newNum = Math.round(oldNum * factor);
    const costStr = formatReducedCost(newNum, raw, locale, currency);
    const next = { ...item, cost: costStr };
    if (item?.suma_lei !== undefined) {
      next.suma_lei = costStr;
    }
    return next;
  });
}

/**
 * Keep exact reduced costs; prefer AI explanations when lengths align.
 */
export function mergeBudgetReductionWithAiExplanations(
  originalItems: any[] | undefined,
  aiItems: any[] | undefined,
  percent: number,
  locale: string,
  currency: string
): any[] {
  const reduced = applyBudgetPercentReduction(originalItems, percent, locale, currency);
  if (!Array.isArray(aiItems) || aiItems.length === 0) return reduced;
  return reduced.map((item, i) => {
    const ai = aiItems[i];
    if (!ai || typeof ai !== "object") return item;
    return {
      ...item,
      explicatie: ai.explicatie || ai.detalii || item.explicatie,
      // keep original item title; AI sometimes renames and breaks chart labels
      item: item.item || item.categorie || item.nume || ai.item,
    };
  });
}
