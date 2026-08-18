"use client";
/**
 * useAuthUser — Gestionează centralizat starea de autentificare și entitlements
 * (permisiuni utilizator) via Firebase Auth + Firestore onSnapshot în timp real.
 *
 * Extrage logica duplicată din DemoDesktop, DemoMobile, StudioDesktop, StudioMobile.
 * Creat în Sesiunea 2 de Refactorizare (17 Aug 2026).
 *
 * @param locale - Limba activă ('ro' | 'en' | 'es')
 * @param options - Opțiuni pentru callback-uri specifice componentei
 */
import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/adminEmails";
import { hasAccountStandardAccess } from "@/lib/planUnlock";
import { readProPackRemaining } from "@/lib/proPackQuota";
import type { VersionStackAccess } from "@/lib/versionStack";

export interface AuthUserState {
  user: User | null;
  isAuthLoading: boolean;
  // Entitlements (sincronizate live din Firestore via onSnapshot)
  credits: number;
  euFundsUnlocked: boolean;
  subscriptionActive: boolean;
  proPackRemaining: { generate: number; edit: number; combine: number };
  lifetimePlanCount: number;
  unlockedPlans: string[];
  unlockedPlanIds: string[];
  promoCodeUnlocked: boolean;
  isPaid: boolean;
  standardPackageActive: boolean;
  // Valori derivate calculate sincron la fiecare render
  isAdmin: boolean;
  hasStandardAccess: boolean;
  hasProAccess: boolean;
  hasProPackQuota: boolean;
  versionStackAccess: VersionStackAccess;
}

export interface AuthUserOptions {
  /**
   * Callback apelat la orice schimbare de utilizator (login/logout).
   * Demo: apelează migrateLocalPlansToFirebase + setIsSharedView.
   * Studio: verifică emailVerified + redirect la logout.
   */
  onUserChanged?: (user: User | null) => void | Promise<void>;
  /**
   * Dacă true, creează documentul user în Firestore la primul login (Studio).
   * Demo creează documentul inline în onSnapshot, Studio are nevoie de flag explicit.
   */
  createUserDocIfMissing?: boolean;
}

export function useAuthUser(
  locale: "ro" | "en" | "es",
  options?: AuthUserOptions
): AuthUserState {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [euFundsUnlocked, setEuFundsUnlocked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [proPackRemaining, setProPackRemaining] = useState({
    generate: 0,
    edit: 0,
    combine: 0,
  });
  const [lifetimePlanCount, setLifetimePlanCount] = useState(0);
  const [unlockedPlans, setUnlockedPlans] = useState<string[]>([]);
  const [unlockedPlanIds, setUnlockedPlanIds] = useState<string[]>([]);
  const [promoCodeUnlocked, setPromoCodeUnlocked] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [standardPackageActive, setStandardPackageActive] = useState(false);

  // Valori derivate calculate sincron (fără state suplimentar)
  const isAdmin = isAdminEmail(user?.email);
  const hasStandardAccess = hasAccountStandardAccess({
    isPaid,
    standardPackageActive,
    promoCodeUnlocked,
    isAdmin,
    subscriptionActive,
    euFundsUnlocked,
  });
  const hasProAccess = !!(isAdmin || subscriptionActive || euFundsUnlocked);
  const hasProPackQuota = !!(euFundsUnlocked && !subscriptionActive && !isAdmin);
  const versionStackAccess: VersionStackAccess = {
    isAdmin,
    hasStandardAccess,
    hasFullAccess: !!(isAdmin || subscriptionActive || euFundsUnlocked),
    hasProTools: hasProAccess,
  };

  // ── Listener onAuthStateChanged ──────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (options?.onUserChanged) {
        await options.onUserChanged(currentUser);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Listener Firestore onSnapshot pentru entitlements ────────────────────────
  useEffect(() => {
    if (!user) {
      // Reset entitlements la deconectare
      setCredits(0);
      setEuFundsUnlocked(false);
      setSubscriptionActive(false);
      setProPackRemaining({ generate: 0, edit: 0, combine: 0 });
      setLifetimePlanCount(0);
      setUnlockedPlans([]);
      setUnlockedPlanIds([]);
      setPromoCodeUnlocked(false);
      setIsPaid(false);
      setStandardPackageActive(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCredits(data.credits || 0);
        setEuFundsUnlocked(data.euFundsUnlocked || false);
        setSubscriptionActive(data.subscriptionActive || false);
        setProPackRemaining(readProPackRemaining(data));
        setLifetimePlanCount(
          typeof data.lifetimePlanCount === "number" ? data.lifetimePlanCount : 0
        );
        setUnlockedPlans(data.unlockedPlans || []);
        setUnlockedPlanIds(data.unlockedPlanIds || []);
        setPromoCodeUnlocked(data.promoCodeUnlocked || false);
        setIsPaid(data.isPaid || false);
        setStandardPackageActive(!!data.standardPackageActive);
      } else if (options?.createUserDocIfMissing && user.email) {
        // Creează document user la primul login (Studio & Demo)
        setDoc(
          userRef,
          { email: user.email, createdAt: new Date().toISOString() },
          { merge: true }
        );
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    user,
    isAuthLoading,
    credits,
    euFundsUnlocked,
    subscriptionActive,
    proPackRemaining,
    lifetimePlanCount,
    unlockedPlans,
    unlockedPlanIds,
    promoCodeUnlocked,
    isPaid,
    standardPackageActive,
    isAdmin,
    hasStandardAccess,
    hasProAccess,
    hasProPackQuota,
    versionStackAccess,
  };
}
