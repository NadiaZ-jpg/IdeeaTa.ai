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
  
  const numericValue = parseInt(rawText.toString().replace(/[^0-9]/g, ""));
  if (isNaN(numericValue)) return rawText;

  if (locale === "en" || locale === "es") {
    return `${numericValue.toLocaleString(locale === 'en' ? 'en-US' : 'es-ES')} EUR`;
  }

  const isRawEur = rawText.toString().toUpperCase().includes("EUR") || rawText.toString().includes("€");

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
