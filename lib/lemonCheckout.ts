/**
 * Lemon Squeezy checkout URLs by locale market.
 * RO → store IdeeTa.ai (RON); EN/ES → store IdeeTa International (EUR).
 *
 * NOTE: UUIDs below are from Test mode. Replace with Live UUIDs when going live.
 */

export type CheckoutLocale = "ro" | "en" | "es";
export type CheckoutTier = "standard" | "eu-funds" | "pro";

const RON_STORE = "https://ideeta.lemonsqueezy.com/checkout/buy";
const EUR_STORE = "https://ideeta-international.lemonsqueezy.com/checkout/buy";

/** Test-mode variant IDs (IdeeTa.ai RON store) */
const RON_VARIANTS: Record<CheckoutTier, string> = {
  standard: "dbd62a14-ca39-47ea-8d4f-cd1ef1f3270e",
  "eu-funds": "561d5420-b48c-446e-830e-c5a25ed30b13",
  pro: "a3059ce5-f0e8-45d2-8dc2-ce9f9ff02100",
};

/** Test-mode variant IDs (IdeeTa International EUR store) */
const EUR_VARIANTS: Partial<Record<CheckoutTier, string>> = {
  standard: "fbf29edf-e265-4284-9dfa-62a074ffbdec",
  "eu-funds": "bd8eba73-adf3-4e21-aa4a-0e3565d0a3ca",
};

export function isEurLocale(locale: CheckoutLocale | string | undefined): boolean {
  return locale === "en" || locale === "es";
}

export function getLemonCheckoutUrl(
  tier: string,
  locale: CheckoutLocale | string = "ro"
): string | null {
  const useEur = isEurLocale(locale);

  if (useEur) {
    const id = EUR_VARIANTS[tier as CheckoutTier];
    if (!id) return null;
    return `${EUR_STORE}/${id}`;
  }

  const id = RON_VARIANTS[tier as CheckoutTier];
  if (!id) return null;
  return `${RON_STORE}/${id}`;
}

/** Append userId, tier, email, planName for webhook / prefill */
export function withCheckoutParams(
  baseUrl: string,
  opts: {
    userId: string;
    tier: string;
    email?: string | null;
    planName?: string;
  }
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("checkout[custom][userId]", opts.userId);
  url.searchParams.set("checkout[custom][tier]", opts.tier);
  if (opts.email) {
    url.searchParams.set("checkout[email]", opts.email);
  }
  if (opts.tier === "standard" && opts.planName) {
    url.searchParams.set("checkout[custom][planName]", opts.planName);
  }
  return url.toString();
}
