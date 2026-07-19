import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { code, promoCode, userId } = await req.json();

    const actualCode = (code || promoCode || "").trim().toUpperCase();
    if (!actualCode) {
      return NextResponse.json(
        { success: false, error: "Codul lipsește" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Trebuie să fii autentificat pentru a aplica un cod promoțional." },
        { status: 400 }
      );
    }

    // Verificăm codul promoțional în colecția promo_codes din Firestore
    const promoRef = adminDb.collection("promo_codes").doc(actualCode);
    const promoSnap = await promoRef.get();

    if (!promoSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Codul promoțional nu este valid." },
        { status: 400 }
      );
    }

    const promoData = promoSnap.data() || {};
    if (promoData.active !== true) {
      return NextResponse.json(
        { success: false, error: "Codul promoțional a expirat sau este inactiv." },
        { status: 400 }
      );
    }

    // Deblocăm codul promoțional în profilul utilizatorului
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      promoCodeUnlocked: true,
      euFundsUnlocked: true
    });

    console.log(`[Promo] User ${userId} unlocked Studio access via database code: ${actualCode}`);

    return NextResponse.json({
      success: true,
      tier: "full-access",
      message: "Codul promoțional a fost aplicat cu succes!"
    });
  } catch (error: any) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Eroare la validarea codului promoțional." },
      { status: 500 }
    );
  }
}
