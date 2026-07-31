import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';

export default async function SharedRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let targetLocale = "ro";
  try {
    const docSnap = await adminDb.collection("shared_plans").doc(id).get();
    if (docSnap.exists) {
      targetLocale = docSnap.data()?.locale || "ro";
    }
  } catch (e) {
    console.error("Eroare la citirea shared plan locale:", e);
  }
  
  if (targetLocale === "en") {
    redirect(`/en/demo?sharedId=${id}`);
  } else if (targetLocale === "es") {
    redirect(`/es/demo?sharedId=${id}`);
  } else {
    redirect(`/demo?sharedId=${id}`);
  }
}
