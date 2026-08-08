import { NextRequest, NextResponse } from "next/server";
import { getLemonCheckoutUrl, withCheckoutParams } from "@/lib/lemonCheckout";

export async function POST(req: NextRequest) {
  try {
    const { tier, userId, email, planName, locale = "ro" } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Utilizator neautentificat" }, { status: 401 });
    }

    const baseUrl = getLemonCheckoutUrl(tier, locale);
    if (!baseUrl) {
      return NextResponse.json({ error: "Pachet invalid" }, { status: 400 });
    }

    const checkoutUrl = withCheckoutParams(baseUrl, {
      userId,
      tier,
      email,
      planName,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Error creating Lemon Squeezy checkout link:", error);
    return NextResponse.json({ error: error.message || "Eroare la procesarea plății" }, { status: 500 });
  }
}
