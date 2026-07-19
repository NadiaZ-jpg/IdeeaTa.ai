import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getExchangeRateRonToEur } from "@/lib/exchangeRate";

export const maxDuration = 60; // Max execution time 60s to allow for retries and long generations

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
const ai = new GoogleGenAI({ apiKey });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { skill, locale } = await req.json();
    let prompt = "";
    if (locale === "en") {
      prompt = `
Generate a comprehensive business plan in English based on the following skill or business idea: "${skill}".
It must adhere to the official standards for accessing Eco-Tech / Sustainability and Digitalization SME programs in 2026.
You must strictly follow the requirements for the green transition (Eco-Tech/Sustainability) and digitalization (Automation/ERP/CRM).
Return the result strictly as a valid JSON object with the following structure:
{
  "nume": "Business Name",
  "slogan": "A catchy slogan",
  "date_generale": {
    "forma_juridica": "Ex: LLC, Sole Proprietorship, Partnership",
    "cod_caen": "Main Business Category / Industry description",
    "date_contact": "Ex: Legal Representative"
  },
  "viziune_strategie": {
    "obiective_scurt": "Objectives for 1 year",
    "obiective_mediu": "Objectives for 3-5 years",
    "misiune_valori": "Mission and values"
  },
  "analiza_pietei": {
    "clienti_tinta": "Who are the target customers?",
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
    "descriere_flux": "Description of operations, explicitly detailing the green transition and digitalization.",
    "resurse_umane": "Organigram and key roles",
    "locatie_dotari": "Location and required equipment (emphasize energy efficiency and eco-friendly transport if applicable)"
  },
  "plan_financiar": {
    "buget_investitii": [
      { "item": "Equipment/Service", "explicatie": "Reasoning (must be realistic 2026 prices)", "cost": "3000 EUR" }
    ],
    "strategie_financiara": "Rigorous summary of the revenue model, cash-flow stability, and break-even point."
  }
}
Include at least 6-8 budgeted items (must include green tech and software/digitalization).
Do not include any other text besides the JSON block. Do not format with markdown block quotes (\`\`\`json) if possible, but if you do, it will be stripped out.
`;
    } else if (locale === "es") {
      prompt = `
Generate a comprehensive business plan in Spanish based on the following skill or business idea: "${skill}".
It must adhere to the official standards for accessing Eco-Tech / Sustainability and Digitalization SME programs in 2026.
You must strictly follow the requirements for the green transition (Eco-Tech/Sustainability) and digitalization (Automation/ERP/CRM).
Return the result strictly as a valid JSON object with the following structure:
{
  "nume": "Nombre de la Empresa",
  "slogan": "Un eslogan llamativo",
  "date_generale": {
    "forma_juridica": "Ej: S.L., Sociedad Anónima, Autónomo, Coop",
    "cod_caen": "Categoría principal de negocio / Descripción de industria",
    "date_contact": "Ej: Representante Legal"
  },
  "viziune_strategie": {
    "obiective_scurt": "Objetivos a corto plazo (1 año)",
    "obiective_mediu": "Objetivos a medio/largo plazo (3-5 años)",
    "misiune_valori": "Misión y valores"
  },
  "analiza_pietei": {
    "clienti_tinta": "¿Quiénes son los clientes objetivo?",
    "concurenta": "Principales competidores y ventajas",
    "strategie_marketing": "Estrategia de marketing y precios"
  },
  "analiza_swot": {
    "puncte_tari": [ { "titlu": "Fortaleza 1", "explicatie_tehnica": "Explicación" } ],
    "puncte_slabe": [ { "titlu": "Debilidad 1", "explicatie_tehnica": "Explicación" } ],
    "oportunitati": [ { "titlu": "Oportunidad 1", "explicatie_tehnica": "Explicación" } ],
    "amenintari": [ { "titlu": "Amenaza 1", "explicatie_tehnica": "Explicación" } ]
  },
  "plan_operational": {
    "descriere_flux": "Descripción de operaciones, detallando explícitamente la transición ecológica y la digitalización.",
    "resurse_umane": "Organigrama y roles clave",
    "locatie_dotari": "Ubicación y equipamiento necesario (enfatizando eficiencia energética y transporte ecológico si aplica)"
  },
  "plan_financiar": {
    "buget_investitii": [
      { "item": "Equipo/Servicio", "explicatie": "Justificación (precios realistas de 2026)", "cost": "3000 EUR" }
    ],
    "strategie_financiara": "Resumen riguroso del modelo de ingresos, estabilidad del flujo de caja y punto de equilibrio."
  }
}
Include at least 6-8 budgeted items (must include green tech and software/digitalization).
Do not include any other text besides the JSON block. Do not format with markdown block quotes (\`\`\`json) if possible, but if you do, it will be stripped out.
`;
    } else {
      prompt = `
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
    }

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
