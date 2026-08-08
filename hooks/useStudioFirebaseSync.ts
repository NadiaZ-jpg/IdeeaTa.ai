import { useEffect, useRef } from 'react';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatObjectNumbers } from '@/lib/utils';
import { User } from 'firebase/auth';
import { readStagedStudioPlan, clearStagedStudioPlan } from '@/lib/studioPlanHandoff';
import { resolveLoadedStudioPlan } from '@/lib/studioActiveVersion';

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
  const handoffAppliedForIdRef = useRef<string | null>(null);

  onPlanLoadedRef.current = onPlanLoaded;
  onPlanMissingRef.current = onPlanMissing;
  setVersionsStateRef.current = setVersionsState;
  setActiveVersionIdRef.current = setActiveVersionId;
  setCurrencyRef.current = setCurrency;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const planId = searchParams.get("planId");
    if (!planId) return;

    let cancelled = false;

    const applyPlan = (raw: Record<string, unknown>) => {
      const data = formatObjectNumbers(raw) as Record<string, any>;
      const { versions, activeVersionId, displayResult } = resolveLoadedStudioPlan(data);

      if (displayResult.selectedCurrency && setCurrencyRef.current) {
        setCurrencyRef.current(displayResult.selectedCurrency);
      }

      setVersionsStateRef.current(versions);
      setActiveVersionIdRef.current(activeVersionId);
      onPlanLoadedRef.current(displayResult);

      try {
        localStorage.setItem("current_generated_plan", JSON.stringify(displayResult));
      } catch {
        /* ignore */
      }
    };

    // 1) Handoff imediat din Dashboard (fără a aștepta auth/Firestore)
    let openedFromHandoff = handoffAppliedForIdRef.current === planId;
    if (!openedFromHandoff) {
      const staged = readStagedStudioPlan(planId);
      if (staged) {
        applyPlan(staged);
        handoffAppliedForIdRef.current = planId;
        openedFromHandoff = true;
        // Delay clear: Strict Mode remount încă poate citi handoff-ul
        window.setTimeout(() => clearStagedStudioPlan(), 1500);
      }
    }

    // Asigură view=idea imediat (evită UI „start” / clear pe back)
    window.history.replaceState(
      { view: "idea" },
      "",
      `${window.location.pathname}?planId=${encodeURIComponent(planId)}&view=idea`
    );

    // 2) Firestore când avem user (confirmare / refresh); nu redirect dacă handoff a reușit
    if (!user) return;

    const planRef = doc(db, "users", user.uid, "plans", planId);

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
        // Doar dacă nu am deschis deja din Dashboard handoff
        if (!openedFromHandoff && handoffAppliedForIdRef.current !== planId) {
          onPlanMissingRef.current?.(planId);
        }
      }
    };

    void loadPlan();
    return () => {
      cancelled = true;
    };
    // IMPORTANT: deps length must stay constant (HMR-safe). Callbacks live in refs.
  }, [user]);
};
