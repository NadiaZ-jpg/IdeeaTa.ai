let cachedRate: number | null = null;
let lastFetched: number = 0;
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 ore

export async function getExchangeRateRonToEur(): Promise<number> {
  const now = Date.now();
  if (cachedRate && (now - lastFetched < CACHE_DURATION_MS)) {
    return cachedRate;
  }

  try {
    // API gratuit pentru rate valutare
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
      next: { revalidate: 43200 } // Caching la nivel de Next.js (12 ore)
    } as any);

    if (!res.ok) throw new Error("Failed to fetch exchange rate");
    const data = await res.json();
    const eurToRon = data.rates?.RON;

    if (eurToRon && typeof eurToRon === "number") {
      const ronToEur = 1 / eurToRon;
      cachedRate = ronToEur;
      lastFetched = now;
      console.log(`[ExchangeRate] Update rate: 1 RON = ${ronToEur} EUR`);
      return ronToEur;
    }
  } catch (err) {
    console.error("[ExchangeRate] API error, using fallback rate 0.201:", err);
  }

  return 0.201;
}
