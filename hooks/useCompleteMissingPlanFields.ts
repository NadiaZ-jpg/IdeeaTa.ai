"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  budgetItemNeedsExplanationFill,
  planNeedsExplanationFill,
  swotItemNeedsExplanationFill,
  BusinessPlan,
} from "@/lib/normalizePlanResult";
import { formatObjectNumbers } from "@/lib/utils";
import { auth } from "@/lib/firebase";

type Locale = "ro" | "en" | "es";

function swotItemCount(plan: BusinessPlan | null | undefined): number {
  const swot = plan?.analiza_swot;
  if (!swot) return 0;
  let n = 0;
  for (const key of ["puncte_tari", "puncte_forte", "puncte_slabe", "oportunitati", "amenintari"] as const) {
    const arr = (swot as any)[key];
    if (Array.isArray(arr)) n += arr.length;
  }
  return n;
}

function incompleteExplCount(plan: BusinessPlan | null | undefined): number {
  let n = 0;
  const swot = plan?.analiza_swot;
  if (swot) {
    for (const key of ["puncte_tari", "puncte_slabe", "oportunitati", "amenintari"] as const) {
      const arr = swot[key];
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        if (swotItemNeedsExplanationFill(item)) n += 1;
      }
    }
  }
  const budget = plan?.plan_financiar?.buget_investitii;
  if (Array.isArray(budget)) {
    for (const b of budget) {
      if (budgetItemNeedsExplanationFill(b)) n += 1;
    }
  }
  return n;
}

/**
 * Completes empty/truncated SWOT/budget/ops fields after generate or when opening Studio Edit.
 * Retries once. Does not cancel mid-flight when setResult updates the same plan.
 * Shared by Demo + Studio, Desktop + Mobile, RO/EN/ES.
 *
 * Important (ES cold-start): never mark a plan as "attempted" if the run was cancelled,
 * lacked auth, or never got a successful fill — otherwise the first 1–2 ES plans stay empty forever.
 */
export function useCompleteMissingPlanFields(
  result: BusinessPlan | null,
  setResult: (plan: BusinessPlan) => void,
  locale: Locale,
  enabled = true
) {
  const attemptedKeys = useRef<Set<string>>(new Set());
  const inFlightKey = useRef<string | null>(null);
  const setResultRef = useRef(setResult);
  setResultRef.current = setResult;

  const [authUid, setAuthUid] = useState<string | null>(
    () => auth.currentUser?.uid ?? null
  );

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAuthUid(user?.uid ?? null);
    });
  }, []);

  const planId = result ? String(result.id || result.nume || "") : "";
  const needsFill = !!(result && planNeedsExplanationFill(result));

  useEffect(() => {
    if (!enabled || !result || !needsFill || !planId) return;
    // Wait for Firebase auth — /api/complete-plan-fields requires Bearer token.
    if (!authUid) return;

    const beforeCount = swotItemCount(result);
    const beforeIncomplete = incompleteExplCount(result);
    // v7: auth-aware + do not poison attemptedKeys on cancel/no-token
    const planKey = `${planId}:fields-v7:i${beforeIncomplete}:s${beforeCount}`;
    if (attemptedKeys.current.has(planKey)) return;
    if (inFlightKey.current === planKey) return;

    let cancelled = false;
    let markedAttempted = false;
    inFlightKey.current = planKey;

    const snapshot = result;

    (async () => {
      let current = snapshot;
      let best: BusinessPlan | null = null;
      let gotApiOk = false;
      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          if (cancelled) return;
          if (!planNeedsExplanationFill(current)) break;

          const headers: Record<string, string> = { "Content-Type": "application/json" };
          try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            if (!token) {
              // Auth not ready yet — leave unattempted so effect can retry when authUid updates.
              return;
            }
            headers.Authorization = `Bearer ${token}`;
          } catch {
            return;
          }

          const res = await fetch("/api/complete-plan-fields", {
            method: "POST",
            headers,
            body: JSON.stringify({ plan: current, locale }),
          });
          if (!res.ok) continue;
          gotApiOk = true;
          const data = await res.json();
          if (cancelled || !data?.plan) continue;

          const completed = formatObjectNumbers(data.plan);
          if (swotItemCount(completed) < beforeCount) {
            console.warn(
              "[useCompleteMissingPlanFields] Ignoring fill that dropped SWOT items"
            );
            continue;
          }

          best = completed;
          current = completed;

          const afterIncomplete = incompleteExplCount(completed);
          if (afterIncomplete === 0 || afterIncomplete < beforeIncomplete) break;
        }

        if (!cancelled && best) {
          setResultRef.current(best);
          try {
            localStorage.setItem("current_generated_plan", JSON.stringify(best));
          } catch {
            /* ignore */
          }
        }
      } catch (e) {
        console.error("[useCompleteMissingPlanFields]", e);
      } finally {
        // Only lock the key after a real API attempt finished (success or exhausted).
        // Cancelled / no-token runs must remain retryable — critical for ES first generations.
        if (!cancelled && (best || gotApiOk)) {
          attemptedKeys.current.add(planKey);
          markedAttempted = true;
        }
        if (inFlightKey.current === planKey) inFlightKey.current = null;
      }
    })();

    return () => {
      cancelled = true;
      // If cleanup runs before we marked attempted, allow a fresh run.
      if (!markedAttempted && inFlightKey.current === planKey) {
        inFlightKey.current = null;
      }
    };
  }, [enabled, locale, needsFill, planId, authUid]); // eslint-disable-line react-hooks/exhaustive-deps
}
