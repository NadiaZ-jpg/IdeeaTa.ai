import { GoogleGenAI } from "@google/genai";
import {
  buildFillMissingExplanationsPrompt,
  mergeFilledExplanations,
  normalizePlanResult,
  planNeedsExplanationFill,
  BusinessPlan,
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

async function runOneFillPass(
  plan: BusinessPlan,
  locale: "ro" | "en" | "es"
): Promise<BusinessPlan> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildFillMissingExplanationsPrompt(plan, locale),
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });
  const filled = extractJsonObject(response?.text || "");
  if (!filled) return plan;
  return mergeFilledExplanations(plan, filled);
}

/**
 * Fill missing/truncated SWOT & budget explanations (RO/EN/ES).
 * Up to 2 Gemini passes — ES cold starts often omit explicatie_tehnica / explicatie.
 * Optional timeoutMs returns best progress so far (after pass 1 if completed).
 */
export async function fillMissingPlanExplanations(
  plan: BusinessPlan,
  locale: "ro" | "en" | "es",
  timeoutMs = 0
): Promise<BusinessPlan> {
  const normalized = normalizePlanResult(plan);
  if (!planNeedsExplanationFill(normalized) || !apiKey) {
    return normalized;
  }

  const best = { plan: normalized };

  const fillPromise = (async () => {
    try {
      best.plan = await runOneFillPass(best.plan, locale);
      if (planNeedsExplanationFill(best.plan)) {
        best.plan = await runOneFillPass(best.plan, locale);
      }
      return best.plan;
    } catch (e) {
      console.error("[fillMissingPlanExplanations]", e);
      return best.plan;
    }
  })();

  if (!timeoutMs || timeoutMs <= 0) return fillPromise;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fillPromise,
      new Promise<BusinessPlan>((resolve) => {
        timer = setTimeout(() => {
          console.warn(
            `[fillMissingPlanExplanations] timeout ${timeoutMs}ms — returning ${
              planNeedsExplanationFill(best.plan) ? "still-incomplete" : "filled"
            } plan`
          );
          resolve(best.plan);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
