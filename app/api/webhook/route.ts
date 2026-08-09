import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";
import { resolveTierFromLemonOrder } from "@/lib/lemonCheckout";
import { proPackGrantFields } from "@/lib/proPackQuota";
import {
  applyOrderGrantToUser,
  claimLemonOrderOrSkip,
  deleteLemonOrderClaim,
  lemonOrderIdFromPayload,
  refundLemonOrder,
} from "@/lib/lemonOrderLedger";

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

async function deactivateSubscription(opts: {
  subscriptionId: string;
  customerId?: string | number | null;
}) {
  const snapshot = await adminDb
    .collection("users")
    .where("subscriptionId", "==", opts.subscriptionId)
    .get();

  const clearFields = {
    subscriptionActive: false,
    isPaid: false,
    subscriptionId: null,
  };

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.set(clearFields, { merge: true });
    console.log(`Dezactivat abonament pentru user: ${snapshot.docs[0].id}`);
    return;
  }

  if (opts.customerId) {
    const byCustomer = await adminDb
      .collection("users")
      .where("lemonSqueezyCustomerId", "==", opts.customerId)
      .limit(1)
      .get();
    if (!byCustomer.empty) {
      await byCustomer.docs[0].ref.set(clearFields, { merge: true });
      console.log(
        `Dezactivat abonament (customer fallback) pentru user: ${byCustomer.docs[0].id}`
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("X-Signature") || "";

    if (!webhookSecret) {
      console.error("Missing LEMON_SQUEEZY_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Missing secret" }, { status: 500 });
    }

    const hmac = crypto.createHmac("sha256", webhookSecret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(signatureHeader, "utf8");

    if (digest.length !== signature.length || !crypto.timingSafeEqual(digest, signature)) {
      console.error("Invalid Lemon Squeezy webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data || {};

    const userId = String(
      customData.userId || customData.user_id || ""
    ).trim();
    const tierFromVariant = resolveTierFromLemonOrder(payload);
    const tier = tierFromVariant;

    if (
      (eventName === "order_created" || eventName === "subscription_created") &&
      !userId
    ) {
      console.error("Webhook primit dar fara userId in custom_data", {
        keys: Object.keys(customData),
        eventName,
      });
      return NextResponse.json(
        { error: "Missing userId", code: "MISSING_USER_ID" },
        { status: 400 }
      );
    }

    if (
      (eventName === "order_created" || eventName === "subscription_created") &&
      !tier
    ) {
      console.error(
        `[Webhook] Unmapped variant — unlock refused. userId=${userId} custom_tier=${String(
          customData.tier
        )} variant=${payload?.data?.attributes?.first_order_item?.variant_id}. Set LEMON_*_VARIANT_ID.`
      );
      return NextResponse.json(
        { error: "Unmapped variant", code: "VARIANT_UNMAPPED" },
        { status: 500 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = userId ? await userRef.get() : null;
    const userData = userDoc?.exists ? userDoc.data() : {};
    const customerId = payload.data?.attributes?.customer_id ?? null;

    if (eventName === "order_created") {
      const orderId = lemonOrderIdFromPayload(payload);
      if (!orderId) {
        return NextResponse.json(
          { error: "Missing order id", code: "MISSING_ORDER_ID" },
          { status: 400 }
        );
      }

      if (tier === "pro-topup" && !userData?.euFundsUnlocked) {
        console.error(
          `[Webhook] pro-topup without Pro Tools pack — refused. userId=${userId}`
        );
        return NextResponse.json(
          { error: "Pro Tools pack required", code: "TOPUP_REQUIRES_PACK" },
          { status: 400 }
        );
      }

      const claim = await claimLemonOrderOrSkip({
        orderId,
        userId,
        tier: tier!,
        eventName,
        customerId,
        planName: customData.planName || null,
        planId: customData.planId ? String(customData.planId) : null,
      });

      if (claim === "skip") {
        console.log(`[Webhook] Duplicate order_created skipped orderId=${orderId}`);
        return NextResponse.json({ received: true, duplicate: true });
      }

      try {
        await applyOrderGrantToUser({
          userId,
          tier: tier!,
          customerId,
          planName: customData.planName || null,
          planId: customData.planId ? String(customData.planId) : null,
          existingUnlockedPlans: userData?.unlockedPlans || [],
          existingUnlockedPlanIds: userData?.unlockedPlanIds || [],
        });

        if (tier === "pro") {
          await userRef.set(
            { subscriptionId: payload.data.id || null },
            { merge: true }
          );
        }
      } catch (grantErr) {
        await deleteLemonOrderClaim(orderId);
        throw grantErr;
      }

      console.log(
        `[Webhook] Granted tier=${tier} orderId=${orderId} userId=${userId}`
      );
    } else if (eventName === "subscription_created") {
      const subId = lemonOrderIdFromPayload(payload);
      if (!subId) {
        return NextResponse.json(
          { error: "Missing subscription id", code: "MISSING_SUB_ID" },
          { status: 400 }
        );
      }
      // Separate ledger key so order_created + subscription_created for same product don't clash
      const ledgerId = `sub_${subId}`;
      const claim = await claimLemonOrderOrSkip({
        orderId: ledgerId,
        userId,
        tier: tier!,
        eventName,
        customerId,
      });
      if (claim === "skip") {
        console.log(`[Webhook] Duplicate subscription_created skipped id=${ledgerId}`);
        return NextResponse.json({ received: true, duplicate: true });
      }

      try {
        if (tier === "pro") {
          await userRef.set(
            {
              subscriptionActive: true,
              isPaid: true,
              subscriptionId: subId,
              lemonSqueezyCustomerId: customerId,
            },
            { merge: true }
          );
          console.log(`Activat abonament PRO pentru user: ${userId}`);
        } else if (tier === "eu-funds") {
          await userRef.set(
            {
              ...proPackGrantFields((n) => FieldValue.increment(n)),
              subscriptionId: subId,
              lemonSqueezyCustomerId: customerId,
            },
            { merge: true }
          );
          console.log(
            `Deblocat pachet Pro Tools (subscription_created) pentru user: ${userId}`
          );
        }
      } catch (grantErr) {
        await deleteLemonOrderClaim(ledgerId);
        throw grantErr;
      }
    } else if (eventName === "order_refunded") {
      const orderId = lemonOrderIdFromPayload(payload);
      if (!orderId) {
        return NextResponse.json(
          { error: "Missing order id", code: "MISSING_ORDER_ID" },
          { status: 400 }
        );
      }
      const result = await refundLemonOrder(orderId);
      console.log(
        `[Webhook] order_refunded orderId=${orderId} result=${result.reason || "ok"}`
      );
    } else if (
      eventName === "subscription_cancelled" ||
      eventName === "subscription_expired"
    ) {
      const subscriptionId = String(payload.data.id);
      await deactivateSubscription({
        subscriptionId,
        customerId: payload.data.attributes?.customer_id,
      });
    } else {
      console.log(`Webhook neprocesat de tip: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing Lemon Squeezy webhook:", error);
    return NextResponse.json({ error: "Eroare la procesarea webhook-ului" }, { status: 500 });
  }
}
