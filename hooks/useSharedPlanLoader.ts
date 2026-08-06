"use client";

import { useEffect, useRef, useState } from "react";
import { formatObjectNumbers } from "@/lib/utils";

/** Citește ?sharedId= din URL (client-only). */
export function readSharedIdFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("sharedId");
}

/** Încarcă planul partajat de pe /api/share/{id}. */
export async function fetchSharedPlan(sharedId: string): Promise<any | null> {
  const res = await fetch(`/api/share/${sharedId}`);
  const data = await res.json();
  if (data?.data) return formatObjectNumbers(data.data);
  return null;
}

/** Scoate sharedId din URL după încărcare reușită. */
export function clearSharedIdFromUrl(): void {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, document.title, window.location.pathname);
}

/** Resetează contoarele demo după deschiderea unui share (comportament Desktop existent). */
export function resetDemoShareCounters(setDemoCount?: (n: number) => void): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("demoGenerateCount", "0");
  localStorage.setItem("demoEditCount", "0");
  setDemoCount?.(0);
}

type UseSharedPlanLoaderOptions = {
  onLoaded: (plan: any) => void;
  onSharedView?: () => void;
  resetDemoCounters?: boolean;
  setDemoCount?: (n: number) => void;
};

/**
 * Încarcă automat planul din ?sharedId= la mount.
 * Folosit pe Mobile; Desktop poate apela helper-ele de mai sus în useEffect-ul existent.
 */
export function useSharedPlanLoader(options: UseSharedPlanLoaderOptions) {
  const [isCheckingShared, setIsCheckingShared] = useState(true);
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
        const plan = await fetchSharedPlan(sharedId);
        if (cancelled || !plan) return;
        const o = optsRef.current;
        o.onLoaded(plan);
        o.onSharedView?.();
        if (o.resetDemoCounters) {
          resetDemoShareCounters(o.setDemoCount);
        }
        clearSharedIdFromUrl();
      } catch (err) {
        console.error("Eroare incarcare shareId:", err);
      } finally {
        if (!cancelled) setIsCheckingShared(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isCheckingShared };
}
