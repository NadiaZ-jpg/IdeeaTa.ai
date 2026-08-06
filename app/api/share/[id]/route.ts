import { NextRequest, NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { readLocalSharedPlan } from "@/lib/localSharedPlans";

function normalizeLocale(value: unknown): "ro" | "en" | "es" {
  return value === "en" || value === "es" ? value : "ro";
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    if (!isFirebaseAdminReady) {
      const local = await readLocalSharedPlan(id);
      if (!local?.data) {
        return NextResponse.json({ error: "Plan negăsit" }, { status: 404 });
      }
      return NextResponse.json({
        data: local.data,
        locale: normalizeLocale(local.locale),
        localFallback: true,
      });
    }

    const docRef = adminDb.collection("shared_plans").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      const local = await readLocalSharedPlan(id);
      if (local?.data) {
        return NextResponse.json({
          data: local.data,
          locale: normalizeLocale(local.locale),
          localFallback: true,
        });
      }
      return NextResponse.json({ error: "Plan negăsit" }, { status: 404 });
    }

    await docRef.update({ views: FieldValue.increment(1) });
    const snapData = docSnap.data();

    return NextResponse.json({
      data: snapData?.data,
      locale: normalizeLocale(snapData?.locale),
    });
  } catch (error: any) {
    console.error("Eroare la obținerea planului:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
