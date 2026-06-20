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

function formatPrice(val: any): string {
  const num = parseInt((val || "0").toString().replace(/[^0-9]/g, ""));
  if (!num) return "0 RON";
  return num.toLocaleString("ro-RO") + " RON";
}

function swotCellParagraphs(items: any[], color: string): Paragraph[] {
  if (!items || items.length === 0) {
    return [new Paragraph({ children: [new TextRun({ text: "-", font: FONT, size: 20 })] })];
  }
  return items.map(
    (item: any) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `• ${item.titlu || String(item)}: `,
            bold: true,
            color,
            font: FONT,
            size: 20,
          }),
          new TextRun({
            text: item.explicatie_tehnica || "",
            font: FONT,
            size: 20,
            color: COLOR_TEXT,
          }),
        ],
        spacing: { after: 60 },
        alignment: AlignmentType.JUSTIFIED,
      })
  );
}

// ─── Main generator ─────────────────────────────────────────────────────────

export async function generateDocxBlob(
  result: any,
  chartDataUrl?: string | null
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
        ctx.fillRect(0, 0, 800, 400);

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

          // Draw legend
          const lx = 480;
          let ly = Math.max(40, 200 - (items.length * 15));
          items.forEach((item: any, i: number) => {
            if (values[i] === 0) return;
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(lx, ly - 12, 20, 20);
            
            ctx.fillStyle = '#333333';
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

  // ── I & II. Date Generale ──
  children.push(sectionHeading("I & II. Date Generale și Viziune"));

  const dg = result.date_generale || {};
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Forma Juridică:", bold: true, font: FONT, size: 22 })] })],
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: "f0fdf4", type: ShadingType.CLEAR },
            }),
            new TableCell({ children: [bodyText(dg.forma_juridica || "")] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Cod CAEN:", bold: true, font: FONT, size: 22 })] })],
              shading: { fill: "f0fdf4", type: ShadingType.CLEAR },
            }),
            new TableCell({ children: [bodyText(dg.cod_caen || "")] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Date Contact:", bold: true, font: FONT, size: 22 })] })],
              shading: { fill: "f0fdf4", type: ShadingType.CLEAR },
            }),
            new TableCell({ children: [bodyText(dg.date_contact || "")] }),
          ],
        }),
      ],
    })
  );

  children.push(spacer());
  children.push(subHeading("Viziune și Strategie"));

  const viz = result.viziune_strategie || {};
  if (viz.obiective_scurt) children.push(labelValue("Obiective pe Termen Scurt", viz.obiective_scurt));
  if (viz.obiective_mediu) children.push(labelValue("Obiective pe Termen Mediu", viz.obiective_mediu));
  if (viz.misiune_valori) children.push(labelValue("Misiune și Valori", viz.misiune_valori));

  // ── III. Analiza Pieței ──
  children.push(sectionHeading("III. Analiza Pieței și Promovarea"));
  const piata = result.analiza_pietei || {};
  if (piata.clienti_tinta) children.push(labelValue("Clienții Țintă", piata.clienti_tinta));
  if (piata.concurenta) children.push(labelValue("Concurența", piata.concurenta));
  if (piata.strategie_marketing) children.push(labelValue("Strategia de Marketing", piata.strategie_marketing));

  // ── IV. SWOT ──
  children.push(sectionHeading("IV. Analiza SWOT"));
  const swot = result.analiza_swot || {};

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: "Puncte Tari (S)", bold: true, color: COLOR_EMERALD, font: FONT, size: 22 })] }),
                ...swotCellParagraphs(swot.puncte_tari, COLOR_EMERALD),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: "f0fdf4", type: ShadingType.CLEAR },
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: "Slăbiciuni (W)", bold: true, color: COLOR_ORANGE, font: FONT, size: 22 })] }),
                ...swotCellParagraphs(swot.puncte_slabe, COLOR_ORANGE),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: "fff7ed", type: ShadingType.CLEAR },
            }),
          ],
        }),
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: "Oportunități (O)", bold: true, color: COLOR_BLUE, font: FONT, size: 22 })] }),
                ...swotCellParagraphs(swot.oportunitati, COLOR_BLUE),
              ],
              shading: { fill: "eff6ff", type: ShadingType.CLEAR },
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: "Amenințări (T)", bold: true, color: COLOR_RED, font: FONT, size: 22 })] }),
                ...swotCellParagraphs(swot.amenintari, COLOR_RED),
              ],
              shading: { fill: "fef2f2", type: ShadingType.CLEAR },
            }),
          ],
        }),
      ],
    })
  );

  children.push(spacer());

  // ── V. Plan Operational ──
  children.push(sectionHeading("V. Planul Operațional și de Management"));
  const op = result.plan_operational || {};
  if (op.descriere_flux) children.push(...numberedItem(1, "Descriere Flux Tehnologic:", op.descriere_flux));
  if (op.resurse_umane) children.push(...numberedItem(2, "Resurse Umane (Organigramă):", op.resurse_umane));
  if (op.locatie_dotari) children.push(...numberedItem(3, "Locație și Dotări Necesare:", op.locatie_dotari));

  // ── Custom sections ──
  if (result.sectiuni_aditionale && result.sectiuni_aditionale.length > 0) {
    result.sectiuni_aditionale.forEach((sec: any) => {
      if (!sec || !sec.continut) return;
      children.push(sectionHeading(sec.titlu || "Secțiune Adițională"));
      const paragraphs = String(sec.continut)
        .split(/\\n|\n/)
        .filter((p: string) => p.trim());
      paragraphs.forEach((p: string) => children.push(bodyText(p)));
    });
  }

  // ── VI. Plan Financiar ──
  children.push(sectionHeading("VI. Planul Financiar"));
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
          children: [
            new TextRun({
              text: "Distribuția Costurilor",
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
              transformation: { width: 550, height: 250 },
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
    children.push(subHeading("Detalii Buget Investiții"));

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
            new TextRun({ text: formatPrice(b.cost), color: COLOR_EMERALD, font: FONT, size: 24, bold: true }),
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
            text: `TOTAL ESTIMAT: ${formatPrice(total.toString())}`,
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
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1701 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
