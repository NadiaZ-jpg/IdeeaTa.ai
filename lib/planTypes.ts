/**
 * Convenience re-exports: import BusinessPlan, AppLocale and AppPlanCurrency
 * from a single canonical location instead of hunting across lib files.
 *
 * Sources:
 *   BusinessPlan  → lib/normalizePlanResult.ts
 *   AppLocale     → lib/localeEntry.ts
 *   AppPlanCurrency → lib/planCurrency.ts
 */

export type {
  BusinessPlan,
  SwotItem,
  AnalizaSwot,
  BudgetItem,
  PlanFinanciar,
  PlanOperational,
  ViziuneStrategie,
  AnalizaPietei,
} from "@/lib/normalizePlanResult";

export type { AppLocale } from "@/lib/localeEntry";

export type { AppPlanCurrency } from "@/lib/planCurrency";
export {
  defaultCurrencyForLocale,
  normalizePlanCurrency,
  isRonLikeCurrency,
} from "@/lib/planCurrency";
