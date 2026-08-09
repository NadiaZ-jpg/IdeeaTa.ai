import { NextRequest, NextResponse } from "next/server";
import {
  getLemonCheckoutUrl,
  isCheckoutTier,
  withCheckoutParams,
} from "@/lib/lemonCheckout";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    let uid: string;
    let emailFromToken: string | undefined;
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
      uid = decoded.uid;
      emailFromToken = decoded.email;
    } catch {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const { tier, email, planName, planId, locale = "ro" } = await req.json();

    if (!isCheckoutTier(tier)) {
      return NextResponse.json(
        { error: "Invalid package", code: "INVALID_TIER" },
        { status: 400 }
      );
    }

    if (tier === "pro-topup") {
      const userSnap = await adminDb.collection("users").doc(uid).get();
      const data = userSnap.exists ? userSnap.data() : {};
      if (!data?.euFundsUnlocked) {
        return NextResponse.json(
          {
            error:
              locale === "en"
                ? "Top-up requires the Pro Tools package."
                : locale === "es"
                ? "La recarga requiere el paquete Herramientas Pro."
                : "Top-up-ul necesită pachetul Instrumente Pro.",
            code: "TOPUP_REQUIRES_PACK",
          },
          { status: 403 }
        );
      }
    }

    const baseUrl = getLemonCheckoutUrl(tier, locale);
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Invalid package", code: "CHECKOUT_UNAVAILABLE" },
        { status: 400 }
      );
    }

    const checkoutUrl = withCheckoutParams(baseUrl, {
      userId: uid,
      tier,
      email: email || emailFromToken,
      planName,
      planId,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Error creating Lemon Squeezy checkout link:", error);
    return NextResponse.json(
      { error: error.message || "Checkout failed", code: "CHECKOUT_ERROR" },
      { status: 500 }
    );
  }
}
