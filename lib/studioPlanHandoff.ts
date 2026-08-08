/** Hand-off Dashboard → Studio: plan already fetched, avoid second Firestore race. */

const OPEN_PLAN_KEY = "ideeata_open_plan";

export function stagePlanForStudioOpen(plan: Record<string, any> & { id: string }) {
  if (typeof window === "undefined" || !plan?.id) return;
  try {
    const { id, ...rest } = plan;
    sessionStorage.setItem(
      OPEN_PLAN_KEY,
      JSON.stringify({
        id,
        savedAt: Date.now(),
        data: rest,
      })
    );
  } catch {
    /* private mode / quota */
  }
}

/** Read without clearing — Safe for React Strict Mode remount. */
export function readStagedStudioPlan(planId: string): Record<string, any> | null {
  const staged = readStagedStudioPlanWithMeta(planId);
  return staged?.data ?? null;
}

/** Includes handoff `savedAt` so Studio can skip stale Firestore re-applies. */
export function readStagedStudioPlanWithMeta(
  planId: string
): { data: Record<string, any>; savedAt: number } | null {
  if (typeof window === "undefined" || !planId) return null;
  try {
    const raw = sessionStorage.getItem(OPEN_PLAN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.id !== planId || !parsed.data) return null;
    const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now();
    if (Date.now() - savedAt > 5 * 60 * 1000) {
      sessionStorage.removeItem(OPEN_PLAN_KEY);
      return null;
    }
    return { data: { ...parsed.data, id: planId }, savedAt };
  } catch {
    return null;
  }
}

export function clearStagedStudioPlan() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(OPEN_PLAN_KEY);
  } catch {
    /* ignore */
  }
}
