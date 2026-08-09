import { GoogleGenAI } from "@google/genai";
import {
  buildFillMissingExplanationsPrompt,
  mergeFilledExplanations,
  normalizePlanResult,
  planNeedsExplanationFill,
} from "@/lib/normalizePlanResult";

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";

function extractJsonObject(text: string): any | null {
  if (!text) return null;
  let clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  clean = clean.substring(start, end + 1).replace(/,\s*([}\]])/g, "$1");
  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

/**
 * If SWOT/budget/operational/vision fields are missing or truncated mid-sentence,
 * ask the model once to fill/repair them.
 * Safe no-op when complete or when the API key / model call fails.
 * Optional timeoutMs: return normalized plan early so /api/generate stays fast;
 * client hook useCompleteMissingPlanFields finishes the rest (Demo+Studio D/M RO/EN/ES).
 */
export async function fillMissingPlanExplanations(
  plan: any,
  locale: "ro" | "en" | "es",
  timeoutMs = 0
): Promise<any> {
  const normalized = normalizePlanResult(plan);
  if (!planNeedsExplanationFill(normalized) || !apiKey) {
    return normalized;
  }

  const fillPromise = (async () => {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: buildFillMissingExplanationsPrompt(normalized, locale),
        config: { responseMimeType: "application/json" },
      });
      const filled = extractJsonObject(response?.text || "");
      if (!filled) return normalized;
      return mergeFilledExplanations(normalized, filled);
    } catch (e) {
      console.error("[fillMissingPlanExplanations]", e);
      return normalized;
    }
  })();

  if (!timeoutMs || timeoutMs <= 0) return fillPromise;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fillPromise,
      new Promise<any>((resolve) => {
        timer = setTimeout(() => {
          console.warn(`[fillMissingPlanExplanations] timeout ${timeoutMs}ms — returning partial plan`);
          resolve(normalized);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
