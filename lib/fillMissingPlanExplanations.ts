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
 * If SWOT/budget rows are missing explanations, ask the model once to fill them.
 * Safe no-op when complete or when the API key / model call fails.
 */
export async function fillMissingPlanExplanations(
  plan: any,
  locale: "ro" | "en" | "es"
): Promise<any> {
  const normalized = normalizePlanResult(plan);
  if (!planNeedsExplanationFill(normalized) || !apiKey) {
    return normalized;
  }

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
}
