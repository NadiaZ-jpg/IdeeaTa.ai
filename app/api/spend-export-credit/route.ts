import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb, isFirebaseAdminReady } from "@/lib/firebase-admin";

/**
 * Atomic credit spend + plan unlock (Admin transaction).
 * Clients must NOT write credits / unlocked* directly.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isFirebaseAdminReady) {
      return NextResponse.json(
        { error: "Service unavailable", code: "ADMIN_REQUIRED" },
        { status: 503 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
      uid = decoded.uid;
    } catch {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const planName = String(body?.planName || "Plan").trim() || "Plan";
    const planId = body?.planId ? String(body.planId).trim() : null;

    const userRef = adminDb.collection("users").doc(uid);

    const result = await adminDb.runTransaction(async (tx: any) => {
      const snap = await tx.get(userRef);
      const data = snap.exists ? snap.data() || {} : {};
      const credits = typeof data.credits === "number" ? data.credits : 0;
      const unlockedPlans: string[] = Array.isArray(data.unlockedPlans)
        ? data.unlockedPlans
        : [];
      const unlockedPlanIds: string[] = Array.isArray(data.unlockedPlanIds)
        ? data.unlockedPlanIds
        : [];

      const alreadyById = !!(planId && unlockedPlanIds.includes(planId));
      // Name match only for legacy clients that omit planId — never free-pass a new id
      const alreadyByName = !planId && unlockedPlans.includes(planName);
      if (alreadyById || alreadyByName) {
        return {
          success: true,
          alreadyUnlocked: true,
          credits,
          planName,
          planId,
        };
      }

      if (!planId) {
        return { success: false, code: "PLAN_ID_REQUIRED", credits };
      }

      if (credits < 1) {
        return { success: false, code: "NO_CREDITS", credits };
      }

      const nextPlans = unlockedPlans.includes(planName)
        ? unlockedPlans
        : [...unlockedPlans, planName];
      const nextIds =
        planId && !unlockedPlanIds.includes(planId)
          ? [...unlockedPlanIds, planId]
          : unlockedPlanIds;

      tx.set(
        userRef,
        {
          credits: credits - 1,
          unlockedPlans: nextPlans,
          unlockedPlanIds: nextIds,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return {
        success: true,
        alreadyUnlocked: false,
        credits: credits - 1,
        planName,
        planId,
      };
    });

    if (!result.success) {
      const status = result.code === "PLAN_ID_REQUIRED" ? 400 : 403;
      return NextResponse.json(
        { error: result.code === "PLAN_ID_REQUIRED" ? "planId required" : "No credits", code: result.code || "NO_CREDITS", credits: result.credits },
        { status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[spend-export-credit]", error);
    return NextResponse.json(
      { error: error?.message || "Spend failed", code: "SPEND_FAILED" },
      { status: 500 }
    );
  }
}
