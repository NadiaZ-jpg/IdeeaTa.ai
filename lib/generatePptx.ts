import pptxgen from "pptxgenjs";

export const generatePptx = async (
  result: any,
  safeName: string,
  currency: string,
  fxRate: number,
  locale: "ro" | "en" | "es" = "ro"
) => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: '09090b' },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: '10b981' } } }
    ]
  });

  const pptxTranslations = {
    ro: {
      generalInfoTitle: "DATE GENERALE & OBIECTIVE",
      legalForm: "Forma juridică: ",
      caenCode: "\nCod CAEN: ",
      contactInfo: "\nContact: ",
      shortTermObj: "Obiective (1 an)",
      mediumTermObj: "OBIECTIVE PE TERMEN MEDIU",
      mediumTermObjSub: "Obiective (3-5 ani)",
      missionValues: "MISIUNE ȘI VALORI",
      missionValuesSub: "Misiune și Valori",
      marketCompTitle: "PIAȚA ȘI CONCURENȚA",
      targetCustomers: "Clienții Țintă",
      competition: "Concurența",
      marketingTitle: "PROMOVARE",
      marketingStrategy: "Strategia de Marketing",
      swotTitle: "ANALIZĂ SWOT",
      strengths: "PUNCTE TARI (S)",
      weaknesses: "SLĂBICIUNI (W)",
      opportunities: "OPORTUNITĂȚI (O)",
      threats: "AMENINȚĂRI (T)",
      operationalTitle: "PLAN OPERAȚIONAL",
      workflowDesc: "Descriere Flux Tehnologic",
      humanResources: "Resurse Umane",
      facilities: "Locație și Dotări",
      investmentBudget: "BUGET INVESTIȚII",
      financialPlanTitle: "PLAN FINANCIAR - DISTRIBUȚIA COSTURILOR",
      customSectionDefault: "Secțiune Adițională",
      part: "Partea",
      budgetName: "Buget"
    },
    en: {
      generalInfoTitle: "GENERAL INFORMATION & OBJECTIVES",
      legalForm: "Legal form: ",
      caenCode: "\nCAEN Code: ",
      contactInfo: "\nContact: ",
      shortTermObj: "Objectives (1 year)",
      mediumTermObj: "MEDIUM-TERM OBJECTIVES",
      mediumTermObjSub: "Objectives (3-5 years)",
      missionValues: "MISSION & VALUES",
      missionValuesSub: "Mission & Values",
      marketCompTitle: "MARKET & COMPETITION",
      targetCustomers: "Target Customers",
      competition: "Competition",
      marketingTitle: "PROMOTION",
      marketingStrategy: "Marketing Strategy",
      swotTitle: "SWOT ANALYSIS",
      strengths: "STRENGTHS (S)",
      weaknesses: "WEAKNESSES (W)",
      opportunities: "OPPORTUNITIES (O)",
      threats: "THREATS (T)",
      operationalTitle: "OPERATIONAL PLAN",
      workflowDesc: "Workflow Description",
      humanResources: "Human Resources",
      facilities: "Location & Facilities",
      investmentBudget: "INVESTMENT BUDGET",
      financialPlanTitle: "FINANCIAL PLAN - COST DISTRIBUTION",
      customSectionDefault: "Additional Section",
      part: "Part",
      budgetName: "Budget"
    },
    es: {
      generalInfoTitle: "INFORMACIÓN GENERAL Y OBJETIVOS",
      legalForm: "Forma jurídica: ",
      caenCode: "\nCódigo CAEN: ",
      contactInfo: "\nContacto: ",
      shortTermObj: "Objetivos (1 año)",
      mediumTermObj: "OBJETIVOS A MEDIO PLAZO",
      mediumTermObjSub: "Objetivos (3-5 años)",
      missionValues: "MISIÓN Y VALORES",
      missionValuesSub: "Misión y Valores",
      marketCompTitle: "MERCADO Y COMPETENCIA",
      targetCustomers: "Clientes Objetivo",
      competition: "Competencia",
      marketingTitle: "PROMOCIÓN",
      marketingStrategy: "Estrategia de Marketing",
      swotTitle: "ANÁLISIS SWOT / DAFO",
      strengths: "FORTALEZAS (S)",
      weaknesses: "DEBILIDADES (W)",
      opportunities: "OPORTUNIDADES (O)",
      threats: "AMENAZAS (T)",
      operationalTitle: "PLAN OPERATIVO",
      workflowDesc: "Descripción del Flujo de Trabajo",
      humanResources: "Recursos Humanos",
      facilities: "Ubicación e Instalaciones",
      investmentBudget: "PRESUPUESTO DE INVERSIÓN",
      financialPlanTitle: "PLAN FINANCIERO - DISTRIBUCIÓN DE COSTES",
      customSectionDefault: "Sección Adicional",
      part: "Parte",
      budgetName: "Presupuesto"
    }
  };

  const tr = pptxTranslations[locale] || pptxTranslations.ro;

  const formatPrice = (priceText: any) => {
    if (!priceText) return "";
    const numericValue = parseInt(priceText.toString().replace(/[^0-9]/g, ""));
    if (isNaN(numericValue)) return priceText;

    const locString = locale === "es" ? "es-ES" : locale === "en" ? "en-US" : "ro-RO";
    if (currency === "EUR") {
      const eurValue = Math.round(numericValue * fxRate);
      return `€${eurValue.toLocaleString(locString)}`;
    }
    return `${numericValue.toLocaleString(locString)} RON`;
  };

  const splitTextIntoSlides = (text: string, maxLength: number) => {
    if (!text) return [];
    const paragraphs = text.split('\n');
    let slides: string[] = [];
    let currentSlide = '';

    for (let p of paragraphs) {
      if (currentSlide.length + p.length > maxLength) {
        if (currentSlide.trim()) slides.push(currentSlide.trim());
        currentSlide = p + '\n';
      } else {
        currentSlide += p + '\n';
      }
    }
    if (currentSlide.trim()) slides.push(currentSlide.trim());
    return slides;
  };

  const formatPptText = (text: string, color: string = 'e4e4e7') => {
    if (!text) return [];
    let stripped = text.replace(/\*\*/g, '').replace(/###/g, '').replace(/##/g, '').replace(/#/g, '');
    return stripped.split('\n').filter(l => l.trim().length > 0).map(l => {
      return { text: l.trim(), options: { bullet: false, color, breakLine: true, fontFace: 'Times New Roman', align: 'justify' as any } as any };
    });
  };

  // Slide 1: Title
  let slide1 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
  slide1.addText(result.nume || 'IdeeaTa', { x: 0, y: 2.5, w: '100%', h: 1, fontSize: 54, bold: true, color: '10b981', align: 'center', fontFace: 'Times New Roman' });
  slide1.addText(result.slogan || '', { x: 0, y: 3.5, w: '100%', h: 1, fontSize: 24, italic: true, color: 'e4e4e7', align: 'center', fontFace: 'Times New Roman' });

  // Slide 2: Obiective 1 An
  let slide2 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
  slide2.addText(tr.generalInfoTitle, { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '10b981', fontFace: 'Times New Roman' });
  slide2.addText(tr.legalForm + result.date_generale?.forma_juridica + tr.caenCode + result.date_generale?.cod_caen + tr.contactInfo + result.date_generale?.date_contact, { x: 0.5, y: 1.2, w: 9, h: 0.8, fontSize: 12, color: 'a1a1aa', fontFace: 'Times New Roman' });
  slide2.addText(tr.shortTermObj, { x: 0.5, y: 2.2, w: 9, h: 0.4, fontSize: 16, bold: true, color: '10b981', fontFace: 'Times New Roman' });
  slide2.addText(formatPptText(result.viziune_strategie?.obiective_scurt), { x: 0.5, y: 2.6, w: 9, h: 4, fontSize: 12, valign: 'top' });

  const addTextSlide = (mainTitle: string, subTitle: string, contentStr: string | undefined) => {
    if(!contentStr) return;
    const slides = splitTextIntoSlides(contentStr, 1100);
    slides.forEach((content, slideIdx) => {
      let slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
      slide.addText(mainTitle, { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '10b981', fontFace: 'Times New Roman' });
      slide.addText(subTitle + (slides.length > 1 ? ` (${tr.part} ${slideIdx + 1})` : ''), { x: 0.5, y: 1.2, w: 9, h: 0.4, fontSize: 16, bold: true, color: '10b981', fontFace: 'Times New Roman' });
      slide.addText(formatPptText(content), { x: 0.5, y: 1.6, w: 9, h: 5.5, fontSize: 11, valign: 'top' });
    });
  };

  const addSwotSlide = (mainTitle: string, subTitle: string, color: string, swotArr: any[]) => {
    if(!swotArr || !swotArr.length) return;
    const contentStr = swotArr.map((i: any) => '• ' + (i.titlu || i) + '\n  ' + (i.explicatie_tehnica || '')).join('\n\n');
    const slides = splitTextIntoSlides(contentStr, 1100);
    slides.forEach((content, slideIdx) => {
      let slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
      slide.addText(mainTitle, { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color, fontFace: 'Times New Roman' });
      slide.addText(subTitle + (slides.length > 1 ? ` (${tr.part} ${slideIdx + 1})` : ''), { x: 0.5, y: 1.2, w: 9, h: 0.4, fontSize: 16, bold: true, color, fontFace: 'Times New Roman' });
      slide.addText(formatPptText(content, 'e4e4e7'), { x: 0.5, y: 1.6, w: 9, h: 5.5, fontSize: 11, valign: 'top' });
    });
  };

  addTextSlide(tr.mediumTermObj, tr.mediumTermObjSub, result.viziune_strategie?.obiective_mediu);
  addTextSlide(tr.missionValues, tr.missionValuesSub, result.viziune_strategie?.misiune_valori);
  addTextSlide(tr.marketCompTitle, tr.targetCustomers, result.analiza_pietei?.clienti_tinta);
  addTextSlide(tr.marketCompTitle, tr.competition, result.analiza_pietei?.concurenta);
  addTextSlide(tr.marketingTitle, tr.marketingStrategy, result.analiza_pietei?.strategie_marketing);

  addSwotSlide(tr.swotTitle, tr.strengths, '10b981', result.analiza_swot?.puncte_tari);
  addSwotSlide(tr.swotTitle, tr.weaknesses, 'ef4444', result.analiza_swot?.puncte_slabe);
  addSwotSlide(tr.swotTitle, tr.opportunities, '3b82f6', result.analiza_swot?.oportunitati);
  addSwotSlide(tr.swotTitle, tr.threats, 'eab308', result.analiza_swot?.amenintari);

  addTextSlide(tr.operationalTitle, tr.workflowDesc, result.plan_operational?.descriere_flux);
  addTextSlide(tr.operationalTitle, tr.humanResources, result.plan_operational?.resurse_umane);
  addTextSlide(tr.operationalTitle, tr.facilities, result.plan_operational?.locatie_dotari);

  // Slides for Buget (chunked)
  const budgetItems = result.plan_financiar?.buget_investitii || [];
  const numBudgetSlides = Math.ceil((budgetItems.length || 1) / 4);
  for(let slideIdx = 0; slideIdx < numBudgetSlides; slideIdx++) {
    let bSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    bSlide.addText(tr.investmentBudget + (slideIdx > 0 ? ` (${tr.part} ${slideIdx + 1})` : ''), { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '10b981', fontFace: 'Times New Roman' });
    
    const chunk = budgetItems.slice(slideIdx * 4, slideIdx * 4 + 4);
    let bText = chunk.map((b: any) => ({ text: b.item + ' - ' + formatPrice(b.cost) + '\n' + b.explicatie, options: { bullet: true, color: 'e4e4e7', breakLine: true, fontFace: 'Times New Roman' } }));
    bSlide.addText(bText, { x: 0.5, y: 1.2, w: 9, h: 5.5, fontSize: 11, valign: 'top' });
  }

  // Slide 8: Buget Chart (Native PPTX Chart)
  let cSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
  cSlide.addText(tr.financialPlanTitle, { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 22, bold: true, color: '10b981', fontFace: 'Times New Roman' });
  if (result?.plan_financiar?.buget_investitii && result.plan_financiar.buget_investitii.length > 0) {
    let dataChartPie = [
      {
        name: tr.budgetName,
        labels: result.plan_financiar.buget_investitii.map((i: any) => i.item),
        values: result.plan_financiar.buget_investitii.map((i: any) => parseInt(i.cost.toString().replace(/[^0-9]/g, "")))
      }
    ];
    cSlide.addChart(pres.ChartType.doughnut, dataChartPie, { 
      x: 1.8, y: 1.8, w: 6.4, h: 3.5, 
      showLegend: true, legendPos: 'r', 
      showPercent: true,
      dataLabelPosition: 'outEnd',
      holeSize: 50,
      dataLabelColor: 'e4e4e7',
      dataLabelFontSize: 10,
      legendColor: 'e4e4e7',
      legendFontSize: 10,
      showTitle: false,
      chartColors: ['10b981', '3b82f6', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '14b8a6']
    });
  }

  // Slides for Custom/Additional Sections
  result.sectiuni_aditionale?.forEach((sec: any) => {
    if (!sec || !sec.continut) return;
    const slides = splitTextIntoSlides(sec.continut, 1800);
    slides.forEach((slideContent, slideIdx) => {
      let cSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
      const secTitle = (sec.titlu || tr.customSectionDefault).toUpperCase();
      cSlide.addText(secTitle + (slides.length > 1 ? ` (${tr.part} ${slideIdx + 1})` : ''), { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 22, bold: true, color: '10b981', fontFace: 'Times New Roman' });
      cSlide.addText(formatPptText(slideContent), { x: 0.5, y: 1.2, w: 9, h: 5.5, fontSize: 11, valign: 'top' });
    });
  });

  await pres.writeFile({ fileName: `IdeeaTa_Brosura_${safeName}.pptx` });
};
