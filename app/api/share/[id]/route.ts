import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const docRef = adminDb.collection("shared_plans").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Plan negăsit" }, { status: 404 });
    }

    // Increment views
    await docRef.update({ views: FieldValue.increment(1) });

    return NextResponse.json({ data: docSnap.data()?.data });
  } catch (error: any) {
    console.error("Eroare la obținerea planului:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
