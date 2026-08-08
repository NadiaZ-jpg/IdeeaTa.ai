import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getExchangeRateRonToEur } from "@/lib/exchangeRate";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { getGeneratePrompt } from "@/lib/promptConfig";
import { normalizePlanResult } from "@/lib/normalizePlanResult";
import { FREE_ACCOUNT_PLAN_LIMIT, GUEST_DEMO_PLAN_LIMIT } from "@/lib/planQuota";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/apiRateLimit";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
const ai = new GoogleGenAI({ apiKey });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { skill, locale, currency: rawCurrency, surface } = await req.json();
    const currency =
      locale === "en" || locale === "es"
        ? "EUR"
        : rawCurrency === "EUR"
        ? "EUR"
        : "LEI";

    const authHeader = req.headers.get("Authorization");
    const isStudio = surface === "studio";

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        const userId = decoded.uid;

        const plansSnap = await adminDb
          .collection("users")
          .doc(userId)
          .collection("plans")
          .get();

        const userDoc = await adminDb.collection("users").doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // Account-level only — never unlockedPlans / current-doc unlock
        const isAccountPaid = !!(
          userData?.isPaid ||
          userData?.subscriptionActive ||
          userData?.euFundsUnlocked ||
          userData?.promoCodeUnlocked
        );

        if (!isAccountPaid && plansSnap.size >= FREE_ACCOUNT_PLAN_LIMIT) {
          return NextResponse.json(
            {
              error: "LIMIT_REACHED",
              message:
                locale === "en"
                  ? "You reached the free plan limit. Please upgrade."
                  : locale === "es"
                  ? "Alcanzaste el límite de planes gratuitos. Mejora tu plan."
                  : "Ai atins limita de 4 planuri gratuite. Te rugăm să faci upgrade.",
            },
            { status: 403 }
          );
        }
      } catch (e: any) {
        console.error("[Generate API Auth Guard Error]:", e.message);
        return NextResponse.json(
          { error: "Unauthorized", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }
    } else {
      // Guests: Demo only. Studio must send Bearer.
      if (isStudio) {
        return NextResponse.json(
          { error: "Unauthorized", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }
      const ip = clientIpFromRequest(req);
      if (!consumeRateLimit(`gen:guest:${ip}`, GUEST_DEMO_PLAN_LIMIT, DAY_MS)) {
        return NextResponse.json(
          {
            error: "LIMIT_REACHED",
            message:
              locale === "en"
                ? "Guest generate limit reached. Create a free account."
                : locale === "es"
                ? "Límite de invitado alcanzado. Crea una cuenta gratuita."
                : "Ai atins limita de generări ca invitat. Creează un cont gratuit.",
          },
          { status: 403 }
        );
      }
    }

    const prompt = getGeneratePrompt(locale, skill, currency);

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });
        break;
      } catch (e: any) {
        console.error(`Eroare generare Gemini. Incercari ramase: ${retries - 1}`, e.message);
        retries--;
        if (retries === 0) throw e;
        await sleep(1500);
      }
    }

    let text = response?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    try {
      const parsedText = normalizePlanResult(JSON.parse(text));
      parsedText.selectedCurrency =
        currency || (locale === "en" || locale === "es" ? "EUR" : "LEI");
      text = JSON.stringify(parsedText);
    } catch (e) {
      console.warn("[generate] normalize skip:", e);
    }

    const fx_rate = await getExchangeRateRonToEur();
    return NextResponse.json({ ideas: [text], fx_rate });
  } catch (error: any) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error?.message || "Generation failed" },
      { status: 500 }
    );
  }
}
