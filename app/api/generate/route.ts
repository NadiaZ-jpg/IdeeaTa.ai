import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30; // Max execution time 30s to allow for retries

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { skill } = await req.json();

    const prompt = `
Generate a comprehensive business plan in Romanian based on the following skill or business idea: "${skill}".
It must adhere to the official Romanian structural standard for accessing EU Funds / SME Eco-Tech programs in 2026.
You must strictly follow the requirements for "Pilonul Verde" (Eco-Tech/Sustainability) and "Digitalizare" (Automation/ERP/CRM).
Return the result strictly as a valid JSON object with the following structure:
{
  "nume": "Business Name",
  "slogan": "A catchy slogan",
  "date_generale": {
    "forma_juridica": "Ex: SRL, PFA, SRL-D",
    "cod_caen": "Main CAEN code and description",
    "date_contact": "Ex: Reprezentant Legal"
  },
  "viziune_strategie": {
    "obiective_scurt": "Objectives for 1 year",
    "obiective_mediu": "Objectives for 3-5 years",
    "misiune_valori": "Mission and values"
  },
  "analiza_pietei": {
    "clienti_tinta": "Who are the customers?",
    "concurenta": "Main competitors and advantages",
    "strategie_marketing": "Marketing and pricing strategy"
  },
  "analiza_swot": {
    "puncte_tari": [ { "titlu": "Strength 1", "explicatie_tehnica": "Explanation" } ],
    "puncte_slabe": [ { "titlu": "Weakness 1", "explicatie_tehnica": "Explanation" } ],
    "oportunitati": [ { "titlu": "Opportunity 1", "explicatie_tehnica": "Explanation" } ],
    "amenintari": [ { "titlu": "Threat 1", "explicatie_tehnica": "Explanation" } ]
  },
  "plan_operational": {
    "descriere_flux": "Description of operations, explicitly detailing the green transition (Pilonul Verde) and digitalization (Componenta Tech).",
    "resurse_umane": "Organigram and key roles",
    "locatie_dotari": "Location and required equipment (emphasize energy efficiency and EV transport if applicable)"
  },
  "plan_financiar": {
    "buget_investitii": [
      { "item": "Equipment/Service", "explicatie": "Reasoning (must be realistic 2026 prices)", "cost": "15000 LEI" }
    ],
    "strategie_financiara": "Rigorous summary of the revenue model, cash-flow stability, and break-even point."
  }
}
Include at least 6-8 budgeted items (must include green tech and software/digitalization).
Do not include any other text besides the JSON block. Do not format with markdown block quotes (\`\`\`json) if possible, but if you do, it will be stripped out.
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
        console.error(`Eroare generare Gemini. Incercari ramase: ${retries - 1}`, e.message);
        retries--;
        if (retries === 0) throw e;
        await sleep(2500); // Așteaptă 2.5 secunde înainte de retry
      }
    }

    let text = response?.text || "";

    // Extrage doar bucata de JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    return NextResponse.json({
      fx_rate: 0.201, // 1 RON = 0.20 EUR approximately
      ideas: [text]
    });
  } catch (error: any) {
    console.error("Error generating content:", error);
    const isServiceUnavailable = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand') || error?.message?.includes('UNAVAILABLE');
    const isRateLimited = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED');
    
    let errorMessage = "Nu am putut genera planul de afaceri. Te rugăm să încerci din nou.";
    let statusCode = 500;
    
    if (isServiceUnavailable) {
        errorMessage = "AI-ul este momentan foarte solicitat. Te rugăm să încerci din nou în câteva momente.";
        statusCode = 503;
    } else if (isRateLimited) {
        errorMessage = "Ai depășit limita de utilizare (Quota Exceeded). Te rugăm să aștepți un minut și să încerci din nou.";
        statusCode = 429;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
