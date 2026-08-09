"use client";

import { useEffect, useRef, useState } from "react";
import { formatObjectNumbers } from "@/lib/utils";
import {
  normalizeAppLocale,
  redirectToSharedPlanLocale,
  sharedPlanOpenPath,
  type AppLocale,
} from "@/lib/pdfCtaBehavior";

export type { AppLocale };

/** Citește ?sharedId= din URL (client-only). Acceptă și legacy ?shareId=. */
export function readSharedIdFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  return q.get("sharedId") || q.get("shareId");
}

export type SharedPlanPayload = {
  data: any;
  locale: AppLocale;
};

export type SharedPlanFetchResult =
  | { ok: true; payload: SharedPlanPayload }
  | { ok: false; error: "not_found" | "network" };

/** Path demo pentru un locale (fără origin) — alias pdfCtaBehavior. */
export function demoPathForLocale(locale: AppLocale, sharedId?: string): string {
  if (sharedId) return sharedPlanOpenPath(locale, sharedId);
  const prefix = locale === "en" ? "/en" : locale === "es" ? "/es" : "";
  return `${prefix}/demo`;
}

/**
 * Dacă locale-ul planului partajat ≠ locale-ul paginii curente, redirecționează.
 * Returnează true dacă a pornit redirect (nu continua load-ul).
 */
export function redirectIfSharedLocaleMismatch(
  shareLocale: AppLocale,
  pageLocale: AppLocale,
  sharedId: string
): boolean {
  return redirectToSharedPlanLocale(shareLocale, pageLocale, sharedId);
}

/** Încarcă planul partajat + locale de pe /api/share/{id}. */
export async function fetchSharedPlanResult(
  sharedId: string
): Promise<SharedPlanFetchResult> {
  try {
    const res = await fetch(`/api/share/${encodeURIComponent(sharedId)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.data) {
      return { ok: false, error: res.status === 404 ? "not_found" : "network" };
    }
    return {
      ok: true,
      payload: {
        data: formatObjectNumbers(data.data),
        locale: normalizeAppLocale(data.locale),
      },
    };
  } catch {
    return { ok: false, error: "network" };
  }
}

/** @deprecated — preferă fetchSharedPlanResult */
export async function fetchSharedPlanPayload(
  sharedId: string
): Promise<SharedPlanPayload | null> {
  const result = await fetchSharedPlanResult(sharedId);
  return result.ok ? result.payload : null;
}

/** @deprecated — preferă fetchSharedPlanPayload */
export async function fetchSharedPlan(sharedId: string): Promise<any | null> {
  const payload = await fetchSharedPlanPayload(sharedId);
  return payload?.data ?? null;
}

/** Scoate sharedId din URL după încărcare reușită. */
export function clearSharedIdFromUrl(): void {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, document.title, window.location.pathname);
}

/** Resetează doar contoarele de edit după share — NU resetează demoGenerateCount (anti-abuse). */
export function resetDemoShareCounters(setDemoCount?: (n: number) => void): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("demoEditCount", "0");
  // Keep guest generate quota intact when opening shared plans.
  if (setDemoCount) {
    const count = parseInt(localStorage.getItem("demoGenerateCount") || "0", 10) || 0;
    setDemoCount(count);
  }
}

type UseSharedPlanLoaderOptions = {
  pageLocale: AppLocale;
  onLoaded: (plan: any, shareLocale: AppLocale) => void;
  onSharedView?: () => void;
  onError?: (error: "not_found" | "network") => void;
  resetDemoCounters?: boolean;
  setDemoCount?: (n: number) => void;
};

/**
 * Încarcă automat planul din ?sharedId= la mount.
 * Redirecționează pe /en|/es/demo dacă locale-ul share ≠ pagina.
 */
export function useSharedPlanLoader(options: UseSharedPlanLoaderOptions) {
  const [isCheckingShared, setIsCheckingShared] = useState(true);
  const [shareError, setShareError] = useState<"not_found" | "network" | null>(
    null
  );
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const sharedId = readSharedIdFromLocation();
    if (!sharedId) {
      setIsCheckingShared(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result = await fetchSharedPlanResult(sharedId);
        if (cancelled) return;
        if (!result.ok) {
          setShareError(result.error);
          optsRef.current.onError?.(result.error);
          return;
        }
        const payload = result.payload;
        const o = optsRef.current;
        if (redirectIfSharedLocaleMismatch(payload.locale, o.pageLocale, sharedId)) {
          return;
        }
        o.onLoaded(payload.data, payload.locale);
        o.onSharedView?.();
        if (o.resetDemoCounters) {
          resetDemoShareCounters(o.setDemoCount);
        }
        clearSharedIdFromUrl();
      } catch (err) {
        console.error("Eroare incarcare shareId:", err);
        if (!cancelled) {
          setShareError("network");
          optsRef.current.onError?.("network");
        }
      } finally {
        if (!cancelled) setIsCheckingShared(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isCheckingShared, shareError };
}
