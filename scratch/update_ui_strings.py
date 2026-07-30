import re
import json

file_path = r"d:\APLICATII\IdeeaTa-latest_17072026\IdeeaTa-latest\lib\uiStrings.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define new type keys
new_types = """
  // MOCKUP PREVIEW STRINGS
  mockupSummary: string; mockupSwot: string; mockupBudget: string; mockupStrategy: string;
  mockupSummaryP1: string; mockupSummaryP2: string;
  mockupSwotS_Title: string; mockupSwotS_1: string; mockupSwotS_2: string; mockupSwotS_3: string;
  mockupSwotW_Title: string; mockupSwotW_1: string; mockupSwotW_2: string; mockupSwotW_3: string;
  mockupSwotO_Title: string; mockupSwotO_1: string; mockupSwotO_2: string; mockupSwotO_3: string;
  mockupSwotT_Title: string; mockupSwotT_1: string; mockupSwotT_2: string; mockupSwotT_3: string;
  mockupBudgetTitle: string; mockupBudgetEq: string; mockupBudgetDes: string; mockupBudgetStock: string;
  mockupStrategy1_Title: string; mockupStrategy1_Desc: string;
  mockupStrategy2_Title: string; mockupStrategy2_Desc: string;
  mockupChartSalaries: string; mockupChartRent: string; mockupChartStock: string; mockupChartMarketing: string;
  mockupProfitMargin: string;
  mockupLiveTitle: string; mockupLiveGen: string; mockupLiveRev: string; mockupLiveRev1: string; mockupLiveRev2: string; mockupLiveRev3: string;
  mockupLiveCosts: string; mockupLiveCosts1: string; mockupLiveCosts2: string;
  mockupLiveStatus: string; mockupLiveStat1: string; mockupLiveStat2: string; mockupLiveStat3: string; mockupLiveComplete: string;
  mockupBeforeTitle: string; mockupBeforeDesc: string;
};"""

# Replace the closing brace of UIStringsShape
content = content.replace("  costDistribution: string;\n};", "  costDistribution: string;\n" + new_types)


ro_strings = """
    mockupSummary: "Rezumat", mockupSwot: "SWOT", mockupBudget: "Buget", mockupStrategy: "Strategie",
    mockupSummaryP1: "este o cafenea de specialitate modernă, situată în inima centrului istoric. Ne propunem să oferim nu doar cafea de origine prăjită local, ci și o experiență senzorială completă, într-un mediu cu un design industrial minimalist.",
    mockupSummaryP2: "Misiunea noastră este să educăm consumatorii despre procesul de la bob la ceașcă, sprijinind fermierii independenți prin comerț echitabil (Fairtrade).",
    mockupSwotS_Title: "Puncte Tari", mockupSwotS_1: "Locație premium cu trafic pietonal intens", mockupSwotS_2: "Baristi certificați SCA", mockupSwotS_3: "Exclusivitate pentru un prăjitor local renumit",
    mockupSwotW_Title: "Puncte Slabe", mockupSwotW_1: "Costuri mari de chirie în zona centrală", mockupSwotW_2: "Lipsa unei istorii pe piață (brand nou)", mockupSwotW_3: "Prețuri mai mari față de lanțurile comerciale",
    mockupSwotO_Title: "Oportunități", mockupSwotO_1: "Creșterea cererii pentru cafea de specialitate", mockupSwotO_2: "Parteneriate B2B cu birourile din zonă", mockupSwotO_3: "Abonament lunar pentru boabe de cafea",
    mockupSwotT_Title: "Amenințări", mockupSwotT_1: "Fluctuația prețului cafelei verzi", mockupSwotT_2: "Deschiderea unei noi francize în apropiere", mockupSwotT_3: "Reticența clienților tradiționaliști",
    mockupBudgetTitle: "Buget de Investiții Inițiale", mockupBudgetEq: "Echipamente (Espressor, Râșnițe)", mockupBudgetDes: "Amenajare locație & Design", mockupBudgetStock: "Stoc inițial marfă & Consumabile",
    mockupStrategy1_Title: "Pre-lansare & Teasing", mockupStrategy1_Desc: "Campanie Social Media axată pe procesul de amenajare, prezentarea echipei și dezvăluirea prăjitorului partener.",
    mockupStrategy2_Title: "Soft Opening", mockupStrategy2_Desc: "O săptămână dedicată exclusiv comunității locale și influencerilor din nișa culinară, cu un meniu limitat la 50% reducere.",
    mockupChartSalaries: "Salarii", mockupChartRent: "Chirie & Utilități", mockupChartStock: "Stoc Marfă", mockupChartMarketing: "Marketing",
    mockupProfitMargin: "Marjă Profit",
    mockupLiveTitle: "# Plan de Afaceri - Cafenea de Specialitate \\"Urban Beans\\"", mockupLiveGen: "> Generând proiecții financiare (în LEI)...", mockupLiveRev: "## Venituri Estimate", mockupLiveRev1: "- Trimestrul 1: 150.000 lei (creștere organică)", mockupLiveRev2: "- Trimestrul 2: 275.000 lei (sezon cald)", mockupLiveRev3: "- Trimestrul 3: 400.000 lei (B2B stabilizat)",
    mockupLiveCosts: "## Costuri Operaționale", mockupLiveCosts1: "- Salarii: 35.000 lei / lună", mockupLiveCosts2: "- Chirie: 15.000 lei / lună",
    mockupLiveStatus: "## Stadiu Generare", mockupLiveStat1: "Analiză Competiție", mockupLiveStat2: "Strategie Prețuri", mockupLiveStat3: "Calcul ROI", mockupLiveComplete: "Complet",
    mockupBeforeTitle: "Înainte", mockupBeforeDesc: "\\"Vreau să deschid o cafenea. Am experiență de 5 ani în domeniu. Nu știu de unde să încep cu planul de afaceri.\\""
  },"""

en_strings = """
    mockupSummary: "Summary", mockupSwot: "SWOT", mockupBudget: "Budget", mockupStrategy: "Strategy",
    mockupSummaryP1: "is a modern specialty coffee shop located in the heart of the historic center. We aim to offer not only locally roasted origin coffee, but also a complete sensory experience in a minimalist industrial design environment.",
    mockupSummaryP2: "Our mission is to educate consumers about the bean-to-cup process, supporting independent farmers through fair trade (Fairtrade).",
    mockupSwotS_Title: "Strengths", mockupSwotS_1: "Premium location with heavy foot traffic", mockupSwotS_2: "SCA certified baristas", mockupSwotS_3: "Exclusivity for a renowned local roaster",
    mockupSwotW_Title: "Weaknesses", mockupSwotW_1: "High rent costs in the central area", mockupSwotW_2: "Lack of market history (new brand)", mockupSwotW_3: "Higher prices compared to commercial chains",
    mockupSwotO_Title: "Opportunities", mockupSwotO_1: "Growing demand for specialty coffee", mockupSwotO_2: "B2B partnerships with local offices", mockupSwotO_3: "Monthly coffee bean subscription",
    mockupSwotT_Title: "Threats", mockupSwotT_1: "Green coffee price fluctuations", mockupSwotT_2: "Opening of a new major franchise nearby", mockupSwotT_3: "Reluctance of traditionalist customers",
    mockupBudgetTitle: "Initial Investment Budget", mockupBudgetEq: "Equipment (Espresso machines, Grinders)", mockupBudgetDes: "Location setup & Design", mockupBudgetStock: "Initial inventory & Supplies",
    mockupStrategy1_Title: "Pre-launch & Teasing", mockupStrategy1_Desc: "Social Media campaign focused on the setup process, presenting the team and revealing the partner roaster.",
    mockupStrategy2_Title: "Soft Opening", mockupStrategy2_Desc: "A week dedicated exclusively to the local community and culinary influencers, with a limited menu at 50% discount.",
    mockupChartSalaries: "Salaries", mockupChartRent: "Rent & Utilities", mockupChartStock: "Inventory", mockupChartMarketing: "Marketing",
    mockupProfitMargin: "Profit Margin",
    mockupLiveTitle: "# Business Plan - Specialty Coffee Shop \\"Urban Beans\\"", mockupLiveGen: "> Generating financial projections...", mockupLiveRev: "## Estimated Revenues", mockupLiveRev1: "- Quarter 1: 150,000 (organic growth)", mockupLiveRev2: "- Quarter 2: 275,000 (warm season)", mockupLiveRev3: "- Quarter 3: 400,000 (stable B2B)",
    mockupLiveCosts: "## Operational Costs", mockupLiveCosts1: "- Salaries: 35,000 / month", mockupLiveCosts2: "- Rent: 15,000 / month",
    mockupLiveStatus: "## Generation Status", mockupLiveStat1: "Competition Analysis", mockupLiveStat2: "Pricing Strategy", mockupLiveStat3: "ROI Calculation", mockupLiveComplete: "Complete",
    mockupBeforeTitle: "Before", mockupBeforeDesc: "\\"I want to open a coffee shop. I have 5 years of experience in the field. I don't know where to start with the business plan.\\""
  },"""

es_strings = """
    mockupSummary: "Resumen", mockupSwot: "FODA", mockupBudget: "Presupuesto", mockupStrategy: "Estrategia",
    mockupSummaryP1: "es una moderna cafetería de especialidad situada en el corazón del centro histórico. Nuestro objetivo es ofrecer no solo café de origen tostado localmente, sino también una experiencia sensorial completa en un entorno de diseño industrial minimalista.",
    mockupSummaryP2: "Nuestra misión es educar a los consumidores sobre el proceso del grano a la taza, apoyando a los agricultores independientes mediante comercio justo (Fairtrade).",
    mockupSwotS_Title: "Fortalezas", mockupSwotS_1: "Ubicación premium con mucho tráfico", mockupSwotS_2: "Baristas certificados por SCA", mockupSwotS_3: "Exclusividad con un tostador local",
    mockupSwotW_Title: "Debilidades", mockupSwotW_1: "Altos costos de alquiler en la zona céntrica", mockupSwotW_2: "Falta de historial en el mercado (nueva marca)", mockupSwotW_3: "Precios más altos que las cadenas comerciales",
    mockupSwotO_Title: "Oportunidades", mockupSwotO_1: "Creciente demanda de café de especialidad", mockupSwotO_2: "Asociaciones B2B con oficinas de la zona", mockupSwotO_3: "Suscripción mensual de granos de café",
    mockupSwotT_Title: "Amenazas", mockupSwotT_1: "Fluctuación del precio del café verde", mockupSwotT_2: "Apertura de una nueva franquicia cercana", mockupSwotT_3: "Reticencia de los clientes tradicionalistas",
    mockupBudgetTitle: "Presupuesto de Inversión Inicial", mockupBudgetEq: "Equipamiento (Máquinas, Molinillos)", mockupBudgetDes: "Acondicionamiento y Diseño", mockupBudgetStock: "Inventario inicial y Suministros",
    mockupStrategy1_Title: "Pre-lanzamiento y Teasing", mockupStrategy1_Desc: "Campaña en redes sociales centrada en el proceso de montaje, presentación del equipo y revelación del tostador asociado.",
    mockupStrategy2_Title: "Apertura Suave", mockupStrategy2_Desc: "Una semana dedicada exclusivamente a la comunidad local e influencers culinarios, con un menú limitado al 50% de descuento.",
    mockupChartSalaries: "Salarios", mockupChartRent: "Alquiler y Servicios", mockupChartStock: "Inventario", mockupChartMarketing: "Marketing",
    mockupProfitMargin: "Margen de Beneficio",
    mockupLiveTitle: "# Plan de Negocio - Cafetería de Especialidad \\"Urban Beans\\"", mockupLiveGen: "> Generando proyecciones financieras...", mockupLiveRev: "## Ingresos Estimados", mockupLiveRev1: "- Trimestre 1: 150.000 (crecimiento orgánico)", mockupLiveRev2: "- Trimestre 2: 275.000 (temporada cálida)", mockupLiveRev3: "- Trimestre 3: 400.000 (B2B estable)",
    mockupLiveCosts: "## Costos Operativos", mockupLiveCosts1: "- Salarios: 35.000 / mes", mockupLiveCosts2: "- Alquiler: 15.000 / mes",
    mockupLiveStatus: "## Estado de Generación", mockupLiveStat1: "Análisis de la Competencia", mockupLiveStat2: "Estrategia de Precios", mockupLiveStat3: "Cálculo del ROI", mockupLiveComplete: "Completo",
    mockupBeforeTitle: "Antes", mockupBeforeDesc: "\\"Quiero abrir una cafetería. Tengo 5 años de experiencia. No sé por dónde empezar con el plan de negocio.\\""
  }
};"""

content = content.replace('paywallBtn: "Vizitează IdeeaTa.ai", studioHeaderSubtitle: "Proiectul tău de afaceri inteligent", costDistribution: "Distribuția Costurilor",\n  },', 'paywallBtn: "Vizitează IdeeaTa.ai", studioHeaderSubtitle: "Proiectul tău de afaceri inteligent", costDistribution: "Distribuția Costurilor",\n' + ro_strings)
content = content.replace('paywallBtn: "Visit IdeeaTa.ai", studioHeaderSubtitle: "Your intelligent business project", costDistribution: "Cost Distribution",\n  },', 'paywallBtn: "Visit IdeeaTa.ai", studioHeaderSubtitle: "Your intelligent business project", costDistribution: "Cost Distribution",\n' + en_strings)
content = content.replace('paywallBtn: "Visita IdeeaTa.ai", studioHeaderSubtitle: "Tu proyecto de negocio inteligente", costDistribution: "Distribución de Costes",\n  }\n};', 'paywallBtn: "Visita IdeeaTa.ai", studioHeaderSubtitle: "Tu proyecto de negocio inteligente", costDistribution: "Distribución de Costes",\n' + es_strings)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated uiStrings.ts")
