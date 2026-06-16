import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("X-Signature") || "";

    if (!webhookSecret) {
      console.error("Missing LEMON_SQUEEZY_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Missing secret" }, { status: 500 });
    }

    // Verificăm semnătura criptografică
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

    const userId = customData.userId;
    const tier = customData.tier;

    if (!userId) {
      console.error("Webhook primit dar fara userId in custom_data");
      return NextResponse.json({ received: true }); // Ignoram comenzile fara userId
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};

    if (eventName === "order_created") {
      if (tier === "standard") {
        const planName = customData.planName || "Plan de Afaceri";
        const unlocked = userData?.unlockedPlans || [];
        const updatedPlans = !unlocked.includes(planName) ? [...unlocked, planName] : unlocked;
        await userRef.set({
          unlockedPlans: updatedPlans,
          lemonSqueezyCustomerId: payload.data.attributes.customer_id,
        }, { merge: true });
        console.log(`Deblocat planul "${planName}" pentru user: ${userId}`);
      } else if (tier === "eu-funds") {
        await userRef.set({
          euFundsUnlocked: true,
          lemonSqueezyCustomerId: payload.data.attributes.customer_id,
        }, { merge: true });
        console.log(`Deblocat modul Fonduri Europene pentru user: ${userId}`);
      } else if (tier === "pro") {
        await userRef.set({
          subscriptionActive: true,
          lemonSqueezyCustomerId: payload.data.attributes.customer_id,
        }, { merge: true });
        console.log(`Activat abonament PRO pentru user: ${userId} via order_created`);
      }
    } else if (eventName === "subscription_created") {
      // In cazul abonamentelor PRO recurente, s-ar putea sa vina acest event in loc de order_created sau suplimentar
      if (tier === "pro") {
        await userRef.set({
          subscriptionActive: true,
          subscriptionId: payload.data.id,
          lemonSqueezyCustomerId: payload.data.attributes.customer_id,
        }, { merge: true });
        console.log(`Activat abonament PRO pentru user: ${userId} via subscription_created`);
      }
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
      const subscriptionId = payload.data.id;
      const snapshot = await adminDb
        .collection("users")
        .where("subscriptionId", "==", subscriptionId)
        .get();

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await docRef.set({
          subscriptionActive: false,
          subscriptionId: null,
        }, { merge: true });
        console.log(`Dezactivat abonament pentru user: ${docRef.id}`);
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
