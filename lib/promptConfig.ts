/**
 * promptConfig.ts
 * Centralized business plan configurations, JSON skeletons, rules and helpers for RO, EN, ES.
 * Used by `/api/generate` and `/api/edit`.
 */

export const PLAN_SKELETONS = {
  en: {
    nume: "Business Name",
    slogan: "A catchy slogan",
    date_generale: {
      forma_juridica: "Ex: LLC, Sole Proprietorship, Partnership (Use target equivalents, strictly avoid Romanian terms like SRL or PFA)",
      cod_caen: "Main industry / activity code (use local equivalents e.g. SIC/NAICS or plain industry description; strictly avoid Romanian CAEN codes or Romanian law)",
      date_contact: "Ex: Legal Representative"
    },
    viziune_strategie: {
      obiective_scurt: "Objectives for 1 year",
      obiective_mediu: "Objectives for 3-5 years",
      misiune_valori: "Mission and values"
    },
    analiza_pietei: {
      clienti_tinta: "Who are the target customers?",
      concurenta: "Main competitors and advantages",
      strategie_marketing: "Marketing and pricing strategy"
    },
    analiza_swot: {
      puncte_tari: [
        { titlu: "Strength 1", explicatie_tehnica: "2-4 sentences explaining why this is a strength." },
        { titlu: "Strength 2", explicatie_tehnica: "2-4 sentences explaining why this is a strength." },
        { titlu: "Strength 3", explicatie_tehnica: "2-4 sentences explaining why this is a strength." },
        { titlu: "Strength 4", explicatie_tehnica: "2-4 sentences explaining why this is a strength." },
      ],
      puncte_slabe: [
        { titlu: "Weakness 1", explicatie_tehnica: "2-4 sentences explaining this internal weakness." },
        { titlu: "Weakness 2", explicatie_tehnica: "2-4 sentences explaining this internal weakness." },
        { titlu: "Weakness 3", explicatie_tehnica: "2-4 sentences explaining this internal weakness." },
        { titlu: "Weakness 4", explicatie_tehnica: "2-4 sentences explaining this internal weakness." },
      ],
      oportunitati: [
        { titlu: "Opportunity 1", explicatie_tehnica: "2-4 sentences on an EXTERNAL positive market opportunity (never a risk)." },
        { titlu: "Opportunity 2", explicatie_tehnica: "2-4 sentences on an EXTERNAL positive market opportunity (never a risk)." },
        { titlu: "Opportunity 3", explicatie_tehnica: "2-4 sentences on an EXTERNAL positive market opportunity (never a risk)." },
        { titlu: "Opportunity 4", explicatie_tehnica: "2-4 sentences on an EXTERNAL positive market opportunity (never a risk)." },
      ],
      amenintari: [
        { titlu: "Threat 1", explicatie_tehnica: "2-4 sentences on an EXTERNAL risk/threat (cyber risk, competition, regulation)." },
        { titlu: "Threat 2", explicatie_tehnica: "2-4 sentences on an EXTERNAL risk/threat (cyber risk, competition, regulation)." },
        { titlu: "Threat 3", explicatie_tehnica: "2-4 sentences on an EXTERNAL risk/threat (cyber risk, competition, regulation)." },
        { titlu: "Threat 4", explicatie_tehnica: "2-4 sentences on an EXTERNAL risk/threat (cyber risk, competition, regulation)." },
      ],
    },
    plan_operational: {
      descriere_flux: "Description of operations, explicitly detailing the green transition and digitalization.",
      resurse_umane: "Organigram and key roles",
      locatie_dotari: "Location and required equipment (emphasize energy efficiency and eco-friendly transport if applicable)"
    },
    plan_financiar: {
      buget_investitii: [
        { item: "Equipment/Service", explicatie: "Reasoning (must be realistic 2026 prices)", cost: "3000 EUR" }
      ],
      strategie_financiara: "Rigorous summary of the revenue model, cash-flow stability, and break-even point."
    }
  },
  es: {
    nume: "Nombre de la Empresa",
    slogan: "Un eslogan llamativo",
    date_generale: {
      forma_juridica: "Ej: S.L., Sociedad Anónima, Autónomo, Coop (Use equivalentes locales en español, evite términos rumanos como SRL o PFA)",
      cod_caen: "Código CNAE + descripción de la actividad (España; evite códigos CAEN rumanos o referencias a ley rumana)",
      date_contact: "Ej: Representante Legal"
    },
    viziune_strategie: {
      obiective_scurt: "Objetivos a corto plazo (1 año)",
      obiective_mediu: "Objetivos a medio/largo plazo (3-5 años)",
      misiune_valori: "Misión y valores"
    },
    analiza_pietei: {
      clienti_tinta: "¿Quiénes son los clientes objetivo?",
      concurenta: "Principales competidores y ventajas",
      strategie_marketing: "Estrategia de marketing y precios"
    },
    analiza_swot: {
      puncte_tari: [
        { titlu: "Fortaleza 1", explicatie_tehnica: "2-4 frases explicando por qué es una fortaleza." },
        { titlu: "Fortaleza 2", explicatie_tehnica: "2-4 frases explicando por qué es una fortaleza." },
        { titlu: "Fortaleza 3", explicatie_tehnica: "2-4 frases explicando por qué es una fortaleza." },
        { titlu: "Fortaleza 4", explicatie_tehnica: "2-4 frases explicando por qué es una fortaleza." },
      ],
      puncte_slabe: [
        { titlu: "Debilidad 1", explicatie_tehnica: "2-4 frases explicando esta debilidad interna." },
        { titlu: "Debilidad 2", explicatie_tehnica: "2-4 frases explicando esta debilidad interna." },
        { titlu: "Debilidad 3", explicatie_tehnica: "2-4 frases explicando esta debilidad interna." },
        { titlu: "Debilidad 4", explicatie_tehnica: "2-4 frases explicando esta debilidad interna." },
      ],
      oportunitati: [
        { titlu: "Oportunidad 1", explicatie_tehnica: "2-4 frases sobre una oportunidad EXTERNA positiva (nunca un riesgo)." },
        { titlu: "Oportunidad 2", explicatie_tehnica: "2-4 frases sobre una oportunidad EXTERNA positiva (nunca un riesgo)." },
        { titlu: "Oportunidad 3", explicatie_tehnica: "2-4 frases sobre una oportunidad EXTERNA positiva (nunca un riesgo)." },
        { titlu: "Oportunidad 4", explicatie_tehnica: "2-4 frases sobre una oportunidad EXTERNA positiva (nunca un riesgo)." },
      ],
      amenintari: [
        { titlu: "Amenaza 1", explicatie_tehnica: "2-4 frases sobre un riesgo/amenaza EXTERNA (ciberriesgo, competencia, regulación)." },
        { titlu: "Amenaza 2", explicatie_tehnica: "2-4 frases sobre un riesgo/amenaza EXTERNA (ciberriesgo, competencia, regulación)." },
        { titlu: "Amenaza 3", explicatie_tehnica: "2-4 frases sobre un riesgo/amenaza EXTERNA (ciberriesgo, competencia, regulación)." },
        { titlu: "Amenaza 4", explicatie_tehnica: "2-4 frases sobre un riesgo/amenaza EXTERNA (ciberriesgo, competencia, regulación)." },
      ],
    },
    plan_operational: {
      descriere_flux: "Descripción de operaciones, detallando explícitamente la transición ecológica y la digitalización.",
      resurse_umane: "Organigrama y roles clave",
      locatie_dotari: "Ubicación y equipamiento necesario (enfatizando eficiencia energética y transporte ecológico si aplica)"
    },
    plan_financiar: {
      buget_investitii: [
        { item: "Equipo/Servicio", explicatie: "Justificación (precios realistas de 2026)", cost: "3000 EUR" }
      ],
      strategie_financiara: "Resumen riguroso del modelo de ingresos, estabilidad del flujo de caja y punto de equilibrio."
    }
  },
  ro: {
    nume: "Numele Afacerii",
    slogan: "Un slogan atractiv",
    date_generale: {
      forma_juridica: "Ex: SRL, PFA, SRL-D",
      cod_caen: "Cod CAEN principal și descriere",
      date_contact: "Ex: Reprezentant Legal"
    },
    viziune_strategie: {
      obiective_scurt: "Obiective pentru primul an",
      obiective_mediu: "Obiective pentru 3-5 ani",
      misiune_valori: "Misiune și valori"
    },
    analiza_pietei: {
      clienti_tinta: "Cine sunt clienții țintă?",
      concurenta: "Principalii concurenți și avantajele noastre",
      strategie_marketing: "Strategia de marketing și prețuri"
    },
    analiza_swot: {
      puncte_tari: [
        { titlu: "Punct tare 1", explicatie_tehnica: "2-4 propoziții care explică de ce e un punct tare." },
        { titlu: "Punct tare 2", explicatie_tehnica: "2-4 propoziții care explică de ce e un punct tare." },
        { titlu: "Punct tare 3", explicatie_tehnica: "2-4 propoziții care explică de ce e un punct tare." },
        { titlu: "Punct tare 4", explicatie_tehnica: "2-4 propoziții care explică de ce e un punct tare." },
      ],
      puncte_slabe: [
        { titlu: "Punct slab 1", explicatie_tehnica: "2-4 propoziții despre această slăbiciune internă." },
        { titlu: "Punct slab 2", explicatie_tehnica: "2-4 propoziții despre această slăbiciune internă." },
        { titlu: "Punct slab 3", explicatie_tehnica: "2-4 propoziții despre această slăbiciune internă." },
        { titlu: "Punct slab 4", explicatie_tehnica: "2-4 propoziții despre această slăbiciune internă." },
      ],
      oportunitati: [
        { titlu: "Oportunitate 1", explicatie_tehnica: "2-4 propoziții despre o oportunitate EXTERNĂ pozitivă (niciodată un risc)." },
        { titlu: "Oportunitate 2", explicatie_tehnica: "2-4 propoziții despre o oportunitate EXTERNĂ pozitivă (niciodată un risc)." },
        { titlu: "Oportunitate 3", explicatie_tehnica: "2-4 propoziții despre o oportunitate EXTERNĂ pozitivă (niciodată un risc)." },
        { titlu: "Oportunitate 4", explicatie_tehnica: "2-4 propoziții despre o oportunitate EXTERNĂ pozitivă (niciodată un risc)." },
      ],
      amenintari: [
        { titlu: "Amenințare 1", explicatie_tehnica: "2-4 propoziții despre un risc/amenințare EXTERNĂ." },
        { titlu: "Amenințare 2", explicatie_tehnica: "2-4 propoziții despre un risc/amenințare EXTERNĂ." },
        { titlu: "Amenințare 3", explicatie_tehnica: "2-4 propoziții despre un risc/amenințare EXTERNĂ." },
        { titlu: "Amenințare 4", explicatie_tehnica: "2-4 propoziții despre un risc/amenințare EXTERNĂ." },
      ],
    },
    plan_operational: {
      descriere_flux: "Descrierea operațiunilor, detaliind explicit tranziția verde (Pilonul Verde) și digitalizarea (Componenta Tech).",
      resurse_umane: "Organigramă și roluri cheie",
      locatie_dotari: "Locație și echipamente necesare (accentuând eficiența energetică și transportul verde, dacă este aplicabil)"
    },
    plan_financiar: {
      buget_investitii: [
        { item: "Echipament/Serviciu", explicatie: "Justificare achiziție (prețuri realiste pentru 2026)", cost: "15000 LEI" }
      ],
      strategie_financiara: "Rezumat riguros al modelului de venituri, stabilitatea fluxului de numerar și pragul de rentabilitate."
    }
  }
};

export function getGeneratePrompt(locale: "ro" | "en" | "es", skill: string, currency: "LEI" | "EUR" = "LEI"): string {
  const isEn = locale === "en";
  const isEs = locale === "es";
  const skeleton = JSON.parse(JSON.stringify(PLAN_SKELETONS[locale] || PLAN_SKELETONS.ro));

  if (locale === "ro") {
    if (skeleton.plan_financiar?.buget_investitii?.[0]) {
      if (currency === "EUR") {
        skeleton.plan_financiar.buget_investitii[0].cost = "3000 EUR";
      } else {
        skeleton.plan_financiar.buget_investitii[0].cost = "15000 LEI";
      }
    }
  }

  if (isEn) {
    // Ensure EUR costs in skeleton for EN (same as ES)
    if (skeleton.plan_financiar?.buget_investitii?.[0]) {
      skeleton.plan_financiar.buget_investitii[0].cost = "3000 EUR";
    }
    return `Generate a comprehensive business plan in English based on the following skill or business idea: "${skill}".
It must adhere to the official standards for accessing Eco-Tech / Sustainability and Digitalization SME programs in 2026.
You must strictly follow the requirements for the green transition (Eco-Tech/Sustainability) and digitalization (Automation/ERP/CRM).
Return the result strictly as a valid JSON object with the following structure:
${JSON.stringify(skeleton, null, 2)}
Include at least 6-8 budgeted items (must include green tech and software/digitalization). Costs in EUR.
STRICT STRUCTURE RULES (do not break the app):
- Keep JSON KEY names EXACTLY as in the skeleton (do NOT translate keys). Values in English; required keys stay Romanian names: titlu, explicatie_tehnica, item, explicatie, cost, descriere_flux, resurse_umane, locatie_dotari, obiective_scurt, obiective_mediu, misiune_valori, clienti_tinta, concurenta, strategie_marketing, strategie_financiara, etc.
- NEVER rename locatie_dotari to location_facilities / facilities. Key must be exactly "locatie_dotari" with non-empty text (3-6 sentences).
- NEVER rename misiune_valori to mission_values / mission / values. Key must be exactly "misiune_valori" with non-empty text (3-6 sentences).
- plan_operational MUST include all 3 non-empty keys: "descriere_flux", "resurse_umane", "locatie_dotari".
- viziune_strategie MUST include all 3 non-empty keys: "obiective_scurt", "obiective_mediu", "misiune_valori".
- Every SWOT item MUST include BOTH "titlu" AND a non-empty "explicatie_tehnica" (2-4 sentences). Never leave explicatie_tehnica empty — not even on items 2, 3, or 4.
- CRITICAL: EVERY item in puncte_tari, puncte_slabe, oportunitati, amenintari must have its own non-empty explicatie_tehnica. Copying the title alone is forbidden.
- SWOT semantics: oportunitati = EXTERNAL positive opportunities only. amenintari = EXTERNAL risks/threats (cyber risk, competition, regulation). NEVER put risks inside oportunitati.
- Provide exactly 4 items in EACH SWOT category (puncte_tari, puncte_slabe, oportunitati, amenintari).
- Every budget row MUST include non-empty "item", "cost", AND "explicatie" (justification). Do NOT leave explicatie empty on later rows.
CRITICAL PENALTY AVOIDANCE: The entire generated content (including item names, slogans, industry/activity descriptions, detailed SWOT technical explanations, etc.) MUST be strictly in English. Use LLC/sole proprietorship etc. (never Romanian SRL/PFA). Use industry codes/descriptions appropriate for EN markets (never Romanian CAEN). Currency EUR unless specified. Even if the user provided the idea in Romanian, translate everything to English. Do NOT write any Romanian words. Failure to do so will break the application.
Do not include any other text besides the JSON block. Do not format with markdown block quotes (\`\`\`json) if possible, but if you do, it will be stripped out.`;
  }

  if (isEs) {
    // Ensure EUR costs in skeleton for ES
    if (skeleton.plan_financiar?.buget_investitii?.[0]) {
      skeleton.plan_financiar.buget_investitii[0].cost = "3000 EUR";
    }
    return `Genera un plan de negocio completo en ESPAÑOL (España / Latinoamérica formal) basado en esta idea: "${skill}".
Adáptalo a programas Eco-Tech / Sostenibilidad y Digitalización para pymes en 2026 (equivalentes locales en español, NO programas rumanos).
Sigue requisitos de transición ecológica y digitalización (Automatización/ERP/CRM).
Devuelve SOLO un JSON válido con esta estructura:
${JSON.stringify(skeleton, null, 2)}
Incluye al menos 6-8 partidas de presupuesto (tecnología verde y software/digitalización). Costes en EUR.

FORMATO DEL CONTENIDO (obligatorio — NO uses formato rumano):
- Forma jurídica: S.L., S.A., Autónomo, Cooperativa (NUNCA SRL, PFA, SRL-D u otros términos rumanos).
- Actividad económica: código CNAE español + descripción en español (NUNCA "CAEN" ni códigos rumanos).
- Mercado, precios, impuestos y tono: España / hispanohablante; moneda EUR.
- No menciones Fonduri Europene de Rumanía, ANAF, ONRC, LEI/RON ni ciudades rumanas salvo que la idea lo pida explícitamente.

REGLAS ESTRICTAS DE ESTRUCTURA (no romper la app):
- Mantén los NOMBRES de las claves JSON EXACTAMENTE como en el esqueleto (NO traduzcas las claves). Valores en español; claves OBLIGATORIAS sin traducir: titlu, explicatie_tehnica, item, explicatie, cost, descriere_flux, resurse_umane, locatie_dotari, obiective_scurt, obiective_mediu, misiune_valori, clienti_tinta, concurenta, strategie_marketing, strategie_financiara, etc.
- NUNCA renombres locatie_dotari → ubicacion / instalaciones / location_facilities. La clave debe ser exactamente "locatie_dotari" con texto NO vacío (3-6 frases).
- NUNCA renombres misiune_valori → mision_valores / mision / valores. Clave exacta "misiune_valori" con texto NO vacío (3-6 frases).
- plan_operational DEBE incluir las 3 claves con texto no vacío: "descriere_flux", "resurse_umane", "locatie_dotari".
- viziune_strategie DEBE incluir las 3 claves con texto no vacío: "obiective_scurt", "obiective_mediu", "misiune_valori".
- Cada elemento SWOT DEBE incluir AMBOS "titlu" Y "explicatie_tehnica" no vacío (2-4 frases). Nunca dejes explicatie_tehnica vacío — tampoco en los ítems 2, 3 o 4.
- CRÍTICO: CADA ítem en puncte_tari, puncte_slabe, oportunitati, amenintari debe tener su propia explicatie_tehnica no vacía. Solo el título está prohibido.
- Semántica SWOT: oportunitati = solo oportunidades EXTERNAS positivas. amenintari = riesgos/amenazas EXTERNAS (ciberriesgo, competencia, regulación). NUNCA pongas riesgos dentro de oportunitati.
- Incluye exactamente 4 elementos en CADA categoría SWOT (puncte_tari, puncte_slabe, oportunitati, amenintari).
- Cada fila de presupuesto DEBE incluir "item", "cost" Y "explicatie" no vacíos. NO dejes explicatie vacío en filas posteriores.
CRITICAL: Todo el contenido generado (nombres, eslóganes, CNAE, SWOT, presupuesto, ubicación) DEBE estar estrictamente en español. Si la idea viene en rumano u otro idioma, tradúcela por completo al español. Cero palabras en rumano.
No agregues texto fuera del JSON. Sin markdown (\`\`\`json) si es posible.`;
  }

  // Default: Română
  return `Generează un plan de afaceri cuprinzător în limba română bazat pe următoarea idee sau abilitate: "${skill}".
Trebuie să respecte standardul structural oficial din România pentru accesarea Fondurilor Europene / programelor Eco-Tech pentru IMM-uri în anul 2026.
Trebuie să urmezi cu strictețe cerințele pentru "Pilonul Verde" (Eco-Tech/Sustenabilitate) și "Digitalizare" (Automatizare/ERP/CRM).
Returnează rezultatul strict ca un obiect JSON valid cu următoarea structură:
${JSON.stringify(skeleton, null, 2)}
Include cel puțin 6-8 articole bugetate (care să conțină tehnologie verde și software/digitalizare). Toate valorile din bugetul de investiții la câmpul 'cost' trebuie exprimate obligatoriu în monedă nativă: ${currency === "EUR" ? "EUR (ex: 3000 EUR)" : "LEI (ex: 15000 LEI)"}.
REGULI STRICTE DE STRUCTURĂ:
- Păstrează EXACT numele cheilor JSON din schelet (nu le traduce).
- plan_operational trebuie să aibă text nevid la: descriere_flux, resurse_umane, locatie_dotari.
- Fiecare element SWOT trebuie să aibă ȘI "titlu" ȘI "explicatie_tehnica" nevid (2-4 propoziții). Nu lăsa explicatie_tehnica gol nici la itemele 2–4.
- CRITICAL: FIECARE item din puncte_tari, puncte_slabe, oportunitati, amenintari trebuie să aibă propria explicatie_tehnica. Doar titlul este interzis.
- Semantica SWOT: oportunitati = doar oportunități EXTERNE pozitive. amenintari = riscuri/amenințări EXTERNE. NU pune riscuri în oportunitati.
- Exact 4 elemente în FIECARE categorie SWOT.
- Fiecare rând de buget trebuie să aibă "item", "cost" ȘI "explicatie" nevide (și pe rândurile următoare).
- Fiecare linie de buget trebuie să aibă "item", "cost" ȘI "explicatie" nevide (nu folosi chei alternative precum detalii).
CRITICAL: The entire generated content (including item names, slogans, CAEN explanations, SWOT titles, etc.) MUST be strictly in Romanian. Do not write any English words.
Nu include niciun alt text în afară de blocul JSON. Nu formata cu ghilimele de bloc markdown (\`\`\`json) dacă este posibil, dar dacă o faci, acestea vor fi eliminate la parsare.`;
}

export function getEditInstruction(action: string, locale: "ro" | "en" | "es", customStyle?: string, targetSection?: string, currency: "LEI" | "EUR" = "LEI"): string {
  const isEn = locale === "en";
  const isEs = locale === "es";

  // Map tone keys to full localized instructions
  let mappedStyle = customStyle;
  if (action === "professional_tone" && customStyle) {
    const styleKey = customStyle.trim().toLowerCase();
    if (isEn) {
      if (styleKey === "formal") mappedStyle = "formal, corporate and professional";
      else if (styleKey === "creative") mappedStyle = "enthusiastic, creative and energetic";
      else if (styleKey === "persuasive") mappedStyle = "persuasive, sales-oriented and convincing";
      else if (styleKey === "friendly") mappedStyle = "friendly, simple and easy to understand";
    } else if (isEs) {
      if (styleKey === "formal") mappedStyle = "formal, corporativo y profesional";
      else if (styleKey === "creative") mappedStyle = "entusiasta, creativo y lleno de energía";
      else if (styleKey === "persuasive") mappedStyle = "persuasivo, orientado a las ventas y convincente";
      else if (styleKey === "friendly") mappedStyle = "amigable, simple y fácil de entender";
    } else { // ro / default
      if (styleKey === "formal") mappedStyle = "formal, corporativ și profesionist";
      else if (styleKey === "creative") mappedStyle = "entuziast, creativ și plin de energie";
      else if (styleKey === "persuasive") mappedStyle = "persuasiv, orientat spre vânzări și convingător";
      else if (styleKey === "friendly") mappedStyle = "prietenos, simplu și ușor de înțeles";
    }
  }

  if (isEn) {
    if (action === "professional_tone") {
      return `Rewrite the textual content to have a ${mappedStyle || 'formal, corporate and professional'} tone, keeping the exact structure. Do not change any numbers.`;
    }
    if (action === "optimize_budget") {
      return `Reduce costs in 'plan_financiar.buget_investitii' by approximately ${targetSection}%, adjust explanations showing how the savings were achieved, and translate the text inside the 'item' and 'explicatie' properties to English if they are in another language. IMPORTANT: DO NOT rename the JSON keys 'item' and 'explicatie' themselves. Keep everything else untouched.`;
    }
    if (action === "add_sections") {
      return `Generate NEW text sections for the business plan, referring strictly to the requested topics: "${targetSection || 'anything you deem necessary'}". 
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
    }
    if (action === "eu_funds_optimization") {
      return `REWRITE THE ENTIRE STRUCTURE of this business plan to be "OPTIMIZED FOR GREEN & DIGITAL FUNDING PROGRAMS".
You must align the project with strict EU/international funding criteria:
1. Strategic alignment (Relevance): Detail how the project contributes to digitalization, green transition, and reducing the carbon footprint.
2. Logical framework and KPIs: Add clear output/outcome/impact indicators in the vision and strategy.
3. Proper budgeting: Mention cost-efficiency, cash-flow stability, and eligibility of expenses in the financial strategy.
4. Horizontal criteria: Integrate gender equality, non-discrimination, and DNSH (Do No Significant Harm to the environment).
5. Sustainability: Show how the project remains viable 3-5 years after completion.
IMPORTANT: Keep the original JSON structure, but rewrite and enrich the content of existing sections! Do not change budget numbers.`;
    }
    if (action === "investor_ready") {
      return `REWRITE THE ENTIRE STRUCTURE of this business plan to attract investors and banks ("PROFESSIONAL PLAN").
Transform the language to emphasize commercial viability, risk management, and profitability:
1. Financial dynamics: Introduce Cash-Flow projections, IRR, NPV, ROI, and runway in the financial strategy.
2. Sensitivity analysis and risk scenarios: Simulate controlled failures (e.g., if costs rise or sales drop).
3. Market traction: Detail the market size (TAM, SAM, SOM), Unit Economics (CAC vs LTV 1:3), and entry barriers (Moat).
4. Financing & Exit strategy: Explain the use of funds and exit strategies (IPO, acquisition).
5. Management team: Highlight complementary skills and track record.
IMPORTANT: Keep the original JSON structure, but rewrite and enrich the content of existing sections! Do not change budget numbers.`;
    }
    if (action === "shorten_for_export") {
      return "Shorten and synthesize the text drastically. Keep the essence but use short sentences. Reduce the volume by half for presentation slides.";
    }
    return "Perform minor improvements for flow and correctness.";
  }

  if (isEs) {
    if (action === "professional_tone") {
      return `Reescribe el contenido de texto para tener un tono ${mappedStyle || 'formal, corporativo y profesional'}, manteniendo la estructura exacta. No cambies ningún número.`;
    }
    if (action === "optimize_budget") {
      return `Reduce los costes en 'plan_financiar.buget_investitii' en aproximadamente un ${targetSection}%, ajusta las explicaciones mostrando cómo se lograron los ahorros, y traduce el texto dentro de las propiedades 'item' y 'explicatie' al español. IMPORTANTE: NO cambies los nombres de las claves JSON 'item' y 'explicatie' bajo ninguna circunstancia. Mantén todo lo demás intacto.`;
    }
    if (action === "add_sections") {
      return `Genera NUEVAS secciones de texto para el plan de negocios, refiriéndose estrictamente a los temas solicitados: "${targetSection || 'lo que consideres necesario'}". 
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
    }
    if (action === "eu_funds_optimization") {
      return `REESCRIBE LA ESTRUCTURA COMPLETA de este plan de negocios para que esté "OPTIMIZADO PARA PROGRAMAS DE FINANCIACIÓN ECOLÓGICA Y DIGITAL".
Debes alinear el proyecto con los criterios estrictos de financiación:
1. Alineación estratégica (Relevancia): Detalla cómo el proyecto contribuye a la digitalización, la transición ecológica y la reducción de la huella de carbono.
2. Marco lógico y KPIs: Añade indicadores claros de output/outcome/impacto en la visión y estrategia.
3. Presupuestación adecuada: Menciona la rentabilidad, la estabilidad del flujo de caja y la elegibilidad de los gastos en la estrategia financiera.
4. Criterios horizontales: Integra la igualdad de género, la no discriminación y el principio DNSH (No causar daño significativo al medio ambiente).
5. Sostenibilidad: Muestra cómo el proyecto sigue siendo viable de 3 a 5 años después de su finalización.
IMPORTANTE: ¡Mantén la estructura JSON original, pero reescribe y enriquece el contenido de las secciones existentes! No cambies los números del presupuesto.`;
    }
    if (action === "investor_ready") {
      return `REESCRIBE LA ESTRUCTURA COMPLETA de este plan de negocios para atraer inversores y bancos ("PLAN PROFESIONAL").
Transforma el lenguaje para enfatizar la viabilidad comercial, la gestión de riesgos y la rentabilidad:
1. Dinámica financiera: Introduce proyecciones de flujo de caja, TIR, VAN, ROI y runway en la estrategia financiera.
2. Análisis de sensibilidad y escenarios de riesgo: Simula fallos controlados (ej. si los costes suben o las ventas bajan).
3. Tracción de mercado: Detalla el tamaño del mercado (TAM, SAM, SOM), Unit Economics (CAC vs LTV 1:3) y barreras de entrada (Foso/Moat).
4. Financiación y estrategia de salida: Explica el uso de fondos y las estrategias de salida (IPO, adquisición).
5. Equipo de gestión: Destaca las habilidades complementarias y la trayectoria.
IMPORTANTE: ¡Mantén la estructura JSON original, pero reescribe y enriquece el contenido de las secciones existentes! No cambies los números del presupuesto.`;
    }
    if (action === "shorten_for_export") {
      return "Acorta y sintetiza el texto drásticamente. Mantén la esencia pero usa oraciones cortas. Reduce el volumen a la mitad para diapositivas de presentación.";
    }
    return "Realiza mejoras menores para la fluidez y corrección del texto.";
  }

  // Default: Română
  if (action === "professional_tone") {
    return `Rescrie conținutul pentru a avea un ton ${mappedStyle || 'formal, corporativ și profesionist'}, păstrând structura exactă. Nu modifica cifrele.`;
  }
  if (action === "optimize_budget") {
    return `Redu costurile din 'plan_financiar.buget_investitii' cu aproximativ ${targetSection}%, ajustează explicațiile arătând cum s-a făcut economia și tradu conținutul text din proprietățile 'item' și 'explicatie' în limba română dacă sunt în altă limbă. Toate valorile rezultate pentru costuri în bugetul de investiții la câmpul 'cost' trebuie exprimate obligatoriu în moneda: ${currency}. IMPORTANT: ESTE STRICT INTERZIS să schimbi numele cheilor JSON (ele trebuie să rămână 'item' și 'explicatie'). Păstrează restul neatins.`;
  }
  if (action === "add_sections") {
    return `Generează SECȚIUNI NOI de text pentru planul de afaceri, referitoare strict la subiectele cerute: "${targetSection || 'orice consideri necesar'}". 
IMPORTANT:
- Dacă cerința utilizatorului reprezintă o comandă de ștergere sau modificare a unor lucruri existente (ex: "elimină", "şterge", "modifică capitolul X"), returnează o secțiune cu titlul "⚠️ Sfat de Editare" și explică în "continut" că acest instrument AI este doar pentru a *adăuga* secțiuni noi, iar pentru ștergeri/modificări trebuie să folosească butonul 🗑️ din Studio Editare sau să editeze manual textul.
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
  }
  if (action === "eu_funds_optimization") {
    return `RESCRIE ÎNTREAGA STRUCTURĂ a acestui plan de afaceri pentru a fi "OPTIMIZAT PENTRU FONDURI EUROPENE".
Trebuie să traduci ideea în limbajul birocratic și strategic al Uniunii Europene, bifând criteriile stricte:
1. Alinierea strategică perfectă (Relevanța): Demonstrează cum proiectul contribuie la digitalizare, tranziție verde și reducerea amprentei de carbon.
2. Matricea logică și Indicatorii de performanță (KPIs): Adaugă obiective clare (Output, Outcome, Impact) în vizune și strategie.
3. Bugetarea corectă: Menționează principiul raportului calitate-preț, cash-flow-ul și eligibilitatea cheltuielilor în strategia financiară.
4. Criterii transversale: Integrează nativ Egalitatea de șanse, non-discriminarea și principiul DNSH (Dezvoltare durabilă / A nu aduce prejudicii semnificative mediului).
5. Sustenabilitatea post-proiect: Demonstrează clar cum investiția va continua să funcționeze 3-5 ani de la finalizare.
IMPORTANT: Păstrează structura JSON originală, dar rescrie și îmbogățește masiv conținutul capitolelor existente! Nu modifica cifrele brute.`;
  }
  if (action === "investor_ready") {
    return `RESCRIE ÎNTREAGA STRUCTURĂ a acestui plan de afaceri pentru a atrage investitori și bănci ("PLAN PROFESIONIST").
Transformă limbajul pentru a pune accent masiv pe viabilitate comercială, managementul riscului și profitabilitate:
1. Dinamică financiară impecabilă: Introdu proiecții de Cash-Flow, IRR, NPV, ROI și DSCR în strategia financiară.
2. Analiza de senzitivitate și Scenarii de risc: Simulează eșecul controlat (ce se întâmplă dacă costurile cresc sau vânzările scad).
3. Validarea pieței (Market Traction): Detaliază piața (TAM, SAM, SOM), Unit Economics (CAC vs LTV 1:3) și Barierele la intrare (Moat).
4. Finanțare și Strategie de Exit: Explică 'skin in the game', destinația clară a capitalului (runway) și Strategia de Exit (IPO, achiziție).
5. Echipa de Management: Subliniază competențele complementare și track record-ul.
IMPORTANT: Păstrează structura JSON originală (viziune_strategie, analiza_pietei, plan_operational, analiza_swot, plan_financiar), dar rescrie și îmbogățește masiv conținutul capitolelor existente! Nu modifica cifrele brute ale bugetului investiției, ci adaugă explicațiile financiare teoretice în 'strategie_financiara'.`;
  }
  if (action === "shorten_for_export") {
    return "Scurtează și sintetizează drastic textul (analiza pieței, planul operațional, SWOT, strategia financiară). Menține esența dar folosește fraze scurte. Redu volumul la jumătate pentru slide-uri.";
  }
  return "Operează mici îmbunătățiri de corectură și fluență pe text.";
}

export function getEditPrompt(
  locale: "ro" | "en" | "es",
  inputData: any,
  instruction: string
): string {
  const isEn = locale === "en";
  const isEs = locale === "es";

  if (isEn) {
    return `You are an expert business consultant. 
Here is the background information of the current plan for context:
${JSON.stringify(inputData)}

YOUR TASK:
${instruction}

You must respond EXCLUSIVELY with a valid JSON.
IMPORTANT FOR JSON: 
- The entire response values (including names, slogans, SWOT titles, and technical descriptions) MUST be strictly in English. Do NOT write any Romanian or Spanish words.
- DO NOT use real unescaped newlines inside strings! For paragraphs, strictly use '\\n' (escaped).
- You MUST escape double quotes inside text using backslash (\\"). It is safest to use single quotes (') inside text.
- NO trailing commas.
- DO NOT add markdown formatting, DO NOT add backticks (\`\`\`), DO NOT add additional text before or after the JSON.`;
  }

  if (isEs) {
    return `Eres un consultor de negocios experto. 
Aquí tienes la información de fondo del plan actual para el contexto:
${JSON.stringify(inputData)}

TU TAREA:
${instruction}

Debes responder EXCLUSIVAMENTE con un JSON válido.
IMPORTANTE PARA EL JSON: 
- Todos los valores de la respuesta (incluidos nombres, eslóganes, títulos SWOT y descripciones técnicas) DEBEN estar estrictamente en español. NO escribas palabras en rumano o inglés.
- ¡NO utilices saltos de línea reales sin escapar dentro de las cadenas! Para los párrafos, usa estrictamente '\\n' (escapado).
- DEBES escapar las comillas dobles dentro del texto usando barra invertida (\\"). Lo más seguro es usar comillas simples (') dentro del texto.
- SIN comas flotantes al final (no trailing commas).
- NO agregues formato markdown, NO agregues comillas invertidas (\`\`\`), NO agregues texto adicional antes o después del JSON.`;
  }

  // Default: Română
  return `Ești un consultant de afaceri expert. 
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

export function getSegmentPrompt(locale: "ro" | "en" | "es", segment: any, instruction: string): string {
  if (locale === "es") {
    return `Eres un consultor de negocios experto.
Actúa sobre el siguiente segmento del plan de negocios.
${instruction}

Segmento de plan actual:
${JSON.stringify(segment)}

Debes responder EXCLUSIVAMENTE con un JSON válido, respetando la estructura original del segmento recibido.
Si recibiste un solo campo, devuélvelo en el mismo formato JSON.
IMPORTANTE PARA EL JSON:
- Todos los valores de la respuesta (incluidos nombres, eslóganes, títulos SWOT y descripciones técnicas) DEBEN estar estrictamente en español. NO escribas palabras en rumano o inglés.
- ¡NO utilices saltos de línea reales (unescaped newlines) dentro de los textos! Para los párrafos, usa estrictamente '\\n' (escapado).
- IMPORTANTE: Si necesitas usar comillas en los textos generados, usa estrictamente comillas simples ('). NO uses comillas dobles (") dentro de los textos bajo ninguna circunstancia, ya que romperán la estructura JSON.
- SIN comas al final del último elemento (no trailing commas).
- NO agregues formato markdown, NO agregues comillas invertidas (\`\`\`), NO agregues texto adicional antes o después del JSON.`;
  }
  if (locale === "en") {
    return `You are an expert business consultant. 
Act upon the following segment of the business plan.
${instruction}

Current plan segment:
${JSON.stringify(segment)}

You must respond EXCLUSIVELY with a valid JSON, respecting the original structure of the received segment.
If you received a single field, return it in the same JSON format.
IMPORTANT FOR JSON: 
- The entire response values (including names, slogans, SWOT titles, and technical descriptions) MUST be strictly in English. Do NOT write any Romanian or Spanish words.
- DO NOT use real unescaped newlines inside strings! For paragraphs, strictly use '\\n' (escaped).
- IMPORTANT: If you need to use quotes inside the generated texts, strictly use single quotes ('). DO NOT use double quotes (") inside the text values under any circumstances, as they break the JSON structure.
- NO trailing commas.
- DO NOT add markdown formatting, DO NOT add backticks (\`\`\`), DO NOT add additional text before or after the JSON.`;
  }
  // Default: Română
  return `Ești un consultant de afaceri expert. 
Acționează asupra următorului segment de plan de afaceri.
${instruction}

Plan curent:
${JSON.stringify(segment)}

Trebuie să răspunzi EXCLUSIV cu un JSON valid, respectând structura originală a segmentului primit.
Dacă ai primit un singur câmp, returnează-l în același format JSON.
IMPORTANT PENTRU JSON: 
- NU folosi rânduri noi reale (unescaped newlines) în interiorul string-urilor! Pentru paragrafe, folosește strict '\\n' (escapat).
- IMPORTANT: Dacă ai nevoie să folosești ghilimele în textele generate, folosește strict ghilimele simple ('). NU folosi ghilimele duble (") în interiorul textelor sub nicio formă, deoarece vor strica structura JSON-ului.
- FĂRĂ virgule la finalul ultimului element din obiect sau array (fără trailing commas).
- NU adăuga formatare markdown, NU adăuga backticks (\`\`\`), NU adăuga text adițional înainte sau după JSON.`;
}

export function getMetaPrompt(locale: "ro" | "en" | "es", result: any): string {
  if (locale === "es") {
    return `Eres un traductor y consultor experto. Traduce y localiza el siguiente objeto al español.
Asegúrate de:
1. Traducir el lema (slogan).
2. Adaptar la forma jurídica (forma_juridica) a equivalentes en español (ej. S.L., Sociedad Anónima, Autónomo, etc.) y traducir la descripción del sector del código CAEN (cod_caen) al español.
3. Traduce el texto contenido dentro de las propiedades "item" y "explicatie" de cada elemento en la lista "buget_investitii" al español. ¡NO alteres los nombres de las claves JSON (deben seguir siendo "item" y "explicatie") y NO traduzcas ni alteres los costes, monedas ni números!
4. Mantener la estructura JSON exacta del objeto recibido.

Objeto actual:
${JSON.stringify({ nume: result.nume, slogan: result.slogan, date_generale: result.date_generale, buget_investitii: result.plan_financiar?.buget_investitii || [] })}

Responde EXCLUSIVAMENTE con un JSON válido.`;
  }
  if (locale === "en") {
    return `You are an expert translator and consultant. Translate and localize the following object to English.
Ensure you:
1. Translate the slogan.
2. Adapt the legal form (forma_juridica) to English/international equivalents (e.g. LLC, Sole Proprietorship, Partnership, etc.) and translate the CAEN category description (cod_caen) to English.
3. Translate the text inside the "item" and "explicatie" properties of each element in the "buget_investitii" list to English. DO NOT change the JSON key names (they must remain exactly "item" and "explicatie") and DO NOT translate or alter costs, currencies, or numbers!
4. Keep the exact JSON structure of the received object.

Current object:
${JSON.stringify({ nume: result.nume, slogan: result.slogan, date_generale: result.date_generale, buget_investitii: result.plan_financiar?.buget_investitii || [] })}

Respond EXCLUSIVELY with a valid JSON.`;
  }
  // Default: Română
  return `Ești un consultant și traducător expert. Traduce și adaptează următorul obiect în limba română.
Asigură-te că:
1. Traduci sloganul.
2. Adaptezi forma juridică (forma_juridica) la termeni românești (ex: SRL, PFA, SA) și traduci descrierea codului CAEN în română.
3. Tradu textul din interiorul proprietăților "item" și "explicatie" pentru fiecare element din lista "buget_investitii" în limba română. ESTE STRICT INTERZIS să modifici numele cheilor JSON (ele trebuie să rămână "item" și "explicatie") și NU modifica costurile, monedele sau valorile numerice!
4. Păstrezi structura JSON exactă a obiectului primit.

Obiect curent:
${JSON.stringify({ nume: result.nume, slogan: result.slogan, date_generale: result.date_generale, buget_investitii: result.plan_financiar?.buget_investitii || [] })}

Răspunde EXCLUSIV cu un JSON valid.`;
}
