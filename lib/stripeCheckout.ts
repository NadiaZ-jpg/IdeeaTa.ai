/**
 * Stripe Managed Payments (merchant of record) checkout.
 *
 * Replaces Lemon Squeezy, which stops processing on 2027-03-31.
 * Active only when PAYMENT_PROVIDER=stripe; Lemon stays the default until then.
 *
 * One Stripe product per tier, each with a single one-off price in RON
 * (default) and an EUR currency option. RO → RON, EN/ES → EUR, same as the
 * two Lemon stores today.
 *
 * Webhook unlock resolves the tier from the paid price id only — never from
 * session metadata (same fail-closed rule as Lemon variant ids).
 */

import Stripe from "stripe";
import { isCheckoutTier, isEurLocale, type CheckoutTier } from "@/lib/lemonCheckout";

export type PaymentProvider = "lemon" | "stripe";

export function paymentProvider(): PaymentProvider {
  return (process.env.PAYMENT_PROVIDER || "").trim().toLowerCase() === "stripe"
    ? "stripe"
    : "lemon";
}

/** Tiers sold through Stripe (one-off only; the legacy `pro` subscription is not migrated). */
export type StripeTier = Exclude<CheckoutTier, "pro">;

function priceIdEnv(tier: StripeTier): string | undefined {
  if (tier === "standard") return process.env.STRIPE_PRICE_STANDARD;
  if (tier === "eu-funds") return process.env.STRIPE_PRICE_EU_FUNDS;
  return process.env.STRIPE_PRICE_PRO_TOPUP;
}

export function isStripeTier(tier: unknown): tier is StripeTier {
  return isCheckoutTier(tier) && tier !== "pro";
}

export function stripePriceId(tier: StripeTier): string | null {
  const id = priceIdEnv(tier)?.trim();
  return id ? id : null;
}

/** price id → tier, for the webhook. */
export function stripePriceTierMap(): Map<string, StripeTier> {
  const map = new Map<string, StripeTier>();
  for (const tier of ["standard", "eu-funds", "pro-topup"] as const) {
    const id = stripePriceId(tier);
    if (id) map.set(id, tier);
  }
  return map;
}

let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  if (!client) client = new Stripe(key);
  return client;
}

export function stripeCheckoutCurrency(locale: string | undefined): "ron" | "eur" {
  return isEurLocale(locale) ? "eur" : "ron";
}

export function stripeCheckoutLocale(locale: string | undefined): "ro" | "en" | "es" {
  return locale === "en" || locale === "es" ? locale : "ro";
}

/** Where Stripe sends the customer back if they close the payment page. */
export function buildPaymentCancelUrl(successUrl: string): string {
  const url = new URL(successUrl);
  url.searchParams.delete("payment_success");
  url.searchParams.delete("tier");
  return url.toString();
}

export async function createStripeCheckoutSession(opts: {
  tier: StripeTier;
  userId: string;
  email?: string | null;
  planName?: string;
  planId?: string;
  locale?: string;
  successUrl: string;
}): Promise<string | null> {
  const price = stripePriceId(opts.tier);
  if (!price) return null;

  const userId = String(opts.userId || "").trim();
  if (!userId) throw new Error("Checkout requires userId");

  // Informational only — the webhook never unlocks from metadata.
  const metadata: Record<string, string> = { userId, tier: opts.tier };
  if (opts.tier === "standard") {
    if (opts.planId) metadata.planId = String(opts.planId).slice(0, 500);
    if (opts.planName) metadata.planName = String(opts.planName).slice(0, 500);
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    managed_payments: { enabled: true },
    line_items: [{ price, quantity: 1 }],
    currency: stripeCheckoutCurrency(opts.locale),
    locale: stripeCheckoutLocale(opts.locale),
    client_reference_id: userId,
    customer_email: opts.email || undefined,
    metadata,
    payment_intent_data: { metadata },
    success_url: opts.successUrl,
    cancel_url: buildPaymentCancelUrl(opts.successUrl),
  });

  return session.url;
}
