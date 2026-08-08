import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, isFirebaseAdminReady } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { saveLocalSharedPlan } from "@/lib/localSharedPlans";
import { consumeRateLimit } from "@/lib/apiRateLimit";

const HOUR_MS = 60 * 60 * 1000;
const MAX_PLAN_JSON_CHARS = 800_000;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
      uid = decoded.uid;
    } catch {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    if (!consumeRateLimit(`share:user:${uid}`, 30, HOUR_MS)) {
      return NextResponse.json(
        { error: "Too many requests", code: "RATE_LIMIT" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { planData, locale } = body;

    if (!planData || !planData.nume) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    const cleanPlanData = JSON.parse(JSON.stringify(planData));
    const serialized = JSON.stringify(cleanPlanData);
    if (serialized.length > MAX_PLAN_JSON_CHARS) {
      return NextResponse.json({ error: "Plan too large" }, { status: 413 });
    }

    if (!isFirebaseAdminReady) {
      if (process.env.NODE_ENV === "production") {
        console.error("[share] Firebase Admin missing in production");
        return NextResponse.json(
          { error: "Share service unavailable. Configure FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY." },
          { status: 503 }
        );
      }
      const id = await saveLocalSharedPlan({
        data: cleanPlanData,
        locale: locale || "ro",
      });
      console.warn(`[share] Local fallback id=${id}`);
      return NextResponse.json({ id, localFallback: true });
    }

    const docRef = await adminDb.collection("shared_plans").add({
      data: cleanPlanData,
      locale: locale || "ro",
      createdAt: FieldValue.serverTimestamp(),
      views: 0,
      createdBy: uid,
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error: any) {
    console.error("Eroare la salvarea planului distribuit:", error);
    return NextResponse.json({ error: "Eroare internă a serverului" }, { status: 500 });
  }
}
