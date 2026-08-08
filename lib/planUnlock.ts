/**
 * Plan unlock helpers — prefer stable plan.id; keep name for legacy docs.
 */

export function isPlanUnlockedByLists(
  result: { id?: string; nume?: string } | null | undefined,
  unlockedPlans?: string[] | null,
  unlockedPlanIds?: string[] | null
): boolean {
  if (!result) return false;
  const ids = Array.isArray(unlockedPlanIds) ? unlockedPlanIds : [];
  const names = Array.isArray(unlockedPlans) ? unlockedPlans : [];
  if (result.id && ids.includes(String(result.id))) return true;
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
