"use client";

import { useEffect, useRef } from "react";
import { planNeedsExplanationFill } from "@/lib/normalizePlanResult";
import { formatObjectNumbers } from "@/lib/utils";

type Locale = "ro" | "en" | "es";

function swotItemCount(plan: any): number {
  const swot = plan?.analiza_swot;
  if (!swot) return 0;
  let n = 0;
  for (const key of ["puncte_tari", "puncte_forte", "puncte_slabe", "oportunitati", "amenintari"]) {
    if (Array.isArray(swot[key])) n += swot[key].length;
  }
  return n;
}

function emptySwotExplCount(plan: any): number {
  const swot = plan?.analiza_swot;
  if (!swot) return 0;
  let n = 0;
  for (const key of ["puncte_tari", "puncte_slabe", "oportunitati", "amenintari"]) {
    const arr = swot[key];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      const titlu = typeof item === "string" ? item : item?.titlu;
      const expl =
        typeof item === "string"
          ? ""
          : String(
              item?.explicatie_tehnica ||
                item?.explicacion_tecnica ||
                item?.explicacion ||
                ""
            ).trim();
      if (titlu && String(titlu).trim() && !expl) n += 1;
    }
  }
  return n;
}

/**
 * Completes empty SWOT/budget/ops fields after generate or when opening Studio Edit.
 * Retries once. Does not cancel mid-flight when setResult updates the same plan.
 */
export function useCompleteMissingPlanFields(
  result: any,
  setResult: (plan: any) => void,
  locale: Locale,
  enabled = true
) {
  const attemptedKeys = useRef<Set<string>>(new Set());
  const inFlightKey = useRef<string | null>(null);
  const setResultRef = useRef(setResult);
  setResultRef.current = setResult;

  const planId = result ? String(result.id || result.nume || "") : "";
  const needsFill = !!(result && planNeedsExplanationFill(result));

  useEffect(() => {
    if (!enabled || !result || !needsFill || !planId) return;

    const planKey = `${planId}:fields-v5:e${beforeEmpty}:s${beforeCount}`;
    if (attemptedKeys.current.has(planKey)) return;
    if (inFlightKey.current === planKey) return;

    const beforeCount = swotItemCount(result);
    const beforeEmpty = emptySwotExplCount(result);
    let cancelled = false;
    inFlightKey.current = planKey;

    const snapshot = result;

    (async () => {
      let current = snapshot;
      let best: any = null;
      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          if (cancelled) return;
          if (!planNeedsExplanationFill(current)) break;

          const res = await fetch("/api/complete-plan-fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: current, locale }),
          });
          if (!res.ok) continue;
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

          const afterEmpty = emptySwotExplCount(completed);
          if (afterEmpty === 0 || afterEmpty < beforeEmpty) break;
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
        attemptedKeys.current.add(planKey);
        if (inFlightKey.current === planKey) inFlightKey.current = null;
      }
    })();

    return () => {
      // Only cancel if navigating away / plan id changes — not on our own setResult
      cancelled = true;
    };
  }, [enabled, locale, needsFill, planId]); // eslint-disable-line react-hooks/exhaustive-deps
}
