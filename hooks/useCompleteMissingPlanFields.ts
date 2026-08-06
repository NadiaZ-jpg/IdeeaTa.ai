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

/**
 * When a loaded/generated plan has SWOT/budget titles without explanations
 * OR empty operational fields (e.g. locatie_dotari missing after ES key rename),
 * call /api/complete-plan-fields once and update the plan in state + localStorage.
 * Refuses to apply a response that drops SWOT items (merge regression guard).
 */
export function useCompleteMissingPlanFields(
  result: any,
  setResult: (plan: any) => void,
  locale: Locale,
  enabled = true
) {
  const attemptedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !result || typeof result !== "object") return;
    if (!planNeedsExplanationFill(result)) return;

    const planKey = `${String(result.id || result.nume || "plan")}:fields-v2`;
    if (attemptedKeys.current.has(planKey)) return;
    attemptedKeys.current.add(planKey);

    const beforeCount = swotItemCount(result);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/complete-plan-fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: result, locale }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.plan) return;
        const completed = formatObjectNumbers(data.plan);
        if (swotItemCount(completed) < beforeCount) {
          console.warn("[useCompleteMissingPlanFields] Ignoring fill result that dropped SWOT items");
          return;
        }
        setResult(completed);
        try {
          localStorage.setItem("current_generated_plan", JSON.stringify(completed));
        } catch {
          /* ignore quota */
        }
      } catch (e) {
        console.error("[useCompleteMissingPlanFields]", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [result, setResult, locale, enabled]);
}
