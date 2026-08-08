/**
 * Public editorial resources for AdSense / SEO (RO, EN, ES).
 * Phase B — content pages with original publisher copy.
 */

export type ResourceLocale = "ro" | "en" | "es";

export type ResourceSlug = "guide" | "eu-funds" | "investors" | "faq";

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
      "Ghiduri practice pentru planuri de afaceri, fonduri europene, investitori și întrebări frecvente.",
    path: "/resurse",
    label: "Resurse",
  },
  en: {
    title: "IdeeaTa.ai Resources",
    description:
      "Practical guides for business plans, EU funding, investors, and frequently asked questions.",
    path: "/en/resources",
    label: "Resources",
  },
  es: {
    title: "Recursos IdeeaTa.ai",
    description:
      "Guías prácticas sobre planes de negocio, fondos europeos, inversores y preguntas frecuentes.",
    path: "/es/recursos",
    label: "Recursos",
  },
};

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
      ro: "Un plan de afaceri bun nu e literatură — e un document de decizie. Trebuie să arate ce vinzi, cui, cu ce bani și de ce merită riscul. IdeeaTa.ai te ajută să treci de la o idee scurtă la o structură completă, pe care o poți edita, combina și descărca.",
      en: "A good business plan is not literature — it is a decision document. It must show what you sell, to whom, with what money, and why the risk is worth it. IdeeaTa.ai helps you go from a short idea to a full structure you can edit, combine, and download.",
      es: "Un buen plan de negocios no es literatura: es un documento de decisión. Debe mostrar qué vendes, a quién, con qué dinero y por qué vale el riesgo. IdeeaTa.ai te ayuda a pasar de una idea breve a una estructura completa que puedes editar, combinar y descargar.",
    },
    sections: {
      ro: [
        {
          heading: "1. Clarifică ideea în 3–5 propoziții",
          paragraphs: [
            "Înainte să apeși Generează, scrie: problema clientului, soluția ta, cui te adresezi și cum faci bani. Cu cât e mai concretă ideea, cu atât planul generat e mai util.",
            "Exemple bune: „cafenea specialitate în cartier X, 40 locuri, abonamente cafea + evenimente” — nu doar „o cafenea”.",
          ],
        },
        {
          heading: "2. Generează structura de bază",
          paragraphs: [
            "În Demo sau Studio, IdeeaTa construiește capitolele esențiale: viziune și strategie, piață, operațiuni, SWOT și plan financiar (inclusiv buget de investiții).",
            "Contul gratuit îți permite să testezi fluxul. Pentru editări avansate, istoric de versiuni și instrumente Pro, folosești Studio după autentificare.",
          ],
        },
        {
          heading: "3. Revizuiește cifrele și SWOT-ul",
          paragraphs: [
            "Platforma propune un punct de plecare. Tu verifici: costurile sunt realiste pentru orașul tău? Piața e corectă? SWOT-ul are explicații, nu doar titluri?",
            "Editează direct în browser, apoi Confirmă și Salvează înainte de export — logo-ul și aranjarea din PDF se finalizează la descărcare.",
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
            "Full Access: până la 4 tool-uri pe același lanț",
          ],
        },
        {
          heading: "5. Exportă pentru audiența potrivită",
          paragraphs: [
            "PDF/PPT pentru pitch, Word pentru editare ulterioară, sumar gratuit când testezi. Descărcarea folosește tab-ul activ din istoric — verifică că ai selectat versiunea corectă.",
          ],
        },
      ],
      en: [
        {
          heading: "1. Clarify the idea in 3–5 sentences",
          paragraphs: [
            "Before you hit Generate, write: the customer problem, your solution, who you serve, and how you make money. The more concrete the idea, the more useful the generated plan.",
            "Good examples: “specialty coffee shop in district X, 40 seats, coffee subscriptions + events” — not just “a coffee shop”.",
          ],
        },
        {
          heading: "2. Generate the base structure",
          paragraphs: [
            "In Demo or Studio, IdeeaTa builds the essential chapters: vision and strategy, market, operations, SWOT, and financial plan (including investment budget).",
            "A free account lets you test the flow. For advanced editing, version history, and Pro tools, use Studio after signing in.",
          ],
        },
        {
          heading: "3. Review numbers and SWOT",
          paragraphs: [
            "The platform proposes a starting point. You verify: are costs realistic for your city? Is the market accurate? Does every SWOT item include an explanation, not just a title?",
            "Edit in the browser, then Confirm & Save before export — logo and PDF layout are finalized at download.",
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
            "Full Access: up to 4 tools on the same stack",
          ],
        },
        {
          heading: "5. Export for the right audience",
          paragraphs: [
            "PDF/PPT for pitching, Word for further editing, free summary when testing. Downloads use the active history tab — make sure the correct version is selected.",
          ],
        },
      ],
      es: [
        {
          heading: "1. Aclara la idea en 3–5 frases",
          paragraphs: [
            "Antes de pulsar Generar, escribe: el problema del cliente, tu solución, a quién te diriges y cómo ganas dinero. Cuanto más concreta sea la idea, más útil será el plan generado.",
            "Buenos ejemplos: “cafetería de especialidad en el barrio X, 40 plazas, suscripciones de café + eventos” — no solo “una cafetería”.",
          ],
        },
        {
          heading: "2. Genera la estructura base",
          paragraphs: [
            "En Demo o Studio, IdeeaTa construye los capítulos esenciales: visión y estrategia, mercado, operaciones, FODA y plan financiero (incluido el presupuesto de inversión).",
            "La cuenta gratuita te permite probar el flujo. Para edición avanzada, historial de versiones y herramientas Pro, usa Studio tras iniciar sesión.",
          ],
        },
        {
          heading: "3. Revisa cifras y FODA",
          paragraphs: [
            "La plataforma propone un punto de partida. Tú verificas: ¿son realistas los costes en tu ciudad? ¿es correcto el mercado? ¿cada ítem FODA tiene explicación, no solo título?",
            "Edita en el navegador y luego Confirma y Guarda antes de exportar: el logo y el diseño del PDF se finalizan al descargar.",
          ],
        },
        {
          heading: "4. Usa las herramientas de Studio",
          paragraphs: [
            "Puedes cambiar el tono (formal, creativo, persuasivo), optimizar el presupuesto por porcentaje, adaptar el plan para fondos UE o inversores, y añadir módulos de la Biblioteca de Secciones Experta.",
            "En la Versión Original, cada herramienta crea una pestaña nueva. En otra pestaña, la herramienta se combina con la versión activa (según tu paquete).",
          ],
          bullets: [
            "Gratis: pestañas simples, sin cadenas largas",
            "Standard: hasta 2 herramientas en la misma cadena",
            "Full Access: hasta 4 herramientas en la misma cadena",
          ],
        },
        {
          heading: "5. Exporta para la audiencia correcta",
          paragraphs: [
            "PDF/PPT para el pitch, Word para editar después, resumen gratuito al probar. La descarga usa la pestaña activa del historial: comprueba que sea la versión correcta.",
          ],
        },
      ],
    },
    ctaLabel: {
      ro: "Începe un plan gratuit",
      en: "Start a free plan",
      es: "Empieza un plan gratis",
    },
    ctaHref: {
      ro: "/demo?start=nou",
      en: "/en/demo?start=nou",
      es: "/es/demo?start=nou",
    },
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
      ro: "Evaluatorii de fonduri nu caută un pitch de startup — caută relevanță strategică, eligibilitate a cheltuielilor și dovezi că proiectul respectă principii orizontale (mediu, egalitate). Un plan „optimizat UE” vorbește această limbă.",
      en: "Fund evaluators are not looking for a startup pitch — they look for strategic relevance, expense eligibility, and proof that the project respects horizontal principles (environment, equality). An “EU-optimized” plan speaks that language.",
      es: "Los evaluadores de fondos no buscan un pitch de startup: buscan relevancia estratégica, elegibilidad del gasto y pruebas de que el proyecto respeta principios horizontales (medio ambiente, igualdad). Un plan “optimizado UE” habla ese idioma.",
    },
    sections: {
      ro: [
        {
          heading: "Relevanță și aliniere strategică",
          paragraphs: [
            "Arată cum proiectul contribuie la digitalizare, tranziție verde și reducerea amprentei de carbon. Leagă activitatea de obiective măsurabile (output, outcome, impact).",
          ],
        },
        {
          heading: "Buget eligibil și raport calitate-preț",
          paragraphs: [
            "Redenumește și argumentează achizițiile astfel încât să fie clare pentru ghidul de finanțare. Menține cash-flow realist și explică de ce fiecare cost e necesar.",
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
          ],
        },
      ],
      en: [
        {
          heading: "Relevance and strategic alignment",
          paragraphs: [
            "Show how the project contributes to digitalization, green transition, and lower carbon footprint. Tie activity to measurable goals (output, outcome, impact).",
          ],
        },
        {
          heading: "Eligible budget and value for money",
          paragraphs: [
            "Name and justify purchases so they match funding guidelines. Keep cash-flow realistic and explain why each cost is necessary.",
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
          ],
        },
      ],
      es: [
        {
          heading: "Relevancia y alineación estratégica",
          paragraphs: [
            "Muestra cómo el proyecto contribuye a la digitalización, la transición ecológica y la reducción de la huella de carbono. Vincula la actividad a objetivos medibles (output, outcome, impacto).",
          ],
        },
        {
          heading: "Presupuesto elegible y relación calidad-precio",
          paragraphs: [
            "Nombra y justifica las compras para que encajen con la guía de financiación. Mantén un flujo de caja realista y explica por qué cada coste es necesario.",
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
          ],
        },
      ],
    },
    ctaLabel: {
      ro: "Deschide Demo și testează",
      en: "Open Demo and try it",
      es: "Abre Demo y pruébalo",
    },
    ctaHref: {
      ro: "/demo?start=nou",
      en: "/en/demo?start=nou",
      es: "/es/demo?start=nou",
    },
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
      ro: "Investitorii și băncile citesc altfel decât un consultant de granturi. Vor viabilitate comercială, managementul riscului și o poveste financiară coerentă — nu doar „idee frumoasă”.",
      en: "Investors and banks read differently than grant consultants. They want commercial viability, risk management, and a coherent financial story — not just a “nice idea”.",
      es: "Inversores y bancos leen distinto que un consultor de subvenciones. Quieren viabilidad comercial, gestión del riesgo y una historia financiera coherente — no solo una “idea bonita”.",
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
          heading: "Ce face Planul Profesional în IdeeaTa",
          paragraphs: [
            "Instrumentul Plan Profesional (Investitori/Bănci) rescrie planul pe limbaj de viabilitate: cash-flow, IRR/NPV/ROI, senzitivitate, tracțiune de piață și echipă — păstrând structura documentului.",
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
          heading: "What Professional Plan does in IdeeaTa",
          paragraphs: [
            "The Professional Plan (Investors/Banks) tool rewrites the plan in viability language: cash-flow, IRR/NPV/ROI, sensitivity, market traction, and team — while keeping document structure.",
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
          heading: "Qué hace el Plan Profesional en IdeeaTa",
          paragraphs: [
            "La herramienta Plan Profesional (Inversores/Bancos) reescribe el plan en lenguaje de viabilidad: flujo de caja, TIR/VAN/ROI, sensibilidad, tracción de mercado y equipo — manteniendo la estructura del documento.",
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
            "Există o cotă de planuri gratuite (și tonuri de bază) pe cont. Când o epuizezi, apar pachetele Standard sau Full Access. Detaliile actuale sunt în modalul de tarife din aplicație.",
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
            "Da — editare directă în browser, plus instrumentele din Studio (ton, buget, fonduri UE, plan investitori, librărie de secțiuni). Pentru imagini/logo în layout-ul final, Confirmă și Salvează, apoi descarcă.",
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
            "There is a free plan quota (and basic tones) per account. When you use it up, Standard or Full Access packages appear. Current details are in the in-app pricing modal.",
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
            "Yes — direct browser editing, plus Studio tools (tone, budget, EU funds, investor plan, expert section library). For images/logo in the final layout, Confirm & Save, then download.",
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
            "Hay una cuota de planes gratis (y tonos básicos) por cuenta. Cuando se agota, aparecen los paquetes Standard o Full Access. Los detalles actuales están en el modal de precios de la app.",
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
            "Sí: edición directa en el navegador, más las herramientas de Studio (tono, presupuesto, fondos UE, plan inversores, biblioteca experta). Para imágenes/logo en el diseño final, Confirma y Guarda y luego descarga.",
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
