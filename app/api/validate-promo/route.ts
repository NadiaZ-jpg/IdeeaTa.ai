import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, error: "Codul lipsește" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Citire securizată (server-side)
    const promoStandard = (process.env.PROMO_STANDARD || process.env.NEXT_PUBLIC_PROMO_STANDARD || "").trim().toUpperCase();
    const promoFonduri  = (process.env.PROMO_FONDURI || process.env.NEXT_PUBLIC_PROMO_FONDURI || "").trim().toUpperCase();
    const promoAdmin    = (process.env.PROMO_ADMIN || process.env.NEXT_PUBLIC_PROMO_ADMIN || "").trim().toUpperCase();

    if (promoStandard && cleanCode === promoStandard) {
      return NextResponse.json({ success: true, tier: "standard" });
    }
    if (promoFonduri && cleanCode === promoFonduri) {
      return NextResponse.json({ success: true, tier: "eu-funds" });
    }
    if (promoAdmin && cleanCode === promoAdmin) {
      return NextResponse.json({ success: true, tier: "full-access" });
    }

    return NextResponse.json({ success: false, error: "Cod promoțional invalid" });
  } catch (error: any) {
    console.error("Eroare validare cod promo:", error);
    return NextResponse.json({ success: false, error: "Eroare internă de server" }, { status: 500 });
  }
}
