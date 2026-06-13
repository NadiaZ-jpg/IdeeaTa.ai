import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planData } = body;

    if (!planData || !planData.nume) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    // Salvăm în Firestore sub colecția 'shared_plans'
    const docRef = await adminDb.collection("shared_plans").add({
      data: planData,
      createdAt: FieldValue.serverTimestamp(),
      views: 0
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error: any) {
    console.error("Eroare la salvarea planului distribuit:", error);
    return NextResponse.json({ error: "Eroare internă a serverului" }, { status: 500 });
  }
}
