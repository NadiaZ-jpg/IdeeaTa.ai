/**
 * UI_STRINGS - Centralizare completa a string-urilor UI
 * Folosit in DemoDesktop.tsx si StudioDesktop.tsx
 * Pattern: const ui = UI_STRINGS[locale]; => ui.cheie
 */

type Locale = "ro" | "en" | "es";

type UIStringsShape = {
  // NAVBAR
  pricing: string; logOut: string; logIn: string; tryFree: string; myPlans: string;
  badgeStudioGrants: string; badgeStandardUnlocked: string; badgePreviewOnly: string;
  supportCoffeeTitle: string; businessExamplesTitle: string;
  generationTime: string; generationTimeSub: string;
  exportFormat: string; documentStructure: string; documentStructureSub: string; grantsInvestors: string;
  // HERO
  heroSubtitle: string; heroDesc1: string; heroDesc2: string;
  ideaComingAlive: string; buildPlanIntelligently: string;
  inputPlaceholder: string; inspireMe: string; generatePlan: string;
  limitReached: string; limitRemaining: string;
  // LOADING
  downloadQualityNote: string;
  generatingPptx: string; generatingPdf: string; generatingDoc: string;
  aiLoadingStep0: string; aiLoadingStep1: string; aiLoadingStep2: string; aiLoadingStep3: string;
  aiLoadingDesc0: string; aiLoadingDesc1: string; aiLoadingDesc2: string; aiLoadingDesc3: string;
  // ERROR MODAL
  processingError: string; retryBtn: string; closeBtn: string;
  // DOWNLOAD
  downloading: string; downloadFreeSummary: string;
  downloadPresentation: string; downloadBrochure: string; downloadDocument: string;
  unlockDownloadsTitle: string;
  tooltipPdfPresentation: string; tooltipPptxBrochure: string; tooltipWordDocument: string; tooltipPackageStandard: string;
  // VERSION TABS
  versionOriginal: string; versionTone: string; versionEuFunds: string;
  versionBudget: string; versionExpert: string; versionInvestor: string;
  // PLAN SECTIONS
  sectionGeneral: string; sectionMarket: string; sectionOperational: string; sectionFinancial: string;
  fieldLegalForm: string; fieldCaenCode: string; fieldContact: string;
  fieldObjectives1y: string; fieldObjectives35y: string; fieldMissionValues: string;
  fieldTargetCustomers: string; fieldCompetition: string; fieldMarketingStrategy: string;
  fieldTechFlow: string; fieldHumanResources: string; fieldLocationEquipment: string; fieldCostDistribution: string;
  // SWOT
  swotStrengths: string; swotWeaknesses: string; swotOpportunities: string; swotThreats: string;
  swotStrengthsLetter: string; swotWeaknessesLetter: string;
  // SLIDES
  slideVisionStrategy: string; slideMarketAnalysis: string; slideSwot: string;
  slideStrengths: string; slideWeaknesses: string; slideOpportunities: string; slideThreats: string;
  slideOperationalPlan: string; slideFinancialPlan: string;
  slideObjShort: string; slideObjMedium: string; slideMissionValues: string;
  slideTargetCustomers: string; slideCompetition: string; slideMarketingStrategy: string;
  slideTechFlow: string; slideHumanResources: string; slideLocationEquipment: string;
  // TOOLS PANEL
  toolsTitle: string; toolsDesc: string; proChaptersTitle: string;
  investorPlanBtn: string; investorPlanDesc: string;
  euFundsBtn: string; euFundsDesc: string;
  toneTitle: string; toneDesc: string; budgetTitle: string; budgetDesc: string; processing: string;
  // EDIT
  sectionEditTitle: string;
  // AUTH
  loginTitle: string; loginSubtitle: string; continueGoogle: string; orDivider: string;
  emailPlaceholder: string; passwordPlaceholder: string; loginBtn2: string; registerBtn: string;
  forgotPassword: string; noAccount: string; hasAccount: string;
  forgotPasswordTitle: string; sendResetEmail: string; backToLogin: string; resetEmailSent: string;
  // MISC
  currencyNotice: string; shareBtn: string; shareCopied: string;
  printBtn: string; resetBtn: string; newPlan: string; confirmUnlockPlan: string;
};

export const UI_STRINGS: Record<Locale, UIStringsShape> = {
  ro: {
    pricing: "Tarife", logOut: "Iesi din cont", logIn: "Autentificare", tryFree: "Testeaza Gratuit",
    myPlans: "Proiectele Mele", badgeStudioGrants: "STUDIO & FONDURI",
    badgeStandardUnlocked: "STANDARD DEBLOCAT", badgePreviewOnly: "PREVIZUALIZARE",
    supportCoffeeTitle: "Sustine IdeeaTa.ai cu o cafea",
    businessExamplesTitle: "Exemple de Afaceri",
    generationTime: "Timp de generare", generationTimeSub: "Sub 60 sec",
    exportFormat: "Format export", documentStructure: "Structura Document",
    documentStructureSub: "6 Capitole Standard", grantsInvestors: "Fonduri / Investitori",
    heroSubtitle: "Transforma-ti experienta intr-un business validat.",
    heroDesc1: "Descrie la ce esti bun, iar noi iti vom genera un plan de afaceri complet.",
    heroDesc2: "Analiza SWOT, proiectii financiare si strategie de piata.",
    ideaComingAlive: "Ideea Ta prinde viata...",
    buildPlanIntelligently: "Construieste planul tau de afaceri inteligent. Viziunea ta, sprijinul nostru!",
    inputPlaceholder: "Descrie ideea ta de afaceri in detaliu... (ex: Vreau sa deschid o cafenea de specialitate cu produse vegane in centrul orasului...)",
    inspireMe: "Inspira-ma", generatePlan: "Genereaza Planul",
    limitReached: "Ai epuizat cele 3 planuri gratuite fara cont. Inregistreaza-te gratuit pentru a debloca inca +1 plan.",
    limitRemaining: "Mai ai dreptul la {{count}} planuri gratuite fara cont. Creeaza cont gratuit ulterior pentru inca +1 plan.",
    downloadQualityNote: "Acest proces dureaza cateva momente pentru a asigura calitatea maxima.",
    generatingPptx: "Se genereaza brosura de prezentare...",
    generatingPdf: "Se genereaza prezentarea...", generatingDoc: "Se genereaza document...",
    aiLoadingStep0: "Se rescrie documentul...", aiLoadingStep1: "Se proceseaza sectiunile...",
    aiLoadingStep2: "Se calculeaza datele...", aiLoadingStep3: "Se finalizeaza...",
    aiLoadingDesc0: "Acest proces dureaza 15-20 de secunde. Analizam structura actuala a documentului...",
    aiLoadingDesc1: "Generam sectiunile si rescriem paragrafele pentru o calitate maxima...",
    aiLoadingDesc2: "Aplicam calculele financiare si rafinam tonul profesional...",
    aiLoadingDesc3: "Ultimele retusuri. Pregatim noul tau plan de afaceri...",
    processingError: "Eroare la procesare", retryBtn: "Reincearca", closeBtn: "Inchide",
    downloading: "Se descarca...", downloadFreeSummary: "DESCARCA SUMAR GRATUIT",
    downloadPresentation: "Prezentare", downloadBrochure: "Brosura", downloadDocument: "Document",
    unlockDownloadsTitle: "Deblocheaza Descarcarile Complete (Pachet Standard)",
    tooltipPdfPresentation: "Prezentare PDF", tooltipPptxBrochure: "Brosura PPTX",
    tooltipWordDocument: "Document Word", tooltipPackageStandard: "Pachet Standard",
    versionOriginal: "Varianta Originala", versionTone: "Rescrie Tonul",
    versionEuFunds: "Optimizat Fonduri UE", versionBudget: "Buget Optimizat",
    versionExpert: "Sectiuni Expert", versionInvestor: "Plan Investitori",
    sectionGeneral: "I & II. Date Generale si Viziune",
    sectionMarket: "III. Analiza Pietei si Promovarea",
    sectionOperational: "V. Planul Operational si de Management",
    sectionFinancial: "VI. Planul Financiar",
    fieldLegalForm: "Forma Juridica:", fieldCaenCode: "Cod CAEN:", fieldContact: "Contact:",
    fieldObjectives1y: "Obiective (1 an):", fieldObjectives35y: "Obiective (3-5 ani):",
    fieldMissionValues: "Misiune si Valori:", fieldTargetCustomers: "Clientii Tinta:",
    fieldCompetition: "Concurenta:", fieldMarketingStrategy: "Strategia de Marketing:",
    fieldTechFlow: "Descriere Flux Tehnologic:", fieldHumanResources: "Resurse Umane:",
    fieldLocationEquipment: "Locatie si Dotari:", fieldCostDistribution: "Distributia costurilor",
    swotStrengths: "Puncte Tari", swotWeaknesses: "Slabiciuni",
    swotOpportunities: "Oportunitati", swotThreats: "Amenintari",
    swotStrengthsLetter: "S", swotWeaknessesLetter: "W",
    slideVisionStrategy: "Viziune si Strategie", slideMarketAnalysis: "Analiza Pietei",
    slideSwot: "Analiza Strategica SWOT", slideStrengths: "Puncte Tari (Strengths)",
    slideWeaknesses: "Slabiciuni (Weaknesses)", slideOpportunities: "Oportunitati (Opportunities)",
    slideThreats: "Amenintari (Threats)", slideOperationalPlan: "Planul Operational",
    slideFinancialPlan: "Plan Financiar", slideObjShort: "Obiective (1 an)",
    slideObjMedium: "Obiective (3-5 ani)", slideMissionValues: "Misiune si Valori",
    slideTargetCustomers: "Clientii Tinta", slideCompetition: "Concurenta",
    slideMarketingStrategy: "Strategia de Marketing",
    slideTechFlow: "Descriere Flux Tehnologic", slideHumanResources: "Resurse Umane",
    slideLocationEquipment: "Locatie si Dotari",
    toolsTitle: "Instrumente",
    toolsDesc: "Aici poti folosi asistentul inteligent pentru a adauga mai multe informatii si detalii planului tau.",
    proChaptersTitle: "Capitole Pro",
    investorPlanBtn: "Plan Profesionist (Investitori/Banci)",
    investorPlanDesc: "Se va genera:\n1. Rezumat Executiv\n2. Matrice Diferentiere\n3. Strategie Go-To-Market\n4. Analiza Risc\n5. Scenarii Financiare",
    euFundsBtn: "Fonduri Europene (Granturi)",
    euFundsDesc: "Se va genera un capitol dedicat accesarii fondurilor europene disponibile pentru afacerea ta.",
    toneTitle: "Rescrie Tonul", toneDesc: "Reformuleaza planul cu un ton diferit.",
    budgetTitle: "Optimizare Buget", budgetDesc: "Redistribuie procentele bugetului de investitii.",
    processing: "Se proceseaza...",
    sectionEditTitle: "Editeaza Sectiunea",
    loginTitle: "Bun venit inapoi", loginSubtitle: "Autentifica-te pentru a accesa planurile tale",
    continueGoogle: "Continua cu Google", orDivider: "sau",
    emailPlaceholder: "Email", passwordPlaceholder: "Parola",
    loginBtn2: "Autentificare", registerBtn: "Inregistrare",
    forgotPassword: "Ai uitat parola?", noAccount: "Nu ai cont?", hasAccount: "Ai deja cont?",
    forgotPasswordTitle: "Reseteaza parola", sendResetEmail: "Trimite email de resetare",
    backToLogin: "Inapoi la autentificare",
    resetEmailSent: "Email de resetare trimis! Verifica casuta postala.",
    currencyNotice: "Sumele sunt estimate si pot varia in functie de piata.",
    shareBtn: "Partajeaza", shareCopied: "Link copiat!", printBtn: "Printeaza",
    resetBtn: "Plan Nou", newPlan: "Plan Nou",
    confirmUnlockPlan: "Folosesti 1 credit pentru a debloca descarcarea completa a planului",
  },
  en: {
    pricing: "Pricing", logOut: "Log Out", logIn: "Log In", tryFree: "Try Free",
    myPlans: "My Plans", badgeStudioGrants: "STUDIO & GRANTS",
    badgeStandardUnlocked: "STANDARD UNLOCKED", badgePreviewOnly: "PREVIEW ONLY",
    supportCoffeeTitle: "Support IdeeaTa.ai with a coffee",
    businessExamplesTitle: "Business Examples",
    generationTime: "Generation Time", generationTimeSub: "Under 60 sec",
    exportFormat: "Export Format", documentStructure: "Document Structure",
    documentStructureSub: "6 Standard Chapters", grantsInvestors: "Grants / Investors",
    heroSubtitle: "Turn your expertise into a validated business.",
    heroDesc1: "Describe what you are good at, and we will generate a complete business plan for you.",
    heroDesc2: "SWOT analysis, financial projections, and market strategy.",
    ideaComingAlive: "Your Idea is coming to life...",
    buildPlanIntelligently: "Build your business plan intelligently. Your vision, our support!",
    inputPlaceholder: "Describe your business idea in detail... (e.g. I want to open a specialty coffee shop with vegan products in the city center...)",
    inspireMe: "Inspire me", generatePlan: "Generate the Plan",
    limitReached: "You have used your 3 free guest plan generations. Register for free to unlock +1 more plan.",
    limitRemaining: "You have {{count}} free guest plan generations remaining. Create a free account later for +1 more.",
    downloadQualityNote: "This process takes a few moments to ensure maximum quality.",
    generatingPptx: "Generating presentation brochure...",
    generatingPdf: "Generating presentation...", generatingDoc: "Generating document...",
    aiLoadingStep0: "Rewriting the document...", aiLoadingStep1: "Processing sections...",
    aiLoadingStep2: "Calculating data...", aiLoadingStep3: "Finalizing...",
    aiLoadingDesc0: "This process takes 15-20 seconds. We are analyzing the current structure of the document...",
    aiLoadingDesc1: "Generating sections and rewriting paragraphs for maximum quality...",
    aiLoadingDesc2: "Applying financial calculations and refining the professional tone...",
    aiLoadingDesc3: "Final touches. Preparing your new business plan...",
    processingError: "Processing Error", retryBtn: "Retry", closeBtn: "Close",
    downloading: "Downloading...", downloadFreeSummary: "DOWNLOAD FREE SUMMARY",
    downloadPresentation: "Presentation", downloadBrochure: "Brochure", downloadDocument: "Document",
    unlockDownloadsTitle: "Unlock Full Downloads (Standard Package)",
    tooltipPdfPresentation: "PDF Presentation", tooltipPptxBrochure: "PPTX Brochure",
    tooltipWordDocument: "Word Document", tooltipPackageStandard: "Standard Package",
    versionOriginal: "Original Version", versionTone: "Rewrite Tone",
    versionEuFunds: "EU Funds Optimized", versionBudget: "Budget Optimized",
    versionExpert: "Expert Sections", versionInvestor: "Investors Plan",
    sectionGeneral: "I & II. General Information and Vision",
    sectionMarket: "III. Market Analysis and Promotion",
    sectionOperational: "V. Operational and Management Plan",
    sectionFinancial: "VI. Financial Plan",
    fieldLegalForm: "Legal Form:", fieldCaenCode: "CAEN Code:", fieldContact: "Contact:",
    fieldObjectives1y: "Objectives (1 year):", fieldObjectives35y: "Objectives (3-5 years):",
    fieldMissionValues: "Mission and Values:", fieldTargetCustomers: "Target Customers:",
    fieldCompetition: "Competition:", fieldMarketingStrategy: "Marketing Strategy:",
    fieldTechFlow: "Technological Flow Description:", fieldHumanResources: "Human Resources:",
    fieldLocationEquipment: "Location and Equipment:", fieldCostDistribution: "Cost Distribution",
    swotStrengths: "Strengths", swotWeaknesses: "Weaknesses",
    swotOpportunities: "Opportunities", swotThreats: "Threats",
    swotStrengthsLetter: "S", swotWeaknessesLetter: "W",
    slideVisionStrategy: "Vision and Strategy", slideMarketAnalysis: "Market Analysis",
    slideSwot: "Strategic SWOT Analysis", slideStrengths: "Strengths",
    slideWeaknesses: "Weaknesses", slideOpportunities: "Opportunities",
    slideThreats: "Threats", slideOperationalPlan: "Operational Plan",
    slideFinancialPlan: "Financial Plan", slideObjShort: "Objectives (1 year)",
    slideObjMedium: "Objectives (3-5 years)", slideMissionValues: "Mission and Values",
    slideTargetCustomers: "Target Customers", slideCompetition: "Competition",
    slideMarketingStrategy: "Marketing Strategy",
    slideTechFlow: "Technological Flow Description", slideHumanResources: "Human Resources",
    slideLocationEquipment: "Location and Equipment",
    toolsTitle: "Tools",
    toolsDesc: "Here you can use the intelligent assistant to add more information and details to your plan.",
    proChaptersTitle: "Pro Chapters",
    investorPlanBtn: "Professional Plan (Investors/Banks)",
    investorPlanDesc: "The following will be generated:\n1. Executive Summary\n2. Differentiation Matrix\n3. Go-To-Market Strategy\n4. Risk Analysis\n5. Financial Scenarios",
    euFundsBtn: "European Funds (Grants)",
    euFundsDesc: "A dedicated chapter will be generated for accessing available European funds for your business.",
    toneTitle: "Rewrite Tone", toneDesc: "Reformat the plan with a different tone.",
    budgetTitle: "Budget Optimization", budgetDesc: "Redistribute investment budget percentages.",
    processing: "Processing...",
    sectionEditTitle: "Edit Section",
    loginTitle: "Welcome back", loginSubtitle: "Log in to access your plans",
    continueGoogle: "Continue with Google", orDivider: "or",
    emailPlaceholder: "Email", passwordPlaceholder: "Password",
    loginBtn2: "Log In", registerBtn: "Register",
    forgotPassword: "Forgot password?", noAccount: "Do not have an account?", hasAccount: "Already have an account?",
    forgotPasswordTitle: "Reset password", sendResetEmail: "Send reset email",
    backToLogin: "Back to login",
    resetEmailSent: "Reset email sent! Check your inbox.",
    currencyNotice: "Amounts are estimated and may vary depending on the market.",
    shareBtn: "Share", shareCopied: "Link copied!", printBtn: "Print",
    resetBtn: "New Plan", newPlan: "New Plan",
    confirmUnlockPlan: "You will use 1 credit to unlock the full download of this plan",
  },
  es: {
    pricing: "Precios", logOut: "Cerrar sesion", logIn: "Iniciar sesion", tryFree: "Probar Gratis",
    myPlans: "Mis Planes", badgeStudioGrants: "STUDIO Y BECAS",
    badgeStandardUnlocked: "STANDARD DESBLOQUEADO", badgePreviewOnly: "SOLO VISTA PREVIA",
    supportCoffeeTitle: "Apoya a IdeeaTa.ai con un cafe",
    businessExamplesTitle: "Ejemplos de Negocios",
    generationTime: "Tiempo de Generacion", generationTimeSub: "Menos de 60 seg",
    exportFormat: "Formato de Exportacion", documentStructure: "Estructura del Documento",
    documentStructureSub: "6 Capitulos Estandar", grantsInvestors: "Subvenciones / Inversores",
    heroSubtitle: "Convierte tu experiencia en un negocio validado.",
    heroDesc1: "Describe en que eres bueno y generaremos un plan de negocios completo para ti.",
    heroDesc2: "Analisis FODA, proyecciones financieras y estrategia de mercado.",
    ideaComingAlive: "Tu Idea esta cobrando vida...",
    buildPlanIntelligently: "Crea tu plan de negocios inteligentemente. Tu vision, nuestro apoyo!",
    inputPlaceholder: "Describe tu idea de negocio en detalle... (ej: Quiero abrir una cafeteria de especialidad con productos veganos en el centro de la ciudad...)",
    inspireMe: "Inspirame", generatePlan: "Generar el Plan",
    limitReached: "Has agotado las 3 generaciones gratuitas como invitado. Registrate gratis para desbloquear +1 plan mas.",
    limitRemaining: "Te quedan {{count}} generaciones de planes gratuitos como invitado. Crea una cuenta gratuita mas tarde para +1 mas.",
    downloadQualityNote: "Este proceso tarda unos momentos para garantizar la maxima calidad.",
    generatingPptx: "Generando folleto de presentacion...",
    generatingPdf: "Generando presentacion...", generatingDoc: "Generando documento...",
    aiLoadingStep0: "Reescribiendo el documento...", aiLoadingStep1: "Procesando secciones...",
    aiLoadingStep2: "Calculando datos...", aiLoadingStep3: "Finalizando...",
    aiLoadingDesc0: "Este proceso tarda 15-20 segundos. Estamos analizando la estructura actual del documento...",
    aiLoadingDesc1: "Generando secciones y reescribiendo parrafos para maxima calidad...",
    aiLoadingDesc2: "Aplicando calculos financieros y refinando el tono profesional...",
    aiLoadingDesc3: "Toques finales. Preparando tu nuevo plan de negocios...",
    processingError: "Error de procesamiento", retryBtn: "Reintentar", closeBtn: "Cerrar",
    downloading: "Descargando...", downloadFreeSummary: "DESCARGAR RESUMEN GRATUITO",
    downloadPresentation: "Presentacion", downloadBrochure: "Folleto", downloadDocument: "Documento",
    unlockDownloadsTitle: "Desbloquear Descargas Completas (Paquete Estandar)",
    tooltipPdfPresentation: "Presentacion PDF", tooltipPptxBrochure: "Folleto PPTX",
    tooltipWordDocument: "Documento Word", tooltipPackageStandard: "Paquete Estandar",
    versionOriginal: "Version Original", versionTone: "Tono Reescrito",
    versionEuFunds: "Fondos UE", versionBudget: "Presupuesto Optimizado",
    versionExpert: "Secciones Expertas", versionInvestor: "Plan para Inversores",
    sectionGeneral: "I & II. Informacion General y Vision",
    sectionMarket: "III. Analisis de Mercado y Promocion",
    sectionOperational: "V. Plan Operativo y de Gestion",
    sectionFinancial: "VI. Plan Financiero",
    fieldLegalForm: "Forma Juridica:", fieldCaenCode: "Codigo CAEN:", fieldContact: "Contacto:",
    fieldObjectives1y: "Objetivos (1 ano):", fieldObjectives35y: "Objetivos (3-5 anos):",
    fieldMissionValues: "Mision y Valores:", fieldTargetCustomers: "Clientes Objetivo:",
    fieldCompetition: "Competencia:", fieldMarketingStrategy: "Estrategia de Marketing:",
    fieldTechFlow: "Descripcion del Flujo Tecnologico:", fieldHumanResources: "Recursos Humanos:",
    fieldLocationEquipment: "Ubicacion y Equipamiento:", fieldCostDistribution: "Distribucion de Costos",
    swotStrengths: "Fortalezas", swotWeaknesses: "Debilidades",
    swotOpportunities: "Oportunidades", swotThreats: "Amenazas",
    swotStrengthsLetter: "F", swotWeaknessesLetter: "D",
    slideVisionStrategy: "Vision y Estrategia", slideMarketAnalysis: "Analisis de Mercado",
    slideSwot: "Analisis FODA Estrategico", slideStrengths: "Fortalezas (Strengths)",
    slideWeaknesses: "Debilidades (Weaknesses)", slideOpportunities: "Oportunidades (Opportunities)",
    slideThreats: "Amenazas (Threats)", slideOperationalPlan: "Plan Operativo",
    slideFinancialPlan: "Plan Financiero", slideObjShort: "Objetivos (1 ano)",
    slideObjMedium: "Objetivos (3-5 anos)", slideMissionValues: "Mision y Valores",
    slideTargetCustomers: "Clientes Objetivo", slideCompetition: "Competencia",
    slideMarketingStrategy: "Estrategia de Marketing",
    slideTechFlow: "Descripcion del Flujo Tecnologico", slideHumanResources: "Recursos Humanos",
    slideLocationEquipment: "Ubicacion y Equipamiento",
    toolsTitle: "Herramientas",
    toolsDesc: "Aqui puedes utilizar el asistente inteligente para anadir mas informacion y detalles a tu plan.",
    proChaptersTitle: "Capitulos Pro",
    investorPlanBtn: "Plan Profesional (Inversores/Bancos)",
    investorPlanDesc: "Se generara lo siguiente:\n1. Resumen Ejecutivo\n2. Matriz de Diferenciacion\n3. Estrategia Go-To-Market\n4. Analisis de Riesgos\n5. Escenarios Financieros",
    euFundsBtn: "Fondos Europeos (Subvenciones)",
    euFundsDesc: "Se generara un capitulo dedicado al acceso a los fondos europeos disponibles para tu negocio.",
    toneTitle: "Reescribir Tono", toneDesc: "Reformula el plan con un tono diferente.",
    budgetTitle: "Optimizacion de Presupuesto", budgetDesc: "Redistribuye los porcentajes del presupuesto de inversion.",
    processing: "Procesando...",
    sectionEditTitle: "Editar Seccion",
    loginTitle: "Bienvenido de nuevo", loginSubtitle: "Inicia sesion para acceder a tus planes",
    continueGoogle: "Continuar con Google", orDivider: "o",
    emailPlaceholder: "Correo electronico", passwordPlaceholder: "Contrasena",
    loginBtn2: "Iniciar sesion", registerBtn: "Registrarse",
    forgotPassword: "Olvidaste tu contrasena?", noAccount: "No tienes cuenta?", hasAccount: "Ya tienes cuenta?",
    forgotPasswordTitle: "Restablecer contrasena", sendResetEmail: "Enviar email de restablecimiento",
    backToLogin: "Volver al inicio de sesion",
    resetEmailSent: "Email de restablecimiento enviado! Revisa tu bandeja de entrada.",
    currencyNotice: "Las cantidades son estimadas y pueden variar segun el mercado.",
    shareBtn: "Compartir", shareCopied: "Enlace copiado!", printBtn: "Imprimir",
    resetBtn: "Nuevo Plan", newPlan: "Nuevo Plan",
    confirmUnlockPlan: "Usaras 1 credito para desbloquear la descarga completa del plan",
  },
};
