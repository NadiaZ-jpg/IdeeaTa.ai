export const formatPriceLocalized = (
  priceText: any,
  locale: string,
  currencyToggle: string,
  fxRate: number = 0.201
) => {
  if (!priceText) return "";
  
  let rawText = priceText;
  if (typeof priceText === 'object') {
    rawText = Object.values(priceText)[0] || "";
  }

  const text = rawText.toString();
  const numericValue = parseInt(text.replace(/[^0-9]/g, ""));
  if (isNaN(numericValue)) return text;

  const upper = text.toUpperCase();
  const isRawEur = upper.includes("EUR") || text.includes("€");
  const isRawLei = upper.includes("LEI") || upper.includes("RON");

  // EN/ES: always show EUR. If the AI wrote LEI amounts, convert with fxRate.
  if (locale === "en" || locale === "es") {
    const eurValue =
      isRawLei && !isRawEur ? Math.round(numericValue * fxRate) : numericValue;
    return `${eurValue.toLocaleString(locale === "en" ? "en-US" : "es-ES")} EUR`;
  }

  if (currencyToggle === "EUR") {
    if (isRawEur) {
      return `${numericValue.toLocaleString('ro-RO')} EUR`;
    }
    const eurValue = Math.round(numericValue * fxRate);
    return `${eurValue.toLocaleString('ro-RO')} EUR`;
  }
  
  // currencyToggle is "LEI"
  if (isRawEur) {
    const leiValue = Math.round(numericValue / fxRate);
    return `${leiValue.toLocaleString('ro-RO')} LEI`;
  }
  
  return `${numericValue.toLocaleString('ro-RO')} LEI`;
};
