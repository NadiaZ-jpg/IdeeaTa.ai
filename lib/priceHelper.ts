import { normalizePlanCurrency } from "@/lib/planCurrency";

export const parseBudgetCost = (priceText: any): number => {
  if (priceText === null || priceText === undefined || priceText === "") return 0;
  let rawText: any = priceText;
  if (typeof priceText === "object") {
    rawText = Object.values(priceText)[0] || "";
  }
  const numericValue = parseInt(String(rawText).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

/** Format a numeric total already expressed in the plan's display currency (no FX). */
export const formatAmountInCurrency = (
  amount: number,
  locale: string,
  currencyToggle: string
): string => {
  const loc =
    locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "ro-RO";
  const cur =
    locale === "en" || locale === "es"
      ? "EUR"
      : normalizePlanCurrency(currencyToggle, locale);
  return `${Math.round(amount).toLocaleString(loc)} ${cur}`;
};

export const formatPriceLocalized = (
  priceText: any,
  locale: string,
  currencyToggle: string,
  fxRate: number = 0.201
) => {
  if (priceText === null || priceText === undefined || priceText === "") return "";
  
  let rawText = priceText;
  if (typeof priceText === 'object') {
    rawText = Object.values(priceText)[0] || "";
  }

  const text = rawText.toString();
  const numericValue = parseInt(text.replace(/[^0-9]/g, ""));
  if (isNaN(numericValue)) return text;

  const upper = text.toUpperCase();
  const isRawEur = upper.includes("EUR") || text.includes("€");
  const isRawLei = upper.includes("LEI") || upper.includes("RON");
  const displayCur = normalizePlanCurrency(currencyToggle, locale);

  // EN/ES: always show EUR. Convert only when the AI explicitly wrote LEI/RON.
  // Bare numbers (and summed totals) are already EUR for EN/ES plans — do NOT apply fxRate.
  if (locale === "en" || locale === "es") {
    const eurValue =
      isRawLei && !isRawEur ? Math.round(numericValue * fxRate) : numericValue;
    return `${eurValue.toLocaleString(locale === "en" ? "en-US" : "es-ES")} EUR`;
  }

  if (displayCur === "EUR") {
    if (isRawEur) {
      return `${numericValue.toLocaleString('ro-RO')} EUR`;
    }
    const eurValue = Math.round(numericValue * fxRate);
    return `${eurValue.toLocaleString('ro-RO')} EUR`;
  }
  
  // displayCur is RON (F1; accepts legacy LEI toggle)
  if (isRawEur) {
    const ronValue = Math.round(numericValue / fxRate);
    return `${ronValue.toLocaleString('ro-RO')} RON`;
  }
  
  return `${numericValue.toLocaleString('ro-RO')} RON`;
};
