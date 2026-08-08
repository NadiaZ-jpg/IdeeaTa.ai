/**
 * Plan unlock helpers — prefer stable plan.id; name is legacy-only when id missing.
 */

export function isPlanUnlockedByLists(
  result: { id?: string; nume?: string } | null | undefined,
  unlockedPlans?: string[] | null,
  unlockedPlanIds?: string[] | null
): boolean {
  if (!result) return false;
  const ids = Array.isArray(unlockedPlanIds) ? unlockedPlanIds : [];
  const names = Array.isArray(unlockedPlans) ? unlockedPlans : [];
  // Prefer id — never grant free export via renamed duplicate with same nume
  if (result.id) return ids.includes(String(result.id));
  // Legacy docs without id
  if (result.nume && names.includes(String(result.nume))) return true;
  return false;
}

export function planUnlockPayload(result: {
  id?: string;
  nume?: string;
}): { planName: string; planId?: string } {
  const planName = result?.nume || "Plan";
  const planId = result?.id ? String(result.id) : undefined;
  return { planName, planId };
}

/** Account Standard/Pro package (tones, Combine, copy-protect) — NOT credit/export unlock alone. */
export function hasAccountStandardAccess(opts: {
  isPaid?: boolean;
  standardPackageActive?: boolean;
  promoCodeUnlocked?: boolean;
  isAdmin?: boolean;
  subscriptionActive?: boolean;
  euFundsUnlocked?: boolean;
}): boolean {
  return !!(
    opts.isAdmin ||
    opts.isPaid ||
    opts.standardPackageActive ||
    opts.promoCodeUnlocked ||
    opts.subscriptionActive ||
    opts.euFundsUnlocked
  );
}

/** Full export formats for this plan (credit unlock or account tier). */
export function isPlanExportUnlocked(opts: {
  result?: { id?: string; nume?: string } | null;
  unlockedPlans?: string[] | null;
  unlockedPlanIds?: string[] | null;
  isPaid?: boolean;
  promoCodeUnlocked?: boolean;
  isAdmin?: boolean;
  subscriptionActive?: boolean;
  euFundsUnlocked?: boolean;
}): boolean {
  if (
    opts.isAdmin ||
    opts.isPaid ||
    opts.promoCodeUnlocked ||
    opts.subscriptionActive ||
    opts.euFundsUnlocked
  ) {
    return true;
  }
  return isPlanUnlockedByLists(
    opts.result,
    opts.unlockedPlans,
    opts.unlockedPlanIds
  );
}
