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

  if (currencyToggle === "EUR") {
    const eurValue = Math.round(numericValue * fxRate);
    return `${eurValue.toLocaleString('ro-RO')} EUR`;
  }
  
  return `${numericValue.toLocaleString('ro-RO')} LEI`;
};
