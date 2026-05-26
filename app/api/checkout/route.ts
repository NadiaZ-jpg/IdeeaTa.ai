import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: NextRequest) {
  try {
    const { tier, currency, userId, email } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Utilizator neautentificat" }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const selectedCurrency = currency === "EUR" ? "eur" : "ron";

    let lineItems: any[] = [];
    let mode: any = "payment";

    if (tier === "standard") {
      const amount = selectedCurrency === "eur" ? 1000 : 4900; // 10 EUR or 49 RON
      lineItems = [{
        price_data: {
          currency: selectedCurrency,
          product_data: {
            name: "IdeeaTa.ai - Pachet Standard (3 Documente)",
            description: "Deblochează descărcarea a 3 planuri de afaceri în toate formatele premium.",
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
      mode = "payment";
    } else if (tier === "eu-funds") {
      const amount = selectedCurrency === "eur" ? 3000 : 14900; // 30 EUR or 149 RON
      lineItems = [{
        price_data: {
          currency: selectedCurrency,
          product_data: {
            name: "IdeeaTa.ai - Pachet Optimizat Fonduri Europene",
            description: "Deblochează instrumentul avansat de optimizare a planului pentru fonduri europene.",
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
