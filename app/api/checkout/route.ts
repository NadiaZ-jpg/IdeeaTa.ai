import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { tier, userId, email, planName } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Utilizator neautentificat" }, { status: 401 });
    }

    const urls: Record<string, string> = {
      standard: "https://ideeta.lemonsqueezy.com/checkout/buy/dbd62a14-ca39-47ea-8d4f-cd1ef1f3270e",
      "eu-funds": "https://ideeta.lemonsqueezy.com/checkout/buy/561d5420-b48c-446e-830e-c5a25ed30b13",
      pro: "https://ideeta.lemonsqueezy.com/checkout/buy/a3059ce5-f0e8-45d2-8dc2-ce9f9ff02100"
    };

    const baseUrl = urls[tier];
    if (!baseUrl) {
      return NextResponse.json({ error: "Pachet invalid" }, { status: 400 });
    }

    // Adaugăm query parameters pentru a trimite custom data către Lemon Squeezy
    const checkoutUrl = new URL(baseUrl);
    checkoutUrl.searchParams.set("checkout[custom][userId]", userId);
    checkoutUrl.searchParams.set("checkout[custom][tier]", tier);
    if (planName) {
      checkoutUrl.searchParams.set("checkout[custom][planName]", planName);
    }
    if (email) {
      checkoutUrl.searchParams.set("checkout[email]", email);
    }

    return NextResponse.json({ url: checkoutUrl.toString() });
  } catch (error: any) {
    console.error("Error creating Lemon Squeezy checkout link:", error);
    return NextResponse.json({ error: error.message || "Eroare la procesarea plății" }, { status: 500 });
  }
}
