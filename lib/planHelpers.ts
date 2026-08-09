/**
 * planHelpers.ts
 * Funcții helper pure, fără dependențe UI, comune pentru StudioDesktop și DemoDesktop.
 * Sesiunea 1 din planul de refactorizare arhitecturală (30 Iulie 2026).
 */

/**
 * Trunchiează un text la o lungime specificată și adaugă "...".
 */
export const truncateText = (text: any, length: number): string => {
  if (text === null || text === undefined) return "";
  const str = typeof text === "string" ? text : String(text);
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

/**
 * Împarte un text lung în slide-uri bazate pe numărul maxim de caractere,
 * evitând tăierea în mijlocul paragrafelor sau al titlurilor scurte.
 */
export const splitTextIntoSlides = (text: any, maxChars: number = 1500): string[] => {
  if (!text || typeof text !== 'string') return [];
  const paragraphs = text.split('\n');

  const totalLength = text.length;
  const numSlides = Math.ceil(totalLength / maxChars);
  const idealCharsPerSlide = Math.ceil(totalLength / numSlides);
  const targetChars = Math.min(maxChars, idealCharsPerSlide + 150);

  const slides: string[] = [];
  let currentParas: string[] = [];
  let currentLen = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const paraLen = para.length + (currentParas.length > 0 ? 1 : 0);

    if (currentLen + paraLen > targetChars && currentParas.length > 0 && !(currentParas.length === 1 && currentLen < 200)) {
      let lastPara = currentParas[currentParas.length - 1].trim();
      // Avoid orphaned headings or short intro lines at the bottom of a slide
      if (lastPara.length > 0 && lastPara.length < 150 && currentParas.length > 1) {
        const headingPara = currentParas.pop();
        slides.push(currentParas.join('\n').trim());
        currentParas = [headingPara!];
        currentLen = headingPara!.length;
      } else {
        slides.push(currentParas.join('\n').trim());
        currentParas = [];
        currentLen = 0;
      }
    }

    currentParas.push(para);
    currentLen += paraLen;
  }

  if (currentParas.length > 0) {
    slides.push(currentParas.join('\n').trim());
  }
  return slides;
};

/**
 * Returnează clasa CSS de dimensiune a textului în funcție de lungimea conținutului,
 * pentru a asigura că textele lungi nu depășesc limitele containerului.
 */
export const getDynamicTextSize = (
  text: any,
  limits = { large: 400, medium: 800, extra: 1200 },
  classes = { default: 'text-2xl', medium: 'text-xl', small: 'text-lg', xsmall: 'text-base' }
): string => {
  const len = typeof text === 'string' ? text.length : 0;
  if (len > limits.extra) return classes.xsmall;
  if (len > limits.medium) return classes.small;
  if (len > limits.large) return classes.medium;
  return classes.default;
};
