import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      if (!signature) {
        throw new Error("Lipseste stripe-signature header");
      }
      if (!webhookSecret) {
        throw new Error("Lipseste STRIPE_WEBHOOK_SECRET");
      }
    }
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (!userId) {
          console.error("Nu exista userId in metadata sesiunii Stripe");
          break;
        }

        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.exists ? userDoc.data() : {};

        if (tier === "standard") {
          const currentCredits = userData?.credits || 0;
          await userRef.set({
            credits: currentCredits + 3,
            stripeCustomerId: session.customer,
          }, { merge: true });
          console.log(`Adaugat 3 credite pentru user: ${userId}`);
        } else if (tier === "eu-funds") {
          await userRef.set({
            euFundsUnlocked: true,
            stripeCustomerId: session.customer,
          }, { merge: true });
          console.log(`Deblocat modul Fonduri Europene pentru user: ${userId}`);
        } else if (tier === "pro") {
          await userRef.set({
            subscriptionActive: true,
            subscriptionId: session.subscription as string,
            stripeCustomerId: session.customer,
          }, { merge: true });
          console.log(`Activat abonament PRO pentru user: ${userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const snapshot = await adminDb
          .collection("users")
          .where("subscriptionId", "==", subscription.id)
          .get();

        if (!snapshot.empty) {
          const userRef = snapshot.docs[0].ref;
          await userRef.set({
            subscriptionActive: false,
            subscriptionId: null,
          }, { merge: true });
          console.log(`Dezactivat abonament pentru user: ${userRef.id}`);
        }
        break;
      }
      
      default:
        console.log(`Webhook neprocesat de tip: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Eroare la procesarea webhook-ului" }, { status: 500 });
  }
}
