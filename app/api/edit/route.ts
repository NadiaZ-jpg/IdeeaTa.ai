import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Returns only the subset of the plan needed for a given action
function extractRelevantSection(result: any, action: string) {
  switch (action) {
    case "optimize_budget":
      return { plan_financiar: result.plan_financiar };
    case "professional_tone":
      return {
        viziune_strategie: result.viziune_strategie,
        analiza_pietei: result.analiza_pietei,
        plan_operational: result.plan_operational,
        plan_financiar: { strategie_financiara: result.plan_financiar?.strategie_financiara },
        analiza_swot: result.analiza_swot,
      };
    case "eu_funds_optimization":
      return {
        plan_operational: result.plan_operational,
        analiza_swot: result.analiza_swot,
        plan_financiar: result.plan_financiar,
      };
    case "shorten_for_export":
      return {
        viziune_strategie: result.viziune_strategie,
        analiza_pietei: result.analiza_pietei,
        analiza_swot: result.analiza_swot,
        plan_operational: result.plan_operational,
        plan_financiar: { strategie_financiara: result.plan_financiar?.strategie_financiara },
      };
    default:
      return result;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { result, action, customStyle, targetSection } = await req.json();

    let instruction = "";
    if (action === "professional_tone") {
      instruction = `Rescrie conținutul textual pentru a avea un ton ${customStyle || 'formal, corporativ și profesionist'}, păstrând structura exactă. Nu modifica cifrele.`;
    } else if (action === "optimize_budget") {
      instruction = `Redu costurile din 'plan_financiar.buget_investitii' cu aproximativ ${targetSection}% și ajustează explicațiile arătând cum s-a făcut economia. Păstrează restul neatins.`;
    } else if (action === "add_sections") {
      instruction = `Extinde planul adăugând informații suplimentare referitoare strict la: "${targetSection || 'orice consideri necesar'}". Nu adăuga chei noi în JSON, doar extinde array-urile sau descrierile existente.`;
    } else if (action === "eu_funds_optimization") {
      instruction = "Optimizează planul pentru Fonduri Europene. Ajustează limbajul din plan_operational și SWOT (digitalizare, inovare, sustenabilitate). Reformulează elementele din planul financiar pentru categorii eligibile UE.";
    } else if (action === "investor_ready") {
      instruction = `Transformă planul într-un document pentru investitori sau credite bancare integrând:
1. Rezumat Executiv în 'viziune_strategie'.
2. Matrice de diferențiere în 'analiza_pietei.concurenta'.
3. Go-To-Market cu CAC/LTV în 'analiza_pietei.strategie_marketing'.
4. Plan de Contingență în 'analiza_swot.amenintari'.
5. 3 Scenarii Financiare (pesimist/realist/optimist) în 'plan_financiar.strategie_financiara'.`;
    } else if (action === "shorten_for_export") {
      instruction = "Scurtează și sintetizează drastic textul (analiza pieței, planul operațional, SWOT, strategia financiară). Menține esența dar folosește fraze scurte. Redu volumul la jumătate pentru slide-uri.";
    } else {
      instruction = "Operează mici îmbunătățiri de corectură și fluență pe text.";
    }

    // Use only the relevant section for most actions to reduce token usage
    const relevantData = extractRelevantSection(result, action);
    const isFullPlan = action === "investor_ready" || action === "add_sections";
    const inputData = isFullPlan ? result : relevantData;

    const prompt = `Plan de afaceri (JSON):
${JSON.stringify(inputData)}

Sarcina: ${instruction}

Returnează DOAR JSON valid cu aceeași structură ca inputul. Fără text extra, fără markdown.`;

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash-002",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        break;
      } catch (e: any) {
        console.error(`Eroare editare Gemini. Incercari ramase: ${retries - 1}`, e.message);
        retries--;
        if (retries === 0) throw e;
        await sleep(1500);
      }
    }

    let text = response?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    // Merge the partial result back into the full plan
    let mergedResult = result;
    try {
      const parsed = JSON.parse(text);
      if (!isFullPlan) {
        // Deep merge only modified sections back into original
        mergedResult = { ...result, ...parsed };
        // Preserve nested objects properly
        if (parsed.plan_financiar) mergedResult.plan_financiar = { ...result.plan_financiar, ...parsed.plan_financiar };
        if (parsed.analiza_swot) mergedResult.analiza_swot = { ...result.analiza_swot, ...parsed.analiza_swot };
        if (parsed.viziune_strategie) mergedResult.viziune_strategie = { ...result.viziune_strategie, ...parsed.viziune_strategie };
        if (parsed.analiza_pietei) mergedResult.analiza_pietei = { ...result.analiza_pietei, ...parsed.analiza_pietei };
        if (parsed.plan_operational) mergedResult.plan_operational = { ...result.plan_operational, ...parsed.plan_operational };
      } else {
        mergedResult = parsed;
      }
    } catch {
      return NextResponse.json({ updatedResult: text });
    }

    return NextResponse.json({ updatedResult: JSON.stringify(mergedResult) });
  } catch (error: any) {
    console.error("Error editing content:", error);

    const isServiceUnavailable = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE');
    const isRateLimited = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');

    let errorMessage = "Nu s-a putut edita documentul. Te rugăm să încerci din nou.";
    let statusCode = 500;

    if (isServiceUnavailable) {
      errorMessage = "Sistemul este momentan solicitat. Te rugăm să încerci din nou.";
      statusCode = 503;
    } else if (isRateLimited) {
      errorMessage = "Limită de utilizare depășită. Te rugăm să aștepți un minut.";
      statusCode = 429;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}