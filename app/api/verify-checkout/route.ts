import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const tier   = searchParams.get("tier");

    if (!userId) {
      return NextResponse.json({ error: "Lipseste userId" }, { status: 400 });
    }

    // Citim documentul utilizatorului direct din Firestore.
    // Webhook-ul Lemon Squeezy a scris deja datele acolo (async).
    const userRef  = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ success: false, pending: true });
    }

    const data = userSnap.data() || {};

    // Verificam daca webhook-ul a scris deja permisiunile corecte
    let isUnlocked = false;
    if (tier === "standard") {
      isUnlocked = Array.isArray(data.unlockedPlans) && data.unlockedPlans.length > 0;
    } else if (tier === "eu-funds") {
      isUnlocked = data.euFundsUnlocked === true;
    } else if (tier === "pro") {
      isUnlocked = data.subscriptionActive === true;
    }

    if (isUnlocked) {
      return NextResponse.json({ success: true, userId, tier });
    }

    // Webhook inca nu a ajuns (latenta normala de cateva secunde)
    return NextResponse.json({ success: false, pending: true });

  } catch (error: any) {
    console.error("Error verifying checkout:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la verificarea platii" },
      { status: 500 }
    );
  }
}
