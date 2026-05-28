import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30; // Max execution time 30s to allow for retries

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { result, action, customStyle } = await req.json();

    let instruction = "";
    if (action === "professional_tone") {
      instruction = `Rescrie conținutul textual pentru a avea un ton mult mai ${customStyle || 'formal, corporativ și profesionist'}, păstrând structura exactă. Nu modifica cifrele din planul financiar.`;
    } else if (action === "optimize_budget") {
      instruction = "Redu costurile din 'plan_financiar.buget_investitii' cu aproximativ 20% și ajustează explicațiile arătând cum s-a făcut economia (de exemplu prin închiriere sau alternative mai ieftine). Păstrează restul documentului neatins.";
    } else if (action === "add_sections") {
      instruction = "Adaugă 2 concepte suplimentare la 'plan_operational' și extinde secțiunea 'amenintari' din 'analiza_swot' cu încă o amenințare relevantă. Păstrează tonul existent. Nu adăuga chei noi în JSON care nu sunt în modelul inițial.";
    } else if (action === "eu_funds_optimization") {
      instruction = "Optimizează planul de afaceri pentru accesarea de Fonduri Europene. Ajustează limbajul din plan_operational și din explicațiile SWOT pentru a folosi termeni specifici ghidurilor de finanțare europene (digitalizare, inovare, sustenabilitate, economie circulară). În planul financiar, reformulează denumirile elementelor de cheltuieli pentru a reflecta clar categorii eligibile (active corporale, achiziții echipamente tehnologice, software, servicii).";
    } else if (action === "shorten_for_export") {
      instruction = "Scurtează și sintetizează drastic întregul text (analiza pieței, planul operațional, elementele SWOT și strategia financiară). Menține esența, dar folosește fraze foarte scurte, la obiect. Redu volumul de text la jumătate pentru a te asigura că încape perfect vizual pe slide-uri de prezentare (PDF/PowerPoint).";
    } else {
      instruction = "Oprează mici îmbunătățiri de corectură și fluență pe text.";
    }

    const prompt = `
Ai primit următorul plan de afaceri în format JSON:
${JSON.stringify(result, null, 2)}

Sarcina ta:
${instruction}

Returnează DOAR rezultatul ca un JSON valid, respectând fix aceeași schemă a modelului original (date_generale, viziune_strategie, analiza_pietei, analiza_swot, plan_operational, plan_financiar). Include toate lucrurile existente, doar că modificate sau îmbogățite conform instrucțiunii.
Fără niciun alt text, fără cod sursă markdown dacă se poate, doar JSON pur.
`;

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        break; // Succes
      } catch (e: any) {
        console.error(`Eroare editare Gemini. Incercari ramase: ${retries - 1}`, e.message);
        retries--;
        if (retries === 0) throw e;
        await sleep(2500); // Așteaptă 2.5 secunde înainte de retry
      }
    }

    let text = response?.text || "";
    // Extrage doar bucata de JSON pentru a ignora eventualul text adaugat de Gemini
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    return NextResponse.json({ updatedResult: text });
  } catch (error: any) {
    console.error("Error editing content:", error);
    
    const isServiceUnavailable = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand') || error?.message?.includes('UNAVAILABLE');
    const isRateLimited = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED');
    
    let errorMessage = "Nu s-a putut edita documentul. Te rugăm să încerci din nou mai târziu.";
    let statusCode = 500;
    
    if (isServiceUnavailable) {
      errorMessage = "AI-ul este momentan foarte solicitat. Te rugăm să aștepți câteva momente și să încerci din nou.";
      statusCode = 503;
    } else if (isRateLimited) {
      errorMessage = "Ai depășit limita de utilizare. Te rugăm să aștepți un minut și să încerci din nou.";
      statusCode = 429;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}