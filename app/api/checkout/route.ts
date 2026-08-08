import { NextRequest, NextResponse } from "next/server";
import { getLemonCheckoutUrl, withCheckoutParams } from "@/lib/lemonCheckout";
import { adminAuth } from "@/lib/firebase-admin";

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

    const baseUrl = getLemonCheckoutUrl(tier, locale);
    if (!baseUrl) {
      return NextResponse.json({ error: "Pachet invalid" }, { status: 400 });
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
    return NextResponse.json({ error: error.message || "Eroare la procesarea plății" }, { status: 500 });
  }
}
