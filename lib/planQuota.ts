/**
 * Cotă planuri Demo/Studio + sync localStorage ↔ Firestore.
 *
 * Guest Demo: max 3 (localStorage demoGenerateCount)
 * Cont gratuit: max 4 planuri în users/{uid}/plans
 * Ștergerea din Dashboard trebuie să scoată și copia locală, altfel
 * migrateLocalPlansToFirebase reîncărca planurile șterse.
 */

const DELETED_KEY_PREFIX = "deleted_plan_ids_";

export const FREE_ACCOUNT_PLAN_LIMIT = 4;
/** Max successful guest Demo plans per browser (localStorage). */
export const GUEST_DEMO_PLAN_LIMIT = 3;
/**
 * Server anti-abuse ceiling per IP / day for guest /api/generate.
 * Higher than GUEST_DEMO_PLAN_LIMIT so JSON retries / failed AI calls
 * do not burn the user's 3 visible free plans.
 */
export const GUEST_IP_DAILY_ABUSE_LIMIT = 20;
/** Soft per-hour IP cap (retries + double-clicks). */
export const GUEST_IP_HOURLY_ABUSE_LIMIT = 30;

/**
 * Unlimited generate (account-level).
 * Admin / subscription / legacy isPaid → yes.
 * Standard / one-time Pro Tools (euFundsUnlocked) → NOT unlimited (use pro pack quotas).
 */
export function hasUnlimitedGenerateAccess(opts: {
  isPaid?: boolean;
  subscriptionActive?: boolean;
  isAdmin?: boolean;
  /** @deprecated Ignored — one-time Pro pack uses proPackGenerateRemaining */
  euFundsUnlocked?: boolean;
}): boolean {
  return !!(opts.isAdmin || opts.isPaid || opts.subscriptionActive);
}

export function deletedPlansStorageKey(uid: string): string {
  return `${DELETED_KEY_PREFIX}${uid}`;
}

export function readDeletedPlanIds(uid: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(deletedPlansStorageKey(uid));
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markPlanDeletedLocally(uid: string, planId: string, planName?: string): void {
  if (typeof window === "undefined" || !planId) return;
  const set = readDeletedPlanIds(uid);
  set.add(planId);
  // Optional name marker for diagnostics; migrate skips by **id** only (A2).
  if (planName?.trim()) set.add(`name:${planName.trim().toLowerCase()}`);
  localStorage.setItem(deletedPlansStorageKey(uid), JSON.stringify([...set]));
  removePlanFromLocalMirrors(planId);
}

/** Scoate planul din current_generated_plan + demo_plans_list (doar pe id — A2). */
export function removePlanFromLocalMirrors(planId: string): void {
  if (typeof window === "undefined" || !planId) return;

  try {
    const current = localStorage.getItem("current_generated_plan");
    if (current) {
      const plan = JSON.parse(current);
      if (String(plan?.id || "") === planId) {
        localStorage.removeItem("current_generated_plan");
        localStorage.removeItem("current_versions");
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const listStr = localStorage.getItem("demo_plans_list");
    if (!listStr) return;
    const list = JSON.parse(listStr);
    if (!Array.isArray(list)) return;
    const next = list.filter((p: any) => String(p?.id || "") !== planId);
    localStorage.setItem("demo_plans_list", JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * Guest Demo: append a generated plan to demo_plans_list immediately (sync).
 * Dedupe by id only — same business name must NOT drop a distinct plan (Sesiunea A1).
 * Returns true if the plan was newly appended.
 */
export function appendGuestPlanToLocalList(plan: any): boolean {
  if (typeof window === "undefined" || !plan || typeof plan !== "object") return false;
  try {
    const planToSave = { ...plan };
    if (!planToSave.id) {
      const safeName =
        String(planToSave.nume || "Plan").replace(/[^a-zA-Z0-9]/g, "_") || "Plan";
      planToSave.id = `${safeName}_${Date.now()}`;
    }
    const listStr = localStorage.getItem("demo_plans_list");
    let list: any[] = listStr ? JSON.parse(listStr) : [];
    if (!Array.isArray(list)) list = [];
    const id = String(planToSave.id);
    if (list.some((p: any) => String(p?.id || "") === id)) {
      return false;
    }
    list.push(planToSave);
    localStorage.setItem("demo_plans_list", JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("[appendGuestPlanToLocalList]", e);
    return false;
  }
}

/** La login pe cont nou (UID nou): resetează contorul guest Demo. */
export function resetGuestDemoCounterOnLogin(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("demoGenerateCount", "0");
}

/**
 * Restart curat: șterge planuri/contoare locale (după delete account / logout / „de la capăt”).
 * Fără asta, migrateLocalPlansToFirebase reîncarcă planurile vechi pe contul nou.
 */
export function clearLocalPlanState(): void {
  if (typeof window === "undefined") return;
  const keysToRemove = [
    "current_generated_plan",
    "current_versions",
    "demo_plans_list",
    "demoGenerateCount",
    "demoToneEditCount",
    "studioGenerateCount",
    "studioToneCount",
    "businessPlan",
    "businessDetails",
    "studioActiveTab",
    "resultState",
    "migration_completed_for_uid",
  ];
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
  // deleted_plan_ids_{uid} — toate UID-urile vechi
  const toDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith(DELETED_KEY_PREFIX) || k.startsWith("firebase:"))) {
      // nu atingem firebase auth persistence aici
      if (k.startsWith(DELETED_KEY_PREFIX)) toDelete.push(k);
    }
  }
  toDelete.forEach((k) => localStorage.removeItem(k));
}
