"use client";

import { useState, useEffect } from "react";
import {
  defaultCurrencyForLocale,
  normalizePlanCurrency,
  type AppPlanCurrency,
} from "@/lib/planCurrency";

/**
 * Currency state tied to the active locale.
 *
 * - EN / ES: always EUR, ignores toggle
 * - RO: starts from `initialCurrency` (plan's selectedCurrency or RON)
 *
 * Usage:
 *   const { currency, setCurrency } = useLocaleCurrency(locale, result?.selectedCurrency);
 */
export function useLocaleCurrency(
  locale: string,
  /** Raw currency string from the plan (selectedCurrency) or previous toggle. */
  initialCurrency?: string | null
): { currency: AppPlanCurrency; setCurrency: (c: AppPlanCurrency) => void } {
  const [currency, setCurrencyState] = useState<AppPlanCurrency>(() =>
    normalizePlanCurrency(initialCurrency, locale)
  );

  // Enforce locale rules whenever locale changes (e.g. user switches language).
  useEffect(() => {
    if (locale === "en" || locale === "es") {
      setCurrencyState("EUR");
    } else if ((currency as string) === "LEI") {
      // F1: normalize legacy label stored in older plans
      setCurrencyState("RON");
    }
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  // When a new plan loads (initialCurrency changes), re-derive — respecting locale.
  useEffect(() => {
    if (initialCurrency !== undefined && initialCurrency !== null) {
      const derived = normalizePlanCurrency(initialCurrency, locale);
      setCurrencyState(derived);
    }
  }, [initialCurrency, locale]);

  const setCurrency = (c: AppPlanCurrency) => {
    // Guard: EN/ES never accept RON.
    if ((locale === "en" || locale === "es") && c !== "EUR") return;
    setCurrencyState(c);
  };

  return { currency, setCurrency };
}

/** Derive display currency without React state (for SSR / exports). */
export function resolveCurrency(
  selectedCurrency: string | null | undefined,
  locale: string
): AppPlanCurrency {
  return normalizePlanCurrency(selectedCurrency, locale);
}

export type { AppPlanCurrency };
export { defaultCurrencyForLocale };
