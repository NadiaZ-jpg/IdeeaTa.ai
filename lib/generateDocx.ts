import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const FONT = "Times New Roman";
const COLOR_EMERALD = "065f46";
const COLOR_TEXT = "1a1a1a";
const COLOR_GRAY = "555555";
const COLOR_RED = "991b1b";
const COLOR_ORANGE = "9a3412";
const COLOR_BLUE = "1e40af";

// ─── Helpers ────────────────────────────────────────────────────────────────

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: COLOR_EMERALD,
        font: FONT,
      }),
    ],
    keepNext: true,
    keepLines: true,
    spacing: { before: 480, after: 160 },
    border: {
      bottom: {
        color: "10b981",
        style: BorderStyle.SINGLE,
        size: 8,
        space: 4,
      },
    },
  });
}

function subHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: COLOR_EMERALD,
        font: FONT,
      }),
    ],
    spacing: { before: 240, after: 120 },
  });
}

function bodyText(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text || "", size: 24, font: FONT, color: COLOR_TEXT })],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 80, line: 360 },
  });
}

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 24, font: FONT }),
      new TextRun({ text: value || "", size: 24, font: FONT, color: COLOR_TEXT }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100 },
    bullet: { level: 0 },
  });
}

function numberedItem(num: number, label: string, value: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: `${num}. `, bold: true, size: 24, font: FONT }),
        new TextRun({ text: label, bold: true, size: 24, font: FONT, color: COLOR_EMERALD }),
      ],
      keepNext: true,
      keepLines: true,
      spacing: { before: 120, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: value || "", size: 24, font: FONT, color: COLOR_TEXT })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100 },
      indent: { left: 400 },
    }),
  ];
}

function spacer(): Paragraph {
  return new Paragraph({ spacing: { after: 160 } });
}

function formatPrice(val: any, locale: "ro" | "en" | "es" = "ro"): string {
  const num = parseInt((val || "0").toString().replace(/[^0-9]/g, ""));
  if (!num) return locale === "ro" ? "0 RON" : "0 EUR";
  if (locale === "ro") {
    return num.toLocaleString("ro-RO") + " RON";
  } else {
    return num.toLocaleString(locale === "es" ? "es-ES" : "en-US") + " EUR";
  }
}

const swotItemParagraphs = (items: any[], title: string, color: string): Paragraph[] => {
  const list: Paragraph[] = [];
  list.push(
    new Paragraph({
      keepNext: true,
      children: [new TextRun({ text: title, bold: true, color, font: FONT, size: 24 })],
      spacing: { before: 240, after: 120 },
    })
  );
  if (!items || items.length === 0) {
    list.push(new Paragraph({ children: [new TextRun({ text: "-", font: FONT, size: 20 })] }));
    return list;
  }
  items.forEach((item: any) => {
    list.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• ${item.titlu || String(item)}: `, bold: true, color, font: FONT, size: 20 }),
          new TextRun({ text: item.explicatie_tehnica || "", font: FONT, size: 20, color: COLOR_TEXT }),
        ],
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  });
  return list;
};

// ─── Translations ───────────────────────────────────────────────────────────
const docxTranslations = {
  ro: {
    generalInfoTitle: "I & II. Date Generale și Viziune",
    contactInfo: "Date Contact:",
    legalForm: "Forma Juridică:",
    caenCode: "Cod CAEN:",
    shortTermObj: "Obiective pe Termen Scurt",
    mediumTermObj: "Obiective pe Termen Mediu",
    missionValues: "Misiune și Valori",
    marketAnalysis: "III. Analiza Pieței și Promovarea",
    targetCustomers: "Clienții Țintă",
    competition: "Concurență",
    marketingStrategy: "Strategia de Marketing",
    tendintePiata: "Tendințe Piață",
    swotAnalysis: "IV. Analiza SWOT",
    strengths: "Puncte Tari (S)",
    weaknesses: "Slăbiciuni (W)",
    opportunities: "Oportunități (O)",
    threats: "Amenințări (T)",
    operationalPlan: "V. Planul Operațional și de Management",
    workflowDesc: "Descriere Flux Tehnologic:",
    humanResources: "Resurse Umane (Organigramă):",
    facilities: "Locație și Dotări Necesare:",
    financialPlan: "VI. Planul Financiar",
    investmentBudget: "Detalii Buget Investiții",
    budgetCost: "Valoare Estimată",
    costDistribution: "Distribuția Costurilor",
    customSectionDefault: "Secțiune Adițională",
    viziuneStrategie: "Viziune și Strategie",
    totalEstimat: "TOTAL ESTIMAT"
  },
  en: {
    generalInfoTitle: "I & II. General Information and Vision",
    contactInfo: "Contact Info:",
    legalForm: "Legal Form:",
    caenCode: "CAEN Code:",
    shortTermObj: "Short-Term Objectives",
    mediumTermObj: "Medium-Term Objectives",
    missionValues: "Mission and Values",
    marketAnalysis: "III. Market Analysis and Promotion",
    targetCustomers: "Target Customers",
    competition: "Competition",
    marketingStrategy: "Marketing Strategy",
    tendintePiata: "Market Trends",
    swotAnalysis: "IV. SWOT Analysis",
    strengths: "Strengths (S)",
    weaknesses: "Weaknesses (W)",
    opportunities: "Opportunities (O)",
    threats: "Threats (T)",
    operationalPlan: "V. Operational & Management Plan",
    workflowDesc: "Workflow Description:",
    humanResources: "Human Resources (Org Chart):",
    facilities: "Location & Required Facilities:",
    financialPlan: "VI. Financial Plan",
    investmentBudget: "Investment Budget Details",
    budgetCost: "Estimated Cost",
    costDistribution: "Cost Distribution",
    customSectionDefault: "Additional Section",
    viziuneStrategie: "Vision & Strategy",
    totalEstimat: "ESTIMATED TOTAL"
  },
  es: {
    generalInfoTitle: "I y II. Información General y Visión",
    contactInfo: "Contacto / Representante:",
    legalForm: "Forma Jurídica:",
    caenCode: "Código CAEN:",
    shortTermObj: "Objetivos a Corto Plazo",
    mediumTermObj: "Objetivos a Medio Plazo",
    missionValues: "Misión y Valores",
    marketAnalysis: "III. Análisis de Mercado y Promoción",
    targetCustomers: "Clientes Objetivo",
    competition: "Competencia",
    marketingStrategy: "Estrategia de Marketing",
    tendintePiata: "Tendencias del Mercado",
    swotAnalysis: "IV. Análisis SWOT / DAFO",
    strengths: "Fortalezas (S)",
    weaknesses: "Debilidades (W)",
    opportunities: "Oportunidades (O)",
    threats: "Amenazas (T)",
    operationalPlan: "V. Plan Operativo y de Gestión",
    workflowDesc: "Descripción del Flujo de Trabajo:",
    humanResources: "Recursos Humanos (Organigrama):",
    facilities: "Ubicación e Instalaciones Requeridas:",
    financialPlan: "VI. Plan Financiero",
    investmentBudget: "Detalles del Presupuesto de Inversión",
    budgetCost: "Valor Estimado",
    costDistribution: "Distribución de Costes",
    customSectionDefault: "Sección Adicional",
    viziuneStrategie: "Visión y Estrategia",
    totalEstimat: "TOTAL ESTIMADO"
  }
};

// ─── Main generator ─────────────────────────────────────────────────────────

export async function generateDocxBlob(
  result: any,
  chartDataUrl?: string | null,
  locale: "ro" | "en" | "es" = "ro"
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  // Generate a pure canvas pie chart if budget exists
  let finalChartDataUrl = chartDataUrl;
  if (!finalChartDataUrl && result?.plan_financiar?.buget_investitii?.length > 0 && typeof document !== 'undefined') {
    try {
      const items = result.plan_financiar.buget_investitii;
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(0, 0, 800, 400, 24);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, 800, 400);
        }

        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
        const values = items.map((i: any) => parseInt((i.cost || i.valoare || "0").toString().replace(/[^0-9]/g, '')) || 0);
        const total = values.reduce((a: number, b: number) => a + b, 0);

        const cx = 250;
        const cy = 200;
        const radius = 160;

        let startAngle = -Math.PI / 2;

        if (total > 0) {
          // Draw pie
          values.forEach((val: number, i: number) => {
            if (val === 0) return;
            const sliceAngle = (val / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();

            // Draw percentage
            const midAngle = startAngle + sliceAngle / 2;
            const px = cx + Math.cos(midAngle) * (radius * 0.65);
            const py = cy + Math.sin(midAngle) * (radius * 0.65);
            const perc = Math.round((val / total) * 100) + '%';
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(perc, px, py);

            startAngle += sliceAngle;
          });

          // Draw inner hole for doughnut
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 0.55, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          
          // Draw Total in center
          ctx.fillStyle = '#6b7280';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('TOTAL', cx, cy - 15);
          
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 20px Arial';
          
          // Formateaza totalul frumos
          const formatPriceCenter = (val: number) => {
             if (locale === "ro") {
               return new Intl.NumberFormat('ro-RO').format(val) + ' RON';
             } else {
               return new Intl.NumberFormat(locale === "es" ? 'es-ES' : 'en-US').format(val) + ' EUR';
             }
          };
          ctx.fillText(formatPriceCenter(total), cx, cy + 12);

            // Draw legend
            const lx = 480;
            let ly = Math.max(40, 200 - (items.length * 15));
            items.forEach((item: any, i: number) => {
              if (values[i] === 0) return;
              ctx.fillStyle = colors[i % colors.length];
              ctx.fillRect(lx, ly - 12, 20, 20);
              
              ctx.fillStyle = '#1f2937';
              ctx.font = '16px Arial';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              
              let label = item.item || item.nume || "Investiție";
              if (label.length > 30) label = label.substring(0, 27) + '...';
              
              ctx.fillText(label, lx + 30, ly - 2);
              ly += 30;
            });

            finalChartDataUrl = canvas.toDataURL('image/png');
        }
      }
    } catch (e) {
      console.error("Failed to draw canvas pie chart for docx", e);
    }
  }

  // ── Cover ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: result.nume || "",
          bold: true,
          size: 56,
          font: FONT,
          color: COLOR_EMERALD,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 160 },
    })
  );

  if (result.slogan) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `„${result.slogan}"`,
            italics: true,
            size: 28,
            font: FONT,
            color: COLOR_GRAY,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
      })
    );
  }

  // ── Divider ──
  children.push(
    new Paragraph({
      border: { bottom: { color: "10b981", style: BorderStyle.SINGLE, size: 12, space: 1 } },
      spacing: { after: 320 },
    })
  );

  const tr = docxTranslations[locale] || docxTranslations.ro;

  // ── I & II. Date Generale ──
  children.push(sectionHeading(tr.generalInfoTitle));

  const dg = result.date_generale || {};
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: tr.legalForm, bold: true, font: FONT, size: 22 })] })],
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: "f0fdf4", type: ShadingType.CLEAR },
            }),
            new TableCell({ children: [bodyText(dg.forma_juridica || "")] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: tr.caenCode, bold: true, font: FONT, size: 22 })] })],
              shading: { fill: "f0fdf4", type: ShadingType.CLEAR },
            }),
            new TableCell({ children: [bodyText(dg.cod_caen || "")] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: tr.contactInfo, bold: true, font: FONT, size: 22 })] })],
              shading: { fill: "f0fdf4", type: ShadingType.CLEAR },
            }),
            new TableCell({ children: [bodyText(dg.date_contact || "")] }),
          ],
        }),
      ],
    })
  );

  children.push(spacer());
  children.push(subHeading(tr.viziuneStrategie));

  const viz = result.viziune_strategie || {};
  if (viz.obiective_scurt) children.push(labelValue(tr.shortTermObj, viz.obiective_scurt));
  if (viz.obiective_mediu) children.push(labelValue(tr.mediumTermObj, viz.obiective_mediu));
  if (viz.misiune_valori) children.push(labelValue(tr.missionValues, viz.misiune_valori));

  // ── III. Analiza Pieței ──
  children.push(sectionHeading(tr.marketAnalysis));
  const piata = result.analiza_pietei || {};
  if (piata.clienti_tinta) children.push(labelValue(tr.targetCustomers, piata.clienti_tinta));
  if (piata.concurenta) children.push(labelValue(tr.competition, piata.concurenta));
  if (piata.strategie_marketing) children.push(labelValue(tr.marketingStrategy, piata.strategie_marketing));
  if (piata.tendinte_piata) children.push(labelValue(tr.tendintePiata, piata.tendinte_piata));

  // ── IV. SWOT ──
  children.push(sectionHeading(tr.swotAnalysis));
  const swot = result.analiza_swot || {};

  children.push(...swotItemParagraphs(swot.puncte_tari, tr.strengths, COLOR_EMERALD));
  children.push(...swotItemParagraphs(swot.puncte_slabe, tr.weaknesses, COLOR_ORANGE));
  children.push(...swotItemParagraphs(swot.oportunitati, tr.opportunities, COLOR_BLUE));
  children.push(...swotItemParagraphs(swot.amenintari, tr.threats, COLOR_RED));

  children.push(spacer());

  // ── V. Plan Operational ──
  children.push(sectionHeading(tr.operationalPlan));
  const op = result.plan_operational || {};
  if (op.descriere_flux) children.push(...numberedItem(1, tr.workflowDesc, op.descriere_flux));
  if (op.resurse_umane) children.push(...numberedItem(2, tr.humanResources, op.resurse_umane));
  if (op.locatie_dotari) children.push(...numberedItem(3, tr.facilities, op.locatie_dotari));

  // ── Custom sections ──
  if (result.sectiuni_aditionale && result.sectiuni_aditionale.length > 0) {
    result.sectiuni_aditionale.forEach((sec: any) => {
      if (!sec || !sec.continut) return;
      children.push(sectionHeading(sec.titlu || tr.customSectionDefault));
      const paragraphs = String(sec.continut)
        .split(/\\n|\n/)
        .filter((p: string) => p.trim());
      paragraphs.forEach((p: string) => children.push(bodyText(p)));
    });
  }

  // ── VI. Plan Financiar ──
  children.push(sectionHeading(tr.financialPlan));
  const fin = result.plan_financiar || {};
  if (fin.strategie_financiara) children.push(bodyText(fin.strategie_financiara));

  children.push(spacer());

  // Chart image
  if (finalChartDataUrl) {
    try {
      const response = await fetch(finalChartDataUrl);
      const arrayBuffer = await response.arrayBuffer();
      children.push(
        new Paragraph({
          keepNext: true,
          children: [
            new TextRun({
              text: tr.costDistribution,
              bold: true,
              size: 26,
              color: COLOR_EMERALD,
              font: FONT,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 160 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: arrayBuffer,
              transformation: { width: 550, height: 275 },
              type: "png",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
        })
      );
    } catch (err) {
      console.error("Chart embed failed:", err);
    }
  }

  // Budget list
  if (fin.buget_investitii && fin.buget_investitii.length > 0) {
    children.push(subHeading(tr.investmentBudget));

    const sorted = [...fin.buget_investitii].sort(
      (a: any, b: any) =>
        parseInt(b.cost?.toString().replace(/[^0-9]/g, "") || "0") -
        parseInt(a.cost?.toString().replace(/[^0-9]/g, "") || "0")
    );

    sorted.forEach((b: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${b.item}: `, bold: true, font: FONT, size: 24 }),
            new TextRun({ text: formatPrice(b.cost, locale), color: COLOR_EMERALD, font: FONT, size: 24, bold: true }),
          ],
          spacing: { after: 40 },
          bullet: { level: 0 },
        })
      );
      if (b.explicatie) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: b.explicatie, italics: true, color: COLOR_GRAY, font: FONT, size: 20 })],
            indent: { left: 400 },
            spacing: { after: 80 },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    });

    const total = fin.buget_investitii.reduce(
      (sum: number, b: any) => sum + parseInt(b.cost?.toString().replace(/[^0-9]/g, "") || "0"),
      0
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${tr.totalEstimat}: ${formatPrice(total.toString(), locale)}`,
            bold: true,
            size: 28,
            color: COLOR_EMERALD,
            font: FONT,
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 240 },
        border: { top: { color: "10b981", style: BorderStyle.SINGLE, size: 8, space: 4 } },
      })
    );
  }

  // ── Build document ──
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 24, color: COLOR_TEXT },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
