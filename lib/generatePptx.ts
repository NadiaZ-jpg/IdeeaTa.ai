import pptxgen from "pptxgenjs";

export const generatePptx = async (result: any, safeName: string, currency: string, fxRate: number) => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: '09090b' },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: '10b981' } } }
    ]
  });

  const formatPrice = (priceText: any) => {
    if (!priceText) return "";
    const numericValue = parseInt(priceText.toString().replace(/[^0-9]/g, ""));
    if (isNaN(numericValue)) return priceText;

    if (currency === "EUR") {
      const eurValue = Math.round(numericValue * fxRate);
      return `€${eurValue.toLocaleString("ro-RO")}`;
    }
    return `${numericValue.toLocaleString("ro-RO")} RON`;
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

  const swotFormat = (arr: any[], color: string) => arr?.map((i: any) => ({ text: (i.titlu || i) + '\n' + (i.explicatie_tehnica || ''), options: { color, bullet: true, breakLine: true, fontFace: 'Times New Roman', align: 'justify' as any } as any })) || [];

  // Slide 1: Title
  let slide1 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
  slide1.addText(result.nume || 'IdeeaTa', { x: 0, y: 2.5, w: '100%', h: 1, fontSize: 54, bold: true, color: '10b981', align: 'center', fontFace: 'Times New Roman' });
  slide1.addText(result.slogan || '', { x: 0, y: 3.5, w: '100%', h: 1, fontSize: 24, italic: true, color: 'e4e4e7', align: 'center', fontFace: 'Times New Roman' });

  // Slide 2: Obiective 1 An
  let slide2 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
  slide2.addText('DATE GENERALE & OBIECTIVE', { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '10b981', fontFace: 'Times New Roman' });
  slide2.addText('Forma juridică: ' + result.date_generale?.forma_juridica + '\nCod CAEN: ' + result.date_generale?.cod_caen + '\nContact: ' + result.date_generale?.date_contact, { x: 0.5, y: 1.2, w: 9, h: 0.8, fontSize: 12, color: 'a1a1aa', fontFace: 'Times New Roman' });
  slide2.addText('Obiective (1 an)', { x: 0.5, y: 2.2, w: 9, h: 0.4, fontSize: 16, bold: true, color: '10b981', fontFace: 'Times New Roman' });
  slide2.addText(formatPptText(result.viziune_strategie?.obiective_scurt), { x: 0.5, y: 2.6, w: 9, h: 4, fontSize: 12, valign: 'top' });

  const addTextSlide = (mainTitle: string, subTitle: string, contentStr: string | undefined) => {
    if(!contentStr) return;
    const slides = splitTextIntoSlides(contentStr, 1100);
    slides.forEach((content, slideIdx) => {
      let slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
      slide.addText(mainTitle, { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '10b981', fontFace: 'Times New Roman' });
      slide.addText(subTitle + (slides.length > 1 ? ` (Partea ${slideIdx + 1})` : ''), { x: 0.5, y: 1.2, w: 9, h: 0.4, fontSize: 16, bold: true, color: '10b981', fontFace: 'Times New Roman' });
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
      slide.addText(subTitle + (slides.length > 1 ? ` (Partea ${slideIdx + 1})` : ''), { x: 0.5, y: 1.2, w: 9, h: 0.4, fontSize: 16, bold: true, color, fontFace: 'Times New Roman' });
      slide.addText(formatPptText(content, 'e4e4e7'), { x: 0.5, y: 1.6, w: 9, h: 5.5, fontSize: 11, valign: 'top' });
    });
  };

  addTextSlide('OBIECTIVE PE TERMEN MEDIU', 'Obiective (3-5 ani)', result.viziune_strategie?.obiective_mediu);
  addTextSlide('MISIUNE ȘI VALORI', 'Misiune și Valori', result.viziune_strategie?.misiune_valori);
  addTextSlide('PIAȚA ȘI CONCURENȚA', 'Clienții Țintă', result.analiza_pietei?.clienti_tinta);
  addTextSlide('PIAȚA ȘI CONCURENȚA', 'Concurența', result.analiza_pietei?.concurența);
  addTextSlide('PROMOVARE', 'Strategia de Marketing', result.analiza_pietei?.strategie_marketing);

  addSwotSlide('ANALIZĂ SWOT', 'PUNCTE TARI (S)', '10b981', result.analiza_swot?.puncte_tari);
  addSwotSlide('ANALIZĂ SWOT', 'SLĂBICIUNI (W)', 'ef4444', result.analiza_swot?.puncte_slabe);
  addSwotSlide('ANALIZĂ SWOT', 'OPORTUNITĂȚI (O)', '3b82f6', result.analiza_swot?.oportunitati);
  addSwotSlide('ANALIZĂ SWOT', 'AMENINȚĂRI (T)', 'eab308', result.analiza_swot?.amenintari);

  addTextSlide('PLAN OPERAȚIONAL', 'Descriere Flux Tehnologic', result.plan_operational?.descriere_flux);
  addTextSlide('PLAN OPERAȚIONAL', 'Resurse Umane', result.plan_operational?.resurse_umane);
  addTextSlide('PLAN OPERAȚIONAL', 'Locație și Dotări', result.plan_operational?.locatie_dotari);

  // Slides for Buget (chunked)
  const budgetItems = result.plan_financiar?.buget_investitii || [];
  const numBudgetSlides = Math.ceil((budgetItems.length || 1) / 4);
  for(let slideIdx = 0; slideIdx < numBudgetSlides; slideIdx++) {
    let bSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    bSlide.addText('BUGET INVESTIȚII' + (slideIdx > 0 ? ` (Partea ${slideIdx + 1})` : ''), { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 28, bold: true, color: '10b981', fontFace: 'Times New Roman' });
    
    const chunk = budgetItems.slice(slideIdx * 4, slideIdx * 4 + 4);
    let bText = chunk.map((b: any) => ({ text: b.item + ' - ' + formatPrice(b.cost) + '\n' + b.explicatie, options: { bullet: true, color: 'e4e4e7', breakLine: true, fontFace: 'Times New Roman' } }));
    bSlide.addText(bText, { x: 0.5, y: 1.2, w: 9, h: 5.5, fontSize: 11, valign: 'top' });
  }

  // Slide 8: Buget Chart (Native PPTX Chart)
  let cSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
  cSlide.addText('PLAN FINANCIAR - DISTRIBUȚIA COSTURILOR', { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 22, bold: true, color: '10b981', fontFace: 'Times New Roman' });
  if (result?.plan_financiar?.buget_investitii && result.plan_financiar.buget_investitii.length > 0) {
    let dataChartPie = [
      {
        name: "Buget",
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
      const secTitle = (sec.titlu || 'Secțiune Adițională').toUpperCase();
      cSlide.addText(secTitle + (slides.length > 1 ? ` (Partea ${slideIdx + 1})` : ''), { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 22, bold: true, color: '10b981', fontFace: 'Times New Roman' });
      cSlide.addText(formatPptText(slideContent), { x: 0.5, y: 1.2, w: 9, h: 5.5, fontSize: 11, valign: 'top' });
    });
  });

  await pres.writeFile({ fileName: `IdeeaTa_Brosura_${safeName}.pptx` });
};
