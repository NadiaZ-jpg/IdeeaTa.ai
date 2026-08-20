/**
 * F5 Phase 1 — shared /api/generate request body for Demo + Studio (Desktop/Mobile).
 * Keeps currency + surface rules in one place (RON via planCurrency / F1).
 */

import {
  defaultCurrencyForLocale,
  normalizePlanCurrency,
  type AppPlanCurrency,
} from "@/lib/planCurrency";

export type GenerateSurface = "demo" | "studio";

export type GenerateRequestBody = {
  skill: string;
  locale: "ro" | "en" | "es";
  currency: AppPlanCurrency;
  surface: GenerateSurface;
};

function normalizeLocale(locale: string): "ro" | "en" | "es" {
  return locale === "en" || locale === "es" ? locale : "ro";
}

/**
 * Build JSON body for POST /api/generate.
 * - EN/ES → always EUR
 * - RO → currencyToggle if provided (RON/EUR), else RON
 */
export function buildGenerateRequestBody(opts: {
  skill: string;
  locale: string;
  /** Desktop RO toggle (RON | EUR | legacy LEI). Ignored on EN/ES. */
  currencyToggle?: string | null;
  surface: GenerateSurface;
}): GenerateRequestBody {
  const locale = normalizeLocale(opts.locale);
  const currency: AppPlanCurrency =
    locale === "en" || locale === "es"
      ? "EUR"
      : opts.currencyToggle
        ? normalizePlanCurrency(opts.currencyToggle, locale)
        : defaultCurrencyForLocale(locale);

  return {
    skill: opts.skill,
    locale,
    currency,
    surface: opts.surface,
  };
}
