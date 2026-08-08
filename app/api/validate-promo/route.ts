import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function readPromoEnv(serverKey: string, publicFallbackKey: string, defaultValue: string): string {
  // Preferă variabile server-only; fallback public doar pentru compat local temporar
  const raw =
    process.env[serverKey] ||
    process.env[publicFallbackKey] ||
    defaultValue;
  return raw.trim().toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { code, promoCode, userId, locale = "ro" } = await req.json();
    const getErrorMsg = (ro: string, en: string, es: string) =>
      locale === "en" ? en : locale === "es" ? es : ro;

    const actualCode = (code || promoCode || "").trim().toUpperCase();
    if (!actualCode) {
      return NextResponse.json(
        { success: false, error: getErrorMsg("Codul lipsește", "Code is missing", "Falta el código") },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: getErrorMsg(
            "Trebuie să fii autentificat pentru a aplica un cod promoțional.",
            "You must be logged in to apply a promo code.",
            "Debes iniciar sesión para aplicar un código promocional."
          ),
        },
        { status: 400 }
      );
    }

    const hasCredentials = !!(
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_PRIVATE_KEY.includes("-----BEGIN PRIVATE KEY-----")
    );

    // REGULA #21: în production NU există bypass pe NEXT_PUBLIC_*
    if (!hasCredentials) {
      if (process.env.NODE_ENV === "production") {
        console.error("[Promo] Firebase Admin credentials missing in production — refusing promo unlock.");
        return NextResponse.json(
          {
            success: false,
            error: getErrorMsg(
              "Serviciul de promoții este temporar indisponibil. Încearcă mai târziu.",
              "Promo service is temporarily unavailable. Please try again later.",
              "El servicio de promociones no está disponible temporalmente. Inténtalo más tarde."
            ),
          },
          { status: 503 }
        );
      }

      // Doar development/local: bypass controlat (fără a expune obligatoriu NEXT_PUBLIC_*)
      console.warn("[Promo] Dev-only bypass (no Firebase Admin credentials).");
      const adminCode = readPromoEnv("PROMO_ADMIN", "NEXT_PUBLIC_PROMO_ADMIN", "ADMIN_NADIA");
      const standardCode = readPromoEnv("PROMO_STANDARD", "NEXT_PUBLIC_PROMO_STANDARD", "STANDARD_NADIA");
      const fonduriCode = readPromoEnv("PROMO_FONDURI", "NEXT_PUBLIC_PROMO_FONDURI", "FONDURI_PROMO");

      if (actualCode === adminCode) {
        return NextResponse.json({
          success: true,
          tier: "full-access",
          isDevBypass: true,
          message: "Bypass Admin local aplicat cu succes!",
        });
      }
      if (actualCode === standardCode) {
        return NextResponse.json({
          success: true,
          tier: "standard",
          isDevBypass: true,
          message: "Bypass Standard local aplicat cu succes!",
        });
      }
      if (actualCode === fonduriCode) {
        return NextResponse.json({
          success: true,
          tier: "eu-funds",
          isDevBypass: true,
          message: "Bypass EU Funds local aplicat cu succes!",
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: getErrorMsg(
            "Codul promoțional nu este valid pe dev local.",
            "Promo code invalid on local dev.",
            "Código promocional no válido en desarrollo local."
          ),
        },
        { status: 400 }
      );
    }

    // Verificăm codul promoțional în colecția promo_codes din Firestore
    const promoRef = adminDb.collection("promo_codes").doc(actualCode);
    const promoSnap = await promoRef.get();

    if (!promoSnap.exists) {
      return NextResponse.json(
        {
          success: false,
          error: getErrorMsg(
            "Codul promoțional nu este valid.",
            "Invalid promo code.",
            "Código promocional inválido."
          ),
        },
        { status: 400 }
      );
    }

    const promoData = promoSnap.data() || {};
    if (promoData.active !== true) {
      return NextResponse.json(
        {
          success: false,
          error: getErrorMsg(
            "Codul promoțional a expirat sau este inactiv.",
            "Promo code expired or inactive.",
            "El código promocional ha expirado o está inactivo."
          ),
        },
        { status: 400 }
      );
    }

    // Verificare utilizare multiplă & limite (C1 + C2)
    const promoTier = promoData.tier || "full-access";
    const usedBy: string[] = promoData.usedBy || [];
    const usageLimit = promoData.usageLimit !== undefined ? Number(promoData.usageLimit) : null;

    if (usedBy.includes(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: getErrorMsg(
            "Ai folosit deja acest cod promoțional pe acest cont.",
            "You have already used this promo code on this account.",
            "Ya has usado este código promocional en esta cuenta."
          ),
        },
        { status: 400 }
      );
    }

    if (usageLimit !== null && usedBy.length >= usageLimit) {
      return NextResponse.json(
        {
          success: false,
          error: getErrorMsg(
            "Acest cod promoțional a atins limita maximă de utilizări.",
            "This promo code has reached its maximum usage limit.",
            "Este código promocional ha alcanzado su límite máximo de uso."
          ),
        },
        { status: 400 }
      );
    }

    // Deblocăm permisiunile în funcție de tier (C2)
    const userRef = adminDb.collection("users").doc(userId);
    const userUpdate: any = {
      promoCodeUnlocked: true,
      promoCodeTier: promoTier,
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

    await promoRef.update({
      usedBy: [...usedBy, userId],
    });

    console.log(`[Promo] User ${userId} unlocked access tier "${promoTier}" via database code: ${actualCode}`);

    return NextResponse.json({
      success: true,
      tier: promoTier,
      message: getErrorMsg(
        "Codul promoțional a fost aplicat cu succes!",
        "Promo code applied successfully!",
        "¡Código promocional aplicado con éxito!"
      ),
    });
  } catch (error: any) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Eroare la validarea codului promoțional." },
      { status: 500 }
    );
  }
}
