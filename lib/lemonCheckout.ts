/**
 * Lemon Squeezy checkout URLs by locale market.
 * RO → store IdeeTa.ai (RON); EN/ES → store IdeeTa International (EUR).
 *
 * Buy links use checkout UUIDs (LEMON_*_STANDARD etc.).
 * Webhook unlock uses numeric VARIANT_ID / PRODUCT_ID only — never custom_data.tier.
 */

export type CheckoutLocale = "ro" | "en" | "es";
export type CheckoutTier = "standard" | "eu-funds" | "pro" | "pro-topup";

export const CHECKOUT_TIERS: readonly CheckoutTier[] = [
  "standard",
  "eu-funds",
  "pro",
  "pro-topup",
] as const;

const RON_STORE = "https://ideeta.lemonsqueezy.com/checkout/buy";
const EUR_STORE = "https://ideeta-international.lemonsqueezy.com/checkout/buy";

/** Test-mode checkout UUIDs (dev only — never in production) */
const RON_TEST: Partial<Record<CheckoutTier, string>> = {
  standard: "dbd62a14-ca39-47ea-8d4f-cd1ef1f3270e",
  "eu-funds": "561d5420-b48c-446e-830e-c5a25ed30b13",
  pro: "a3059ce5-f0e8-45d2-8dc2-ce9f9ff02100",
};

const EUR_TEST: Partial<Record<CheckoutTier, string>> = {
  standard: "fbf29edf-e265-4284-9dfa-62a074ffbdec",
  "eu-funds": "bd8eba73-adf3-4e21-aa4a-0e3565d0a3ca",
};

function allowTestCheckoutIds(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Checkout shareable UUID for buy URLs (not used for webhook unlock). */
function checkoutLinkEnv(tier: CheckoutTier, useEur: boolean): string | undefined {
  if (useEur) {
    if (tier === "standard") return process.env.LEMON_EUR_STANDARD;
    if (tier === "eu-funds") return process.env.LEMON_EUR_EU_FUNDS;
    if (tier === "pro") return process.env.LEMON_EUR_PRO;
    if (tier === "pro-topup") return process.env.LEMON_EUR_PRO_TOPUP;
    return undefined;
  }
  if (tier === "standard") return process.env.LEMON_RON_STANDARD;
  if (tier === "eu-funds") return process.env.LEMON_RON_EU_FUNDS;
  if (tier === "pro") return process.env.LEMON_RON_PRO;
  if (tier === "pro-topup") return process.env.LEMON_RON_PRO_TOPUP;
  return undefined;
}

/** Numeric Lemon variant/product IDs trusted for webhook unlock. */
function webhookIdEnv(tier: CheckoutTier, useEur: boolean): string[] {
  if (useEur) {
    if (tier === "standard") {
      return [
        process.env.LEMON_EUR_STANDARD_VARIANT_ID,
        process.env.LEMON_EUR_STANDARD_PRODUCT_ID,
      ].filter(Boolean) as string[];
    }
    if (tier === "eu-funds") {
      return [
        process.env.LEMON_EUR_EU_FUNDS_VARIANT_ID,
        process.env.LEMON_EUR_EU_FUNDS_PRODUCT_ID,
      ].filter(Boolean) as string[];
    }
    if (tier === "pro") {
      return [
        process.env.LEMON_EUR_PRO_VARIANT_ID,
        process.env.LEMON_EUR_PRO_PRODUCT_ID,
      ].filter(Boolean) as string[];
    }
    if (tier === "pro-topup") {
      return [
        process.env.LEMON_EUR_PRO_TOPUP_VARIANT_ID,
        process.env.LEMON_EUR_PRO_TOPUP_PRODUCT_ID,
      ].filter(Boolean) as string[];
    }
    return [];
  }
  if (tier === "standard") {
    return [
      process.env.LEMON_RON_STANDARD_VARIANT_ID,
      process.env.LEMON_RON_STANDARD_PRODUCT_ID,
    ].filter(Boolean) as string[];
  }
  if (tier === "eu-funds") {
    return [
      process.env.LEMON_RON_EU_FUNDS_VARIANT_ID,
      process.env.LEMON_RON_EU_FUNDS_PRODUCT_ID,
    ].filter(Boolean) as string[];
  }
  if (tier === "pro") {
    return [
      process.env.LEMON_RON_PRO_VARIANT_ID,
      process.env.LEMON_RON_PRO_PRODUCT_ID,
    ].filter(Boolean) as string[];
  }
  if (tier === "pro-topup") {
    return [
      process.env.LEMON_RON_PRO_TOPUP_VARIANT_ID,
      process.env.LEMON_RON_PRO_TOPUP_PRODUCT_ID,
    ].filter(Boolean) as string[];
  }
  return [];
}

function checkoutLinkId(tier: CheckoutTier, useEur: boolean): string | null {
  const fromEnv = checkoutLinkEnv(tier, useEur);
  if (fromEnv) return fromEnv;
  if (!allowTestCheckoutIds()) return null;
  return (useEur ? EUR_TEST[tier] : RON_TEST[tier]) || null;
}

export function isCheckoutTier(tier: unknown): tier is CheckoutTier {
  return typeof tier === "string" && (CHECKOUT_TIERS as readonly string[]).includes(tier);
}

/** id → tier map for webhook (numeric VARIANT_ID / PRODUCT_ID only). */
export function lemonVariantTierMap(): Map<string, CheckoutTier> {
  const map = new Map<string, CheckoutTier>();
  for (const tier of CHECKOUT_TIERS) {
    for (const id of webhookIdEnv(tier, false)) {
      map.set(String(id).trim().toLowerCase(), tier);
    }
    for (const id of webhookIdEnv(tier, true)) {
      map.set(String(id).trim().toLowerCase(), tier);
    }
  }
  return map;
}

/**
 * Resolve paid tier from Lemon order variant/product ids only.
 * Never trusts meta.custom_data.tier (spoofable on shareable checkout URLs).
 */
export function resolveTierFromLemonOrder(payload: {
  data?: { attributes?: Record<string, any> };
  meta?: { custom_data?: Record<string, any> };
}): CheckoutTier | null {
  const attrs = payload?.data?.attributes || {};
  const item = attrs.first_order_item || {};
  // Only Lemon-owned fields — not custom_data.*
  const candidates = [item.variant_id, item.product_id, attrs.variant_id, attrs.product_id]
    .filter((v) => v !== undefined && v !== null && String(v).length > 0)
    .map((v) => String(v).trim().toLowerCase());

  if (candidates.length === 0) {
    console.warn("[Lemon] Order payload missing variant_id/product_id");
    return null;
  }

  const map = lemonVariantTierMap();
  if (map.size === 0) {
    console.error(
      "[Lemon] No LEMON_*_VARIANT_ID / PRODUCT_ID configured — refusing unlock (fail-closed)"
    );
    return null;
  }

  for (const id of candidates) {
    const tier = map.get(id);
    if (tier) return tier;
  }

  console.warn(
    `[Lemon] Unmapped variant/product ids: ${candidates.join(",")}. custom_tier ignored.`
  );
  return null;
}

export function isEurLocale(locale: CheckoutLocale | string | undefined): boolean {
  return locale === "en" || locale === "es";
}

export function getLemonCheckoutUrl(
  tier: string,
  locale: CheckoutLocale | string = "ro"
): string | null {
  if (!isCheckoutTier(tier)) return null;
  const useEur = isEurLocale(locale);
  const id = checkoutLinkId(tier, useEur);
  if (!id) return null;
  return `${useEur ? EUR_STORE : RON_STORE}/${id}`;
}

/** Append userId, email, planName/planId for webhook / prefill (server-only).
 *  custom tier is informational only — webhook unlock uses variant_id.
 *  redirectUrl: post-checkout return (Lemon product_options.redirect_url). */
export function withCheckoutParams(
  baseUrl: string,
  opts: {
    userId: string;
    tier: string;
    email?: string | null;
    planName?: string;
    planId?: string;
    redirectUrl?: string | null;
  }
): string {
  const userId = String(opts.userId || "").trim();
  if (!userId) {
    throw new Error("Checkout requires userId");
  }
  const url = new URL(baseUrl);
  url.searchParams.set("checkout[custom][userId]", userId);
  // Kept for logging / verify UX — unlock must NOT trust this field
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
  if (opts.redirectUrl) {
    // Supported on many Lemon checkout link builds; Confirmation URL in product is fallback
    url.searchParams.set(
      "checkout[product_options][redirect_url]",
      opts.redirectUrl
    );
  }
  return url.toString();
}

/** Locale-aware return URL after Lemon checkout. */
export function buildPaymentReturnUrl(opts: {
  locale?: string;
  tier: string;
  /** App path without locale prefix, e.g. /dashboard or /studio */
  returnPath?: string;
}): string {
  const origin = (process.env.APP_URL || "https://ideeata.ai").replace(/\/$/, "");
  const locale = opts.locale === "en" || opts.locale === "es" ? opts.locale : "ro";
  let path = opts.returnPath || "/dashboard";
  if (!path.startsWith("/")) path = `/${path}`;
  // Strip accidental locale prefix from returnPath
  path = path.replace(/^\/(en|es)(?=\/|$)/, "") || "/dashboard";
  const localized =
    locale === "en" ? `/en${path === "/" ? "" : path}` : locale === "es" ? `/es${path === "/" ? "" : path}` : path;
  const url = new URL(localized, origin);
  url.searchParams.set("payment_success", "true");
  url.searchParams.set("tier", opts.tier);
  return url.toString();
}
