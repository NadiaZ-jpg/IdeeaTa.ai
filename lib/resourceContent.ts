/**
 * Public editorial resources for AdSense / SEO (RO, EN, ES).
 * Publisher content pages — Desktop + Mobile, all locales.
 */

export type ResourceLocale = "ro" | "en" | "es";

export type ResourceSlug =
  | "guide"
  | "budget"
  | "swot"
  | "eu-funds"
  | "investors"
  | "faq";

export type ResourceSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ResourceArticle = {
  slug: ResourceSlug;
  path: Record<ResourceLocale, string>;
  title: Record<ResourceLocale, string>;
  description: Record<ResourceLocale, string>;
  intro: Record<ResourceLocale, string>;
  sections: Record<ResourceLocale, ResourceSection[]>;
  ctaLabel: Record<ResourceLocale, string>;
  ctaHref: Record<ResourceLocale, string>;
};

export const RESOURCE_HUB: Record<
  ResourceLocale,
  { title: string; description: string; path: string; label: string }
> = {
  ro: {
    title: "Resurse IdeeaTa.ai",
    description:
      "Ghiduri practice pentru planuri de afaceri, buget, SWOT, fonduri europene, investitori și întrebări frecvente.",
    path: "/resurse",
    label: "Resurse",
  },
  en: {
    title: "IdeeaTa.ai Resources",
    description:
      "Practical guides for business plans, budget, SWOT, EU funding, investors, and frequently asked questions.",
    path: "/en/resources",
    label: "Resources",
  },
  es: {
    title: "Recursos IdeeaTa.ai",
    description:
      "Guías prácticas sobre planes de negocio, presupuesto, FODA, fondos europeos, inversores y preguntas frecuentes.",
    path: "/es/recursos",
    label: "Recursos",
  },
};

const DEMO_CTA = {
  ro: "/demo?start=nou",
  en: "/en/demo?start=new",
  es: "/es/demo?start=nuevo",
} as const;

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    slug: "guide",
    path: {
      ro: "/resurse/cum-scrii-un-plan-de-afaceri",
      en: "/en/resources/how-to-write-a-business-plan",
      es: "/es/recursos/como-escribir-un-plan-de-negocios",
    },
    title: {
      ro: "Cum scrii un plan de afaceri cu IdeeaTa.ai",
      en: "How to write a business plan with IdeeaTa.ai",
      es: "Cómo escribir un plan de negocios con IdeeaTa.ai",
    },
    description: {
      ro: "Pași clari de la idee la document: structură, SWOT, buget, editare în Studio și export PDF/Word/PPT.",
      en: "Clear steps from idea to document: structure, SWOT, budget, Studio editing, and PDF/Word/PPT export.",
      es: "Pasos claros de la idea al documento: estructura, FODA, presupuesto, edición en Studio y exportación PDF/Word/PPT.",
    },
    intro: {
      ro: "Un plan de afaceri bun nu e literatură — e un document de decizie. Trebuie să arate ce vinzi, cui, cu ce bani și de ce merită riscul. IdeeaTa.ai te ajută să treci de la o idee scurtă la o structură completă, pe care o poți edita, combina și descărca pe desktop sau pe telefon.",
      en: "A good business plan is not literature — it is a decision document. It must show what you sell, to whom, with what money, and why the risk is worth it. IdeeaTa.ai helps you go from a short idea to a full structure you can edit, combine, and download on desktop or mobile.",
      es: "Un buen plan de negocios no es literatura: es un documento de decisión. Debe mostrar qué vendes, a quién, con qué dinero y por qué vale el riesgo. IdeeaTa.ai te ayuda a pasar de una idea breve a una estructura completa que puedes editar, combinar y descargar en escritorio o móvil.",
    },
    sections: {
      ro: [
        {
          heading: "1. Clarifică ideea în 3–5 propoziții",
          paragraphs: [
            "Înainte să apeși Generează, scrie: problema clientului, soluția ta, cui te adresezi și cum faci bani. Cu cât e mai concretă ideea, cu atât planul generat e mai util.",
            "Exemple bune: „cafenea specialitate în cartier X, 40 locuri, abonamente cafea + evenimente” — nu doar „o cafenea”. Include locație, canal de vânzare și un preț orientativ dacă îl știi.",
            "Dacă ideea e vagă, planul va fi vag. Zece minute de claritate aici economisesc ore de editare mai târziu.",
          ],
        },
        {
          heading: "2. Generează structura de bază",
          paragraphs: [
            "În Demo sau Studio, IdeeaTa construiește capitolele esențiale: viziune și strategie, piață, operațiuni, SWOT și plan financiar (inclusiv buget de investiții).",
            "Contul gratuit îți permite să testezi fluxul. Pentru editări avansate, istoric de versiuni și instrumente Pro, folosești Studio după autentificare.",
            "Pe mobil și pe desktop fluxul e același: introduci ideea, generezi, apoi revizuiești capitol cu capitol — nu trebuie să „rescrii totul de la zero”.",
          ],
        },
        {
          heading: "3. Revizuiește cifrele și SWOT-ul",
          paragraphs: [
            "Platforma propune un punct de plecare. Tu verifici: costurile sunt realiste pentru orașul tău? Piața e corectă? SWOT-ul are explicații, nu doar titluri?",
            "Editează direct în browser, apoi Confirmă și Salvează înainte de export. Dacă un capitol e incomplet, completează-l înainte să trimiți documentul la bancă sau la un evaluator.",
            "Citește și ghidurile dedicate din Resurse despre buget și SWOT — te ajută să știi ce să corectezi.",
          ],
        },
        {
          heading: "4. Folosește instrumentele din Studio",
          paragraphs: [
            "Poți schimba tonul (formal, creativ, persuasiv), optimiza bugetul procentual, adapta planul pentru fonduri UE sau pentru investitori, și adăuga module din Librăria de Secțiuni Experte.",
            "Pe Varianta Originală, fiecare instrument creează un tab nou. Pe un alt tab, instrumentul se combină cu versiunea activă (în limitele pachetului tău).",
          ],
          bullets: [
            "Free: tab-uri simple, fără combinații lungi",
            "Standard: până la 2 tool-uri pe același lanț",
            "Instrumente Pro: până la 4 tool-uri pe același lanț",
          ],
        },
        {
          heading: "5. Exportă pentru audiența potrivită",
          paragraphs: [
            "PDF/PPT pentru pitch, Word pentru editare ulterioară, sumar gratuit când testezi. Descărcarea folosește tab-ul activ din istoric — verifică că ai selectat versiunea corectă.",
            "Înainte de trimitere, citește documentul ca un străin: are sens fără explicații orale? Dacă nu, revino în Studio și clarifică.",
          ],
        },
        {
          heading: "Greșeli frecvente de evitat",
          paragraphs: [
            "Idei generice („o aplicație”, „un magazin online”) fără nișă. Buget inventat fără prețuri reale. SWOT cu o singură linie per punct. Piață „toată lumea”.",
            "Corectează aceste puncte înainte de export. Un plan scurt și onest bate un document lung și vag.",
          ],
        },
      ],
      en: [
        {
          heading: "1. Clarify the idea in 3–5 sentences",
          paragraphs: [
            "Before you hit Generate, write: the customer problem, your solution, who you serve, and how you make money. The more concrete the idea, the more useful the generated plan.",
            "Good examples: “specialty coffee shop in district X, 40 seats, coffee subscriptions + events” — not just “a coffee shop”. Include location, sales channel, and a rough price if you know it.",
            "If the idea is vague, the plan will be vague. Ten minutes of clarity here saves hours of editing later.",
          ],
        },
        {
          heading: "2. Generate the base structure",
          paragraphs: [
            "In Demo or Studio, IdeeaTa builds the essential chapters: vision and strategy, market, operations, SWOT, and financial plan (including investment budget).",
            "A free account lets you test the flow. For advanced editing, version history, and Pro tools, use Studio after signing in.",
            "On mobile and desktop the flow is the same: enter the idea, generate, then review chapter by chapter — you do not need to rewrite everything from scratch.",
          ],
        },
        {
          heading: "3. Review numbers and SWOT",
          paragraphs: [
            "The platform proposes a starting point. You verify: are costs realistic for your city? Is the market accurate? Does every SWOT item include an explanation, not just a title?",
            "Edit in the browser, then Confirm & Save before export. If a chapter is incomplete, finish it before sending the document to a bank or evaluator.",
            "Also read the dedicated Resource guides on budget and SWOT — they show what to fix.",
          ],
        },
        {
          heading: "4. Use Studio tools",
          paragraphs: [
            "You can change tone (formal, creative, persuasive), optimize the budget by percentage, adapt the plan for EU funds or investors, and add modules from the Expert Section Library.",
            "On the Original tab, each tool creates a new tab. On another tab, the tool combines with the active version (within your plan limits).",
          ],
          bullets: [
            "Free: simple tabs, no deep combine chains",
            "Standard: up to 2 tools on the same stack",
            "Pro Tools: up to 4 tools on the same stack",
          ],
        },
        {
          heading: "5. Export for the right audience",
          paragraphs: [
            "PDF/PPT for pitch, Word for further editing, free summary when testing. Downloads use the active history tab — check that you selected the right version.",
            "Before sending, read the document as a stranger: does it make sense without spoken explanation? If not, go back to Studio and clarify.",
          ],
        },
        {
          heading: "Common mistakes to avoid",
          paragraphs: [
            "Generic ideas (“an app”, “an online store”) without a niche. Invented budgets without real prices. SWOT with one line per item. Market = “everyone”.",
            "Fix these before export. A short honest plan beats a long vague document.",
          ],
        },
      ],
      es: [
        {
          heading: "1. Aclara la idea en 3–5 frases",
          paragraphs: [
            "Antes de pulsar Generar, escribe: el problema del cliente, tu solución, a quién te diriges y cómo ganas dinero. Cuanto más concreta sea la idea, más útil será el plan generado.",
            "Buenos ejemplos: “cafetería de especialidad en el barrio X, 40 plazas, suscripciones de café + eventos” — no solo “una cafetería”. Incluye ubicación, canal de venta y un precio orientativo si lo conoces.",
            "Si la idea es vaga, el plan será vago. Diez minutos de claridad aquí ahorran horas de edición después.",
          ],
        },
        {
          heading: "2. Genera la estructura base",
          paragraphs: [
            "En Demo o Studio, IdeeaTa construye los capítulos esenciales: visión y estrategia, mercado, operaciones, FODA y plan financiero (incluido el presupuesto de inversión).",
            "La cuenta gratuita te permite probar el flujo. Para edición avanzada, historial de versiones y herramientas Pro, usa Studio tras iniciar sesión.",
            "En móvil y escritorio el flujo es el mismo: introduces la idea, generas y revisas capítulo a capítulo — no hace falta reescribirlo todo desde cero.",
          ],
        },
        {
          heading: "3. Revisa cifras y FODA",
          paragraphs: [
            "La plataforma propone un punto de partida. Tú verificas: ¿son realistas los costes para tu ciudad? ¿Es correcto el mercado? ¿Cada punto FODA tiene explicación, no solo título?",
            "Edita en el navegador y luego Confirma y Guarda antes de exportar. Si un capítulo está incompleto, termínalo antes de enviarlo a un banco o evaluador.",
            "Lee también las guías de Recursos sobre presupuesto y FODA: te ayudan a saber qué corregir.",
          ],
        },
        {
          heading: "4. Usa las herramientas de Studio",
          paragraphs: [
            "Puedes cambiar el tono (formal, creativo, persuasivo), optimizar el presupuesto porcentualmente, adaptar el plan a fondos UE o inversores, y añadir módulos de la Biblioteca Experta.",
            "En la pestaña Original, cada herramienta crea una pestaña nueva. En otra pestaña, la herramienta se combina con la versión activa (según tu paquete).",
          ],
          bullets: [
            "Free: pestañas simples, sin cadenas largas",
            "Standard: hasta 2 herramientas en la misma cadena",
            "Herramientas Pro: hasta 4 herramientas en la misma cadena",
          ],
        },
        {
          heading: "5. Exporta para la audiencia correcta",
          paragraphs: [
            "PDF/PPT para el pitch, Word para seguir editando, resumen gratuito al probar. La descarga usa la pestaña activa del historial — comprueba que elegiste la versión correcta.",
            "Antes de enviar, lee el documento como un desconocido: ¿tiene sentido sin explicación oral? Si no, vuelve a Studio y aclara.",
          ],
        },
        {
          heading: "Errores frecuentes a evitar",
          paragraphs: [
            "Ideas genéricas (“una app”, “una tienda online”) sin nicho. Presupuesto inventado sin precios reales. FODA con una sola línea por punto. Mercado = “todo el mundo”.",
            "Corrige esto antes de exportar. Un plan corto y honesto supera a un documento largo y vago.",
          ],
        },
      ],
    },
    ctaLabel: {
      ro: "Începe un plan gratuit",
      en: "Start a free plan",
      es: "Empieza un plan gratis",
    },
    ctaHref: { ...DEMO_CTA },
  },
  {
    slug: "budget",
    path: {
      ro: "/resurse/buget-de-investitii-realist",
      en: "/en/resources/realistic-investment-budget",
      es: "/es/recursos/presupuesto-de-inversion-realista",
    },
    title: {
      ro: "Buget de investiții realist: cum îl verifici într-un plan",
      en: "A realistic investment budget: how to check it in a plan",
      es: "Presupuesto de inversión realista: cómo verificarlo en un plan",
    },
    description: {
      ro: "Ce trebuie să conțină un buget credibil: categorii, explicații, cash-flow și greșeli tipice pe care le văd băncile și evaluatorii.",
      en: "What a credible budget needs: categories, explanations, cash-flow, and typical mistakes banks and evaluators spot.",
      es: "Qué necesita un presupuesto creíble: categorías, explicaciones, flujo de caja y errores típicos que ven bancos y evaluadores.",
    },
    intro: {
      ro: "Bugetul e locul unde un plan pierde credibilitate rapid. Cifre rotunde fără explicație, echipamente „din aer” sau cash-flow care nu acoperă primele luni ridică semnale roșii. Acest ghid arată ce să verifici — pe desktop sau pe mobil — înainte să exporți.",
      en: "The budget is where a plan loses credibility fast. Round numbers with no explanation, equipment from thin air, or cash-flow that cannot cover the first months raise red flags. This guide shows what to check — on desktop or mobile — before you export.",
      es: "El presupuesto es donde un plan pierde credibilidad rápido. Cifras redondas sin explicación, equipos “de la nada” o un flujo de caja que no cubre los primeros meses levantan alertas. Esta guía muestra qué revisar — en escritorio o móvil — antes de exportar.",
    },
    sections: {
      ro: [
        {
          heading: "Separă investiția de cheltuielile de operare",
          paragraphs: [
            "Investiția (CAPEX) e ce cumperi o dată ca să pornești: echipamente, amenajare, licențe, stoc inițial. Operarea (OPEX) e ce plătești lunar: chirie, salarii, marketing, utilități.",
            "Amestecarea celor două confundă cititorul. În plan, listează clar ce e one-time și ce e recurent.",
          ],
        },
        {
          heading: "Fiecare linie mare are nevoie de explicație",
          paragraphs: [
            "„Echipamente — 40.000” fără detalii nu ajunge. Notează ce cumperi, de ce e necesar și pe ce te bazezi (ofertă, catalog, experiență din industrie).",
            "În IdeeaTa, câmpul de explicație de lângă sumă e exact pentru asta. Dacă textul e tăiat sau gol, completează-l înainte de export.",
          ],
        },
        {
          heading: "Cash-flow pentru primele 6–12 luni",
          paragraphs: [
            "Chiar cu investiție acoperită, ai nevoie de lichiditate până apar venituri stabile. Include o rezervă de operare (runway) realistă.",
            "Verifică: dacă vânzările întârziesc cu 2–3 luni, mai ai bani de chirie și salarii? Dacă răspunsul e nu, bugetul e subdimensionat.",
          ],
        },
        {
          heading: "Optimizarea procentuală a bugetului",
          paragraphs: [
            "În Studio poți reduce sau redistribui bugetul cu un procent (de exemplu −20%) ca să testezi scenarii. Folosește asta ca exercițiu de senzitivitate, nu ca „truc” ca să arate mai ieftin fără argument.",
            "După optimizare, recitiți explicațiile: sumă și justificare trebuie să rămână coerente.",
          ],
        },
        {
          heading: "Greșeli tipice",
          paragraphs: ["Evitați:"],
          bullets: [
            "Sume rotunde fără sursă (10.000, 50.000, 100.000)",
            "Zero rezervă pentru neprevăzut",
            "Marketing = 0 în primul an (nerealist pentru majoritatea afacerilor)",
            "Salarii sub minimul pieței locale",
            "Lipsă TVA / taxe unde e cazul",
          ],
        },
        {
          heading: "Checklist rapid înainte de export",
          paragraphs: [
            "Trece prin listă pe telefon sau pe desktop: fiecare linie mare are explicație? Totalul bate cu suma pe categorii? Ai runway? Ai scenariu pesimist?",
            "Dacă trimiți planul la fonduri UE, verifică și eligibilitatea cheltuielilor în ghidul apelului — nu orice cost „necesar” e și eligibil.",
          ],
        },
      ],
      en: [
        {
          heading: "Separate investment from operating spend",
          paragraphs: [
            "Investment (CAPEX) is what you buy once to start: equipment, fit-out, licenses, initial stock. Operations (OPEX) is what you pay monthly: rent, salaries, marketing, utilities.",
            "Mixing the two confuses the reader. In the plan, clearly list what is one-time and what is recurring.",
          ],
        },
        {
          heading: "Every major line needs an explanation",
          paragraphs: [
            "“Equipment — 40,000” with no detail is not enough. Note what you buy, why it is needed, and what you base it on (quote, catalog, industry experience).",
            "In IdeeaTa, the explanation field next to the amount is for exactly that. If the text is cut off or empty, complete it before export.",
          ],
        },
        {
          heading: "Cash-flow for the first 6–12 months",
          paragraphs: [
            "Even with investment covered, you need liquidity until revenue stabilizes. Include a realistic operating reserve (runway).",
            "Check: if sales are 2–3 months late, can you still pay rent and salaries? If not, the budget is undersized.",
          ],
        },
        {
          heading: "Percentage budget optimization",
          paragraphs: [
            "In Studio you can cut or redistribute the budget by a percentage (for example −20%) to test scenarios. Use this as a sensitivity exercise, not a trick to look cheaper without arguments.",
            "After optimization, re-read the explanations: amount and justification must stay coherent.",
          ],
        },
        {
          heading: "Typical mistakes",
          paragraphs: ["Avoid:"],
          bullets: [
            "Round sums with no source (10,000 / 50,000 / 100,000)",
            "Zero contingency reserve",
            "Marketing = 0 in year one (unrealistic for most businesses)",
            "Salaries below the local market",
            "Missing VAT / taxes where applicable",
          ],
        },
        {
          heading: "Quick checklist before export",
          paragraphs: [
            "Go through the list on phone or desktop: does every major line have an explanation? Do totals match categories? Do you have runway? Do you have a downside scenario?",
            "If you send the plan for EU funds, also check expense eligibility in the call guide — not every “necessary” cost is eligible.",
          ],
        },
      ],
      es: [
        {
          heading: "Separa inversión y gastos de operación",
          paragraphs: [
            "La inversión (CAPEX) es lo que compras una vez para arrancar: equipos, acondicionamiento, licencias, stock inicial. La operación (OPEX) es lo que pagas cada mes: alquiler, salarios, marketing, suministros.",
            "Mezclar ambas confunde al lector. En el plan, lista con claridad qué es puntual y qué es recurrente.",
          ],
        },
        {
          heading: "Cada partida grande necesita explicación",
          paragraphs: [
            "“Equipos — 40.000” sin detalle no basta. Anota qué compras, por qué hace falta y en qué te basas (presupuesto, catálogo, experiencia del sector).",
            "En IdeeaTa, el campo de explicación junto al importe sirve exactamente para eso. Si el texto está cortado o vacío, complétalo antes de exportar.",
          ],
        },
        {
          heading: "Flujo de caja de los primeros 6–12 meses",
          paragraphs: [
            "Aunque la inversión esté cubierta, necesitas liquidez hasta que los ingresos se estabilicen. Incluye una reserva de operación (runway) realista.",
            "Comprueba: si las ventas se retrasan 2–3 meses, ¿puedes seguir pagando alquiler y salarios? Si no, el presupuesto está infradimensionado.",
          ],
        },
        {
          heading: "Optimización porcentual del presupuesto",
          paragraphs: [
            "En Studio puedes reducir o redistribuir el presupuesto un porcentaje (por ejemplo −20%) para probar escenarios. Úsalo como ejercicio de sensibilidad, no como truco para parecer más barato sin argumentos.",
            "Tras optimizar, relee las explicaciones: importe y justificación deben seguir siendo coherentes.",
          ],
        },
        {
          heading: "Errores típicos",
          paragraphs: ["Evita:"],
          bullets: [
            "Importes redondos sin fuente (10.000 / 50.000 / 100.000)",
            "Cero reserva para imprevistos",
            "Marketing = 0 en el primer año (poco realista en la mayoría de negocios)",
            "Salarios por debajo del mercado local",
            "IVA / impuestos omitidos cuando aplican",
          ],
        },
        {
          heading: "Checklist rápido antes de exportar",
          paragraphs: [
            "Repasa en el móvil o en el escritorio: ¿cada partida grande tiene explicación? ¿Los totales cuadran por categorías? ¿Tienes runway? ¿Hay escenario pesimista?",
            "Si envías el plan a fondos UE, comprueba también la elegibilidad del gasto en la guía de la convocatoria: no todo coste “necesario” es elegible.",
          ],
        },
      ],
    },
    ctaLabel: {
      ro: "Generează un plan și verifică bugetul",
      en: "Generate a plan and check the budget",
      es: "Genera un plan y revisa el presupuesto",
    },
    ctaHref: { ...DEMO_CTA },
  },
  {
    slug: "swot",
    path: {
      ro: "/resurse/analiza-swot-cu-explicatii",
      en: "/en/resources/swot-analysis-with-explanations",
      es: "/es/recursos/analisis-foda-con-explicaciones",
    },
    title: {
      ro: "Analiză SWOT cu explicații: cum arată una utilă",
      en: "SWOT analysis with explanations: what a useful one looks like",
      es: "Análisis FODA con explicaciones: cómo se ve uno útil",
    },
    description: {
      ro: "De ce SWOT-ul fără explicații e respins, cum scrii fiecare cadran și cum îl legi de buget și de piață.",
      en: "Why SWOT without explanations gets rejected, how to write each quadrant, and how to tie it to budget and market.",
      es: "Por qué un FODA sin explicaciones se rechaza, cómo escribir cada cuadrante y cómo vincularlo a presupuesto y mercado.",
    },
    intro: {
      ro: "Un SWOT bun nu e o listă de cuvinte. Fiecare punct trebuie să spună de ce e relevant pentru afacerea ta și ce faci cu informația. Evaluatorii și investitorii citesc explicațiile — nu doar etichetele.",
      en: "A good SWOT is not a word list. Each point must say why it matters for your business and what you do with the information. Evaluators and investors read the explanations — not just the labels.",
      es: "Un buen FODA no es una lista de palabras. Cada punto debe decir por qué importa para tu negocio y qué haces con la información. Evaluadores e inversores leen las explicaciones — no solo las etiquetas.",
    },
    sections: {
      ro: [
        {
          heading: "Ce înseamnă fiecare cadran",
          paragraphs: [
            "Puncte tari (Strengths): avantaje interne pe care le controlezi — echipă, produs, locație, relații.",
            "Puncte slabe (Weaknesses): limite interne — capital, brand necunoscut, dependență de un client.",
            "Oportunități (Opportunities): factori externi favorabili — cerere în creștere, digitalizare, nișă liberă.",
            "Amenințări (Threats): riscuri externe — concurență, reglementări, costuri energetice, sezonalitate.",
          ],
        },
        {
          heading: "Regula explicației",
          paragraphs: [
            "Titlul e scurt; explicația are 1–3 propoziții: context + impact + (ideal) acțiune. Exemplu slab: „Concurență”. Exemplu bun: „Trei cafenele în rază de 500 m; diferențiere prin abonamente și evenimente locale.”",
            "În IdeeaTa, fiecare element SWOT are câmp de explicație. Dacă e gol sau tăiat la mijlocul frazei, completează-l înainte de export.",
          ],
        },
        {
          heading: "Leagă SWOT-ul de buget și de piață",
          paragraphs: [
            "Dacă o slăbiciune e „capital limitat”, bugetul trebuie să arate priorități clare. Dacă o oportunitate e „cerere B2B”, capitolul de piață și funnel-ul trebuie să o reflecte.",
            "SWOT-ul izolat, fără legătură cu restul planului, arată ca umplutură.",
          ],
        },
        {
          heading: "Câte puncte sunt suficiente?",
          paragraphs: [
            "De obicei 3–5 pe cadran, bine argumentate, bat 10 puncte generice. Calitatea > cantitatea.",
            "Evită duplicatele („preț mic” ca punct tare și „prețuri agresive” ca oportunitate) fără nuanță.",
          ],
        },
        {
          heading: "Greșeli frecvente",
          paragraphs: ["Evitați:"],
          bullets: [
            "Doar cuvinte-cheie fără explicație",
            "Puncte care ar putea fi ale oricărei afaceri („există internet”)",
            "Amenințări fără mitigare în operațiuni sau riscuri",
            "Puncte tari care sunt de fapt aspirații, nu realități",
          ],
        },
        {
          heading: "Cum îl revizuiești pe mobil",
          paragraphs: [
            "Pe ecran mic, citește un punct pe rând: titlu + explicație. Dacă explicația nu stă în picioare fără restul capitolului, e prea vagă.",
            "După editare, Confirmă și Salvează, apoi verifică în export (PDF/Word) că nu s-au tăiat textele.",
          ],
        },
      ],
      en: [
        {
          heading: "What each quadrant means",
          paragraphs: [
            "Strengths: internal advantages you control — team, product, location, relationships.",
            "Weaknesses: internal limits — capital, unknown brand, dependence on one customer.",
            "Opportunities: favorable external factors — rising demand, digitalization, an open niche.",
            "Threats: external risks — competition, regulation, energy costs, seasonality.",
          ],
        },
        {
          heading: "The explanation rule",
          paragraphs: [
            "The title is short; the explanation is 1–3 sentences: context + impact + (ideally) action. Weak example: “Competition”. Strong example: “Three cafés within 500 m; differentiation via subscriptions and local events.”",
            "In IdeeaTa, every SWOT item has an explanation field. If it is empty or cut mid-sentence, complete it before export.",
          ],
        },
        {
          heading: "Tie SWOT to budget and market",
          paragraphs: [
            "If a weakness is “limited capital”, the budget must show clear priorities. If an opportunity is “B2B demand”, the market chapter and funnel should reflect it.",
            "A SWOT isolated from the rest of the plan looks like filler.",
          ],
        },
        {
          heading: "How many points are enough?",
          paragraphs: [
            "Usually 3–5 well-argued points per quadrant beat 10 generic ones. Quality > quantity.",
            "Avoid duplicates (“low price” as a strength and “aggressive prices” as an opportunity) without nuance.",
          ],
        },
        {
          heading: "Common mistakes",
          paragraphs: ["Avoid:"],
          bullets: [
            "Keywords only, no explanation",
            "Points that could apply to any business (“the internet exists”)",
            "Threats with no mitigation in operations or risk sections",
            "Strengths that are aspirations, not realities",
          ],
        },
        {
          heading: "How to review it on mobile",
          paragraphs: [
            "On a small screen, read one point at a time: title + explanation. If the explanation cannot stand without the rest of the chapter, it is too vague.",
            "After editing, Confirm & Save, then check the export (PDF/Word) so texts are not truncated.",
          ],
        },
      ],
      es: [
        {
          heading: "Qué significa cada cuadrante",
          paragraphs: [
            "Fortalezas: ventajas internas que controlas — equipo, producto, ubicación, relaciones.",
            "Debilidades: límites internos — capital, marca desconocida, dependencia de un cliente.",
            "Oportunidades: factores externos favorables — demanda creciente, digitalización, nicho libre.",
            "Amenazas: riesgos externos — competencia, regulación, costes energéticos, estacionalidad.",
          ],
        },
        {
          heading: "La regla de la explicación",
          paragraphs: [
            "El título es corto; la explicación tiene 1–3 frases: contexto + impacto + (ideal) acción. Ejemplo débil: “Competencia”. Ejemplo fuerte: “Tres cafeterías a 500 m; diferenciación con suscripciones y eventos locales.”",
            "En IdeeaTa, cada elemento FODA tiene campo de explicación. Si está vacío o cortado a media frase, complétalo antes de exportar.",
          ],
        },
        {
          heading: "Vincula el FODA a presupuesto y mercado",
          paragraphs: [
            "Si una debilidad es “capital limitado”, el presupuesto debe mostrar prioridades claras. Si una oportunidad es “demanda B2B”, el capítulo de mercado y el embudo deben reflejarlo.",
            "Un FODA aislado del resto del plan parece relleno.",
          ],
        },
        {
          heading: "¿Cuántos puntos bastan?",
          paragraphs: [
            "Suele bastar con 3–5 puntos bien argumentados por cuadrante frente a 10 genéricos. Calidad > cantidad.",
            "Evita duplicados (“precio bajo” como fortaleza y “precios agresivos” como oportunidad) sin matiz.",
          ],
        },
        {
          heading: "Errores frecuentes",
          paragraphs: ["Evita:"],
          bullets: [
            "Solo palabras clave, sin explicación",
            "Puntos que valdrían para cualquier negocio (“existe internet”)",
            "Amenazas sin mitigación en operaciones o riesgos",
            "Fortalezas que son aspiraciones, no realidades",
          ],
        },
        {
          heading: "Cómo revisarlo en el móvil",
          paragraphs: [
            "En pantalla pequeña, lee un punto cada vez: título + explicación. Si la explicación no se sostiene sin el resto del capítulo, es demasiado vaga.",
            "Tras editar, Confirma y Guarda y comprueba la exportación (PDF/Word) para que no se corten los textos.",
          ],
        },
      ],
    },
    ctaLabel: {
      ro: "Generează un plan și verifică SWOT-ul",
      en: "Generate a plan and check the SWOT",
      es: "Genera un plan y revisa el FODA",
    },
    ctaHref: { ...DEMO_CTA },
  },
  {
    slug: "eu-funds",
    path: {
      ro: "/resurse/plan-pentru-fonduri-europene",
      en: "/en/resources/business-plan-for-eu-funds",
      es: "/es/recursos/plan-para-fondos-europeos",
    },
    title: {
      ro: "Plan de afaceri pentru fonduri europene: ce trebuie să conțină",
      en: "Business plan for EU funds: what it must contain",
      es: "Plan de negocios para fondos europeos: qué debe contener",
    },
    description: {
      ro: "Criterii tipice pentru granturi: relevanță, digitalizare, DNSH, egalitate de șanse, buget eligibil și sustenabilitate post-proiect.",
      en: "Typical grant criteria: relevance, digitalization, DNSH, equal opportunity, eligible budget, and post-project sustainability.",
      es: "Criterios típicos de subvención: relevancia, digitalización, DNSH, igualdad de oportunidades, presupuesto elegible y sostenibilidad post-proyecto.",
    },
    intro: {
      ro: "Evaluatorii de fonduri nu caută un pitch de startup — caută relevanță strategică, eligibilitate a cheltuielilor și dovezi că proiectul respectă principii orizontale (mediu, egalitate). Un plan „optimizat UE” vorbește această limbă, pe desktop sau pe mobil.",
      en: "Fund evaluators are not looking for a startup pitch — they look for strategic relevance, expense eligibility, and proof that the project respects horizontal principles (environment, equality). An “EU-optimized” plan speaks that language on desktop or mobile.",
      es: "Los evaluadores de fondos no buscan un pitch de startup: buscan relevancia estratégica, elegibilidad del gasto y pruebas de que el proyecto respeta principios horizontales (medio ambiente, igualdad). Un plan “optimizado UE” habla ese idioma en escritorio o móvil.",
    },
    sections: {
      ro: [
        {
          heading: "Relevanță și aliniere strategică",
          paragraphs: [
            "Arată cum proiectul contribuie la digitalizare, tranziție verde și reducerea amprentei de carbon. Leagă activitatea de obiective măsurabile (output, outcome, impact).",
            "Citește ghidul apelului înainte să rescrii planul: fiecare apel are indicatori și tipuri de cheltuieli preferate. Planul trebuie să oglindească acel limbaj, nu un pitch generic de startup.",
          ],
        },
        {
          heading: "Buget eligibil și raport calitate-preț",
          paragraphs: [
            "Redenumește și argumentează achizițiile astfel încât să fie clare pentru ghidul de finanțare. Menține cash-flow realist și explică de ce fiecare cost e necesar.",
            "Separă clar ce e eligibil din grant și ce finanțezi tu. Evaluatorii verifică dacă suma cerută e proporțională cu rezultatele promise.",
            "Vezi și ghidul despre buget de investiții realist din Resurse — aceleași principii se aplică, plus filtrul de eligibilitate.",
          ],
        },
        {
          heading: "Criterii transversale (DNSH, egalitate)",
          paragraphs: [
            "Integrează principiul DNSH (Do No Significant Harm), egalitatea de șanse și non-discriminarea — nu ca slogan, ci ca măsuri concrete în operațiuni și HR.",
            "În IdeeaTa, instrumentul Optimizare Fonduri Europene rescrie planul pe aceste axe. Apoi, din Librăria de Secțiuni Experte, poți adăuga capitole dedicate: DNSH, logistică verde, egalitate de șanse și digitalizare ERP/CRM.",
          ],
          bullets: [
            "DNSH — conformitate de mediu",
            "Logistică verde / carbon",
            "Egalitate de șanse & incluziune",
            "Plan de digitalizare (ERP/CRM)",
          ],
        },
        {
          heading: "Sustenabilitate după finanțare",
          paragraphs: [
            "Demonstrează cum afacerea rămâne viabilă 3–5 ani după proiect: venituri, clienți, costuri de operare. Fără asta, multe dosare cad la evaluare.",
            "Include un scenariu după ce grantul se încheie: cine plătește salariile, cum se menține echipamentul, ce se întâmplă cu indicatorii.",
          ],
        },
        {
          heading: "Documente și coerență",
          paragraphs: [
            "Planul, bugetul și calendarul trebuie să spună aceeași poveste. Neconcordanțele (ex. angajezi 5 oameni în text, dar bugetul are 2 salarii) sunt ușor de observat.",
            "Înainte de depunere, exportă PDF-ul și citește-l ca un evaluator: fiecare afirmație mare are dovezi sau cifre în plan?",
          ],
        },
        {
          heading: "Ce nu înlocuiește IdeeaTa",
          paragraphs: [
            "Platforma te ajută să structurezi și să rescrii planul pe limbaj de fonduri. Nu înlocuiește consultanța pe un apel specific, nici verificarea eligibilității juridice a firmei tale.",
            "Folosește-o ca bază de lucru, apoi aliniază cu ghidul oficial al apelului și, dacă e cazul, cu un consultant.",
          ],
        },
      ],
      en: [
        {
          heading: "Relevance and strategic alignment",
          paragraphs: [
            "Show how the project contributes to digitalization, green transition, and lower carbon footprint. Tie activity to measurable goals (output, outcome, impact).",
            "Read the call guide before rewriting the plan: each call has preferred indicators and expense types. The plan should mirror that language, not a generic startup pitch.",
          ],
        },
        {
          heading: "Eligible budget and value for money",
          paragraphs: [
            "Name and justify purchases so they match funding guidelines. Keep cash-flow realistic and explain why each cost is necessary.",
            "Clearly separate what the grant covers and what you co-finance. Evaluators check whether the amount requested matches the promised results.",
            "Also see the realistic investment budget guide in Resources — the same principles apply, plus the eligibility filter.",
          ],
        },
        {
          heading: "Horizontal criteria (DNSH, equality)",
          paragraphs: [
            "Integrate DNSH (Do No Significant Harm), equal opportunity, and non-discrimination — not as slogans, but as concrete operational and HR measures.",
            "In IdeeaTa, EU Funds Optimization rewrites the plan along these axes. Then, from the Expert Section Library, add dedicated chapters: DNSH, green logistics, equal opportunity, and ERP/CRM digitalization.",
          ],
          bullets: [
            "DNSH — environmental compliance",
            "Green logistics / carbon",
            "Equal opportunity & inclusion",
            "Digitalization plan (ERP/CRM)",
          ],
        },
        {
          heading: "Sustainability after funding",
          paragraphs: [
            "Show how the business stays viable 3–5 years after the project: revenue, customers, operating costs. Without this, many applications fail evaluation.",
            "Include a scenario after the grant ends: who pays salaries, how equipment is maintained, what happens to the indicators.",
          ],
        },
        {
          heading: "Documents and consistency",
          paragraphs: [
            "Plan, budget, and timeline must tell the same story. Inconsistencies (e.g. hiring 5 people in the text but budgeting 2 salaries) are easy to spot.",
            "Before submission, export the PDF and read it as an evaluator: does every major claim have evidence or numbers in the plan?",
          ],
        },
        {
          heading: "What IdeeaTa does not replace",
          paragraphs: [
            "The platform helps you structure and rewrite the plan in funds language. It does not replace advice on a specific call, or a legal eligibility check for your company.",
            "Use it as a working base, then align with the official call guide and, if needed, a consultant.",
          ],
        },
      ],
      es: [
        {
          heading: "Relevancia y alineación estratégica",
          paragraphs: [
            "Muestra cómo el proyecto contribuye a la digitalización, la transición ecológica y la reducción de la huella de carbono. Vincula la actividad a objetivos medibles (output, outcome, impacto).",
            "Lee la guía de la convocatoria antes de reescribir el plan: cada convocatoria tiene indicadores y tipos de gasto preferidos. El plan debe reflejar ese lenguaje, no un pitch genérico de startup.",
          ],
        },
        {
          heading: "Presupuesto elegible y relación calidad-precio",
          paragraphs: [
            "Nombra y justifica las compras para que encajen con la guía de financiación. Mantén un flujo de caja realista y explica por qué cada coste es necesario.",
            "Separa con claridad qué cubre la subvención y qué cofinancias tú. Los evaluadores comprueban si el importe pedido es proporcional a los resultados prometidos.",
            "Consulta también la guía de presupuesto de inversión realista en Recursos: los mismos principios, más el filtro de elegibilidad.",
          ],
        },
        {
          heading: "Criterios horizontales (DNSH, igualdad)",
          paragraphs: [
            "Integra DNSH (Do No Significant Harm), igualdad de oportunidades y no discriminación — no como eslóganes, sino como medidas concretas en operaciones y RR.HH.",
            "En IdeeaTa, Optimización Fondos UE reescribe el plan en estos ejes. Luego, desde la Biblioteca Experta, añade capítulos dedicados: DNSH, logística verde, igualdad y digitalización ERP/CRM.",
          ],
          bullets: [
            "DNSH — cumplimiento ambiental",
            "Logística verde / carbono",
            "Igualdad de oportunidades e inclusión",
            "Plan de digitalización (ERP/CRM)",
          ],
        },
        {
          heading: "Sostenibilidad tras la financiación",
          paragraphs: [
            "Demuestra cómo el negocio sigue siendo viable 3–5 años después del proyecto: ingresos, clientes, costes operativos. Sin esto, muchos expedientes fallan en la evaluación.",
            "Incluye un escenario cuando termine la subvención: quién paga salarios, cómo se mantiene el equipo, qué ocurre con los indicadores.",
          ],
        },
        {
          heading: "Documentos y coherencia",
          paragraphs: [
            "Plan, presupuesto y calendario deben contar la misma historia. Las incoherencias (p. ej. contratar 5 personas en el texto pero presupuestar 2 salarios) se detectan fácil.",
            "Antes de presentar, exporta el PDF y léelo como un evaluador: ¿cada afirmación importante tiene pruebas o cifras en el plan?",
          ],
        },
        {
          heading: "Qué no sustituye IdeeaTa",
          paragraphs: [
            "La plataforma te ayuda a estructurar y reescribir el plan en lenguaje de fondos. No sustituye el asesoramiento sobre una convocatoria concreta ni la comprobación jurídica de elegibilidad de tu empresa.",
            "Úsala como base de trabajo y luego alinea con la guía oficial y, si hace falta, con un consultor.",
          ],
        },
      ],
    },
    ctaLabel: {
      ro: "Deschide Demo și testează",
      en: "Open Demo and try it",
      es: "Abre Demo y pruébalo",
    },
    ctaHref: { ...DEMO_CTA },
  },
  {
    slug: "investors",
    path: {
      ro: "/resurse/plan-pentru-investitori-si-banci",
      en: "/en/resources/plan-for-investors-and-banks",
      es: "/es/recursos/plan-para-inversores-y-bancos",
    },
    title: {
      ro: "Plan pentru investitori și bănci: checklist practic",
      en: "Plan for investors and banks: a practical checklist",
      es: "Plan para inversores y bancos: checklist práctico",
    },
    description: {
      ro: "Ce caută un investitor sau o bancă: unit economics, riscuri, echipă, destinația banilor și scenarii realiste.",
      en: "What investors or banks look for: unit economics, risks, team, use of funds, and realistic scenarios.",
      es: "Qué buscan inversores o bancos: unit economics, riesgos, equipo, destino de los fondos y escenarios realistas.",
    },
    intro: {
      ro: "Investitorii și băncile citesc altfel decât un consultant de granturi. Vor viabilitate comercială, managementul riscului și o poveste financiară coerentă — nu doar „idee frumoasă”. Poți pregăti documentul pe desktop sau pe telefon, apoi îl exporți pentru întâlnire.",
      en: "Investors and banks read differently than grant consultants. They want commercial viability, risk management, and a coherent financial story — not just a “nice idea”. You can prepare the document on desktop or phone, then export it for the meeting.",
      es: "Inversores y bancos leen distinto que un consultor de subvenciones. Quieren viabilidad comercial, gestión del riesgo y una historia financiera coherente — no solo una “idea bonita”. Puedes preparar el documento en escritorio o móvil y luego exportarlo para la reunión.",
    },
    sections: {
      ro: [
        {
          heading: "Checklist înainte de pitch",
          paragraphs: ["Verifică dacă planul răspunde clar la:"],
          bullets: [
            "Cât de mare e piața (TAM / SAM / SOM) și de ce tu?",
            "Unit economics: CAC vs LTV, marjă, runway",
            "Scenarii: ce se întâmplă dacă vânzările scad sau costurile cresc",
            "Destinația capitalului și, unde e cazul, exit",
            "Echipă: competențe complementare, track record",
          ],
        },
        {
          heading: "Bancă vs investitor: nuanțe",
          paragraphs: [
            "Banca vrea rambursare: garanții, cash-flow predictibil, risc controlat. Investitorul vrea upside: creștere, diferențiere, echipă care execută.",
            "Același plan poate servi ambele, dar accentele diferă. Pentru bancă, scoate în față stabilitatea; pentru equity, tracțiunea și scalarea.",
          ],
        },
        {
          heading: "Ce face Planul Profesional în IdeeaTa",
          paragraphs: [
            "Instrumentul Plan Profesional (Investitori/Bănci) rescrie planul pe limbaj de viabilitate: cash-flow, IRR/NPV/ROI, senzitivitate, tracțiune de piață și echipă — păstrând structura documentului.",
            "După rescriere, verifică cifrele pe tab-ul activ: nu trimite o versiune veche din greșeală.",
          ],
        },
        {
          heading: "Ce adaugi din Librăria Experților",
          paragraphs: [
            "După Plan Profesional, completează cu module care nu apar ca capitole dedicate în rescriere:",
          ],
          bullets: [
            "Funnel B2B / achiziție clienți",
            "Strategie de prețuri & monetizare",
            "Matricea de riscuri",
            "HR / retenție (opțional)",
            "Cybersecurity & GDPR (opțional, pentru seriozitate)",
          ],
        },
        {
          heading: "Greșeli frecvente",
          paragraphs: [
            "Buget umflat fără argumente, SWOT fără explicații, piață vagă, zero scenarii negative. Corectează-le înainte de export — documentul pe care îl trimiți e tab-ul activ.",
            "Altă greșeală: pitch oral excelent, document slab. Mulți decidenți citesc PDF-ul înainte sau după întâlnire — documentul trebuie să stea singur.",
          ],
        },
        {
          heading: "Pregătirea întâlnirii",
          paragraphs: [
            "Exportează PDF pentru prezentare și Word dacă ți se cer modificări. Pe mobil poți revedea sumarul; pe desktop e mai ușor să compari tab-urile din istoric.",
            "Pregătește 3 întrebări grele pe care ți le-ai pune tu ca investitor — și răspunsurile din plan.",
          ],
        },
      ],
      en: [
        {
          heading: "Checklist before the pitch",
          paragraphs: ["Make sure the plan clearly answers:"],
          bullets: [
            "How big is the market (TAM / SAM / SOM) and why you?",
            "Unit economics: CAC vs LTV, margin, runway",
            "Scenarios: what if sales drop or costs rise",
            "Use of funds and, where relevant, exit",
            "Team: complementary skills, track record",
          ],
        },
        {
          heading: "Bank vs investor: nuances",
          paragraphs: [
            "A bank wants repayment: collateral, predictable cash-flow, controlled risk. An investor wants upside: growth, differentiation, a team that executes.",
            "The same plan can serve both, but emphasis differs. For a bank, highlight stability; for equity, traction and scale.",
          ],
        },
        {
          heading: "What Professional Plan does in IdeeaTa",
          paragraphs: [
            "The Professional Plan (Investors/Banks) tool rewrites the plan in viability language: cash-flow, IRR/NPV/ROI, sensitivity, market traction, and team — while keeping document structure.",
            "After the rewrite, check numbers on the active tab: do not send an old version by mistake.",
          ],
        },
        {
          heading: "What to add from the Expert Library",
          paragraphs: [
            "After Professional Plan, add modules that are not dedicated chapters in the rewrite:",
          ],
          bullets: [
            "B2B funnel / customer acquisition",
            "Pricing & monetization strategy",
            "Risk matrix",
            "HR / retention (optional)",
            "Cybersecurity & GDPR (optional, for credibility)",
          ],
        },
        {
          heading: "Common mistakes",
          paragraphs: [
            "Inflated budget without arguments, SWOT without explanations, vague market, zero downside scenarios. Fix these before export — you download the active tab.",
            "Another mistake: great spoken pitch, weak document. Many decision-makers read the PDF before or after the meeting — the document must stand alone.",
          ],
        },
        {
          heading: "Preparing the meeting",
          paragraphs: [
            "Export PDF for presentation and Word if edits are requested. On mobile you can review the summary; on desktop it is easier to compare history tabs.",
            "Prepare 3 hard questions you would ask as an investor — and the answers from the plan.",
          ],
        },
      ],
      es: [
        {
          heading: "Checklist antes del pitch",
          paragraphs: ["Comprueba que el plan responda con claridad a:"],
          bullets: [
            "¿Cuán grande es el mercado (TAM / SAM / SOM) y por qué tú?",
            "Unit economics: CAC vs LTV, margen, runway",
            "Escenarios: qué pasa si bajan las ventas o suben los costes",
            "Destino del capital y, si aplica, exit",
            "Equipo: habilidades complementarias, trayectoria",
          ],
        },
        {
          heading: "Banco vs inversor: matices",
          paragraphs: [
            "El banco quiere cobro: garantías, flujo de caja predecible, riesgo controlado. El inversor quiere upside: crecimiento, diferenciación, un equipo que ejecuta.",
            "El mismo plan puede servir a ambos, pero el énfasis cambia. Para el banco, destaca estabilidad; para equity, tracción y escala.",
          ],
        },
        {
          heading: "Qué hace el Plan Profesional en IdeeaTa",
          paragraphs: [
            "La herramienta Plan Profesional (Inversores/Bancos) reescribe el plan en lenguaje de viabilidad: flujo de caja, TIR/VAN/ROI, sensibilidad, tracción de mercado y equipo — manteniendo la estructura del documento.",
            "Tras la reescritura, comprueba las cifras en la pestaña activa: no envíes una versión antigua por error.",
          ],
        },
        {
          heading: "Qué añadir desde la Biblioteca Experta",
          paragraphs: [
            "Tras el Plan Profesional, completa con módulos que no aparecen como capítulos dedicados en la reescritura:",
          ],
          bullets: [
            "Embudo B2B / adquisición de clientes",
            "Estrategia de precios y monetización",
            "Matriz de riesgos",
            "RR.HH. / retención (opcional)",
            "Ciberseguridad y RGPD (opcional, para seriedad)",
          ],
        },
        {
          heading: "Errores frecuentes",
          paragraphs: [
            "Presupuesto inflado sin argumentos, FODA sin explicaciones, mercado vago, cero escenarios negativos. Corrige antes de exportar: descargas la pestaña activa.",
            "Otro error: pitch oral excelente, documento débil. Muchos decisores leen el PDF antes o después de la reunión — el documento debe sostenerse solo.",
          ],
        },
        {
          heading: "Preparar la reunión",
          paragraphs: [
            "Exporta PDF para la presentación y Word si piden cambios. En el móvil puedes revisar el resumen; en escritorio es más fácil comparar pestañas del historial.",
            "Prepara 3 preguntas difíciles que te harías como inversor — y las respuestas desde el plan.",
          ],
        },
      ],
    },
    ctaLabel: {
      ro: "Intră în Studio",
      en: "Open Studio",
      es: "Abrir Studio",
    },
    ctaHref: {
      ro: "/login",
      en: "/en/login",
      es: "/es/login",
    },
  },
  {
    slug: "faq",
    path: {
      ro: "/resurse/intrebari-frecvente",
      en: "/en/resources/faq",
      es: "/es/recursos/preguntas-frecuentes",
    },
    title: {
      ro: "Întrebări frecvente despre IdeeaTa.ai",
      en: "Frequently asked questions about IdeeaTa.ai",
      es: "Preguntas frecuentes sobre IdeeaTa.ai",
    },
    description: {
      ro: "Demo vs Studio, planuri gratuite, pachete, limbi RO/EN/ES, export și editare.",
      en: "Demo vs Studio, free plans, packages, RO/EN/ES languages, export and editing.",
      es: "Demo vs Studio, planes gratis, paquetes, idiomas RO/EN/ES, exportación y edición.",
    },
    intro: {
      ro: "Răspunsuri scurte la cele mai frecvente întrebări despre platformă. Dacă nu găsești ce cauți, scrie-ne pe pagina de Contact.",
      en: "Short answers to the most common questions about the platform. If you cannot find what you need, write to us on the Contact page.",
      es: "Respuestas breves a las preguntas más comunes sobre la plataforma. Si no encuentras lo que buscas, escríbenos en la página de Contacto.",
    },
    sections: {
      ro: [
        {
          heading: "Care e diferența dintre Demo și Studio?",
          paragraphs: [
            "Demo e pentru a testa rapid generarea unui plan. Studio e spațiul de lucru după autentificare: salvare în cont, instrumente Pro, istoric de versiuni și export complet.",
          ],
        },
        {
          heading: "Câte planuri pot genera gratuit?",
          paragraphs: [
            "Există o cotă de planuri gratuite (și tonuri de bază) pe cont. Când o epuizezi, apar pachetele Standard sau Instrumente Pro. Detaliile actuale sunt în modalul de tarife din aplicație.",
          ],
        },
        {
          heading: "În ce limbi funcționează?",
          paragraphs: [
            "Interfața și generarea sunt disponibile în română, engleză și spaniolă (căi / , /en , /es). Limba planului urmează locale-ul paginii pe care lucrezi.",
          ],
        },
        {
          heading: "Ce documente pot descărca?",
          paragraphs: [
            "PDF prezentare, Word editabil, PPT/PPTX și, unde e disponibil, un sumar gratuit. Descărcarea folosește versiunea activă din istoric.",
          ],
        },
        {
          heading: "Pot edita planul după generare?",
          paragraphs: [
            "Da — editare directă în browser, plus instrumentele din Studio (ton, buget, fonduri UE, plan investitori, librărie de secțiuni). Când e gata, Confirmă și Salvează, apoi descarcă.",
          ],
        },
        {
          heading: "Unde găsesc ghiduri despre buget și SWOT?",
          paragraphs: [
            "În hub-ul Resurse: articole dedicate despre buget de investiții realist și analiză SWOT cu explicații, alături de ghidul general și paginile pentru fonduri UE / investitori.",
          ],
        },
      ],
      en: [
        {
          heading: "What is the difference between Demo and Studio?",
          paragraphs: [
            "Demo is for quickly testing plan generation. Studio is the workspace after sign-in: saving to your account, Pro tools, version history, and full export.",
          ],
        },
        {
          heading: "How many plans can I generate for free?",
          paragraphs: [
            "There is a free plan quota (and basic tones) per account. When you use it up, Standard or Pro Tools packages appear. Current details are in the in-app pricing modal.",
          ],
        },
        {
          heading: "Which languages are supported?",
          paragraphs: [
            "UI and generation are available in Romanian, English, and Spanish (paths / , /en , /es). Plan language follows the locale of the page you work on.",
          ],
        },
        {
          heading: "What documents can I download?",
          paragraphs: [
            "Presentation PDF, editable Word, PPT/PPTX, and where available a free summary. Downloads use the active history version.",
          ],
        },
        {
          heading: "Can I edit the plan after generation?",
          paragraphs: [
            "Yes — direct browser editing, plus Studio tools (tone, budget, EU funds, investor plan, expert section library). When ready, Confirm & Save, then download.",
          ],
        },
        {
          heading: "Where are the budget and SWOT guides?",
          paragraphs: [
            "In the Resources hub: dedicated articles on a realistic investment budget and SWOT with explanations, plus the general guide and EU funds / investor pages.",
          ],
        },
      ],
      es: [
        {
          heading: "¿Cuál es la diferencia entre Demo y Studio?",
          paragraphs: [
            "Demo sirve para probar rápido la generación de un plan. Studio es el espacio de trabajo tras iniciar sesión: guardado en la cuenta, herramientas Pro, historial de versiones y exportación completa.",
          ],
        },
        {
          heading: "¿Cuántos planes puedo generar gratis?",
          paragraphs: [
            "Hay una cuota de planes gratis (y tonos básicos) por cuenta. Cuando se agota, aparecen los paquetes Standard o Herramientas Pro. Los detalles actuales están en el modal de precios de la app.",
          ],
        },
        {
          heading: "¿En qué idiomas funciona?",
          paragraphs: [
            "La interfaz y la generación están disponibles en rumano, inglés y español (rutas / , /en , /es). El idioma del plan sigue el locale de la página en la que trabajas.",
          ],
        },
        {
          heading: "¿Qué documentos puedo descargar?",
          paragraphs: [
            "PDF de presentación, Word editable, PPT/PPTX y, donde esté disponible, un resumen gratuito. La descarga usa la versión activa del historial.",
          ],
        },
        {
          heading: "¿Puedo editar el plan después de generarlo?",
          paragraphs: [
            "Sí: edición directa en el navegador, más las herramientas de Studio (tono, presupuesto, fondos UE, plan inversores, biblioteca experta). Cuando esté listo, Confirma y Guarda y luego descarga.",
          ],
        },
        {
          heading: "¿Dónde están las guías de presupuesto y FODA?",
          paragraphs: [
            "En el hub de Recursos: artículos dedicados sobre presupuesto de inversión realista y FODA con explicaciones, junto a la guía general y las páginas de fondos UE / inversores.",
          ],
        },
      ],
    },
    ctaLabel: {
      ro: "Contactează-ne",
      en: "Contact us",
      es: "Contáctanos",
    },
    ctaHref: {
      ro: "/contact",
      en: "/en/contact",
      es: "/es/contact",
    },
  },
];

export function getResourceBySlug(slug: ResourceSlug): ResourceArticle {
  const article = RESOURCE_ARTICLES.find((a) => a.slug === slug);
  if (!article) throw new Error(`Unknown resource slug: ${slug}`);
  return article;
}

export function getResourceByPath(
  locale: ResourceLocale,
  path: string
): ResourceArticle | undefined {
  return RESOURCE_ARTICLES.find((a) => a.path[locale] === path);
}
