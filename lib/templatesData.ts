export interface ExpertTemplate {
  id: string;
  category: {
    ro: string;
    en: string;
    es: string;
  };
  title: {
    ro: string;
    en: string;
    es: string;
  };
  desc: {
    ro: string;
    en: string;
    es: string;
  };
  content: {
    ro: string;
    en: string;
    es: string;
  };
}

export const EXPERT_TEMPLATES: ExpertTemplate[] = [
  // ─── FONDURI EUROPENE & SUSTENABILITATE ─────────────────────────────────────
  {
    id: "dnsh_sustainability",
    category: {
      ro: "🌱 Fonduri Europene & Sustenabilitate",
      en: "🌱 EU Funding & Sustainability",
      es: "🌱 Fondos Europeos y Sostenibilidad"
    },
    title: {
      ro: "Declarație și Plan de Conformitate DNSH (Do No Significant Harm)",
      en: "DNSH (Do No Significant Harm) Compliance Plan & Statement",
      es: "Declaración y Plan de Cumplimiento DNSH (Do No Significant Harm)"
    },
    desc: {
      ro: "Capitol obligatoriu pentru accesarea granturilor nerambursabile și fondurilor europene 2026.",
      en: "Mandatory section for accessing non-reimbursable grants and 2026 EU funds.",
      es: "Sección obligatoria para acceder a subvenciones no reembolsables y fondos europeos 2026."
    },
    content: {
      ro: "Proiectul dezvoltat de {NUME_AFACERE} respectă cu strictețe principiul DNSH (Do No Significant Harm - A nu aduce prejudicii semnificative mediului) prevăzut în Regulamentul UE 2020/852. Activitatea companiei nu generează emisii semnificative de gaze cu efect de seră, iar toate deșeurile rezultate din activitatea operațională sunt colectate selectiv și predate operatorilor autorizați. De asemenea, echipamentele achiziționate fac parte din clasa energetică superioară (A++ / Energy Star), asigurând un consum redus de energie electrică cu cel puțin 25% față de variantele convenționale.",
      en: "The project developed by {NUME_AFACERE} strictly complies with the DNSH (Do No Significant Harm) principle under EU Regulation 2020/852. The company's operations do not generate significant greenhouse gas emissions, and all operational waste is selectively collected and transferred to authorized recyclers. Furthermore, all acquired equipment belongs to top energy efficiency classes (A++ / Energy Star), ensuring at least 25% lower power consumption compared to conventional alternatives.",
      es: "El proyecto desarrollado por {NUME_AFACERE} cumple estrictamente con el principio DNSH (Do No Significant Harm) según el Reglamento UE 2020/852. Las operaciones de la empresa no generan emisiones significativas de gases de efecto invernadero y todos los residuos operativos se recogen de forma selectiva. Además, los equipos adquiridos pertenecen a las clases energéticas superiores (A++ / Energy Star), garantizando un consumo eléctrico un 25% menor."
    }
  },
  {
    id: "green_transition_logistics",
    category: {
      ro: "🌱 Fonduri Europene & Sustenabilitate",
      en: "🌱 EU Funding & Sustainability",
      es: "🌱 Fondos Europeos y Sostenibilidad"
    },
    title: {
      ro: "Strategia de Logistică Verde și Amprentă Neutră de Carbon",
      en: "Green Logistics & Net-Zero Carbon Strategy",
      es: "Estrategia de Logística Verde y Carbono Neutro"
    },
    desc: {
      ro: "Detalierea transportului ecologic, panourilor fotovoltaice și optimizării de mediu.",
      en: "Detailed breakdown of eco-friendly transport, solar power, and environmental optimization.",
      es: "Desglose detallado de transporte ecológico, paneles solares y optimización ambiental."
    },
    content: {
      ro: "În vederea atingerii obiectivelor de neutralitate climatică, {NUME_AFACERE} integrează un pachet de măsuri ecologice în lanțul de distribuție. Transportul produselor și deplașările la clienți se realizează prioritar utilizând vehicule electrice sau hibride. Pentru sediul operațional, compania preconizează instalarea unui sistem de panouri fotovoltaice de minim 10 kWp care va acoperi peste 70% din necesarul energetic lunar, reducând amprenta de carbon directă cu 4.5 tone CO2 pe an.",
      en: "In order to achieve climate neutrality targets, {NUME_AFACERE} integrates a comprehensive package of green measures into its distribution chain. Deliveries and client visits are prioritized using electric or hybrid vehicles. For the operational premises, the company plans to install a photovoltaic system of at least 10 kWp to cover over 70% of monthly energy needs, reducing direct carbon emissions by 4.5 tons of CO2 per year.",
      es: "Con el fin de alcanzar los objetivos de neutralidad climática, {NUME_AFACERE} integra un paquete de medidas ecológicas en su cadena de distribución. Las entregas y visitas se realizan prioritariamente en vehículos eléctricos o híbridos. Para la sede operativa, la empresa prevé instalar un sistema fotovoltaico de al menos 10 kWp para cubrir más del 70% de las necesidades energéticas mensuales."
    }
  },
  {
    id: "equal_opportunity_inclusion",
    category: {
      ro: "🌱 Fonduri Europene & Sustenabilitate",
      en: "🌱 EU Funding & Sustainability",
      es: "🌱 Fondos Europeos y Sostenibilidad"
    },
    title: {
      ro: "Politica de Egalitate de Șanse, Diversitate și Incluziune Socială",
      en: "Equal Opportunity, Diversity & Social Inclusion Policy",
      es: "Política de Igualdad de Oportunidades, Diversidad e Inclusión"
    },
    desc: {
      ro: "Criteriu transversal obligatoriu în evaluarea proiectelor cu finanțare nerambursabilă.",
      en: "Mandatory cross-cutting evaluation criterion for grant-funded projects.",
      es: "Criterio transversal obligatorio en la evaluación de proyectos financiados."
    },
    content: {
      ro: "La nivelul companiei {NUME_AFACERE}, procesul de recrutare și promovare se desfășoară pe baza meritocrației și competentelor profesionale, fără nicio discriminare bazată de gen, vârstă, etnie, religie sau dizabilitate. Minimum 30% din pozițiile de management și specialist vor fi ocupate de persoane din categorii defavorizate sau tineri sub 29 de ani. Spațiul de lucru este amenajat cu facilități de accesibilitate pentru persoanele cu mobilitate redusă.",
      en: "At {NUME_AFACERE}, recruitment and promotion processes are strictly merit-based, without discrimination based on gender, age, ethnicity, religion, or disability. At least 30% of management and specialist positions will be filled by individuals from disadvantaged categories or youth under 29. Workspace design includes full accessibility features for individuals with reduced mobility.",
      es: "En {NUME_AFACERE}, los procesos de selección y promoción se basan estrictamente en el mérito profesional, sin discriminación de género, edad, etnia o discapacidad. Al menos el 30% de los puestos técnicos y directivos estarán ocupados por personas de colectivos desfavorecidos o jóvenes menores de 29 años."
    }
  },

  // ─── TEHNOLOGIE & DIGITALIZARE ──────────────────────────────────────────────
  {
    id: "digitalization_erp_crm",
    category: {
      ro: "💻 Tehnologie & Digitalizare",
      en: "💻 Technology & Digitalization",
      es: "💻 Tecnología y Digitalización"
    },
    title: {
      ro: "Planul de Digitalizare Integrată (ERP, CRM & Automatizare Cloud)",
      en: "Integrated Digitalization Plan (ERP, CRM & Cloud Automation)",
      es: "Plan de Digitalización Integrada (ERP, CRM y Automatización Cloud)"
    },
    desc: {
      ro: "Optimizarea operațiunilor prin software modern și stocare securizată în cloud.",
      en: "Operational optimization through modern software and secure cloud storage.",
      es: "Optimización operativa mediante software moderno y almacenamiento seguro en la nube."
    },
    content: {
      ro: "Pentru eficientizarea proceselor de afaceri, {NUME_AFACERE} va implementa o platformă integrată ERP/CRM în Cloud. Această soluție permite gestiunea automată a stocurilor, emiterea și transmiterea facturilor electronice (e-Factura), precum și analiza în timp real a oportunităților de vânzare. Prin automatizarea sarcinilor repetitive, timpul de procesare a comenzilor se reduce cu 40%, eliminând erorile umane din fluxul operațional.",
      en: "To streamline business processes, {NUME_AFACERE} will implement an integrated Cloud ERP/CRM platform. This solution enables automated inventory management, electronic invoicing (e-Invoicing), and real-time sales pipeline analytics. By automating repetitive tasks, order processing time is reduced by 40%, eliminating human error from the operational workflow.",
      es: "Para agilizar los procesos comerciales, {NUME_AFACERE} implementará una plataforma integrada de ERP/CRM en la nube. Esta solución permite la gestión automatizada de inventarios, facturación electrónica y análisis en tiempo real. Al automatizar tareas repetitivas, el tiempo de procesamiento se reduce en un 40%."
    }
  },
  {
    id: "cybersecurity_data_privacy",
    category: {
      ro: "💻 Tehnologie & Digitalizare",
      en: "💻 Technology & Digitalization",
      es: "💻 Tecnología y Digitalización"
    },
    title: {
      ro: "Politica de Securitate Cibernetică și Protecție a Datelor (GDPR)",
      en: "Cybersecurity & GDPR Data Privacy Architecture",
      es: "Arquitectura de Ciberseguridad y Privacidad de Datos (RGPD)"
    },
    desc: {
      ro: "Infrastructură de protecție împotriva atacurilor cibernetice și conformitate legală.",
      en: "Infrastructure protection against cyber threats and legal compliance.",
      es: "Protección de infraestructura contra ciberamenazas y cumplimiento legal."
    },
    content: {
      ro: "Protecția datelor clienților este o prioritate critică pentru {NUME_AFACERE}. Infrastructura IT include autentificare cu doi factori (2FA), criptare End-to-End pentru datele sensibile și backup automatizat zilnic în locații redundante geografic. Sistemele sunt protejate prin firewall-uri de generație nouă și antimalware monitorizat 24/7. Politica GDPR garantează dreptul la ștergerea datelor și transparența totală privind prelucrarea acestora.",
      en: "Data protection is a critical priority for {NUME_AFACERE}. The IT infrastructure features multi-factor authentication (MFA), end-to-end encryption for sensitive data, and daily automated backups across geographically redundant nodes. Systems are safeguarded by next-gen firewalls and 24/7 monitored antimalware. GDPR policies guarantee data deletion rights and processing transparency.",
      es: "La protección de datos es una prioridad crítica para {NUME_AFACERE}. La infraestructura de TI incluye autenticación multifactor (MFA), cifrado de extremo a extremo y copias de seguridad automáticas diarias. Los sistemas están protegidos por cortafuegos de última generación."
    }
  },

  // ─── ANALIZĂ DE RISC & MANAGEMENT ──────────────────────────────────────────
  {
    id: "risk_analysis_mitigation",
    category: {
      ro: "🛡️ Analiză de Risc & Management",
      en: "🛡️ Risk Analysis & Management",
      es: "🛡️ Análisis de Riesgo y Gestión"
    },
    title: {
      ro: "Matricea de Evaluare și Mitigare a Riscurilor de Afaceri",
      en: "Business Risk Evaluation & Mitigation Matrix",
      es: "Matriz de Evaluación y Mitigación de Riesgos"
    },
    desc: {
      ro: "Identificarea riscurilor financiare, operaționale și de piață cu măsuri preventive.",
      en: "Identification of financial, operational, and market risks with preventive measures.",
      es: "Identificación de riesgos financieros, operativos y de mercado con medidas preventivas."
    },
    content: {
      ro: "Managementul {NUME_AFACERE} a identificat trei categorii principale de riscuri: (1) Risc de piață - fluctuația cererii (mitigat prin diversificarea portofoliului și contracte pe termen lung); (2) Risc operațional - întreruperi de furnizare (mitigat prin menținerea a cel puțin 2 furnizori alternativi pentru componentele cheie); (3) Risc financiar - neîncasarea la timp a creanțelor (mitigat prin asigurarea creditului comercial și termen de plată de maxim 30 zile).",
      en: "{NUME_AFACERE} management has identified three primary risk categories: (1) Market risk - demand fluctuations (mitigated via portfolio diversification and long-term service contracts); (2) Operational risk - supply chain disruptions (mitigated by maintaining at least 2 alternate suppliers for core items); (3) Financial risk - delayed receivables (mitigated through trade credit insurance and strict 30-day payment terms).",
      es: "La dirección de {NUME_AFACERE} ha identificado tres categorías de riesgo: (1) Riesgo de mercado - fluctuaciones de demanda; (2) Riesgo operativo - interrupción de suministro (mitigado con al menos 2 proveedores alternativos); (3) Riesgo financiero - impagos (mitigado mediante pólizas de crédito)."
    }
  },
  {
    id: "hr_retention_organigram",
    category: {
      ro: "🛡️ Analiză de Risc & Management",
      en: "🛡️ Risk Analysis & Management",
      es: "🛡️ Análisis de Riesgo y Gestión"
    },
    title: {
      ro: "Planul de Recrutare, Fidelizare a Resurselor Umane și Cultură Organizațională",
      en: "HR Recruitment, Employee Retention & Culture Strategy",
      es: "Estrategia de Selección, Retención de Talento y Cultura"
    },
    desc: {
      ro: "Strategia de atragere a talentelor, pachete de beneficii și motivare a echipei.",
      en: "Talent acquisition strategy, benefit packages, and team motivation.",
      es: "Estrategia de atracción de talento, beneficios y motivación del equipo."
    },
    content: {
      ro: "Echipa este principalul motor de creștere pentru {NUME_AFACERE}. Strategia de resurse umane îmbină salarii competitive cu pachete flexibile de beneficii (abonamente medicale private, bugete de training personalizat și posibilitate de lucru hibrid). Pentru retenția personalului cheie, compania implementează un sistem transparent de bonusare bazat pe KPI-uri de performanță trimestriale și posibilități clare de promovare internă.",
      en: "The team is the primary growth engine for {NUME_AFACERE}. The HR strategy combines competitive salaries with flexible benefit packages (private healthcare, individual learning budgets, and hybrid work flexibility). To retain key staff, the company implements a transparent performance-based bonus system linked to quarterly KPIs and clear internal advancement paths.",
      es: "El equipo es el motor de crecimiento de {NUME_AFACERE}. La estrategia de RRHH combina salarios competitivos con beneficios flexibles (seguro médico privado, presupuesto de formación y trabajo híbrido). Para la retención, se implementa un sistema transparente de bonos por KPI."
    }
  },

  // ─── MARKETING & STRATEGIE DE VÂNZĂRI ──────────────────────────────────────
  {
    id: "b2b_sales_funnel",
    category: {
      ro: "📈 Marketing & Strategie de Vânzări",
      en: "📈 Marketing & Sales Strategy",
      es: "📈 Marketing y Estrategia de Ventas"
    },
    title: {
      ro: "Strategia de Achiziție Clienți B2B și Funnel de Vânzări",
      en: "B2B Customer Acquisition Strategy & Sales Funnel",
      es: "Estrategia de Adquisición de Clientes B2B y Embudo de Ventas"
    },
    desc: {
      ro: "Procesul pas cu pas de generare de lead-uri, prospectare și închidere de contracte.",
      en: "Step-by-step lead generation, prospecting, and contract closing pipeline.",
      es: "Proceso paso a paso de generación de leads, prospección y cierre de contratos."
    },
    content: {
      ro: "Pentru atragerea clienților corporate, {NUME_AFACERE} utilizează o strategie mixtă de Outbound și Inbound Marketing. Componenta Outbound implică prospectare directă pe LinkedIn Sales Navigator și participare la evenimente din industrie. Componenta Inbound este susținută de studii de caz relevante și articole tehnice SEO. Rata medie de conversie din lead calificat în client platitor este estimată la 12%, cu un ciclu mediu de vânzare de 45 de zile.",
      en: "To attract corporate clients, {NUME_AFACERE} employs a blended Outbound and Inbound Marketing model. Outbound tactics include targeted LinkedIn Sales Navigator outreach and industry trade fair presence. Inbound marketing is driven by authoritative case studies and SEO content. The lead-to-customer conversion rate is projected at 12%, with an average 45-day sales cycle.",
      es: "Para captar clientes corporativos, {NUME_AFACERE} utiliza un modelo mixto Outbound e Inbound. Las acciones Outbound incluyen prospección en LinkedIn y ferias sectoriales. El Inbound se basa en casos de éxito y SEO. La tasa de conversión proyectada es del 12%."
    }
  },
  {
    id: "pricing_strategy_monetization",
    category: {
      ro: "📈 Marketing & Strategie de Vânzări",
      en: "📈 Marketing & Sales Strategy",
      es: "📈 Marketing y Estrategia de Ventas"
    },
    title: {
      ro: "Strategia de Prețuri, Monetizare și Valoare Sustenabilă",
      en: "Pricing Model, Monetization & Sustainable Value Strategy",
      es: "Modelo de Precios, Monetización y Estrategia de Valor"
    },
    desc: {
      ro: "Structura de tarifare, abonamente, discounturi de volum și marjă de profit.",
      en: "Pricing tiers, subscription structure, volume discounts, and profit margins.",
      es: "Estructura de precios, suscripciones, descuentos por volumen y margen."
    },
    content: {
      ro: "Modelul de monetizare al {NUME_AFACERE} se bazează pe o politică de Value-Based Pricing (preț bazat pe valoarea oferită clienților). Compania oferă 3 niveluri tarifare: Standard (pentru IMM-uri), Professional (pentru afaceri în expansiune) și Enterprise (personalizat). Marja brută de profit este menținută la nivelul optim de 45%, permițând refinanțarea continuă a departamentului de cercetare și dezvoltare (R&D).",
      en: "{NUME_AFACERE}'s monetization model relies on Value-Based Pricing. The company offers 3 distinct pricing tiers: Standard (for SMEs), Professional (for growing businesses), and Enterprise (customized). The target gross profit margin is maintained at a healthy 45%, allowing continuous reinvestment into R&D and service upgrades.",
      es: "El modelo de monetización de {NUME_AFACERE} se basa en precios por valor ofrecido (Value-Based Pricing). La empresa ofrece 3 niveles: Standard, Professional y Enterprise. El margen bruto de beneficio se mantiene en el 45%, permitiendo reinversión continua."
    }
  }
];
