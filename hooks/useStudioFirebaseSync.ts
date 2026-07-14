import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatObjectNumbers } from '@/lib/utils';
import { User } from 'firebase/auth';

interface UseStudioFirebaseSyncProps {
  user: User | null;
  setResultState: (fn: any) => void;
  setVersionsState: (data: any) => void;
  setActiveVersionId: (id: string) => void;
}

export const useStudioFirebaseSync = ({
  user,
  setResultState,
  setVersionsState,
  setActiveVersionId,
}: UseStudioFirebaseSyncProps) => {

  // Funcționalitate #1:
  // Sincronizare plan din localStorage catre Firebase la prima conectare.
  // Scenariul: utilizatorul a generat un plan fara cont, apoi s-a inregistrat/logat.
  // Planul local se salveaza automat in Firebase.
  useEffect(() => {
    if (!user) return;

    const saved = localStorage.getItem("current_generated_plan");
    const syncedUid = localStorage.getItem("plan_synced_to_uid");

    if (saved && saved !== "null" && saved !== "undefined" && syncedUid !== user.uid) {
      try {
        const parsed = JSON.parse(saved);
        const safeName = parsed.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
        const planId = safeName + "_" + Date.now();
        const planRef = doc(db, "users", user.uid, "plans", planId);

        setDoc(planRef, {
          ...parsed,
          createdAt: new Date().toISOString(),
        }).then(() => {
          console.log("Plan sincronizat din localStorage:", planId);
          localStorage.setItem("plan_synced_to_uid", user.uid);
        }).catch(e => console.error("Eroare la sync plan:", e));
      } catch (err) {
        console.error("Eroare parsare plan pentru sync:", err);
      }
    }
  }, [user]);

  // Funcționalitate #2:
  // Incarcare plan din Dashboard pe baza de planId din URL.
  // Scenariul: utilizatorul da click pe un plan din /dashboard,
  // care redirecteaza la /studio?planId=XYZ.
  useEffect(() => {
    if (!user) return;

    const searchParams = new URLSearchParams(window.location.search);
    const planId = searchParams.get("planId");
    if (!planId) return;

    const planRef = doc(db, "users", user.uid, "plans", planId);
    getDoc(planRef).then(snap => {
      if (snap.exists()) {
        const data = formatObjectNumbers(snap.data());
        setResultState(data);
        setVersionsState({ original: data });
        setActiveVersionId("original");
        window.history.replaceState({ view: 'idea' }, '', window.location.pathname + '?view=idea');
      } else {
        console.error("Planul nu a fost gasit in baza de date:", planId);
      }
    }).catch(err => {
      console.error("Eroare la incarcarea planului:", err);
    });
  }, [user]);

};
