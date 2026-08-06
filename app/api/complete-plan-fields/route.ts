import { NextRequest, NextResponse } from "next/server";
import { fillMissingPlanExplanations } from "@/lib/fillMissingPlanExplanations";
import { planNeedsExplanationFill } from "@/lib/normalizePlanResult";

export const maxDuration = 60;

/** Fills empty SWOT/budget explanations for an already-generated plan (view/edit). */
export async function POST(req: NextRequest) {
  try {
    const { plan, locale } = await req.json();
    if (!plan || typeof plan !== "object") {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }
    const loc = locale === "en" || locale === "es" ? locale : "ro";
    if (!planNeedsExplanationFill(plan)) {
      return NextResponse.json({ plan, filled: false });
    }
    const completed = await fillMissingPlanExplanations(plan, loc);
    return NextResponse.json({
      plan: completed,
      filled: planNeedsExplanationFill(completed) ? false : true,
    });
  } catch (e: any) {
    console.error("[complete-plan-fields]", e);
    return NextResponse.json({ error: e?.message || "Complete failed" }, { status: 500 });
  }
}
