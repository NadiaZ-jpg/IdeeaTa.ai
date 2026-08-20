import { NextRequest, NextResponse } from "next/server";
import { fillMissingPlanExplanations } from "@/lib/fillMissingPlanExplanations";
import { planNeedsExplanationFill } from "@/lib/normalizePlanResult";
import { adminAuth } from "@/lib/firebase-admin";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/apiRateLimit";
import { isAdminEmail } from "@/lib/adminEmails";

export const maxDuration = 60;

const HOUR_MS = 60 * 60 * 1000;
/** Guest Demo ES fill — limited to curb Gemini abuse */
const GUEST_FILL_PER_HOUR = 8;

/** Fills empty SWOT/budget explanations. Auth preferred; guests allowed with IP rate limit (ES Demo). */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    let uid: string | null = null;
    let adminUser = false;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
        uid = decoded.uid;
        adminUser = isAdminEmail(decoded.email);
      } catch {
        return NextResponse.json(
          { error: "Unauthorized", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }
    }

    if (uid) {
      if (
        !adminUser &&
        !(await consumeRateLimit(`complete:user:${uid}`, 24, HOUR_MS))
      ) {
        return NextResponse.json(
          { error: "Too many requests", code: "RATE_LIMIT" },
          { status: 429 }
        );
      }
    } else {
      const ip = clientIpFromRequest(req);
      if (
        !(await consumeRateLimit(`complete:guest:${ip}`, GUEST_FILL_PER_HOUR, HOUR_MS))
      ) {
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
      filled: true,
    });
  } catch (error: any) {
    console.error("[complete-plan-fields]", error);
    return NextResponse.json(
      { error: error?.message || "Complete failed" },
      { status: 500 }
    );
  }
}
