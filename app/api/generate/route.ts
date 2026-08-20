import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getExchangeRateRonToEur } from "@/lib/exchangeRate";
import { adminAuth } from "@/lib/firebase-admin";
import { getGeneratePrompt } from "@/lib/promptConfig";
import { normalizePlanResult, planNeedsExplanationFill } from "@/lib/normalizePlanResult";
import { fillMissingPlanExplanations } from "@/lib/fillMissingPlanExplanations";
import { GUEST_IP_DAILY_PLAN_LIMIT, GUEST_IP_HOURLY_ABUSE_LIMIT } from "@/lib/planQuota";
import { assertAndConsumeGenerateQuota, refundGenerateQuota, type GenerateQuotaConsume } from "@/lib/proPackQuotaAdmin";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/apiRateLimit";
import { isAdminEmail } from "@/lib/adminEmails";

export const maxDuration = 90;

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
const ai = new GoogleGenAI({ apiKey });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const DAY_MS = 24 * 60 * 60 * 1000;

type Locale = "ro" | "en" | "es";

function normalizeLocale(locale: unknown): Locale {
  return locale === "en" || locale === "es" ? locale : "ro";
}

export async function POST(req: NextRequest) {
  let generateRefund: { userId: string; consumed: GenerateQuotaConsume } | null =
    null;
  try {
    const { skill, locale: rawLocale, currency: rawCurrency, surface } = await req.json();
    const locale = normalizeLocale(rawLocale);
    const currency =
      locale === "en" || locale === "es"
        ? "EUR"
        : rawCurrency === "EUR"
        ? "EUR"
        : "RON";

    const authHeader = req.headers.get("Authorization");
    const isStudio = surface === "studio";
    const HOUR_MS = 60 * 60 * 1000;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        const userId = decoded.uid;
        const adminUser = isAdminEmail(decoded.email);

        if (
          !adminUser &&
          !(await consumeRateLimit(`gen:user:${userId}`, 30, HOUR_MS))
        ) {
          return NextResponse.json(
            { error: "Too many requests", code: "RATE_LIMIT" },
            { status: 429 }
          );
        }

        const quota = await assertAndConsumeGenerateQuota({
          userId,
          isAdmin: adminUser,
          locale,
        });
        if (!quota.ok) {
          return NextResponse.json(
            {
              error: "LIMIT_REACHED",
              code: quota.code,
              message: quota.message,
            },
            { status: 403 }
          );
        }
        generateRefund = { userId, consumed: quota.consumed };
      } catch (e: any) {
        console.error("[Generate API Auth Guard Error]:", e.message);
        return NextResponse.json(
          { error: "Unauthorized", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }
    } else {
      if (isStudio) {
        return NextResponse.json(
          { error: "Unauthorized", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }
      const ip = clientIpFromRequest(req);
      // F3: product limit of 3 guest plans per IP / day (same as client GUEST_DEMO_PLAN_LIMIT).
      if (!(await consumeRateLimit(`gen:guest-plan:${ip}`, GUEST_IP_DAILY_PLAN_LIMIT, DAY_MS))) {
        return NextResponse.json(
          {
            error: "LIMIT_REACHED",
            code: "GUEST_LIMIT",
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
      if (!(await consumeRateLimit(`gen:guest-hour:${ip}`, GUEST_IP_HOURLY_ABUSE_LIMIT, HOUR_MS))) {
        return NextResponse.json(
          { error: "Too many requests", code: "RATE_LIMIT" },
          { status: 429 }
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
            // ES plans are long; low token caps cut SWOT/budget explanations mid-JSON
            maxOutputTokens: locale === "es" ? 16384 : 12288,
          },
        });
        break;
      } catch (e: any) {
        console.error(`Eroare generare. Incercari ramase: ${retries - 1}`, e.message);
        retries--;
        if (retries === 0) throw e;
        await sleep(1500);
      }
    }

    let text = response?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    try {
      let parsedText = normalizePlanResult(JSON.parse(text));
      parsedText.selectedCurrency =
        currency || (locale === "en" || locale === "es" ? "EUR" : "RON");
      // ES models often omit SWOT/budget explanations; fill before response (Desktop+Mobile+Tablet).
      // 14s was too short (logs: timeout → partial). Allow ~50s within maxDuration 90.
      if (locale === "es" && planNeedsExplanationFill(parsedText)) {
        parsedText = await fillMissingPlanExplanations(parsedText, "es", 50000);
        // Last chance if still incomplete (e.g. first pass timed out mid-flight)
        if (planNeedsExplanationFill(parsedText)) {
          parsedText = await fillMissingPlanExplanations(parsedText, "es", 25000);
        }
      }
      text = JSON.stringify(parsedText);
    } catch (e) {
      console.warn("[generate] normalize skip:", e);
    }

    const fx_rate = await getExchangeRateRonToEur();
    return NextResponse.json({ ideas: [text], fx_rate });
  } catch (error: any) {
    if (generateRefund) {
      await refundGenerateQuota(generateRefund.userId, generateRefund.consumed);
    }
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error?.message || "Generation failed" },
      { status: 500 }
    );
  }
}
