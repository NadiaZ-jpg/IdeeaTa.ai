import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: NextRequest) {
  try {
    const { tier, currency, userId, email, planName } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Utilizator neautentificat" }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const selectedCurrency = currency === "EUR" ? "eur" : "ron";

    let lineItems: any[] = [];
    let mode: any = "payment";

    if (tier === "standard") {
      const amount = selectedCurrency === "eur" ? 800 : 3900; // 8 EUR or 39 RON
      lineItems = [{
        price_data: {
          currency: selectedCurrency,
          product_data: {
            name: "IdeeaTa.ai - Pachet Standard (Descărcare)",
            description: "Deblochează descărcarea planului de afaceri curent în toate formatele premium (PDF, PowerPoint, Word).",
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
      mode = "payment";
    } else if (tier === "eu-funds") {
      const amount = selectedCurrency === "eur" ? 2000 : 9900; // 20 EUR or 99 RON
      lineItems = [{
        price_data: {
          currency: selectedCurrency,
          product_data: {
            name: "IdeeaTa.ai - Pachet Studio + Fonduri",
            description: "Deblochează Studio de Editare în browser și modulul de optimizare pentru Fonduri Europene.",
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
      mode = "payment";
    } else if (tier === "pro") {
      const amount = selectedCurrency === "eur" ? 2000 : 9900; // 20 EUR or 99 RON per month
      lineItems = [{
        price_data: {
          currency: selectedCurrency,
          product_data: {
            name: "IdeeaTa.ai - Abonament Pro Nelimitat",
            description: "Generări, descărcări și optimizări nelimitate lunar.",
          },
          unit_amount: amount,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      }];
      mode = "subscription";
    } else {
      return NextResponse.json({ error: "Pachet invalid" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: mode,
      customer_email: email || undefined,
      metadata: {
        userId: userId,
        tier: tier,
        planName: planName || "",
      },
      success_url: `${appUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${appUrl}?payment_cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message || "Eroare la crearea sesiunii Stripe" }, { status: 500 });
  }
}
