/**
 * Persist version history map to localStorage without throwing into React updaters.
 * QuotaExceeded must never abort setVersions state updates (Sesiunea B1).
 */

export type PersistVersionsResult = {
  ok: boolean;
  quotaExceeded?: boolean;
};

const STORAGE_KEY = "current_versions";

/** Write versions + activeVersionId. Never throws. */
export function persistCurrentVersions(
  versions: Record<string, any> | null | undefined,
  activeVersionId: string
): PersistVersionsResult {
  if (typeof window === "undefined") return { ok: true };
  try {
    const map = versions && typeof versions === "object" ? versions : {};
    if (Object.keys(map).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return { ok: true };
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ versions: map, activeVersionId })
    );
    return { ok: true };
  } catch (e: any) {
    const quota =
      e?.name === "QuotaExceededError" ||
      e?.code === 22 ||
      e?.code === 1014 ||
      (typeof e?.message === "string" &&
        /quota|exceeded|storage/i.test(e.message));
    console.warn("[persistCurrentVersions]", e);
    return { ok: false, quotaExceeded: !!quota };
  }
}

export function clearPersistedVersions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

let lastQuotaAlertAt = 0;

/** Soft alert at most once per 8s so rapid setResult updates do not spam. */
export function notifyVersionPersistFailed(message: string): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastQuotaAlertAt < 8000) return;
  lastQuotaAlertAt = now;
  try {
    window.alert(message);
  } catch {
    /* ignore */
  }
}
