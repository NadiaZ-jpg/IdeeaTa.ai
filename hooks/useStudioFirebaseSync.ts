import { useEffect, useRef } from 'react';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatObjectNumbers } from '@/lib/utils';
import { User } from 'firebase/auth';

interface UseStudioFirebaseSyncProps {
  user: User | null;
  /** Prefer full setResult so versions/localStorage stay in sync (Desktop). */
  onPlanLoaded: (data: Record<string, any>) => void;
  setVersionsState: (data: any) => void;
  setActiveVersionId: (id: string) => void;
  setCurrency?: (curr: string) => void;
  onPlanMissing?: (planId: string) => void;
}

export const useStudioFirebaseSync = ({
  user,
  onPlanLoaded,
  setVersionsState,
  setActiveVersionId,
  setCurrency,
  onPlanMissing,
}: UseStudioFirebaseSyncProps) => {
  const onPlanLoadedRef = useRef(onPlanLoaded);
  const onPlanMissingRef = useRef(onPlanMissing);
  const setVersionsStateRef = useRef(setVersionsState);
  const setActiveVersionIdRef = useRef(setActiveVersionId);
  const setCurrencyRef = useRef(setCurrency);

  onPlanLoadedRef.current = onPlanLoaded;
  onPlanMissingRef.current = onPlanMissing;
  setVersionsStateRef.current = setVersionsState;
  setActiveVersionIdRef.current = setActiveVersionId;
  setCurrencyRef.current = setCurrency;

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const planId = searchParams.get("planId");
    if (!planId) return;

    let cancelled = false;
    const planRef = doc(db, "users", user.uid, "plans", planId);

    // Asigură view=idea imediat (evită UI „start” / clear pe back)
    window.history.replaceState(
      { view: "idea" },
      "",
      `${window.location.pathname}?planId=${encodeURIComponent(planId)}&view=idea`
    );

    const applyPlan = (raw: Record<string, unknown>) => {
      const data = formatObjectNumbers(raw) as Record<string, any>;
      if (data.selectedCurrency && setCurrencyRef.current) {
        setCurrencyRef.current(data.selectedCurrency);
      }
      if (data.versions && typeof data.versions === "object" && Object.keys(data.versions).length > 0) {
        setVersionsStateRef.current(data.versions);
        setActiveVersionIdRef.current(
          data.versions.original ? "original" : Object.keys(data.versions)[0] || "original"
        );
      } else {
        setVersionsStateRef.current({ original: data });
        setActiveVersionIdRef.current("original");
      }
      onPlanLoadedRef.current(data);
      try {
        localStorage.setItem("current_generated_plan", JSON.stringify(data));
      } catch {
        /* ignore */
      }
    };

    const loadPlan = async () => {
      const delaysMs = [0, 300, 800, 1500, 2500];
      for (let i = 0; i < delaysMs.length; i++) {
        if (cancelled) return;
        if (delaysMs[i] > 0) {
          await new Promise((r) => setTimeout(r, delaysMs[i]));
          if (cancelled) return;
        }
        try {
          const snap =
            i >= delaysMs.length - 1
              ? await getDocFromServer(planRef).catch(() => getDoc(planRef))
              : await getDoc(planRef);
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
        console.warn("Planul nu a fost gasit in baza de date:", planId);
        onPlanMissingRef.current?.(planId);
      }
    };

    void loadPlan();
    return () => {
      cancelled = true;
    };
  }, [user]);
};
