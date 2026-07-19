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
      case "eu_funds_optimization":
      case "investor_ready":
        return {
          viziune_strategie: result.viziune_strategie,
          analiza_pietei: result.analiza_pietei,
          plan_operational: result.plan_operational,
          plan_financiar: { strategie_financiara: result.plan_financiar?.strategie_financiara },
          analiza_swot: result.analiza_swot,
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
    const { result, action, customStyle, targetSection, locale } = await req.json();
    const isEn = locale === "en" || locale === "es";
    let instruction = "";
    if (locale === "en") {
      if (action === "professional_tone") {
        instruction = `Rewrite the textual content to have a ${customStyle || 'formal, corporate and professional'} tone, keeping the exact structure. Do not change any numbers.`;
      } else if (action === "optimize_budget") {
        instruction = `Reduce costs in 'plan_financiar.buget_investitii' by approximately ${targetSection}% and adjust explanations showing how the savings were achieved. Keep everything else untouched.`;
      } else if (action === "add_sections") {
        instruction = `Generate NEW text sections for the business plan, referring strictly to the requested topics: "${targetSection || 'anything you deem necessary'}". 
        IMPORTANT:
        - If the user request is a delete or modify command (e.g. "remove", "delete", "modify chapter X"), return a section titled "⚠️ Editing Tip" and explain in "continut" that this AI tool is only for adding new sections, and for deletions/modifications they should use the trash icon 🗑️ in the Studio or manually edit the text.
        - Do not use Markdown Table formatting (no vertical bars |). Structure the info as a numbered list (1., 2., 3., etc.) since the UI only displays plain text.
        - DO NOT return the current plan!
        - Return EXCLUSIVELY a JSON containing only a single key called "sectiuni_aditionale".
        - This key must be an ARRAY of objects. Each object contains "titlu" and "continut".
        - If the user asks for multiple distinct things, create SEPARATE OBJECTS for each topic in this array.
        - Content must be highly detailed and formatted with \\n for paragraphs.
        
        Exact mandatory format (example with 2 sections):
        {
          "sectiuni_aditionale": [
            {
              "titlu": "Marketing Plan",
              "continut": "Detailed marketing plan..."
            },
            {
              "titlu": "Risk Analysis",
              "continut": "Detailed risk analysis..."
            }
          ]
        }`;
      } else if (action === "eu_funds_optimization") {
        instruction = `REWRITE THE ENTIRE STRUCTURE of this business plan to be "OPTIMIZED FOR GREEN & DIGITAL FUNDING PROGRAMS".
You must align the project with strict EU/international funding criteria:
1. Strategic alignment (Relevance): Detail how the project contributes to digitalization, green transition, and reducing the carbon footprint.
2. Logical framework and KPIs: Add clear output/outcome/impact indicators in the vision and strategy.
3. Proper budgeting: Mention cost-efficiency, cash-flow stability, and eligibility of expenses in the financial strategy.
4. Horizontal criteria: Integrate gender equality, non-discrimination, and DNSH (Do No Significant Harm to the environment).
5. Sustainability: Show how the project remains viable 3-5 years after completion.
IMPORTANT: Keep the original JSON structure, but rewrite and enrich the content of existing sections! Do not change budget numbers.`;
      } else if (action === "investor_ready") {
        instruction = `REWRITE THE ENTIRE STRUCTURE of this business plan to attract investors and banks ("PROFESSIONAL PLAN").
Transform the language to emphasize commercial viability, risk management, and profitability:
1. Financial dynamics: Introduce Cash-Flow projections, IRR, NPV, ROI, and runway in the financial strategy.
2. Sensitivity analysis and risk scenarios: Simulate controlled failures (e.g., if costs rise or sales drop).
3. Market traction: Detail the market size (TAM, SAM, SOM), Unit Economics (CAC vs LTV 1:3), and entry barriers (Moat).
4. Financing & Exit strategy: Explain the use of funds and exit strategies (IPO, acquisition).
5. Management team: Highlight complementary skills and track record.
IMPORTANT: Keep the original JSON structure, but rewrite and enrich the content of existing sections! Do not change budget numbers.`;
      } else if (action === "shorten_for_export") {
        instruction = "Shorten and synthesize the text drastically. Keep the essence but use short sentences. Reduce the volume by half for presentation slides.";
      } else {
        instruction = "Perform minor improvements for flow and correctness.";
      }
    } else if (locale === "es") {
      if (action === "professional_tone") {
        instruction = `Reescribe el contenido textual para tener un tono ${customStyle || 'formal, corporativo y profesional'}, manteniendo la estructura exacta. No cambies ningún número.`;
      } else if (action === "optimize_budget") {
        instruction = `Reduce los costes en 'plan_financiar.buget_investitii' en aproximadamente un ${targetSection}% y ajusta las explicaciones mostrando cómo se lograron los ahorros. Mantén todo lo demás intacto.`;
      } else if (action === "add_sections") {
        instruction = `Genera NUEVAS secciones de texto para el plan de negocios, refiriéndote estrictamente a los temas solicitados: "${targetSection || 'lo que consideres necesario'}". 
        IMPORTANTE:
        - Si la solicitud del usuario es un comando de eliminación o modificación (ej. "eliminar", "borrar", "modificar capítulo X"), devuelve una sección titulada "⚠️ Consejo de Edición" y explica en "continut" que esta herramienta de IA es solo para *añadir* nuevas secciones, y para eliminaciones/modificaciones deben usar el icono de papelera 🗑️ en el Studio o editar el texto manualmente.
        - No utilices formato de tabla Markdown (sin barras verticales |). Estructura la información como una lista numerada (1., 2., 3., etc.) ya que la interfaz solo muestra texto plano.
        - ¡NO devuelvas el plan actual!
        - Devuelve EXCLUSIVAMENTE un JSON que contenga únicamente una clave llamada "sectiuni_aditionale".
        - Esta clave debe ser un ARRAY de objetos. Cada objeto contiene "titlu" y "continut".
        - Si el usuario solicita varias cosas distintas, crea OBJETOS SEPARADOS para cada tema en este array.
        - El contenido debe ser muy detallado y formateado con \\n para los párrafos.
        
        Formato obligatorio exacto (ejemplo con 2 secciones):
        {
          "sectiuni_aditionale": [
            {
              "titlu": "Plan de Marketing",
              "continut": "Plan de marketing detallado..."
            },
            {
              "titlu": "Análisis de Riesgos",
              "continut": "Análisis de riesgos detallado..."
            }
          ]
        }`;
      } else if (action === "eu_funds_optimization") {
        instruction = `REESCRIBE LA ESTRUCTURA COMPLETA de este plan de negocios para que esté "OPTIMIZADO PARA PROGRAMAS DE FINANCIACIÓN ECOLÓGICA Y DIGITAL".
Debes alinear el proyecto con los criterios estrictos de financiación:
1. Alineación estratégica (Relevancia): Detalla cómo el proyecto contribuye a la digitalización, la transición ecológica y la reducción de la huella de carbono.
2. Marco lógico y KPIs: Añade indicadores claros de output/outcome/impacto en la visión y estrategia.
3. Presupuestación adecuada: Menciona la rentabilidad, la estabilidad del flujo de caja y la elegibilidad de los gastos en la estrategia financiera.
4. Criterios horizontales: Integra la igualdad de género, la no discriminación y el principio DNSH (No causar daño significativo al medio ambiente).
5. Sostenibilidad: Muestra cómo el proyecto sigue siendo viable de 3 a 5 años después de su finalización.
IMPORTANTE: ¡Mantén la estructura JSON original, pero reescribe y enriquece el contenido de las secciones existentes! No cambies los números del presupuesto.`;
      } else if (action === "investor_ready") {
        instruction = `REESCRIBE LA ESTRUCTURA COMPLETA de este plan de negocios para atraer inversores y bancos ("PLAN PROFESIONAL").
Transforma el lenguaje para enfatizar la viabilidad comercial, la gestión de riesgos y la rentabilidad:
1. Dinámica financiera: Introduce proyecciones de flujo de caja, TIR, VAN, ROI y runway en la estrategia financiera.
2. Análisis de sensibilidad y escenarios de riesgo: Simula fallos controlados (ej. si los costes suben o las ventas bajan).
3. Tracción de mercado: Detalla el tamaño del mercado (TAM, SAM, SOM), Unit Economics (CAC vs LTV 1:3) y barreras de entrada (Foso/Moat).
4. Financiación y estrategia de salida: Explica el uso de fondos y las estrategias de salida (IPO, adquisición).
5. Equipo de gestión: Destaca las habilidades complementarias y la trayectoria.
IMPORTANTE: ¡Mantén la estructura JSON original, pero reescribe y enriquece el contenido de las secciones existentes! No cambies los números del presupuesto.`;
      } else if (action === "shorten_for_export") {
        instruction = "Acorta y sintetiza el texto drásticamente. Mantén la esencia pero usa oraciones cortas. Reduce el volumen a la mitad para diapositivas de presentación.";
      } else {
        instruction = "Realiza mejoras menores para la fluidez y corrección del texto.";
      }
    } else {
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
        instruction = `RESCRIE ÎNTREAGA STRUCTURĂ a acestui plan de afaceri pentru a fi "OPTIMIZAT PENTRU FONDURI EUROPENE".
  Trebuie să traduci ideea în limbajul birocratic și strategic al Uniunii Europene, bifând criteriile stricte:
  1. Alinierea strategică perfectă (Relevanța): Demonstrează cum proiectul contribuie la digitalizare, tranziție verde și reducerea amprentei de carbon.
  2. Matricea logică și Indicatorii de performanță (KPIs): Adaugă obiective clare (Output, Outcome, Impact) în vizune și strategie.
  3. Bugetarea corectă: Menționează principiul raportului calitate-preț, cash-flow-ul și eligibilitatea cheltuielilor în strategia financiară.
  4. Criterii transversale: Integrează nativ Egalitatea de șanse, non-discriminarea și principiul DNSH (Dezvoltare durabilă / A nu aduce prejudicii semnificative mediului).
  5. Sustenabilitatea post-proiect: Demonstrează clar cum investiția va continua să funcționeze 3-5 ani de la finalizare.
  IMPORTANT: Păstrează structura JSON originală, dar rescrie și îmbogățește masiv conținutul capitolelor existente! Nu modifica cifrele brute.`;
      } else if (action === "investor_ready") {
        instruction = `RESCRIE ÎNTREAGA STRUCTURĂ a acestui plan de afaceri pentru a atrage investitori și bănci ("PLAN PROFESIONIST").
  Transformă limbajul pentru a pune accent masiv pe viabilitate comercială, managementul riscului și profitabilitate:
  1. Dinamică financiară impecabilă: Introdu proiecții de Cash-Flow, IRR, NPV, ROI și DSCR în strategia financiară.
  2. Analiza de senzitivitate și Scenarii de risc: Simulează eșecul controlat (ce se întâmplă dacă costurile cresc sau vânzările scad).
  3. Validarea pieței (Market Traction): Detaliază piața (TAM, SAM, SOM), Unit Economics (CAC vs LTV 1:3) și Barierele la intrare (Moat).
  4. Finanțare și Strategie de Exit: Explică 'skin in the game', destinația clară a capitalului (runway) și Strategia de Exit (IPO, achiziție).
  5. Echipa de Management: Subliniază competențele complementare și track record-ul.
  IMPORTANT: Păstrează structura JSON originală (viziune_strategie, analiza_pietei, plan_operational, analiza_swot, plan_financiar), dar rescrie și îmbogățește masiv conținutul capitolelor existente! Nu modifica cifrele brute ale bugetului investiției, ci adaugă explicațiile financiare teoretice în 'strategie_financiara'.`;
      } else if (action === "shorten_for_export") {
        instruction = "Scurtează și sintetizează drastic textul (analiza pieței, planul operațional, SWOT, strategia financiară). Menține esența dar folosește fraze scurte. Redu volumul la jumătate pentru slide-uri.";
      } else {
        instruction = "Operează mici îmbunătățiri de corectură și fluență pe text.";
      }
    }

    // Use only the relevant section for most actions to reduce token usage
    const inputData = extractRelevantSection(result, action);

    let prompt = "";
    if (locale === "en") {
      prompt = `You are an expert business consultant. 
Here is the background information of the current plan for context:
${JSON.stringify(inputData)}

YOUR TASK:
${instruction}

You must respond EXCLUSIVELY with a valid JSON.
IMPORTANT FOR JSON: 
- DO NOT use real unescaped newlines inside strings! For paragraphs, strictly use '\\n' (escaped).
- You MUST escape double quotes inside text using backslash (\\"). It is safest to use single quotes (') inside text.
- NO trailing commas.
- DO NOT add markdown formatting, DO NOT add backticks (\`\`\`), DO NOT add additional text before or after the JSON.`;
    } else if (locale === "es") {
      prompt = `Eres un consultor de negocios experto. 
Aquí tienes la información de fondo del plan actual para el contexto:
${JSON.stringify(inputData)}

TU TAREA:
${instruction}

Debes responder EXCLUSIVAMENTE con un JSON válido.
IMPORTANTE PARA EL JSON: 
- ¡NO utilices saltos de línea reales sin escapar dentro de las cadenas! Para los párrafos, usa estrictamente '\\n' (escapado).
- DEBES escapar las comillas dobles dentro del texto usando barra invertida (\\"). Lo más seguro es usar comillas simples (') dentro del texto.
- SIN comas flotantes al final (no trailing commas).
- NO agregues formato markdown, NO agregues comillas invertidas (\`\`\`), NO agregues texto adicional antes o después del JSON.`;
    } else {
      prompt = `Ești un consultant de afaceri expert. 
Aici sunt informațiile de bază ale planului curent pentru context:
${JSON.stringify(inputData)}

SARCINA TA:
${instruction}

Trebuie să răspunzi EXCLUSIV cu un JSON valid.
IMPORTANT PENTRU JSON: 
- NU folosi rânduri noi reale (unescaped newlines) în interiorul string-urilor! Pentru paragrafe, folosește strict '\\n' (escapat).
- ESCAPEAZĂ obligatoriu ghilimelele duble din interiorul textului folosind backslash (\\"). Cel mai sigur este să folosești doar ghilimele simple (') în interiorul textului.
- FĂRĂ virgule la finalul ultimului element din obiect sau array (fără trailing commas).
- NU adăuga formatare markdown, NU adăuga backticks (\`\`\`), NU adăuga text adițional înainte sau după JSON.`;
    }

    const callGemini = async (sysPrompt: string) => {
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: sysPrompt,
            config: { responseMimeType: "application/json" }
          });
          return response.text || "";
        } catch (e: any) {
          console.error(`Eroare Gemini:`, e.message);
          retries--;
          if (retries === 0) throw e;
          await sleep(1500);
        }
      }
      return "";
    };

    const cleanJsonString = (raw: string) => {
      let t = raw.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const firstBrace = t.indexOf('{');
      const lastBrace = t.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        t = t.substring(firstBrace, lastBrace + 1);
      }
      t = t.replace(/,\s*([}\]])/g, '$1');
      t = t.replace(/"((?:[^"\\]|\\.)*)"/g, (_match: string, inner: string) => {
        return '"' + inner.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
      });
      return t;
    };

    let parsed: any = {};
    const isBigAction = action === "eu_funds_optimization" || action === "investor_ready" || action === "professional_tone";

    if (isBigAction) {
       const pViziune = { viziune_strategie: result.viziune_strategie };
       const pPiata = { analiza_pietei: result.analiza_pietei };
       const pOperational = { plan_operational: result.plan_operational };
       const pSwot = { analiza_swot: result.analiza_swot };
       const pFinanciar = { plan_financiar: { strategie_financiara: result.plan_financiar?.strategie_financiara } };

       const buildPrompt = (segment: any) => isEn ? `You are an expert business consultant. 
Act upon the following segment of the business plan.
${instruction}

Current plan segment:
${JSON.stringify(segment)}

You must respond EXCLUSIVELY with a valid JSON, respecting the original structure of the received segment.
If you received a single field, return it in the same JSON format.
IMPORTANT FOR JSON: 
- DO NOT use real unescaped newlines inside strings! For paragraphs, strictly use '\\n' (escaped).
- You MUST escape double quotes inside text using backslash (\\"). It is safest to use single quotes (') inside text.
- NO trailing commas.
- DO NOT add markdown formatting, DO NOT add backticks (\`\`\`), DO NOT add additional text before or after the JSON.` : `Ești un consultant de afaceri expert. 
Acționează asupra următorului segment de plan de afaceri.
${instruction}

Plan curent:
${JSON.stringify(segment)}

Trebuie să răspunzi EXCLUSIV cu un JSON valid, respectând structura originală a segmentului primit.
Dacă ai primit un singur câmp, returnează-l în același format JSON.
IMPORTANT PENTRU JSON: 
- NU folosi rânduri noi reale (unescaped newlines) în interiorul string-urilor! Pentru paragrafe, folosește strict '\\n' (escapat).
- ESCAPEAZĂ obligatoriu ghilimelele duble din interiorul textului folosind backslash (\\"). Cel mai sigur este să folosești doar ghilimele simple (') în interiorul textului.
- FĂRĂ virgule la finalul ultimului element din obiect sau array (fără trailing commas).
- NU adăuga formatare markdown, NU adăuga backticks (\`\`\`), NU adăuga text adițional înainte sau după JSON.`;

       const [resViz, resPiata, resOp, resSwot, resFin] = await Promise.all([
          callGemini(buildPrompt(pViziune)),
          callGemini(buildPrompt(pPiata)),
          callGemini(buildPrompt(pOperational)),
          callGemini(buildPrompt(pSwot)),
          callGemini(buildPrompt(pFinanciar))
       ]);
       
       const txtViz = cleanJsonString(resViz);
       const txtPiata = cleanJsonString(resPiata);
       const txtOp = cleanJsonString(resOp);
       const txtSwot = cleanJsonString(resSwot);
       const txtFin = cleanJsonString(resFin);

       try {
         const p1 = txtViz ? JSON.parse(txtViz) : {};
         const p2 = txtPiata ? JSON.parse(txtPiata) : {};
         const p3 = txtOp ? JSON.parse(txtOp) : {};
         const p4 = txtSwot ? JSON.parse(txtSwot) : {};
         const p5 = txtFin ? JSON.parse(txtFin) : {};
         parsed = { ...p1, ...p2, ...p3, ...p4, ...p5 };
       } catch (e: any) {
         console.error("Parse error in parallel split");
         return NextResponse.json({ error: "Eroare AI Formatare (Trunchiere pe sectiune): " + e.message + "\n\nFragmente:\n" + txtViz.substring(0, 30) + "...\n" + txtPiata.substring(0, 30) }, { status: 400 });
       }
    } else {
       if (action !== "add_sections") {
         prompt = isEn ? `You are an expert business consultant. 
Act upon the following segment of the business plan.
${instruction}

Current plan segment:
${JSON.stringify(inputData)}

You must respond EXCLUSIVELY with a valid JSON, respecting the original structure of the received segment.
If you received a single field, return it in the same JSON format.
IMPORTANT FOR JSON: 
- DO NOT use real unescaped newlines inside strings! For paragraphs, strictly use '\\n' (escaped).
- You MUST escape double quotes inside text using backslash (\\"). It is safest to use single quotes (') inside text.
- NO trailing commas.
- DO NOT add markdown formatting, DO NOT add backticks (\`\`\`), DO NOT add additional text before or after the JSON.` : `Ești un consultant de afaceri expert. 
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
- NU adăuga formatare markdown, NU adăuga backticks (\`\`\`), NU adăuga text adițional înainte sau după JSON.`;
       }
       
       const res = await callGemini(prompt);
       const text = cleanJsonString(res);
       
       try {
         parsed = JSON.parse(text);
       } catch (parseErr: any) {
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
             console.error("JSON PARSE ERROR:", parseErr, text);
             return NextResponse.json({ error: "Eroare AI Formatare: " + parseErr.message + "\n\nFragment primit: " + text.substring(0, 150) }, { status: 400 });
           }
         } else {
           console.error("JSON PARSE ERROR:", parseErr, text);
           return NextResponse.json({ error: "Eroare AI Formatare: " + parseErr.message + "\n\nFragment primit: " + text.substring(0, 150) }, { status: 400 });
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
          for (const key of Object.keys(parsed)) {
            if (Array.isArray(parsed[key])) {
              parsed = { sectiuni_aditionale: parsed[key] };
              break;
            }
          }
        }
      }
    }

      let mergedResult = { ...result, ...parsed };
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