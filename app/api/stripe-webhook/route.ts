import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import {
  applyOrderGrantToUser,
  claimLemonOrderOrSkip,
  deleteLemonOrderClaim,
  refundLemonOrder,
} from "@/lib/lemonOrderLedger";
import { getStripe, stripePriceTierMap, type StripeTier } from "@/lib/stripeCheckout";

/**
 * Stripe Managed Payments webhook.
 * Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 * charge.refunded.
 */

function ledgerIdForPaymentIntent(paymentIntentId: string): string {
  return `stripe_${paymentIntentId}`;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Tier from the paid price id only — metadata is never trusted for unlock. */
async function resolveTierFromSession(sessionId: string): Promise<StripeTier | null> {
  const map = stripePriceTierMap();
  if (map.size === 0) {
    console.error("[Stripe] No STRIPE_PRICE_* configured — refusing unlock (fail-closed)");
    return null;
  }
  const items = await getStripe().checkout.sessions.listLineItems(sessionId, { limit: 5 });
  for (const item of items.data) {
    const priceId = item.price?.id;
    const tier = priceId ? map.get(priceId) : undefined;
    if (tier) return tier;
  }
  console.warn(
    `[Stripe] Unmapped price ids on session ${sessionId}: ${items.data
      .map((i) => i.price?.id)
      .join(",")}`
  );
  return null;
}

async function fulfillSession(session: Stripe.Checkout.Session): Promise<NextResponse> {
  if (session.payment_status !== "paid") {
    // Async methods: wait for checkout.session.async_payment_succeeded
    return NextResponse.json({ received: true, pending: true });
  }

  const userId = String(session.client_reference_id || "").trim();
  if (!userId) {
    console.error(`[Stripe] Session ${session.id} has no client_reference_id`);
    return NextResponse.json(
      { error: "Missing userId", code: "MISSING_USER_ID" },
      { status: 400 }
    );
  }

  const paymentIntentId = idOf(session.payment_intent);
  if (!paymentIntentId) {
    console.error(`[Stripe] Session ${session.id} has no payment_intent`);
    return NextResponse.json(
      { error: "Missing payment intent", code: "MISSING_ORDER_ID" },
      { status: 400 }
    );
  }

  const tier = await resolveTierFromSession(session.id);
  if (!tier) {
    // 500 → Stripe retries once STRIPE_PRICE_* is fixed
    return NextResponse.json(
      { error: "Unmapped price", code: "PRICE_UNMAPPED" },
      { status: 500 }
    );
  }

  const userRef = adminDb.collection("users").doc(userId);
  const userSnap = await userRef.get();
  const userData = userSnap.exists ? userSnap.data() || {} : {};

  if (tier === "pro-topup" && !userData.euFundsUnlocked) {
    console.error(`[Stripe] pro-topup without Pro Tools pack — refused. userId=${userId}`);
    return NextResponse.json(
      { error: "Pro Tools pack required", code: "TOPUP_REQUIRES_PACK" },
      { status: 400 }
    );
  }

  const meta = session.metadata || {};
  const planName = tier === "standard" ? meta.planName || null : null;
  const planId = tier === "standard" && meta.planId ? String(meta.planId) : null;
  const customerId = idOf(session.customer);
  const ledgerId = ledgerIdForPaymentIntent(paymentIntentId);

  const claim = await claimLemonOrderOrSkip({
    orderId: ledgerId,
    userId,
    tier,
    eventName: "stripe.checkout.session.completed",
    customerId,
    planName,
    planId,
  });
  if (claim === "skip") {
    console.log(`[Stripe] Duplicate fulfillment skipped id=${ledgerId}`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await applyOrderGrantToUser({
      userId,
      tier,
      customerId,
      planName,
      planId,
      existingUnlockedPlans: userData.unlockedPlans || [],
      existingUnlockedPlanIds: userData.unlockedPlanIds || [],
      customerField: "stripeCustomerId",
    });
  } catch (grantErr) {
    await deleteLemonOrderClaim(ledgerId);
    throw grantErr;
  }

  console.log(`[Stripe] Granted tier=${tier} id=${ledgerId} userId=${userId}`);
  return NextResponse.json({ received: true });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Missing secret" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Invalid Stripe webhook signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        return await fulfillSession(event.data.object as Stripe.Checkout.Session);

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = idOf(charge.payment_intent);
        if (!paymentIntentId) {
          return NextResponse.json({ received: true, ignored: "NO_PAYMENT_INTENT" });
        }
        if (!charge.refunded) {
          // Partial refund: keep the grant, log for manual review
          console.warn(
            `[Stripe] Partial refund on ${paymentIntentId} (${charge.amount_refunded}/${charge.amount}) — grant kept`
          );
          return NextResponse.json({ received: true, partial: true });
        }
        const result = await refundLemonOrder(ledgerIdForPaymentIntent(paymentIntentId));
        console.log(
          `[Stripe] charge.refunded pi=${paymentIntentId} result=${result.reason || "ok"}`
        );
        return NextResponse.json({ received: true });
      }

      default:
        console.log(`Stripe webhook neprocesat de tip: ${event.type}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json({ error: "Eroare la procesarea webhook-ului" }, { status: 500 });
  }
}
