/**
 * Lemon Squeezy checkout URLs by locale market.
 * RO → store IdeeTa.ai (RON); EN/ES → store IdeeTa International (EUR).
 *
 * Prefer Live IDs via env. Test IDs are fallback only outside production.
 */

export type CheckoutLocale = "ro" | "en" | "es";
export type CheckoutTier = "standard" | "eu-funds" | "pro";

const RON_STORE = "https://ideeta.lemonsqueezy.com/checkout/buy";
const EUR_STORE = "https://ideeta-international.lemonsqueezy.com/checkout/buy";

/** Test-mode fallbacks (dev only) */
const RON_TEST: Record<CheckoutTier, string> = {
  standard: "dbd62a14-ca39-47ea-8d4f-cd1ef1f3270e",
  "eu-funds": "561d5420-b48c-446e-830e-c5a25ed30b13",
  pro: "a3059ce5-f0e8-45d2-8dc2-ce9f9ff02100",
};

const EUR_TEST: Partial<Record<CheckoutTier, string>> = {
  standard: "fbf29edf-e265-4284-9dfa-62a074ffbdec",
  "eu-funds": "bd8eba73-adf3-4e21-aa4a-0e3565d0a3ca",
};

function variantId(tier: CheckoutTier, useEur: boolean): string | null {
  if (useEur) {
    const fromEnv =
      tier === "standard"
        ? process.env.LEMON_EUR_STANDARD
        : tier === "eu-funds"
        ? process.env.LEMON_EUR_EU_FUNDS
        : process.env.LEMON_EUR_PRO;
    if (fromEnv) return fromEnv;
    if (process.env.NODE_ENV === "production" && process.env.LEMON_REQUIRE_LIVE === "1") {
      return null;
    }
    return EUR_TEST[tier] || null;
  }

  const fromEnv =
    tier === "standard"
      ? process.env.LEMON_RON_STANDARD
      : tier === "eu-funds"
      ? process.env.LEMON_RON_EU_FUNDS
      : process.env.LEMON_RON_PRO;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production" && process.env.LEMON_REQUIRE_LIVE === "1") {
    return null;
  }
  return RON_TEST[tier] || null;
}

export function isEurLocale(locale: CheckoutLocale | string | undefined): boolean {
  return locale === "en" || locale === "es";
}

export function getLemonCheckoutUrl(
  tier: string,
  locale: CheckoutLocale | string = "ro"
): string | null {
  const useEur = isEurLocale(locale);
  const id = variantId(tier as CheckoutTier, useEur);
  if (!id) return null;
  return `${useEur ? EUR_STORE : RON_STORE}/${id}`;
}

/** Append userId, tier, email, planName/planId for webhook / prefill */
export function withCheckoutParams(
  baseUrl: string,
  opts: {
    userId: string;
    tier: string;
    email?: string | null;
    planName?: string;
    planId?: string;
  }
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("checkout[custom][userId]", opts.userId);
  url.searchParams.set("checkout[custom][tier]", opts.tier);
  if (opts.email) {
    url.searchParams.set("checkout[email]", opts.email);
  }
  if (opts.tier === "standard") {
    if (opts.planId) {
      url.searchParams.set("checkout[custom][planId]", opts.planId);
    }
    if (opts.planName) {
      url.searchParams.set("checkout[custom][planName]", opts.planName);
    }
  }
  return url.toString();
}
