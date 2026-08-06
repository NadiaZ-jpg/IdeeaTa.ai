import { redirect } from "next/navigation";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase-admin";
import { readLocalSharedPlan } from "@/lib/localSharedPlans";
import {
  normalizeAppLocale,
  sharedPlanOpenPath,
  type AppLocale,
} from "@/lib/pdfCtaBehavior";

export default async function SharedRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ l?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  let targetLocale: AppLocale = normalizeAppLocale(query?.l);

  try {
    if (isFirebaseAdminReady) {
      const docSnap = await adminDb.collection("shared_plans").doc(id).get();
      if (docSnap.exists) {
        targetLocale = normalizeAppLocale(docSnap.data()?.locale || query?.l);
      }
    } else {
      const local = await readLocalSharedPlan(id);
      if (local) {
        targetLocale = normalizeAppLocale(local.locale || query?.l);
      }
    }
  } catch (e) {
    console.error("Eroare la citirea shared plan locale:", e);
    targetLocale = normalizeAppLocale(query?.l);
  }

  // Aceeași destinație ca butonul din PDF (lib/pdfCtaBehavior)
  redirect(sharedPlanOpenPath(targetLocale, id));
}
