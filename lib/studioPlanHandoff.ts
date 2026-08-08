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
  if (typeof window === "undefined" || !planId) return null;
  try {
    const raw = sessionStorage.getItem(OPEN_PLAN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.id !== planId || !parsed.data) return null;
    if (typeof parsed.savedAt === "number" && Date.now() - parsed.savedAt > 5 * 60 * 1000) {
      sessionStorage.removeItem(OPEN_PLAN_KEY);
      return null;
    }
    return { ...parsed.data, id: planId };
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
