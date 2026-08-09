import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { proPackGrantFields } from "@/lib/proPackQuota";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/apiRateLimit";

function readPromoEnv(serverKey: string, publicFallbackKey: string, defaultValue: string): string {
  // Preferă variabile server-only; fallback public doar pentru compat local temporar
  const raw =
    process.env[serverKey] ||
    process.env[publicFallbackKey] ||
    defaultValue;
  return raw.trim().toUpperCase();
}

async function requireAuthUid(req: NextRequest): Promise<
  { uid: string } | { error: NextResponse }
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  try {
    const token = authHeader.substring(7);
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded?.uid) {
      return {
        error: NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ),
      };
    }
    return { uid: decoded.uid };
  } catch (err) {
    console.error("[Promo] verifyIdToken failed:", err);
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, promoCode, locale = "ro" } = await req.json();
    const getErrorMsg = (ro: string, en: string, es: string) =>
      locale === "en" ? en : locale === "es" ? es : ro;

    const actualCode = (code || promoCode || "").trim().toUpperCase();
    if (!actualCode) {
      return NextResponse.json(
        { success: false, error: getErrorMsg("Codul lipsește", "Code is missing", "Falta el código") },
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

      // Dev bypass without Admin: returns success for UI/session only.
      // Entitlements cannot be client-written (firestore.rules) — configure Admin for real unlock.
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

    // Production / Admin ready: UID only from verified ID token
    const auth = await requireAuthUid(req);
    if ("error" in auth) {
      return NextResponse.json(
        {
          success: false,
          error: getErrorMsg(
            "Trebuie să fii autentificat pentru a aplica un cod promoțional.",
            "You must be logged in to apply a promo code.",
            "Debes iniciar sesión para aplicar un código promocional."
          ),
        },
        { status: 401 }
      );
    }
    const userId = auth.uid;

    const HOUR_MS = 60 * 60 * 1000;
    const ip = clientIpFromRequest(req);
    if (
      !(await consumeRateLimit(`promo:user:${userId}`, 10, HOUR_MS)) ||
      !(await consumeRateLimit(`promo:ip:${ip}`, 30, HOUR_MS))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: getErrorMsg(
            "Prea multe încercări. Reîncearcă mai târziu.",
            "Too many attempts. Please try again later.",
            "Demasiados intentos. Inténtalo más tarde."
          ),
          code: "RATE_LIMIT",
        },
        { status: 429 }
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

    // Atomic redeem: re-check limit + usedBy + user entitlements
    const userRef = adminDb.collection("users").doc(userId);
    const promoTier = promoData.tier || "full-access";

    try {
      await adminDb.runTransaction(async (tx: any) => {
        const freshPromo = await tx.get(promoRef);
        if (!freshPromo.exists) throw new Error("INVALID_PROMO");
        const fresh = freshPromo.data() || {};
        if (fresh.active !== true) throw new Error("INACTIVE_PROMO");
        const used: string[] = Array.isArray(fresh.usedBy) ? fresh.usedBy : [];
        const limit =
          fresh.usageLimit !== undefined ? Number(fresh.usageLimit) : null;
        if (used.includes(userId)) throw new Error("ALREADY_USED");
        if (limit !== null && used.length >= limit) throw new Error("LIMIT_REACHED");

        const userUpdate: any = {
          promoCodeUnlocked: true,
          promoCodeTier: promoTier,
        };
        if (promoTier === "full-access" || promoTier === "eu-funds") {
          // Same finite Pro Tools pack as paid one-time (no unlimited generate)
          Object.assign(userUpdate, proPackGrantFields((n) => FieldValue.increment(n)));
        } else if (promoTier === "standard") {
          userUpdate.standardPackageActive = true;
        }

        tx.set(userRef, userUpdate, { merge: true });
        tx.update(promoRef, { usedBy: [...used, userId] });
      });
    } catch (e: any) {
      const code = e?.message;
      if (code === "ALREADY_USED") {
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
      if (code === "LIMIT_REACHED") {
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
      if (code === "INACTIVE_PROMO" || code === "INVALID_PROMO") {
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
      throw e;
    }

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
      { success: false, error: "Promo validation failed", code: "PROMO_FAILED" },
      { status: 500 }
    );
  }
}
