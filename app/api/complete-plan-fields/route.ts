import { NextRequest, NextResponse } from "next/server";
import { fillMissingPlanExplanations } from "@/lib/fillMissingPlanExplanations";
import { planNeedsExplanationFill } from "@/lib/normalizePlanResult";
import { adminAuth } from "@/lib/firebase-admin";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/apiRateLimit";

export const maxDuration = 60;

const HOUR_MS = 60 * 60 * 1000;

/** Fills empty SWOT/budget explanations for an already-generated plan (view/edit). */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
        if (!consumeRateLimit(`complete:user:${decoded.uid}`, 24, HOUR_MS)) {
          return NextResponse.json(
            { error: "Too many requests", code: "RATE_LIMIT" },
            { status: 429 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Unauthorized", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }
    } else {
      const ip = clientIpFromRequest(req);
      if (!consumeRateLimit(`complete:guest:${ip}`, 12, HOUR_MS)) {
        return NextResponse.json(
          { error: "Too many requests", code: "RATE_LIMIT" },
          { status: 429 }
        );
      }
    }

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
