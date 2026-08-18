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
  supportCoffeeTitle: string; buyMeACoffee: string; businessExamplesTitle: string;
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
  currencyNotice: string; shareBtn: string; shareCopied: string; shareError: string; shareLinkTitle: string;
  studioMobileBadge: string; studioMobileTitle: string; studioGenerateDesktopOnly: string;
  studioGenerateDesktopHint: string; studioBackToDashboard: string; studioTryDemoMobile: string;
  studioLoadingWorkspace: string;
  examplesSwipeHint: string;
  examplesCounter: string;
  printBtn: string; resetBtn: string; newPlan: string; confirmUnlockPlan: string;
  placeholdersArray: string[]; paymentConfirmedEU: string; loadingMessagesArray: string[];
  routes: { login: string; dashboard: string; demoNew: string };
  copyingDisabled: string; investmentBudget: string; estimatedTotal: string; additionalSection: string; part: string;
  strategicObjectives: string; marketCompetition: string; promotion: string; businessPlan: string; yourBusiness: string;
  alertUnlimitedPro: string; rewriteTone: string; toneProfessional: string; toneCreative: string; tonePersuasive: string; toneFriendly: string;
  euGrantsOpt: string; optimizedForEUGrants: string; optimizeBudget: string; optimizeBudgetPlaceholder: string; expertSectionLibrary: string;
  confirm: string; apply: string; cancel: string; contentProtected: string; animatedPlaceholder: string;
  inspireMeSparkles: string; businessExamplesSparkles: string; afterSparkles: string; swotFull: string; budget12m: string;
  marketStrategy: string; euFundsEligibility: string; exportPdfPptx: string; editingStudio: string; cancelCross: string;
  confirmSaveCheck: string; anotherIdea: string; directEditing: string; allTools: string; grantOpt: string;
  downloadingAlt: string; downloadFreeSummaryBtn: string; presentationBtn: string; brochureBtn: string; documentBtn: string;
  unlockDownloads: string; standardPackageBtn: string; pdfPresentation: string; pptxBrochure: string; wordDocument: string;
  originalVersion: string; euFundsOptimized: string; investorsPlan: string; versionHistory: string; savedVersions: string;
  objectives1y: string; objectives3y: string; missionValues: string; targetCustomers: string; competition: string;
  marketingStrategy: string; swotTitle: string; strengths: string; weaknesses: string; opportunities: string; threats: string;
  operationalPlan: string; workflowDesc: string; humanResources: string; locationFacilities: string;
  optimizeBudgetCustom: string; editorTip: string; versionToolsTip: string; expertLibraryTip: string; proPackQuotaTip: string;
  // NEW ADDITIONS
  planGeneratedSmartly: string; filePresentation: string; fileSummaryFree: string; fileDocument: string; fileBrochure: string;
  howItLooks: string; perspective: string; previewTabs: string; animatedCharts: string; typingLive: string;
  beforeAfter: string; generatedExample: string; coffeeShopName: string; paywallTitle: string; paywallDesc: string; paywallDescStudio: string;
  paywallBtn: string; sharedPlanNotFound: string; sharedPlanNotFoundHint: string; studioHeaderSubtitle: string; costDistribution: string; protectedContentPrint: string;
  // MOCKUP PREVIEW STRINGS
  mockupSummary: string; mockupSwot: string; mockupBudget: string; mockupStrategy: string;
  mockupSummaryP1: string; mockupSummaryP2: string;
  mockupSwotS_Title: string; mockupSwotS_1: string; mockupSwotS_2: string; mockupSwotS_3: string;
  mockupSwotW_Title: string; mockupSwotW_1: string; mockupSwotW_2: string; mockupSwotW_3: string;
  mockupSwotO_Title: string; mockupSwotO_1: string; mockupSwotO_2: string; mockupSwotO_3: string;
  mockupSwotT_Title: string; mockupSwotT_1: string; mockupSwotT_2: string; mockupSwotT_3: string;
  mockupBudgetTitle: string; mockupBudgetEq: string; mockupBudgetDes: string; mockupBudgetStock: string;
  mockupBudgetEqVal: string; mockupBudgetDesVal: string; mockupBudgetStockVal: string; mockupBudgetTotal: string; mockupBudgetTotalVal: string;
  mockupStrategy1_Title: string; mockupStrategy1_Desc: string;
  mockupStrategy2_Title: string; mockupStrategy2_Desc: string;
  mockupStrategy3_Title: string; mockupStrategy3_Desc: string;
  mockupFinYearTitle: string; mockupFinYearDesc: string; mockupChartRevenue: string; mockupChartCostsDist: string;
  mockupChartSalaries: string; mockupChartRent: string; mockupChartStock: string; mockupChartMarketing: string;
  mockupProfitMargin: string;
  mockupLiveTitle: string; mockupLiveGen: string; mockupLiveRev: string; mockupLiveRev1: string; mockupLiveRev2: string; mockupLiveRev3: string;
  mockupLiveCosts: string; mockupLiveCosts1: string; mockupLiveCosts2: string;
  mockupLiveStatus: string; mockupLiveStat1: string; mockupLiveStat2: string; mockupLiveStat3: string; mockupLiveComplete: string;
  mockupBeforeTitle: string; mockupBeforeDesc: string;
  // Erori comune (migrate din translations.ts)
  errorServerPrefix: string; errorNetworkError: string; errorInvalidFormat: string; errorGenerationFallback: string;
};

export const UI_STRINGS: Record<Locale, UIStringsShape> = {
  ro: {
    pricing: "Tarife", logOut: "Ieși din cont", logIn: "Autentificare", tryFree: "Testează Gratuit",
    myPlans: "Proiectele Mele", badgeStudioGrants: "INSTRUMENTE PRO",
    badgeStandardUnlocked: "STANDARD DEBLOCAT", badgePreviewOnly: "PREVIZUALIZARE",
    supportCoffeeTitle: "Susține IdeeaTa.ai cu o cafea",
    buyMeACoffee: "Cumpără-mi o cafea",
    businessExamplesTitle: "Exemple de Afaceri",
    generationTime: "Timp de generare", generationTimeSub: "Sub 60 sec",
    exportFormat: "Format export", documentStructure: "Structura Document",
    documentStructureSub: "6 Capitole Standard", grantsInvestors: "Fonduri / Investitori",
    heroSubtitle: "Transformă-ți experiența într-un business validat.",
    heroDesc1: "Descrie la ce ești bun, iar noi îți vom genera un plan de afaceri complet.",
    heroDesc2: "Analiza SWOT, proiecții financiare și strategie de piață.",
    ideaComingAlive: "Ideea Ta prinde viață...",
    buildPlanIntelligently: "Construiește planul tău de afaceri inteligent. Viziunea ta, sprijinul nostru!",
    inputPlaceholder: "Descrie ideea ta de afaceri în detaliu... (ex: Vreau să deschid o cafenea de specialitate cu produse vegane în centrul orașului...)",
    inspireMe: "Inspiră-mă", generatePlan: "Generează Planul",
    limitReached: "Ai epuizat cele 3 planuri gratuite fără cont. Cont gratuit = +1 plan.",
    limitRemaining: "Mai ai {{count}} generări gratuite. Cont gratuit = +1.",
    downloadQualityNote: "Acest proces durează câteva momente pentru a asigura calitatea maximă.",
    generatingPptx: "Se generează broșura de prezentare...",
    generatingPdf: "Se generează prezentarea...", generatingDoc: "Se generează document...",
    aiLoadingStep0: "Se rescrie documentul...", aiLoadingStep1: "Se procesează secțiunile...",
    aiLoadingStep2: "Se calculează datele...", aiLoadingStep3: "Se finalizează...",
    aiLoadingDesc0: "Acest proces durează 15-20 de secunde. Analizăm structura actuală a documentului...",
    aiLoadingDesc1: "Generăm secțiunile și rescriem paragrafele pentru o calitate maximă...",
    aiLoadingDesc2: "Aplicăm calculele financiare și rafinăm tonul profesional...",
    aiLoadingDesc3: "Ultimele retușuri. Pregătim noul tău plan de afaceri...",
    processingError: "Eroare la procesare", retryBtn: "Reîncearcă", closeBtn: "Închide",
    downloading: "Se descarcă...", downloadFreeSummary: "DESCARCĂ SUMAR GRATUIT",
    downloadPresentation: "Prezentare", downloadBrochure: "Broșură", downloadDocument: "Document",
    unlockDownloadsTitle: "Deblochează Descărcările Complete (Pachet Standard)",
    tooltipPdfPresentation: "Prezentare PDF", tooltipPptxBrochure: "Broșură PPTX",
    tooltipWordDocument: "Document Word", tooltipPackageStandard: "Pachet Standard",
    versionOriginal: "Varianta Originală", versionTone: "Rescrie Tonul",
    versionEuFunds: "Optimizat Fonduri UE", versionBudget: "Buget Optimizat",
    versionExpert: "Secțiuni Expert", versionInvestor: "Plan Investitori",
    sectionGeneral: "I & II. Date Generale și Viziune",
    sectionMarket: "III. Analiza Pieței și Promovarea",
    sectionOperational: "V. Planul Operațional și de Management",
    sectionFinancial: "VI. Planul Financiar",
    fieldLegalForm: "Forma Juridică:", fieldCaenCode: "Cod CAEN:", fieldContact: "Contact:",
    fieldObjectives1y: "Obiective (1 an):", fieldObjectives35y: "Obiective (3-5 ani):",
    fieldMissionValues: "Misiune și Valori:", fieldTargetCustomers: "Clienții Țintă:",
    fieldCompetition: "Concurența:", fieldMarketingStrategy: "Strategia de Marketing:",
    fieldTechFlow: "Descriere Flux Tehnologic:", fieldHumanResources: "Resurse Umane:",
    fieldLocationEquipment: "Locație și Dotări:", fieldCostDistribution: "Distribuția costurilor",
    swotStrengths: "Puncte Tari", swotWeaknesses: "Slăbiciuni",
    swotOpportunities: "Oportunități", swotThreats: "Amenințări",
    swotStrengthsLetter: "S", swotWeaknessesLetter: "W",
    slideVisionStrategy: "Viziune și Strategie", slideMarketAnalysis: "Analiza Pieței",
    slideSwot: "Analiza Strategică SWOT", slideStrengths: "Puncte Tari (Strengths)",
    slideWeaknesses: "Slăbiciuni (Weaknesses)", slideOpportunities: "Oportunități (Opportunities)",
    slideThreats: "Amenințări (Threats)", slideOperationalPlan: "Planul Operațional",
    slideFinancialPlan: "Plan Financiar", slideObjShort: "Obiective (1 an)",
    slideObjMedium: "Obiective (3-5 ani)", slideMissionValues: "Misiune și Valori",
    slideTargetCustomers: "Clienții Țintă", slideCompetition: "Concurența",
    slideMarketingStrategy: "Strategia de Marketing",
    slideTechFlow: "Descriere Flux Tehnologic", slideHumanResources: "Resurse Umane",
    slideLocationEquipment: "Locație și Dotări",
    toolsTitle: "Instrumente",
    toolsDesc: "Aici poți folosi asistentul inteligent pentru a adăuga mai multe informații și detalii planului tău.",
    proChaptersTitle: "Capitole Pro",
    investorPlanBtn: "Plan Profesionist (Investitori/Bănci)",
    investorPlanDesc: "Se va genera:\n1. Rezumat Executiv\n2. Matrice Diferențiere\n3. Strategie Go-To-Market\n4. Analiza Risc\n5. Scenarii Financiare",
    euFundsBtn: "Fonduri Europene (Granturi)",
    euFundsDesc: "Se va genera un capitol dedicat accesării fondurilor europene disponibile pentru afacerea ta.",
    toneTitle: "Rescrie Tonul", toneDesc: "Reformulează planul cu un ton diferit.",
    budgetTitle: "Optimizare Buget", budgetDesc: "Redistribuie procentele bugetului de investiții.",
    processing: "Se procesează...",
    sectionEditTitle: "Editează Secțiunea",
    loginTitle: "Bun venit înapoi", loginSubtitle: "Autentifică-te pentru a accesa planurile tale",
    continueGoogle: "Continuă cu Google", orDivider: "sau",
    emailPlaceholder: "Email", passwordPlaceholder: "Parolă",
    loginBtn2: "Autentificare", registerBtn: "Înregistrare",
    forgotPassword: "Ai uitat parola?", noAccount: "Nu ai cont?", hasAccount: "Ai deja cont?",
    forgotPasswordTitle: "Resetează parola", sendResetEmail: "Trimite email de resetare",
    backToLogin: "Înapoi la autentificare",
    resetEmailSent: "Email de resetare trimis! Verifică căsuța poștală.",
    currencyNotice: "Sumele sunt estimate și pot varia în funcție de piață.",
    shareBtn: "Partajează", shareCopied: "Link copiat în clipboard!", shareError: "Nu s-a putut crea linkul de partajare. Încearcă din nou.", shareLinkTitle: "Copiază link-ul",
    studioMobileBadge: "Studio Mobil",
    studioMobileTitle: "Generează planul în Studio",
    studioGenerateDesktopOnly: "Descrie ideea și generează planul direct pe telefon sau tabletă.",
    studioGenerateDesktopHint: "Asistentul creează planul complet, apoi îl poți edita și exporta aici.",
    studioBackToDashboard: "Mergi la Dashboard",
    studioTryDemoMobile: "Încearcă Demo pe mobil",
    studioLoadingWorkspace: "Se încarcă spațiul tău de lucru Studio...",
    examplesSwipeHint: "Glisează pentru mai multe idei",
    examplesCounter: "{{current}} / {{total}}",
    printBtn: "Printează",
    resetBtn: "Plan Nou", newPlan: "Plan Nou",
    confirmUnlockPlan: "Folosești 1 credit pentru a debloca descărcarea completă a planului",
    placeholdersArray: ["Consultanță Securitate Cibernetică...", "Studio de Design Interior...", "Fermă Urbană de Microplante...", "Dezvoltare Soluții...", "Cafenea de Specialitate...", "Platformă de Cursuri Online...", "Spălătorie Auto Ecologică..."],
    paymentConfirmedEU: "Plată confirmată! Planul \"{plan}\" a fost deblocat pentru descărcare.",
    loadingMessagesArray: ["Se analizează ideea...", "Se structurează capitolele...", "Se generează previziunile financiare...", "Se definitivează detaliile..."],
    routes: { login: "/login", dashboard: "/dashboard", demoNew: "/demo?start=nou" },
    copyingDisabled: "Copierea textului este dezactivată în varianta Demo. Apasă pe 🎁 DESCARCĂ SUMAR GRATUIT pentru a obține planul.",
    investmentBudget: "Buget Investiții", estimatedTotal: "Total Estimat:", additionalSection: "Secțiune Adițională", part: "Partea",
    strategicObjectives: "Obiective Strategice", marketCompetition: "Piața și Concurența", promotion: "Promovare", businessPlan: "Plan de Afaceri", yourBusiness: "Compania Ta",
    alertUnlimitedPro: "Plată confirmată! Abonamentul tău Pro Nelimitat a fost activat.",
    rewriteTone: "Rescrie tonul", toneProfessional: "💼 Profesional & Corporativ", toneCreative: "🎨 Entuziast & Creativ", tonePersuasive: "📈 Persuasiv & Vânzări", toneFriendly: "🤝 Prietenos & Casual",
    euGrantsOpt: "Optimizare Fonduri Europene", optimizedForEUGrants: "Optimizat pentru Fonduri Europene",
    optimizeBudget: "Optimizează Bugetul", optimizeBudgetPlaceholder: "ex: 10, 20, 30", expertSectionLibrary: "Librăria de Secțiuni Experte",
    confirm: "Confirmă", apply: "Aplică", cancel: "Anulează",
    contentProtected: "Conținutul este protejat. Pentru a obține documentul, utilizați funcția de descărcare din aplicație.",
    animatedPlaceholder: "Crează un plan pentru... (ex: Consultanță securitate)",
    inspireMeSparkles: "✨ Inspiră-mă", businessExamplesSparkles: "💡 Exemple de Afaceri", afterSparkles: "După ✨",
    swotFull: "📊 Analiză SWOT completă", budget12m: "💰 Buget detaliat pe 12 luni", marketStrategy: "🎯 Strategie de piață",
    euFundsEligibility: "🇪🇺 Eligibilitate fonduri UE", exportPdfPptx: "📄 Export PDF + PPTX",
    editingStudio: "Studio Editare", cancelCross: "❌ Anulează", confirmSaveCheck: "✅ Confirmă și Salvează",
    anotherIdea: "🔄 Altă idee", directEditing: "Editare directă în browser", allTools: "Toate instrumentele incluse", grantOpt: "Optimizare fonduri europene 🇪🇺",
    downloadingAlt: "Se descarcă...", downloadFreeSummaryBtn: "🎁 DESCARCĂ SUMAR GRATUIT", presentationBtn: "⬇ Prezentare", brochureBtn: "⬇ Broșură", documentBtn: "⬇ Document",
    unlockDownloads: "Deblochează Descărcările Complete (Pachet Standard)", standardPackageBtn: "Pachet Standard", pdfPresentation: "Prezentare PDF", pptxBrochure: "Broșură PPTX", wordDocument: "Document Word",
    originalVersion: "📝 Varianta Originală", euFundsOptimized: "🇪🇺 Optimizat Fonduri UE", investorsPlan: "🏦 Plan Investitori", versionHistory: "Istoric Versiuni", savedVersions: "Versiuni Salvate",
    objectives1y: "Obiective (1 an)", objectives3y: "Obiective (3-5 ani)", missionValues: "Misiune și Valori", targetCustomers: "Clienții Țintă", competition: "Concurența",
    marketingStrategy: "Strategia de Marketing", swotTitle: "Analiză Strategica SWOT", strengths: "Puncte Tari", weaknesses: "Slăbiciuni", opportunities: "Oportunități", threats: "Amenințări",
    operationalPlan: "Planul Operațional", workflowDesc: "1. Descriere Flux (Sustenabilitate / Verde)", humanResources: "2. Resurse Umane", locationFacilities: "3. Locație și Dotări",
    optimizeBudgetCustom: "Optimizează Bugetul (Personalizat)",
    editorTip: "<strong>Sfat:</strong> Ajustează mesajul planului direct aici, până sună convingător. Apoi <em>Confirmă și Salvează</em> și descarcă documentele pregătite pentru prezentare.",
    versionToolsTip: "<strong>Sfat:</strong> Fiecare instrument generează o <strong class='text-white'>variantă distinctă</strong> a planului. Poți folosi mai multe instrumente pe aceeași variantă — până la 2 cu Standard, până la 4 cu Instrumente Pro — și descarci varianta activă.",
    expertLibraryTip: "<strong>Sfat:</strong> Pentru dosare solide de <strong class='text-white'>fonduri europene</strong> sau <strong class='text-white'>investitori</strong>, completează din bibliotecă capitolele care contează: DNSH, egalitate de șanse, prețuri, matrice de riscuri.",
    proPackQuotaTip: "<strong>Sfat:</strong> <strong class='text-amber-300'>Atenție:</strong> generările, editările Pro și combinațiile din pachet sunt <strong class='text-white'>comune pentru toate proiectele</strong> din <strong class='text-white'>Proiectele Mele</strong>. Folosește-le cu grijă — fructifică fiecare acțiune pe planul potrivit.",
    planGeneratedSmartly: "Plan generat inteligent de IdeeaTa.ai", filePresentation: "Prezentare", fileSummaryFree: "Sumar_Gratuit", fileDocument: "Document", fileBrochure: "Brosura",
    howItLooks: "Cum arată un plan generat?", perspective: "Perspectivă", previewTabs: "Preview cu tabs", animatedCharts: "Grafice animate", typingLive: "Typing live",
    beforeAfter: "Înainte & După", generatedExample: "EXEMPLU GENERAT", coffeeShopName: "Cafenea de Specialitate 'Urban Beans'", paywallTitle: "Acesta a fost doar un scurt rezumat.", paywallDesc: "Pentru a obține <strong>Analiza SWOT detaliată, Bugetul de investiții, Strategia de Piață completă și Planul Operațional</strong>, creează-ți un cont gratuit!", paywallDescStudio: "Pentru a obține <strong>Analiza SWOT detaliată, Bugetul de investiții, Strategia de Piață completă și Planul Operațional</strong>, deblochează pachetul complet!",
    paywallBtn: "Vizitează IdeeaTa.ai",
    sharedPlanNotFound: "Planul din link nu a fost găsit.",
    sharedPlanNotFoundHint: "Linkul din PDF e vechi sau invalid. Generează un plan nou sau re-descarcă sumarul.",
    studioHeaderSubtitle: "Proiectul tău de afaceri inteligent", costDistribution: "Distribuția Costurilor", protectedContentPrint: "Conținutul este protejat. Pentru a obține documentul, utilizați funcția de descărcare din aplicație.",

    mockupSummary: "Rezumat", mockupSwot: "SWOT", mockupBudget: "Buget", mockupStrategy: "Strategie",
    mockupSummaryP1: "este o cafenea de specialitate modernă, situată în inima centrului istoric. Ne propunem să oferim nu doar cafea de origine prăjită local, ci și o experiență senzorială completă, într-un mediu cu un design industrial minimalist.",
    mockupSummaryP2: "Misiunea noastră este să educăm consumatorii despre procesul de la bob la ceașcă, sprijinind fermierii independenți prin comerț echitabil (Fairtrade).",
    mockupSwotS_Title: "Puncte Tari", mockupSwotS_1: "Locație premium cu trafic pietonal intens", mockupSwotS_2: "Baristi certificați SCA", mockupSwotS_3: "Exclusivitate pentru un prăjitor local renumit",
    mockupSwotW_Title: "Puncte Slabe", mockupSwotW_1: "Costuri mari de chirie în zona centrală", mockupSwotW_2: "Lipsa unei istorii pe piață (brand nou)", mockupSwotW_3: "Prețuri mai mari față de lanțurile comerciale",
    mockupSwotO_Title: "Oportunități", mockupSwotO_1: "Creșterea cererii pentru cafea de specialitate", mockupSwotO_2: "Parteneriate B2B cu birourile din zonă", mockupSwotO_3: "Abonament lunar pentru boabe de cafea",
    mockupSwotT_Title: "Amenințări", mockupSwotT_1: "Fluctuația prețului cafelei verzi", mockupSwotT_2: "Deschiderea unei noi francize în apropiere", mockupSwotT_3: "Reticența clienților tradiționaliști",
    mockupBudgetTitle: "Buget de Investiții Inițiale", mockupBudgetEq: "Echipamente (Espressor, Râșnițe)", mockupBudgetDes: "Amenajare locație & Design", mockupBudgetStock: "Stoc inițial marfă & Consumabile",
    mockupBudgetEqVal: "62.000 lei", mockupBudgetDesVal: "85.000 lei", mockupBudgetStockVal: "17.000 lei", mockupBudgetTotal: "Total Investiție Estimată", mockupBudgetTotalVal: "164.000 lei",
    mockupStrategy1_Title: "Pre-lansare & Teasing", mockupStrategy1_Desc: "Campanie Social Media axată pe procesul de amenajare, prezentarea echipei și dezvăluirea prăjitorului partener.",
    mockupStrategy2_Title: "Soft Opening", mockupStrategy2_Desc: "O săptămână dedicată exclusiv comunității locale și influencerilor din nișa culinară, cu un meniu limitat la 50% reducere.",
    mockupStrategy3_Title: "Fidelizare B2B", mockupStrategy3_Desc: "Pachete speciale pentru angajații birourilor din proximitate: badge-uri de companie care oferă 15% discount permanent.",
    mockupFinYearTitle: "Proiecții Financiare: Anul 1", mockupFinYearDesc: "Estimare a veniturilor și a distribuției costurilor operaționale (în RON).",
    mockupChartRevenue: "Evoluție Venituri", mockupChartCostsDist: "Distribuție Costuri",
    mockupChartSalaries: "Salarii", mockupChartRent: "Chirie & Utilități", mockupChartStock: "Stoc Marfă", mockupChartMarketing: "Marketing",
    mockupProfitMargin: "Marjă Profit",
    mockupLiveTitle: "# Plan de Afaceri - Cafenea de Specialitate \"Urban Beans\"", mockupLiveGen: "> Generând proiecții financiare (în LEI)...", mockupLiveRev: "## Venituri Estimate", mockupLiveRev1: "- Trimestrul 1: 150.000 lei (creștere organică)", mockupLiveRev2: "- Trimestrul 2: 275.000 lei (sezon cald)", mockupLiveRev3: "- Trimestrul 3: 400.000 lei (B2B stabilizat)",
    mockupLiveCosts: "## Costuri Operaționale", mockupLiveCosts1: "- Salarii: 35.000 lei / lună", mockupLiveCosts2: "- Chirie: 15.000 lei / lună",
    mockupLiveStatus: "## Stadiu Generare", mockupLiveStat1: "Analiză Competiție", mockupLiveStat2: "Strategie Prețuri", mockupLiveStat3: "Calcul ROI", mockupLiveComplete: "Complet",
    mockupBeforeTitle: "Înainte", mockupBeforeDesc: "\"Vreau să deschid o cafenea. Am experiență de 5 ani în domeniu. Nu știu de unde să încep cu planul de afaceri.\"",
    errorServerPrefix: "Eroare de server: ", errorNetworkError: "Eroare de rețea. Te rugăm să mai încerci o dată.", errorInvalidFormat: "Sistemul a returnat un format invalid. Mai încearcă o dată.", errorGenerationFallback: "A apărut o eroare la generarea planului. Te rugăm să încerci din nou mai târziu.",
  },
  en: {
    pricing: "Pricing", logOut: "Log Out", logIn: "Log In", tryFree: "Try Free",
    myPlans: "My Plans", badgeStudioGrants: "PRO TOOLS",
    badgeStandardUnlocked: "STANDARD UNLOCKED", badgePreviewOnly: "PREVIEW ONLY",
    supportCoffeeTitle: "Support IdeeaTa.ai with a coffee",
    buyMeACoffee: "Buy me a coffee",
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
    limitReached: "You've used your 3 free guest plans. Free account = +1 plan.",
    limitRemaining: "You have {{count}} free generations left. Free account = +1.",
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
    fieldLegalForm: "Legal Form:", fieldCaenCode: "Industry / Activity:", fieldContact: "Contact:",
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
    shareBtn: "Share", shareCopied: "Link copied to clipboard!", shareError: "Could not create the share link. Please try again.", shareLinkTitle: "Copy link",
    studioMobileBadge: "Mobile Studio",
    studioMobileTitle: "Generate your Studio plan",
    studioGenerateDesktopOnly: "Describe your idea and generate the plan directly on phone or tablet.",
    studioGenerateDesktopHint: "The assistant builds the full plan, then you can edit and export it here.",
    studioBackToDashboard: "Go to Dashboard",
    studioTryDemoMobile: "Try Demo on mobile",
    studioLoadingWorkspace: "Loading your Studio workspace...",
    examplesSwipeHint: "Swipe for more ideas",
    examplesCounter: "{{current}} / {{total}}",
    printBtn: "Print",
    resetBtn: "New Plan", newPlan: "New Plan",
    confirmUnlockPlan: "You will use 1 credit to unlock the full download of this plan",
    placeholdersArray: ["Cybersecurity Consulting...", "Interior Design Studio...", "Urban Microgreens Farm...", "Software Development...", "Specialty Coffee Shop...", "Online Courses Platform...", "Eco Car Wash..."],
    paymentConfirmedEU: "Payment confirmed! The plan \"{plan}\" has been unlocked for download.",
    loadingMessagesArray: ["Analyzing idea...", "Structuring chapters...", "Generating financial forecasts...", "Finalizing details..."],
    routes: { login: "/en/login", dashboard: "/en/dashboard", demoNew: "/en/demo?start=new" },
    copyingDisabled: "Copying text is disabled in the Demo version. Click on 🎁 DOWNLOAD FREE SUMMARY to get the plan.",
    investmentBudget: "Investment Budget", estimatedTotal: "Estimated Total:", additionalSection: "Additional Section", part: "Part",
    strategicObjectives: "Strategic Objectives", marketCompetition: "Market & Competition", promotion: "Promotion", businessPlan: "Business Plan", yourBusiness: "Your Business",
    alertUnlimitedPro: "Payment confirmed! Your Unlimited Pro subscription has been activated.",
    rewriteTone: "Rewrite tone", toneProfessional: "💼 Professional & Corporate", toneCreative: "🎨 Enthusiastic & Creative", tonePersuasive: "📈 Persuasive & Sales", toneFriendly: "🤝 Friendly & Casual",
    euGrantsOpt: "EU Grants Optimization", optimizedForEUGrants: "Optimized for EU Grants",
    optimizeBudget: "Optimize Budget", optimizeBudgetPlaceholder: "e.g. 10, 20, 30", expertSectionLibrary: "Expert Section Library",
    confirm: "Confirm", apply: "Apply", cancel: "Cancel",
    contentProtected: "Content is protected. To obtain the document, use the download function inside the application.",
    animatedPlaceholder: "Create a plan for... (e.g. Cybersecurity consulting)",
    inspireMeSparkles: "✨ Inspire me", businessExamplesSparkles: "💡 Business Examples", afterSparkles: "After ✨",
    swotFull: "📊 Full SWOT Analysis", budget12m: "💰 12-month detailed budget", marketStrategy: "🎯 Market strategy",
    euFundsEligibility: "🇪🇺 EU Funds Eligibility", exportPdfPptx: "📄 Export PDF + PPTX",
    editingStudio: "Editing Studio", cancelCross: "❌ Cancel", confirmSaveCheck: "✅ Confirm & Save",
    anotherIdea: "🔄 Another idea", directEditing: "Direct editing in browser", allTools: "All tools included", grantOpt: "Grant optimization 🇪🇺",
    downloadingAlt: "Downloading...", downloadFreeSummaryBtn: "🎁 DOWNLOAD FREE SUMMARY", presentationBtn: "⬇ Presentation", brochureBtn: "⬇ Brochure", documentBtn: "⬇ Document",
    unlockDownloads: "Unlock Full Downloads (Standard Package)", standardPackageBtn: "Standard Package", pdfPresentation: "PDF Presentation", pptxBrochure: "PPTX Brochure", wordDocument: "Word Document",
    originalVersion: "📝 Original Version", euFundsOptimized: "🇪🇺 EU Funds Optimized", investorsPlan: "🏦 Investors Plan", versionHistory: "Version History", savedVersions: "Saved Versions",
    objectives1y: "Objectives (1 year)", objectives3y: "Objectives (3-5 years)", missionValues: "Mission & Values", targetCustomers: "Target Customers", competition: "Competition",
    marketingStrategy: "Marketing Strategy", swotTitle: "SWOT STRATEGIC ANALYSIS", strengths: "Strengths", weaknesses: "Weaknesses", opportunities: "Opportunities", threats: "Threats",
    operationalPlan: "Operational Plan", workflowDesc: "1. Workflow Description (Sustainability / Green)", humanResources: "2. Human Resources", locationFacilities: "3. Location & Facilities",
    optimizeBudgetCustom: "Optimize Budget (Custom)",
    editorTip: "<strong>Tip:</strong> Refine your plan’s message here until it sounds compelling. Then <em>Confirm & Save</em> and download documents ready to present.",
    versionToolsTip: "<strong>Tip:</strong> Each tool builds a <strong class='text-white'>distinct variant</strong> of your plan. You can use multiple tools on the same variant — up to 2 with Standard, up to 4 with Pro Tools — and download the active variant.",
    expertLibraryTip: "<strong>Tip:</strong> For stronger <strong class='text-white'>EU funding</strong> or <strong class='text-white'>investor</strong> dossiers, add the chapters that matter from the library: DNSH, equal opportunity, pricing, risk matrix.",
    proPackQuotaTip: "<strong>Tip:</strong> <strong class='text-amber-300'>Heads-up:</strong> package <strong class='text-white'>generations</strong>, <strong class='text-white'>Pro edits</strong> and <strong class='text-white'>combinations</strong> are <strong class='text-white'>shared across all projects</strong> in <strong class='text-white'>My Plans</strong>. Use them wisely — make every action count on the right plan.",
    planGeneratedSmartly: "Business plan smartly generated by IdeeaTa.ai", filePresentation: "Presentation", fileSummaryFree: "Free_Summary", fileDocument: "Document", fileBrochure: "Brochure",
    howItLooks: "How does a generated plan look?", perspective: "Perspective", previewTabs: "Tabs Preview", animatedCharts: "Animated charts", typingLive: "Live typing",
    beforeAfter: "Before & After", generatedExample: "GENERATED EXAMPLE", coffeeShopName: "Specialty Coffee Shop 'Urban Beans'", paywallTitle: "This was just a short summary.", paywallDesc: "To get the detailed <strong>SWOT Analysis, Investment Budget, Full Market Strategy, and Operational Plan</strong>, create a free account!", paywallDescStudio: "To get the detailed <strong>SWOT Analysis, Investment Budget, Full Market Strategy, and Operational Plan</strong>, unlock the full package!",
    paywallBtn: "Visit IdeeaTa.ai",
    sharedPlanNotFound: "This shared plan was not found.",
    sharedPlanNotFoundHint: "The PDF link is old or invalid. Generate a new plan or re-download the summary.",
    studioHeaderSubtitle: "Your intelligent business project", costDistribution: "Cost Distribution", protectedContentPrint: "Content is protected. To get the document, use the download function in the app.",

    mockupSummary: "Summary", mockupSwot: "SWOT", mockupBudget: "Budget", mockupStrategy: "Strategy",
    mockupSummaryP1: "is a modern specialty coffee shop located in the heart of the historic center. We aim to offer not only locally roasted origin coffee, but also a complete sensory experience in a minimalist industrial design environment.",
    mockupSummaryP2: "Our mission is to educate consumers about the bean-to-cup process, supporting independent farmers through fair trade (Fairtrade).",
    mockupSwotS_Title: "Strengths", mockupSwotS_1: "Premium location with heavy foot traffic", mockupSwotS_2: "SCA certified baristas", mockupSwotS_3: "Exclusivity for a renowned local roaster",
    mockupSwotW_Title: "Weaknesses", mockupSwotW_1: "High rent costs in the central area", mockupSwotW_2: "Lack of market history (new brand)", mockupSwotW_3: "Higher prices compared to commercial chains",
    mockupSwotO_Title: "Opportunities", mockupSwotO_1: "Growing demand for specialty coffee", mockupSwotO_2: "B2B partnerships with local offices", mockupSwotO_3: "Monthly coffee bean subscription",
    mockupSwotT_Title: "Threats", mockupSwotT_1: "Green coffee price fluctuations", mockupSwotT_2: "Opening of a new major franchise nearby", mockupSwotT_3: "Reluctance of traditionalist customers",
    mockupBudgetTitle: "Initial Investment Budget", mockupBudgetEq: "Equipment (Espresso machines, Grinders)", mockupBudgetDes: "Location setup & Design", mockupBudgetStock: "Initial inventory & Supplies",
    mockupBudgetEqVal: "€12,500", mockupBudgetDesVal: "€17,000", mockupBudgetStockVal: "€3,500", mockupBudgetTotal: "Estimated Total Investment", mockupBudgetTotalVal: "€33,000",
    mockupStrategy1_Title: "Pre-launch & Teasing", mockupStrategy1_Desc: "Social Media campaign focused on the setup process, presenting the team and revealing the partner roaster.",
    mockupStrategy2_Title: "Soft Opening", mockupStrategy2_Desc: "A week dedicated exclusively to the local community and culinary influencers, with a limited menu at 50% discount.",
    mockupStrategy3_Title: "B2B Loyalty", mockupStrategy3_Desc: "Special packages for nearby office employees: company badges with a permanent 15% discount.",
    mockupFinYearTitle: "Financial Projections: Year 1", mockupFinYearDesc: "Estimated revenue and operating cost distribution (in EUR).",
    mockupChartRevenue: "Revenue Growth", mockupChartCostsDist: "Cost Distribution",
    mockupChartSalaries: "Salaries", mockupChartRent: "Rent & Utilities", mockupChartStock: "Inventory", mockupChartMarketing: "Marketing",
    mockupProfitMargin: "Profit Margin",
    mockupLiveTitle: "# Business Plan - Specialty Coffee Shop \"Urban Beans\"", mockupLiveGen: "> Generating financial projections...", mockupLiveRev: "## Estimated Revenues", mockupLiveRev1: "- Quarter 1: 150,000 (organic growth)", mockupLiveRev2: "- Quarter 2: 275,000 (warm season)", mockupLiveRev3: "- Quarter 3: 400,000 (stable B2B)",
    mockupLiveCosts: "## Operational Costs", mockupLiveCosts1: "- Salaries: 35,000 / month", mockupLiveCosts2: "- Rent: 15,000 / month",
    mockupLiveStatus: "## Generation Status", mockupLiveStat1: "Competition Analysis", mockupLiveStat2: "Pricing Strategy", mockupLiveStat3: "ROI Calculation", mockupLiveComplete: "Complete",
    mockupBeforeTitle: "Before", mockupBeforeDesc: "\"I want to open a coffee shop. I have 5 years of experience in the field. I don't know where to start with the business plan.\"",
    errorServerPrefix: "Server error: ", errorNetworkError: "Network error. Please try again.", errorInvalidFormat: "The system returned an invalid format. Please try again.", errorGenerationFallback: "An error occurred during plan generation. Please try again later.",
  },
  es: {
    pricing: "Precios", logOut: "Cerrar sesión", logIn: "Iniciar sesión", tryFree: "Probar Gratis",
    myPlans: "Mis Planes", badgeStudioGrants: "HERRAMIENTAS PRO",
    badgeStandardUnlocked: "STANDARD DESBLOQUEADO", badgePreviewOnly: "SOLO VISTA PREVIA",
    supportCoffeeTitle: "Apoya a IdeeaTa.ai con un café",
    buyMeACoffee: "Invítame un café",
    businessExamplesTitle: "Ejemplos de Negocios",
    generationTime: "Tiempo de Generación", generationTimeSub: "Menos de 60 seg",
    exportFormat: "Formato de Exportación", documentStructure: "Estructura del Documento",
    documentStructureSub: "6 Capítulos Estándar", grantsInvestors: "Subvenciones / Inversores",
    heroSubtitle: "Convierte tu experiencia en un negocio validado.",
    heroDesc1: "Describe en qué eres bueno y generaremos un plan de negocios completo para ti.",
    heroDesc2: "Análisis FODA, proyecciones financieras y estrategia de mercado.",
    ideaComingAlive: "Tu Idea está cobrando vida...",
    buildPlanIntelligently: "Crea tu plan de negocios inteligentemente. Tu visión, nuestro apoyo!",
    inputPlaceholder: "Describe tu idea de negocio en detalle... (ej: Quiero abrir una cafetería de especialidad con productos veganos en el centro de la ciudad...)",
    inspireMe: "Inspírame", generatePlan: "Generar el Plan",
    limitReached: "Has agotado las 3 generaciones gratis. Cuenta gratuita = +1 plan.",
    limitRemaining: "Te quedan {{count}} generaciones gratis. Cuenta gratuita = +1.",
    downloadQualityNote: "Este proceso tarda unos momentos para garantizar la máxima calidad.",
    generatingPptx: "Generando folleto de presentación...",
    generatingPdf: "Generando presentación...", generatingDoc: "Generando documento...",
    aiLoadingStep0: "Reescribiendo el documento...", aiLoadingStep1: "Procesando secciones...",
    aiLoadingStep2: "Calculando datos...", aiLoadingStep3: "Finalizando...",
    aiLoadingDesc0: "Este proceso tarda 15-20 segundos. Estamos analizando la estructura actual del documento...",
    aiLoadingDesc1: "Generando secciones y reescribiendo párrafos para máxima calidad...",
    aiLoadingDesc2: "Aplicando cálculos financieros y refinando el tono profesional...",
    aiLoadingDesc3: "Toques finales. Preparando tu nuevo plan de negocios...",
    processingError: "Error de procesamiento", retryBtn: "Reintentar", closeBtn: "Cerrar",
    downloading: "Descargando...", downloadFreeSummary: "DESCARGAR RESUMEN GRATUITO",
    downloadPresentation: "Presentacion", downloadBrochure: "Folleto", downloadDocument: "Documento",
    unlockDownloadsTitle: "Desbloquear Descargas Completas (Paquete Estándar)",
    tooltipPdfPresentation: "Presentacion PDF", tooltipPptxBrochure: "Folleto PPTX",
    tooltipWordDocument: "Documento Word", tooltipPackageStandard: "Paquete Estándar",
    versionOriginal: "Versión Original", versionTone: "Tono Reescrito",
    versionEuFunds: "Fondos UE", versionBudget: "Presupuesto Optimizado",
    versionExpert: "Secciones Expertas", versionInvestor: "Plan para Inversores",
    sectionGeneral: "I & II. Información General y Vision",
    sectionMarket: "III. Análisis de Mercado y Promocion",
    sectionOperational: "V. Plan Operativo y de Gestion",
    sectionFinancial: "VI. Plan Financiero",
    fieldLegalForm: "Forma Jurídica:", fieldCaenCode: "Código CNAE:", fieldContact: "Contacto:",
    fieldObjectives1y: "Objetivos (1 año):", fieldObjectives35y: "Objetivos (3-5 años):",
    fieldMissionValues: "Misión y Valores:", fieldTargetCustomers: "Clientes Objetivo:",
    fieldCompetition: "Competencia:", fieldMarketingStrategy: "Estrategia de Marketing:",
    fieldTechFlow: "Descripción del Flujo Tecnologico:", fieldHumanResources: "Recursos Humanos:",
    fieldLocationEquipment: "Ubicación y Equipamiento:", fieldCostDistribution: "Distribución de Costos",
    swotStrengths: "Fortalezas", swotWeaknesses: "Debilidades",
    swotOpportunities: "Oportunidades", swotThreats: "Amenazas",
    swotStrengthsLetter: "F", swotWeaknessesLetter: "D",
    slideVisionStrategy: "Visión y Estrategia", slideMarketAnalysis: "Análisis de Mercado",
    slideSwot: "Análisis FODA Estratégico", slideStrengths: "Fortalezas (Strengths)",
    slideWeaknesses: "Debilidades (Weaknesses)", slideOpportunities: "Oportunidades (Opportunities)",
    slideThreats: "Amenazas (Threats)", slideOperationalPlan: "Plan Operativo",
    slideFinancialPlan: "Plan Financiero", slideObjShort: "Objetivos (1 año)",
    slideObjMedium: "Objetivos (3-5 años)", slideMissionValues: "Misión y Valores",
    slideTargetCustomers: "Clientes Objetivo", slideCompetition: "Competencia",
    slideMarketingStrategy: "Estrategia de Marketing",
    slideTechFlow: "Descripción del Flujo Tecnologico", slideHumanResources: "Recursos Humanos",
    slideLocationEquipment: "Ubicación y Equipamiento",
    toolsTitle: "Herramientas",
    toolsDesc: "Aquí puedes utilizar el asistente inteligente para añadir más información y detalles a tu plan.",
    proChaptersTitle: "Capítulos Pro",
    investorPlanBtn: "Plan Profesional (Inversores/Bancos)",
    investorPlanDesc: "Se generará lo siguiente:\n1. Resumen Ejecutivo\n2. Matriz de Diferenciacion\n3. Estrategia Go-To-Market\n4. Análisis de Riesgos\n5. Escenarios Financieros",
    euFundsBtn: "Fondos Europeos (Subvenciones)",
    euFundsDesc: "Se generará un capítulo dedicado al acceso a los fondos europeos disponibles para tu negocio.",
    toneTitle: "Reescribir Tono", toneDesc: "Reformula el plan con un tono diferente.",
    budgetTitle: "Optimización de Presupuesto", budgetDesc: "Redistribuye los porcentajes del presupuesto de inversión.",
    processing: "Procesando...",
    sectionEditTitle: "Editar Sección",
    loginTitle: "Bienvenido de nuevo", loginSubtitle: "Inicia sesión para acceder a tus planes",
    continueGoogle: "Continuar con Google", orDivider: "o",
    emailPlaceholder: "Correo electrónico", passwordPlaceholder: "Contraseña",
    loginBtn2: "Iniciar sesión", registerBtn: "Registrarse",
    forgotPassword: "¿Olvidaste tu contraseña?", noAccount: "¿No tienes cuenta?", hasAccount: "¿Ya tienes una cuenta?",
    forgotPasswordTitle: "Restablecer contraseña", sendResetEmail: "Enviar email de restablecimiento",
    backToLogin: "Volver al inicio de sesión",
    resetEmailSent: "¡Email de restablecimiento enviado! Revisa tu bandeja de entrada.",
    currencyNotice: "Las cantidades son estimadas y pueden variar según el mercado.",
    shareBtn: "Compartir", shareCopied: "¡Enlace copiado al portapapeles!", shareError: "No se pudo crear el enlace para compartir. Inténtalo de nuevo.", shareLinkTitle: "Copiar enlace",
    studioMobileBadge: "Studio Móvil",
    studioMobileTitle: "Genera tu plan en Studio",
    studioGenerateDesktopOnly: "Describe tu idea y genera el plan directamente en el teléfono o tablet.",
    studioGenerateDesktopHint: "El asistente crea el plan completo; luego puedes editarlo y exportarlo aquí.",
    studioBackToDashboard: "Ir al Panel",
    studioTryDemoMobile: "Probar Demo en móvil",
    studioLoadingWorkspace: "Cargando tu espacio de trabajo de Studio...",
    examplesSwipeHint: "Desliza para ver más ideas",
    examplesCounter: "{{current}} / {{total}}",
    printBtn: "Imprimir",
    resetBtn: "Nuevo Plan", newPlan: "Nuevo Plan",
    confirmUnlockPlan: "Usarás 1 crédito para desbloquear la descarga completa de este plan",
    placeholdersArray: ["Consultoría en Ciberseguridad...", "Estudio de Diseño de Interiores...", "Granja Urbana de Microplantas...", "Desarrollo de Software...", "Cafetería de Especialidad...", "Plataforma de Cursos Online...", "Lavado de Coches Ecológico..."],
    paymentConfirmedEU: "¡Pago confirmado! El plan \"{plan}\" ha sido desbloqueado para descargar.",
    loadingMessagesArray: ["Analizando idea...", "Estructurando capítulos...", "Generando previsiones financieras...", "Finalizando detalles..."],
    routes: { login: "/es/login", dashboard: "/es/dashboard", demoNew: "/es/demo?start=nuevo" },
    copyingDisabled: "Copiar texto está desactivado en la versión Demo. Haz clic en 🎁 DESCARGAR RESUMEN GRATUITO para obtener el plan.",
    investmentBudget: "Presupuesto de Inversión", estimatedTotal: "Total Estimado:", additionalSection: "Sección Adicional", part: "Parte",
    strategicObjectives: "Objetivos Estratégicos", marketCompetition: "Mercado y Competencia", promotion: "Promoción", businessPlan: "Plan de Negocios", yourBusiness: "Tu Empresa",
    alertUnlimitedPro: "¡Pago confirmado! Su suscripción Pro Ilimitada ha sido activada.",
    rewriteTone: "Reescribir tono", toneProfessional: "💼 Profesional y Corporativo", toneCreative: "🎨 Entusiasta y Creativo", tonePersuasive: "📈 Persuasivo y Comercial", toneFriendly: "🤝 Amigable y Casual",
    euGrantsOpt: "Optimización de Subvenciones de la UE", optimizedForEUGrants: "Optimizado para Subvenciones de la UE",
    optimizeBudget: "Optimizar Presupuesto", optimizeBudgetPlaceholder: "ej: 10, 20, 30", expertSectionLibrary: "Biblioteca de Secciones Expertas",
    confirm: "Confirmar", apply: "Aplicar", cancel: "Cancelar",
    contentProtected: "El contenido está protegido. Para obtener el documento, utiliza la función de descarga dentro de la aplicación.",
    animatedPlaceholder: "Crea un plan para... (ej. Consultoría en ciberseguridad)",
    inspireMeSparkles: "✨ Inspírame", businessExamplesSparkles: "💡 Ejemplos de Negocios", afterSparkles: "Después ✨",
    swotFull: "📊 Análisis FODA completo", budget12m: "💰 Presupuesto detallado a 12 meses", marketStrategy: "🎯 Estrategia de mercado",
    euFundsEligibility: "🇪🇺 Elegibilidad de fondos UE", exportPdfPptx: "📄 Exportar PDF + PPTX",
    editingStudio: "Studio de Edición", cancelCross: "❌ Cancelar", confirmSaveCheck: "✅ Confirmar y Guardar",
    anotherIdea: "🔄 Otra idea", directEditing: "Edición directa en el navegador", allTools: "Todas las herramientas incluidas", grantOpt: "Optimización de fondos europeos 🇪🇺",
    downloadingAlt: "Descargando...", downloadFreeSummaryBtn: "🎁 DESCARGAR RESUMEN GRATUITO", presentationBtn: "⬇ Presentación", brochureBtn: "⬇ Folleto", documentBtn: "⬇ Documento",
    unlockDownloads: "Desbloquear Descargas Completas (Paquete Estándar)", standardPackageBtn: "Paquete Estándar", pdfPresentation: "Presentación PDF", pptxBrochure: "Folleto PPTX", wordDocument: "Documento Word",
    originalVersion: "📝 Versión Original", euFundsOptimized: "🇪🇺 Optimizado Fondos UE", investorsPlan: "🏦 Plan para Inversores", versionHistory: "Historial de Versiones", savedVersions: "Versiones Guardadas",
    objectives1y: "Objetivos (1 año)", objectives3y: "Objetivos (3-5 años)", missionValues: "Misión y Valores", targetCustomers: "Clientes Objetivo", competition: "Competencia",
    marketingStrategy: "Estrategia de Marketing", swotTitle: "ANÁLISIS ESTRATÉGICO FODA", strengths: "Fortalezas", weaknesses: "Debilidades", opportunities: "Oportunidades", threats: "Amenazas",
    operationalPlan: "Plan Operativo", workflowDesc: "1. Descripción del Flujo (Sostenibilidad / Verde)", humanResources: "2. Recursos Humanos", locationFacilities: "3. Ubicación e Instalaciones",
    optimizeBudgetCustom: "Optimizar Presupuesto (Personalizado)",
    editorTip: "<strong>Consejo:</strong> Ajusta aquí el mensaje de tu plan hasta que resulte convincente. Luego <em>Confirmar y Guardar</em> y descarga documentos listos para presentar.",
    versionToolsTip: "<strong>Consejo:</strong> Cada herramienta genera una <strong class='text-white'>variante distinta</strong> del plan. Puedes usar varias herramientas en la misma variante — hasta 2 con Standard, hasta 4 con Herramientas Pro — y descargar la variante activa.",
    expertLibraryTip: "<strong>Consejo:</strong> Para dossiers sólidos de <strong class='text-white'>fondos europeos</strong> o <strong class='text-white'>inversores</strong>, completa desde la biblioteca los capítulos clave: DNSH, igualdad de oportunidades, precios, matriz de riesgos.",
    proPackQuotaTip: "<strong>Consejo:</strong> <strong class='text-amber-300'>Atención:</strong> las <strong class='text-white'>generaciones</strong>, <strong class='text-white'>ediciones Pro</strong> y <strong class='text-white'>combinaciones</strong> del paquete son <strong class='text-white'>compartidas entre todos los proyectos</strong> de <strong class='text-white'>Mis Planes</strong>. Úsalas con cuidado — aprovecha cada acción en el plan adecuado.",
    planGeneratedSmartly: "Plan de negocios generado inteligentemente por IdeeaTa.ai", filePresentation: "Presentación", fileSummaryFree: "Resumen_Gratuito", fileDocument: "Documento", fileBrochure: "Folleto",
    howItLooks: "¿Cómo se ve un plan generado?", perspective: "Perspectiva", previewTabs: "Vista con pestañas", animatedCharts: "Gráficos animados", typingLive: "Escritura en vivo",
    beforeAfter: "Antes y Después", generatedExample: "EJEMPLO GENERADO", coffeeShopName: "Cafetería de Especialidad 'Urban Beans'", paywallTitle: "Este fue solo un breve resumen.", paywallDesc: "¡Para obtener el <strong>Análisis FODA detallado, el Presupuesto de Inversión, la Estrategia de Mercado y el Plan Operativo</strong>, crea una cuenta gratuita!", paywallDescStudio: "¡Para obtener el <strong>Análisis FODA detallado, el Presupuesto de Inversión, la Estrategia de Mercado y el Plan Operativo</strong>, desbloquea el paquete completo!",
    paywallBtn: "Visita IdeeaTa.ai",
    sharedPlanNotFound: "No se encontró este plan compartido.",
    sharedPlanNotFoundHint: "El enlace del PDF es antiguo o no es válido. Genera un plan nuevo o vuelve a descargar el resumen.",
    studioHeaderSubtitle: "Tu proyecto de negocio inteligente", costDistribution: "Distribución de Costes", protectedContentPrint: "El contenido está protegido. Para obtener el documento, utilice la función de descarga en la aplicación.",

    mockupSummary: "Resumen", mockupSwot: "FODA", mockupBudget: "Presupuesto", mockupStrategy: "Estrategia",
    mockupSummaryP1: "es una moderna cafetería de especialidad situada en el corazón del centro histórico. Nuestro objetivo es ofrecer no solo café de origen tostado localmente, sino también una experiencia sensorial completa en un entorno de diseño industrial minimalista.",
    mockupSummaryP2: "Nuestra misión es educar a los consumidores sobre el proceso del grano a la taza, apoyando a los agricultores independientes mediante comercio justo (Fairtrade).",
    mockupSwotS_Title: "Fortalezas", mockupSwotS_1: "Ubicación premium con mucho tráfico", mockupSwotS_2: "Baristas certificados por SCA", mockupSwotS_3: "Exclusividad con un tostador local",
    mockupSwotW_Title: "Debilidades", mockupSwotW_1: "Altos costos de alquiler en la zona céntrica", mockupSwotW_2: "Falta de historial en el mercado (nueva marca)", mockupSwotW_3: "Precios más altos que las cadenas comerciales",
    mockupSwotO_Title: "Oportunidades", mockupSwotO_1: "Creciente demanda de café de especialidad", mockupSwotO_2: "Asociaciones B2B con oficinas de la zona", mockupSwotO_3: "Suscripción mensual de granos de café",
    mockupSwotT_Title: "Amenazas", mockupSwotT_1: "Fluctuación del precio del café verde", mockupSwotT_2: "Apertura de una nueva franquicia cercana", mockupSwotT_3: "Reticencia de los clientes tradicionalistas",
    mockupBudgetTitle: "Presupuesto de Inversión Inicial", mockupBudgetEq: "Equipamiento (Máquinas, Molinillos)", mockupBudgetDes: "Acondicionamiento y Diseño", mockupBudgetStock: "Inventario inicial y Suministros",
    mockupBudgetEqVal: "12.500 €", mockupBudgetDesVal: "17.000 €", mockupBudgetStockVal: "3.500 €", mockupBudgetTotal: "Inversión Total Estimada", mockupBudgetTotalVal: "33.000 €",
    mockupStrategy1_Title: "Pre-lanzamiento y Teasing", mockupStrategy1_Desc: "Campaña en redes sociales centrada en el proceso de montaje, presentación del equipo y revelación del tostador asociado.",
    mockupStrategy2_Title: "Apertura Suave", mockupStrategy2_Desc: "Una semana dedicada exclusivamente a la comunidad local e influencers culinarios, con un menú limitado al 50% de descuento.",
    mockupStrategy3_Title: "Fidelización B2B", mockupStrategy3_Desc: "Paquetes especiales para empleados de oficinas cercanas: badges de empresa con un 15% de descuento permanente.",
    mockupFinYearTitle: "Proyecciones Financieras: Año 1", mockupFinYearDesc: "Estimación de ingresos y distribución de costes operativos (en EUR).",
    mockupChartRevenue: "Evolución de Ingresos", mockupChartCostsDist: "Distribución de Costes",
    mockupChartSalaries: "Salarios", mockupChartRent: "Alquiler y Servicios", mockupChartStock: "Inventario", mockupChartMarketing: "Marketing",
    mockupProfitMargin: "Margen de Beneficio",
    mockupLiveTitle: "# Plan de Negocio - Cafetería de Especialidad \"Urban Beans\"", mockupLiveGen: "> Generando proyecciones financieras...", mockupLiveRev: "## Ingresos Estimados", mockupLiveRev1: "- Trimestre 1: 150.000 (crecimiento orgánico)", mockupLiveRev2: "- Trimestre 2: 275.000 (temporada cálida)", mockupLiveRev3: "- Trimestre 3: 400.000 (B2B estable)",
    mockupLiveCosts: "## Costos Operativos", mockupLiveCosts1: "- Salarios: 35.000 / mes", mockupLiveCosts2: "- Alquiler: 15.000 / mes",
    mockupLiveStatus: "## Estado de Generación", mockupLiveStat1: "Análisis de la Competencia", mockupLiveStat2: "Estrategia de Precios", mockupLiveStat3: "Cálculo del ROI", mockupLiveComplete: "Completo",
    mockupBeforeTitle: "Antes", mockupBeforeDesc: "\"Quiero abrir una cafetería. Tengo 5 años de experiencia. No sé por dónde empezar con el plan de negocio.\"",
    errorServerPrefix: "Error del servidor: ", errorNetworkError: "Error de red. Por favor, inténtelo de nuevo.", errorInvalidFormat: "El sistema devolvió un formato no válido. Por favor, inténtelo de nuevo.", errorGenerationFallback: "Ocurrió un error al generar el plan. Por favor, inténtelo de nuevo más tarde.",
  }
};
