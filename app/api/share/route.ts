import { NextRequest, NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { saveLocalSharedPlan } from "@/lib/localSharedPlans";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planData, locale } = body;

    if (!planData || !planData.nume) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    const cleanPlanData = JSON.parse(JSON.stringify(planData));

    if (!isFirebaseAdminReady) {
      if (process.env.NODE_ENV === "production") {
        console.error("[share] Firebase Admin missing in production");
        return NextResponse.json(
          { error: "Share service unavailable. Configure FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY." },
          { status: 503 }
        );
      }
      // Development: persist locally so PDF CTA / share still work without Admin SDK
      const id = await saveLocalSharedPlan({
        data: cleanPlanData,
        locale: locale || "ro",
      });
      console.warn(`[share] Local fallback id=${id} (add Firebase Admin credentials for Firestore)`);
      return NextResponse.json({ id, localFallback: true });
    }

    const docRef = await adminDb.collection("shared_plans").add({
      data: cleanPlanData,
      locale: locale || "ro",
      createdAt: FieldValue.serverTimestamp(),
      views: 0,
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error: any) {
    console.error("Eroare la salvarea planului distribuit:", error);
    return NextResponse.json({ error: "Eroare internă a serverului" }, { status: 500 });
  }
}
