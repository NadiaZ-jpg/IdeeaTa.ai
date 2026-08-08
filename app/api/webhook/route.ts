import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";
import { resolveTierFromLemonOrder } from "@/lib/lemonCheckout";

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

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

    // Lemon may echo custom keys as userId or user_id depending on checkout form
    const userId = String(
      customData.userId || customData.user_id || ""
    ).trim();
    // Tier from paid variant/product — never trust spoofable custom_data.tier alone
    const tierFromVariant = resolveTierFromLemonOrder(payload);
    const tier = tierFromVariant;

    if (!userId) {
      console.error("Webhook primit dar fara userId in custom_data", {
        keys: Object.keys(customData),
        eventName,
      });
      // 4xx → Lemon retries (200 would mark delivered and never unlock)
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
      // 500 → Lemon retries once VARIANT_IDs are configured
      return NextResponse.json(
        { error: "Unmapped variant", code: "VARIANT_UNMAPPED" },
        { status: 500 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};

    if (eventName === "order_created") {
      if (tier === "standard") {
        const planName = customData.planName || "Plan";
        const planId = customData.planId ? String(customData.planId) : null;
        const unlocked = userData?.unlockedPlans || [];
        const unlockedIds = userData?.unlockedPlanIds || [];
        const updatedPlans = !unlocked.includes(planName) ? [...unlocked, planName] : unlocked;
        const updatedIds =
          planId && !unlockedIds.includes(planId) ? [...unlockedIds, planId] : unlockedIds;
        // Per-plan unlock + package flag for tones/Combine — NOT account-wide isPaid
        await userRef.set(
          {
            standardPackageActive: true,
            unlockedPlans: updatedPlans,
            unlockedPlanIds: updatedIds,
            lemonSqueezyCustomerId: payload.data.attributes.customer_id,
          },
          { merge: true }
        );
        console.log(
          `Deblocat Standard (plan "${planName}" / id=${planId}, standardPackageActive) pentru user: ${userId}`
        );
      } else if (tier === "eu-funds") {
        await userRef.set(
          {
            euFundsUnlocked: true,
            isPaid: true,
            lemonSqueezyCustomerId: payload.data.attributes.customer_id,
          },
          { merge: true }
        );
        console.log(`Deblocat modul Fonduri Europene pentru user: ${userId}`);
      } else if (tier === "pro") {
        await userRef.set(
          {
            subscriptionActive: true,
            isPaid: true,
            subscriptionId: payload.data.id || null,
            lemonSqueezyCustomerId: payload.data.attributes.customer_id,
          },
          { merge: true }
        );
        console.log(`Activat abonament PRO pentru user: ${userId} via order_created`);
      }
    } else if (eventName === "subscription_created") {
      if (tier === "pro" || tier === "eu-funds") {
        await userRef.set(
          {
            subscriptionActive: tier === "pro" ? true : userData?.subscriptionActive || false,
            euFundsUnlocked: tier === "eu-funds" ? true : userData?.euFundsUnlocked || false,
            isPaid: true,
            subscriptionId: payload.data.id,
            lemonSqueezyCustomerId: payload.data.attributes.customer_id,
          },
          { merge: true }
        );
        console.log(
          `Activat ${tier} pentru user: ${userId} via subscription_created`
        );
      }
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
      const subscriptionId = payload.data.id;
      const snapshot = await adminDb
        .collection("users")
        .where("subscriptionId", "==", subscriptionId)
        .get();

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await docRef.set(
          {
            subscriptionActive: false,
            subscriptionId: null,
          },
          { merge: true }
        );
        console.log(`Dezactivat abonament pentru user: ${docRef.id}`);
      } else {
        // Fallback: cancel by customer id if subscriptionId was never stored
        const customerId = payload.data.attributes?.customer_id;
        if (customerId) {
          const byCustomer = await adminDb
            .collection("users")
            .where("lemonSqueezyCustomerId", "==", customerId)
            .limit(1)
            .get();
          if (!byCustomer.empty) {
            await byCustomer.docs[0].ref.set(
              { subscriptionActive: false, subscriptionId: null },
              { merge: true }
            );
            console.log(
              `Dezactivat abonament (customer fallback) pentru user: ${byCustomer.docs[0].id}`
            );
          }
        }
      }
    } else {
      console.log(`Webhook neprocesat de tip: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing Lemon Squeezy webhook:", error);
    return NextResponse.json({ error: "Eroare la procesarea webhook-ului" }, { status: 500 });
  }
}
