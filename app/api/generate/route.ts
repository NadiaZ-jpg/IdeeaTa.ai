import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getExchangeRateRonToEur } from "@/lib/exchangeRate";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

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
Generează un plan de afaceri cuprinzător în limba română bazat pe următoarea idee sau abilitate: "${skill}".
Trebuie să respecte standardul structural oficial din România pentru accesarea Fondurilor Europene / programelor Eco-Tech pentru IMM-uri în anul 2026.
Trebuie să urmezi cu strictețe cerințele pentru "Pilonul Verde" (Eco-Tech/Sustenabilitate) și "Digitalizare" (Automatizare/ERP/CRM).
Returnează rezultatul strict ca un obiect JSON valid cu următoarea structură:
{
  "nume": "Numele Afacerii",
  "slogan": "Un slogan atractiv",
  "date_generale": {
    "forma_juridica": "Ex: SRL, PFA, SRL-D",
    "cod_caen": "Cod CAEN principal și descriere",
    "date_contact": "Ex: Reprezentant Legal"
  },
  "viziune_strategie": {
    "obiective_scurt": "Obiective pentru primul an",
    "obiective_mediu": "Obiective pentru 3-5 ani",
    "misiune_valori": "Misiune și valori"
  },
  "analiza_pietei": {
    "clienti_tinta": "Cine sunt clienții țintă?",
    "concurenta": "Principalii concurenți și avantajele noastre",
    "strategie_marketing": "Strategia de marketing și prețuri"
  },
  "analiza_swot": {
    "puncte_tari": [ { "titlu": "Punct tare 1", "explicatie_tehnica": "Explicație tehnică" } ],
    "puncte_slabe": [ { "titlu": "Punct slab 1", "explicatie_tehnica": "Explicație tehnică" } ],
    "oportunitati": [ { "titlu": "Oportunitate 1", "explicatie_tehnica": "Explicație tehnică" } ],
    "amenintari": [ { "titlu": "Amenințare 1", "explicatie_tehnica": "Explicație tehnică" } ]
  },
  "plan_operational": {
    "descriere_flux": "Descrierea operațiunilor, detaliind explicit tranziția verde (Pilonul Verde) și digitalizarea (Componenta Tech).",
    "resurse_umane": "Organigramă și roluri cheie",
    "locatie_dotari": "Locație și echipamente necesare (accentuând eficiența energetică și transportul verde, dacă este aplicabil)"
  },
  "plan_financiar": {
    "buget_investitii": [
      { "item": "Echipament/Serviciu", "explicatie": "Justificare achiziție (prețuri realiste pentru 2026)", "cost": "15000 LEI" }
    ],
    "strategie_financiara": "Rezumat riguros al modelului de venituri, stabilitatea fluxului de numerar și pragul de rentabilitate."
  }
}
Include cel puțin 6-8 articole bugetate (care să conțină tehnologie verde și software/digitalizare).
Nu include niciun alt text în afară de blocul JSON. Nu formata cu ghilimele de bloc markdown (\`\`\`json) dacă este posibil, dar dacă o faci, acestea vor fi eliminate la parsare.
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
