import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getExchangeRateRonToEur } from "@/lib/exchangeRate";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { getGeneratePrompt } from "@/lib/promptConfig";

export const maxDuration = 60; // Max execution time 60s to allow for retries and long generations

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
const ai = new GoogleGenAI({ apiKey });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { skill, locale } = await req.json();

    // Soft Guard: Verificăm autentificarea utilizatorului și limita de planuri server-side
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        const userId = decoded.uid;

        // Numărăm planurile utilizatorului din Firestore
        const plansSnap = await adminDb
          .collection("users")
          .doc(userId)
          .collection("plans")
          .get();

        const userDoc = await adminDb.collection("users").doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        const isPaid =
          userData?.isPaid ||
          userData?.subscriptionActive ||
          userData?.euFundsUnlocked ||
          userData?.promoCodeUnlocked;

        // Dacă utilizatorul nu este Paid și are deja 4 sau mai multe planuri, blocăm generarea
        if (!isPaid && plansSnap.size >= 4) {
          return NextResponse.json(
            { error: "LIMIT_REACHED", message: "Ai atins limita de 4 planuri gratuite. Te rugăm să faci upgrade." },
            { status: 403 }
          );
        }
      } catch (e: any) {
        console.error("[Generate API Auth Guard Error]:", e.message);
        // Continuăm ca guest în caz de eroare token
      }
    }
    const prompt = getGeneratePrompt(locale, skill);

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        break; // Succes
      } catch (e: any) {
        console.error(`Eroare generare Gemini. Incercari ramase: ${retries - 1}`, e.message);
        retries--;
        if (retries === 0) throw e;
        await sleep(1500); // Retry mai rapid
      }
    }

    let text = response?.text || "";

    // Extrage doar bucata de JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const fxRate = await getExchangeRateRonToEur();

    return NextResponse.json({
      fx_rate: fxRate,
      ideas: [text]
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error?.message || "Eroare necunoscuta la generare" }, { status: 500 });
  }
}
