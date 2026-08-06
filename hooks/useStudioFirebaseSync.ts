import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatObjectNumbers } from '@/lib/utils';
import { User } from 'firebase/auth';

interface UseStudioFirebaseSyncProps {
  user: User | null;
  setResultState: (fn: any) => void;
  setVersionsState: (data: any) => void;
  setActiveVersionId: (id: string) => void;
  setCurrency?: (curr: string) => void;
}

export const useStudioFirebaseSync = ({
  user,
  setResultState,
  setVersionsState,
  setActiveVersionId,
  setCurrency,
}: UseStudioFirebaseSyncProps) => {

  // Sincronizarea din localStorage redundantă (fosta Funcționalitate #1) a fost eliminată.
  // Migrarea este acum gestionată exclusiv de migrateLocalPlansToFirebase în lib/migrationManager.ts la login/register.

  useEffect(() => {
    if (!user) return;

    const searchParams = new URLSearchParams(window.location.search);
    const planId = searchParams.get("planId");
    if (!planId) return;

    let cancelled = false;
    const planRef = doc(db, "users", user.uid, "plans", planId);

    const applyPlan = (raw: Record<string, unknown>) => {
      const data = formatObjectNumbers(raw);
      setResultState(data);
      if (data.selectedCurrency && setCurrency) {
        setCurrency(data.selectedCurrency);
      }
      if (data.versions && typeof data.versions === 'object' && Object.keys(data.versions).length > 0) {
        setVersionsState(data.versions);
      } else {
        setVersionsState({ original: data });
      }
      setActiveVersionId("original");
      // Păstrăm parametrul planId în URL pentru a asigura actualizarea aceluiași document la salvările ulterioare
      window.history.replaceState({ view: 'idea' }, '', window.location.pathname + `?planId=${planId}&view=idea`);
    };

    // Retry scurt: la navigări rapide Dashboard ↔ Studio, getDoc poate rata documentul o dată (race / cache).
    const loadPlan = async () => {
      const delaysMs = [0, 400, 1000];
      for (let i = 0; i < delaysMs.length; i++) {
        if (cancelled) return;
        if (delaysMs[i] > 0) {
          await new Promise((r) => setTimeout(r, delaysMs[i]));
          if (cancelled) return;
        }
        try {
          const snap = await getDoc(planRef);
          if (cancelled) return;
          if (snap.exists()) {
            applyPlan(snap.data() as Record<string, unknown>);
            return;
          }
        } catch (err) {
          if (i === delaysMs.length - 1 && !cancelled) {
            console.warn("Eroare la incarcarea planului:", err);
          }
        }
      }
      if (!cancelled) {
        // warn (nu error): în Dev, console.error deschide overlay-ul Next.js pentru cazuri tranzitorii
        console.warn("Planul nu a fost gasit in baza de date:", planId);
      }
    };

    void loadPlan();
    return () => {
      cancelled = true;
    };
  }, [user]);

};
