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

    // Verificare utilizare multiplă & limite (C1 + C2)
    const promoTier = promoData.tier || "full-access"; // implicit full-access pentru coduri vechi
    const usedBy: string[] = promoData.usedBy || [];
    const usageLimit = promoData.usageLimit !== undefined ? Number(promoData.usageLimit) : null;

    if (usedBy.includes(userId)) {
      return NextResponse.json(
        { success: false, error: "Ai folosit deja acest cod promoțional pe acest cont." },
        { status: 400 }
      );
    }

    if (usageLimit !== null && usedBy.length >= usageLimit) {
      return NextResponse.json(
        { success: false, error: "Acest cod promoțional a atins limita maximă de utilizări." },
        { status: 400 }
      );
    }

    // Deblocăm permisiunile în funcție de tier (C2)
    const userRef = adminDb.collection("users").doc(userId);
    const userUpdate: any = {
      promoCodeUnlocked: true,
      promoCodeTier: promoTier
    };

    if (promoTier === "full-access") {
      userUpdate.euFundsUnlocked = true;
      userUpdate.subscriptionActive = true;
    } else if (promoTier === "eu-funds") {
      userUpdate.euFundsUnlocked = true;
    } else if (promoTier === "standard") {
      userUpdate.isPaid = true;
    }

    await userRef.update(userUpdate);

    // Salvăm utilizatorul în lista usedBy a codului promoțional (C1)
    await promoRef.update({
      usedBy: [...usedBy, userId]
    });

    console.log(`[Promo] User ${userId} unlocked access tier "${promoTier}" via database code: ${actualCode}`);

    return NextResponse.json({
      success: true,
      tier: promoTier,
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
