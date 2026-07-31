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

    const planRef = doc(db, "users", user.uid, "plans", planId);
    getDoc(planRef).then(snap => {
      if (snap.exists()) {
        const data = formatObjectNumbers(snap.data());
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
      } else {
        console.error("Planul nu a fost gasit in baza de date:", planId);
      }
    }).catch(err => {
      console.error("Eroare la incarcarea planului:", err);
    });
  }, [user]);

};
