import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
const ai = new GoogleGenAI({ apiKey });

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
    case "investor_ready":
      // Do not send the whole plan to prevent massive rewrites and timeouts.
      // We only need basic context to generate the new standalone chapter.
      return {
        nume_afacere: result.nume_afacere,
        viziune_strategie: result.viziune_strategie
      };
    case "shorten_for_export":
      return {
        viziune_strategie: result.viziune_strategie,
        analiza_pietei: result.analiza_pietei,
        analiza_swot: result.analiza_swot,
        plan_operational: result.plan_operational,
        plan_financiar: { strategie_financiara: result.plan_financiar?.strategie_financiara },
      };
    case "add_sections":
      return {
        nume_afacere: result.nume_afacere,
        viziune_strategie: result.viziune_strategie
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
      instruction = `Generează SECȚIUNI NOI de text pentru planul de afaceri, referitoare strict la subiectele cerute: "${targetSection || 'orice consideri necesar'}". 
      IMPORTANT:
      - Dacă cerința utilizatorului reprezintă o comandă de ștergere sau modificare a unor lucruri existente (ex: "elimină", "șterge", "modifică capitolul X"), returnează o secțiune cu titlul "⚠️ Sfat de Editare" și explică în "continut" că acest instrument AI este doar pentru a *adăuga* secțiuni noi, iar pentru ștergeri/modificări trebuie să folosească butonul 🗑️ din Studio Editare sau să editeze manual textul.
      - Nu folosi formatare de tip Tabel Markdown (cu bare verticale |). Structurează informația sub formă de listă numerotată (1., 2., 3. etc) deoarece interfața afișează doar text simplu.
      - NU RETURNĂ planul curent!
      - Returnează EXCLUSIV un JSON care conține doar o singură cheie numită "sectiuni_aditionale".
      - Această cheie trebuie să fie un ARRAY de obiecte. Fiecare obiect conține "titlu" și "continut".
      - Dacă utilizatorul cere mai multe lucruri distincte (ex: "plan marketing și analiza riscurilor"), creează CÂTE UN OBIECT SEPARAT pentru fiecare subiect în acest array.
      - Conținutul trebuie să fie foarte detaliat, profesional, și formatat cu \\n pentru paragrafe.
      
      Format exact obligatoriu (exemplu cu 2 secțiuni):
      {
        "sectiuni_aditionale": [
          {
            "titlu": "Planul de Marketing",
            "continut": "Textul detaliat pentru marketing..."
          },
          {
            "titlu": "Analiza Riscurilor",
            "continut": "Textul detaliat pentru riscuri..."
          }
        ]
      }`;
    } else if (action === "eu_funds_optimization") {
      instruction = `Generează un capitol complet NOU și detaliat pentru accesarea Fondurilor Europene.
OBLIGATORIU: Returnează DOAR o cheie 'sectiuni_aditionale' (o listă cu un obiect cu 'titlu' și 'continut').
Titlul trebuie să fie fix: 'Aliniere Fonduri Europene'.
Conținutul (minim 3 paragrafe detaliate) trebuie să explice convingător felul în care planul se aliniază la Pactul Verde (sustenabilitate), normele de digitalizare europene, inovare și egalitate de șanse. NU scrie și alte secțiuni!`;
    } else if (action === "investor_ready") {
      instruction = `Generează un capitol complet NOU și ultra-detaliat, optimizat special pentru atragerea de investitori și credite bancare.
OBLIGATORIU: Returnează DOAR o cheie 'sectiuni_aditionale' (o listă cu un obiect cu 'titlu' și 'continut').
Titlul trebuie să fie fix: 'Plan Profesionist (Investitori & Bănci)'.
Conținutul (minim 4 paragrafe ample) trebuie să includă o argumentație solidă de business: Rezumat Executiv, Matrice de diferențiere, Go-To-Market cu CAC/LTV, Plan de Contingență și atractivitatea scenariilor financiare. NU scrie și alte secțiuni!`;
    } else if (action === "shorten_for_export") {
      instruction = "Scurtează și sintetizează drastic textul (analiza pieței, planul operațional, SWOT, strategia financiară). Menține esența dar folosește fraze scurte. Redu volumul la jumătate pentru slide-uri.";
    } else {
      instruction = "Operează mici îmbunătățiri de corectură și fluență pe text.";
    }

    // Use only the relevant section for most actions to reduce token usage
    const inputData = extractRelevantSection(result, action);

    let prompt = `Ești un consultant de afaceri expert. 
Aici sunt informațiile de bază ale planului curent pentru context:
${JSON.stringify(inputData)}

SARCINA TA:
${instruction}

Trebuie să răspunzi EXCLUSIV cu un JSON valid.
IMPORTANT PENTRU JSON: 
- NU folosi rânduri noi reale (unescaped newlines) în interiorul string-urilor! Pentru paragrafe, folosește strict '\\n' (escapat).
- ESCAPEAZĂ obligatoriu ghilimelele duble din interiorul textului folosind backslash (\\"). Cel mai sigur este să folosești doar ghilimele simple (') în interiorul textului.
- FĂRĂ virgule la finalul ultimului element din obiect sau array (fără trailing commas).
NU adăuga formatare markdown, NU adăuga backticks (\`\`\`), NU adăuga text adițional înainte sau după JSON.`;

    if (action !== "add_sections") {
      prompt = `Ești un consultant de afaceri expert. 
Acționează asupra următorului segment de plan de afaceri.
${instruction}

Plan curent:
${JSON.stringify(inputData)}

Trebuie să răspunzi EXCLUSIV cu un JSON valid, respectând structura originală a segmentului primit.
Dacă ai primit un singur câmp, returnează-l în același format JSON.
IMPORTANT PENTRU JSON: 
- NU folosi rânduri noi reale (unescaped newlines) în interiorul string-urilor! Pentru paragrafe, folosește strict '\\n' (escapat).
- ESCAPEAZĂ obligatoriu ghilimelele duble din interiorul textului folosind backslash (\\"). Cel mai sigur este să folosești doar ghilimele simple (') în interiorul textului.
- FĂRĂ virgule la finalul ultimului element din obiect sau array (fără trailing commas).
NU adăuga formatare markdown, NU adăuga backticks (\`\`\`), NU adăuga text adițional înainte sau după JSON.`;
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
        break;
      } catch (e: any) {
        console.error(`Eroare editare Gemini. Incercari ramase: ${retries - 1}`, e.message);
        retries--;
        if (retries === 0) throw e;
        await sleep(1500);
      }
    }

    let text = response?.text || "";
    
    // Remove markdown if Gemini adds it despite responseMimeType
    text = text.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    
    // Sanitize common JSON errors
    text = text.replace(/,\s*([}\]])/g, '$1'); // Fix trailing commas
    
    // Fix unescaped control characters inside JSON string values (the main cause of "Bad control character" errors)
    // This replaces literal newlines/tabs/carriage returns inside JSON strings with their escaped versions
    text = text.replace(/"((?:[^"\\]|\\.)*)"/g, (_match: string, inner: string) => {
      const fixed = inner
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return '"' + fixed + '"';
    });

    let mergedResult = result;
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr: any) {
        // If Gemini returned multiple concatenated objects (e.g. {} {}), try to parse them as an array and take the first one
        if (parseErr.message.includes('Unexpected non-whitespace character') || parseErr.message.includes('Unexpected token')) {
          try {
            const arrayFixed = '[' + text.replace(/\}\s*\{/g, '},{').replace(/\]\s*\[/g, '],[') + ']';
            const parsedArray = JSON.parse(arrayFixed);
            if (Array.isArray(parsedArray) && parsedArray.length > 0) {
              parsed = parsedArray[0];
            } else {
              throw parseErr;
            }
          } catch {
            throw parseErr; // Throw original error if fallback fails
          }
        } else {
          throw parseErr;
        }
      }
      
      // Safety checks for add_sections in case Gemini returns an array or raw object
      if (action === "add_sections") {
        if (Array.isArray(parsed)) {
          parsed = { sectiuni_aditionale: parsed };
        } else if (parsed.titlu && parsed.continut) {
          parsed = { sectiuni_aditionale: [parsed] };
        } else if (parsed.sectiuni_aditionale && !Array.isArray(parsed.sectiuni_aditionale)) {
          parsed.sectiuni_aditionale = [parsed.sectiuni_aditionale];
        } else if (!parsed.sectiuni_aditionale) {
          // If Gemini returned something like { "noi_sectiuni": [ ... ] }
          for (const key of Object.keys(parsed)) {
            if (Array.isArray(parsed[key])) {
              parsed = { sectiuni_aditionale: parsed[key] };
              break;
            }
          }
        }
      }

      if (!isFullPlan) {
        // Deep merge only modified sections back into original
        mergedResult = { ...result, ...parsed };
        // Preserve nested objects properly
        if (parsed.plan_financiar) mergedResult.plan_financiar = { ...result.plan_financiar, ...parsed.plan_financiar };
        if (parsed.analiza_swot) mergedResult.analiza_swot = { ...result.analiza_swot, ...parsed.analiza_swot };
        if (parsed.viziune_strategie) mergedResult.viziune_strategie = { ...result.viziune_strategie, ...parsed.viziune_strategie };
        if (parsed.analiza_pietei) mergedResult.analiza_pietei = { ...result.analiza_pietei, ...parsed.analiza_pietei };
        if (parsed.plan_operational) mergedResult.plan_operational = { ...result.plan_operational, ...parsed.plan_operational };
        if (parsed.sectiuni_aditionale) {
          mergedResult.sectiuni_aditionale = result.sectiuni_aditionale 
            ? [...result.sectiuni_aditionale, ...parsed.sectiuni_aditionale]
            : parsed.sectiuni_aditionale;
        }
      } else {
        // Deep merge to avoid losing fields if AI omits them
        mergedResult = { ...result, ...parsed };
        if (parsed.plan_financiar) mergedResult.plan_financiar = { ...result.plan_financiar, ...parsed.plan_financiar };
        if (parsed.analiza_swot) mergedResult.analiza_swot = { ...result.analiza_swot, ...parsed.analiza_swot };
        if (parsed.viziune_strategie) mergedResult.viziune_strategie = { ...result.viziune_strategie, ...parsed.viziune_strategie };
        if (parsed.analiza_pietei) mergedResult.analiza_pietei = { ...result.analiza_pietei, ...parsed.analiza_pietei };
        if (parsed.plan_operational) mergedResult.plan_operational = { ...result.plan_operational, ...parsed.plan_operational };
        if (parsed.sectiuni_aditionale) {
          mergedResult.sectiuni_aditionale = result.sectiuni_aditionale 
            ? [...result.sectiuni_aditionale, ...parsed.sectiuni_aditionale]
            : parsed.sectiuni_aditionale;
        }
      }
    } catch (parseError: any) {
      console.error("JSON PARSE ERROR:", parseError, text);
      return NextResponse.json({ error: "Eroare AI Formatare: " + parseError.message + "\n\nFragment primit: " + text.substring(0, 150) }, { status: 400 });
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