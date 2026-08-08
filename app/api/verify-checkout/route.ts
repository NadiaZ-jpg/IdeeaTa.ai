import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

/**
 * Poll entitlement after Lemon return URL.
 * Auth required — userId always from token (never from query spoof).
 */
export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ success: false, pending: true });
    }

    const data = userSnap.data() || {};

    let isUnlocked = false;
    if (tier === "standard") {
      isUnlocked = !!(
        data.isPaid ||
        data.promoCodeUnlocked ||
        (Array.isArray(data.unlockedPlans) && data.unlockedPlans.length > 0) ||
        (Array.isArray(data.unlockedPlanIds) && data.unlockedPlanIds.length > 0)
      );
    } else if (tier === "eu-funds") {
      isUnlocked = data.euFundsUnlocked === true;
    } else if (tier === "pro") {
      isUnlocked = data.subscriptionActive === true;
    } else {
      // No tier: any paid entitlement
      isUnlocked = !!(
        data.isPaid ||
        data.subscriptionActive ||
        data.euFundsUnlocked ||
        data.promoCodeUnlocked
      );
    }

    if (isUnlocked) {
      return NextResponse.json({ success: true, tier: tier || null });
    }

    return NextResponse.json({ success: false, pending: true });
  } catch (error: any) {
    console.error("Error verifying checkout:", error);
    return NextResponse.json(
      { error: error.message || "Checkout verify failed" },
      { status: 500 }
    );
  }
}
