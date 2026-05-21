import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { result, action, customStyle } = await req.json();

    let instruction = "";
    if (action === "professional_tone") {
      instruction = `Rescrie conținutul textual (descrierea, explicațiile) pentru a avea un ton mult mai ${customStyle || 'formal, corporativ și profesionist'}, păstrând structura exactă. Nu modifica cifrele din buget.`;
    } else if (action === "optimize_budget") {
      instruction = "Redu costurile din 'buget_detaliat' cu aproximativ 20% și ajustează explicațiile arătând cum s-a făcut economia (de exemplu prin închiriere sau alternative mai ieftine). Păstrează restul documentului neatins.";
    } else if (action === "add_sections") {
      instruction = "Adaugă 2 concepte suplimentare la 'functionalitati_cheie' și extinde secțiunea 'amenintari' din analiza_swot cu încă o amenințare relevantă. Păstrează tonul existent. Nu adăuga chei noi în JSON care nu sunt în modelul inițial.";
    } else if (action === "eu_funds_optimization") {
      instruction = "Optimizează planul de afaceri pentru accesarea de Fonduri Europene. Ajustează limbajul din descriere și din explicațiile SWOT pentru a folosi termeni specifici ghidurilor de finanțare europene (cum ar fi digitalizare, inovare, sustenabilitate, economie circulară, impact regional și crearea de noi locuri de muncă). În bugetul detaliat, reformulează denumirile elementelor de cheltuieli pentru a reflecta clar categorii eligibile (cum ar fi active corporale, achiziții echipamente tehnologice, software, servicii de consultanță). Păstrează structura JSON exactă.";
    } else {
      instruction = "Oprează mici îmbunătățiri de corectură și fluență pe text.";
    }

    const prompt = `
Ai primit următorul plan de afaceri în format JSON:
${JSON.stringify(result, null, 2)}

Sarcina ta:
${instruction}

Returnează DOAR rezultatul ca un JSON valid, respectând fix aceeași schemă (nume, slogan, descriere, analiza_swot, buget_detaliat, functionalitati_cheie). Include toate lucrurile existente, doar că modificate sau îmbogățite conform instrucțiunii.
Fără niciun alt text, fără cod sursă markdown dacă se poate, doar JSON pur.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    let text = response.text || "";
    // Curățare cod markdown
    if (text.startsWith("\`\`\`json")) {
      text = text.substring(7);
      if (text.endsWith("\`\`\`")) {
        text = text.substring(0, text.length - 3);
      }
    } else if (text.startsWith("\`\`\`")) {
      text = text.substring(3);
      if (text.endsWith("\`\`\`")) {
        text = text.substring(0, text.length - 3);
      }
    }
    
    return NextResponse.json({ updatedResult: text });
  } catch (error: any) {
    console.error("Error editing content:", error);
    return NextResponse.json({ error: `Nu s-a putut edita documentul. Detalii: ${error?.message || error}` }, { status: 500 });
  }
}