/**
 * Lemon Squeezy checkout URLs by locale market.
 * RO → store IdeeTa.ai (RON); EN/ES → store IdeeTa International (EUR).
 *
 * Prefer Live IDs via env. Test IDs are never used in production.
 */

export type CheckoutLocale = "ro" | "en" | "es";
export type CheckoutTier = "standard" | "eu-funds" | "pro";

const RON_STORE = "https://ideeta.lemonsqueezy.com/checkout/buy";
const EUR_STORE = "https://ideeta-international.lemonsqueezy.com/checkout/buy";

/** Test-mode fallbacks (dev / preview only — never in production) */
const RON_TEST: Record<CheckoutTier, string> = {
  standard: "dbd62a14-ca39-47ea-8d4f-cd1ef1f3270e",
  "eu-funds": "561d5420-b48c-446e-830e-c5a25ed30b13",
  pro: "a3059ce5-f0e8-45d2-8dc2-ce9f9ff02100",
};

const EUR_TEST: Partial<Record<CheckoutTier, string>> = {
  standard: "fbf29edf-e265-4284-9dfa-62a074ffbdec",
  "eu-funds": "bd8eba73-adf3-4e21-aa4a-0e3565d0a3ca",
};

function envIdsForTier(tier: CheckoutTier, useEur: boolean): string[] {
  if (useEur) {
    if (tier === "standard") {
      return [process.env.LEMON_EUR_STANDARD, process.env.LEMON_EUR_STANDARD_VARIANT_ID].filter(
        Boolean
      ) as string[];
    }
    if (tier === "eu-funds") {
      return [
        process.env.LEMON_EUR_EU_FUNDS,
        process.env.LEMON_EUR_EU_FUNDS_VARIANT_ID,
      ].filter(Boolean) as string[];
    }
    return [process.env.LEMON_EUR_PRO, process.env.LEMON_EUR_PRO_VARIANT_ID].filter(
      Boolean
    ) as string[];
  }
  if (tier === "standard") {
    return [process.env.LEMON_RON_STANDARD, process.env.LEMON_RON_STANDARD_VARIANT_ID].filter(
      Boolean
    ) as string[];
  }
  if (tier === "eu-funds") {
    return [
      process.env.LEMON_RON_EU_FUNDS,
      process.env.LEMON_RON_EU_FUNDS_VARIANT_ID,
    ].filter(Boolean) as string[];
  }
  return [process.env.LEMON_RON_PRO, process.env.LEMON_RON_PRO_VARIANT_ID].filter(
    Boolean
  ) as string[];
}

function allowTestCheckoutIds(): boolean {
  return process.env.NODE_ENV !== "production";
}

function variantId(tier: CheckoutTier, useEur: boolean): string | null {
  const fromEnv = envIdsForTier(tier, useEur);
  // Prefer checkout UUID (first env) for buy URLs
  if (fromEnv[0]) return fromEnv[0];
  if (!allowTestCheckoutIds()) return null;
  return (useEur ? EUR_TEST[tier] : RON_TEST[tier]) || null;
}

/** Build id → tier map from env (+ test ids outside production) for webhook verification. */
export function lemonVariantTierMap(): Map<string, CheckoutTier> {
  const map = new Map<string, CheckoutTier>();
  const tiers: CheckoutTier[] = ["standard", "eu-funds", "pro"];
  for (const tier of tiers) {
    for (const id of envIdsForTier(tier, false)) {
      map.set(String(id).trim().toLowerCase(), tier);
    }
    for (const id of envIdsForTier(tier, true)) {
      map.set(String(id).trim().toLowerCase(), tier);
    }
    if (allowTestCheckoutIds()) {
      if (RON_TEST[tier]) map.set(RON_TEST[tier].toLowerCase(), tier);
      if (EUR_TEST[tier]) map.set(EUR_TEST[tier]!.toLowerCase(), tier);
    }
  }
  return map;
}

/**
 * Resolve paid tier from Lemon order attributes (variant/product ids).
 * Prefer mapped variant/product IDs. Soft-fallback to custom_data.tier only when
 * numeric VARIANT_ID mappings are not configured (legacy UUID checkout env).
 */
export function resolveTierFromLemonOrder(payload: {
  data?: { attributes?: Record<string, any> };
  meta?: { custom_data?: Record<string, any> };
}): CheckoutTier | null {
  const attrs = payload?.data?.attributes || {};
  const item = attrs.first_order_item || {};
  const customData = payload?.meta?.custom_data || {};
  const candidates = [
    item.variant_id,
    item.product_id,
    attrs.variant_id,
    attrs.product_id,
    customData.variant_id,
  ]
    .filter((v) => v !== undefined && v !== null && String(v).length > 0)
    .map((v) => String(v).trim().toLowerCase());

  const map = lemonVariantTierMap();
  for (const id of candidates) {
    const tier = map.get(id);
    if (tier) return tier;
  }

  const claimed = String(customData.tier || "").trim();
  const claimedOk =
    claimed === "standard" || claimed === "eu-funds" || claimed === "pro"
      ? (claimed as CheckoutTier)
      : null;

  if (!claimedOk) return null;

  // Locked mode: numeric VARIANT_IDs configured + order has numeric ids → no soft fallback
  const hasNumericMappings = [...map.keys()].some((k) => /^\d+$/.test(k));
  const hasNumericCandidate = candidates.some((c) => /^\d+$/.test(c));
  if (hasNumericMappings && hasNumericCandidate) {
    console.warn(
      `[Lemon] Rejected unlock: variant ${candidates.join(",")} not in map (claimed=${claimedOk})`
    );
    return null;
  }

  console.warn(
    "[Lemon] Soft-fallback to custom_data.tier. Set LEMON_*_VARIANT_ID (numeric) to lock tiers."
  );
  return claimedOk;
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

/** Append userId, tier, email, planName/planId for webhook / prefill (server-only). */
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
