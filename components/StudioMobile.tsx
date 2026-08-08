"use client";
import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import pptxgen from "pptxgenjs";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { PricingModal } from '@/components/PricingModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useStudioFirebaseSync } from '@/hooks/useStudioFirebaseSync';
import { ToneEditor } from '@/components/ToneEditor';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/translations';
import { UI_STRINGS } from '@/lib/uiStrings';
import { createAndCopySharedPlanLink } from '@/lib/sharePlan';
import { StudioMobileGenerateHint } from '@/components/StudioMobileGenerateHint';
import { getExamples } from '@/lib/examples';
import { FREE_ACCOUNT_PLAN_LIMIT } from '@/lib/planQuota';
import { isAdminEmail } from '@/lib/adminEmails';
import { isPlanExportUnlocked, hasAccountStandardAccess } from '@/lib/planUnlock';
import { stripPaymentSuccessParams } from '@/lib/paymentReturn';
import dynamic from 'next/dynamic';
import { useExportActions } from "@/hooks/useExportActions";
import { useCompleteMissingPlanFields } from "@/hooks/useCompleteMissingPlanFields";
import { StudioPdfSlides } from "@/components/pdf/StudioPdfSlides";
import { truncateText, splitTextIntoSlides } from "@/lib/planHelpers";
import { formatPriceLocalized } from "@/lib/priceHelper";
import { formatObjectNumbers, formatNumberedText } from "@/lib/utils";
import { canUseFreeToneEdit, consumeFreeToneEdit, isFreeToneKey, isProToneKey, toneVersionKey } from "@/lib/toneQuota";
import {
  buildStackedVersionKey,
  canUseVersionCombine,
  combineFullAccessHint,
  combineWithLabel,
  formatVersionTabTitle,
  gateVersionStackAppend,
  getCombineMenuItems,
  getVersionStackLimit,
  isStandardOnlyCombineAccess,
  noCombineAccessMessage,
  resolveEditBaseForToolRun,
  resolveVersionStack,
  stackLimitReachedMessage,
  toolStepFromAction,
  withVersionStack,
  type CombineAction,
  type VersionStackAccess,
} from "@/lib/versionStack";

import { EXPERT_TEMPLATES, expertModulesAllFilterLabel } from '@/lib/templatesData';
import { MobileProToolsPanel, type MobileAiPrompt } from '@/components/tools/MobileProToolsPanel';

const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });

export default function StudioMobile({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const ui = UI_STRINGS[locale];
  const isEn = locale === "en";
  const isEs = locale === "es";
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<any>(null);
  useCompleteMissingPlanFields(result, setResult, locale);
  const [versions, setVersions] = useState<any>({});
  const [activeVersionId, setActiveVersionId] = useState<string>("original");
  
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "marketing" | "swot">("overview");
  const [loading, setLoading] = useState(false);
  const [fxRate, setFxRate] = useState(0.201);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | 'pptx' | 'pdf-summary' | null>(null);
  
  // Stări permisiuni utilizator (la fel ca pe desktop)
  const [credits, setCredits] = useState(0);
  const [euFundsUnlocked, setEuFundsUnlocked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [unlockedPlans, setUnlockedPlans] = useState<string[]>([]);
  const [unlockedPlanIds, setUnlockedPlanIds] = useState<string[]>([]);
  const [promoCodeUnlocked, setPromoCodeUnlocked] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  
  const isAdmin = isAdminEmail(user?.email);
  const [isPaidState, setIsPaidState] = useState(false);
  const [standardPackageActive, setStandardPackageActive] = useState(false);
  const isPaid = isPaidState;

  const isPlanPaid = isPlanExportUnlocked({
    result,
    unlockedPlans,
    unlockedPlanIds,
    isPaid,
    promoCodeUnlocked,
    isAdmin,
    subscriptionActive,
    euFundsUnlocked,
  });
  const isStudioPaid = hasAccountStandardAccess({
    isPaid,
    standardPackageActive,
    promoCodeUnlocked,
    isAdmin,
    subscriptionActive,
    euFundsUnlocked,
  });
  const hasProAccess = !!(isAdmin || subscriptionActive || euFundsUnlocked);
  const versionStackAccess: VersionStackAccess = {
    isAdmin,
    hasStandardAccess: isStudioPaid,
    hasFullAccess: hasProAccess,
    hasProTools: hasProAccess,
  };
  const [combineMenuFor, setCombineMenuFor] = useState<string | null>(null);
  const [activeAiPrompt, setActiveAiPrompt] = useState<MobileAiPrompt | null>(null);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [skill, setSkill] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const usedIdeasRef = useRef<number[]>([]);
  const examplesList = getExamples(locale);

  const loadingMessages =
    locale === "en"
      ? ["Analyzing your idea...", "Building structure...", "Estimating finances...", "Finalizing plan..."]
      : locale === "es"
      ? ["Analizando tu idea...", "Construyendo la estructura...", "Estimando finanzas...", "Finalizando el plan..."]
      : ["Analizăm ideea...", "Construim structura...", "Estimăm finanțele...", "Finalizăm planul..."];

  const syncCurrentPlanToFirestore = async (
    updatedResult: any,
    updatedVersions?: Record<string, any>,
    versionIdToSave?: string
  ) => {
    if (!user) return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let planId = searchParams.get("planId") || updatedResult?.id || null;
      const missingInUrl = !searchParams.get("planId");
      if (!planId) {
        const safeName = String(updatedResult?.nume || "Plan").replace(/[^a-zA-Z0-9]/g, "_");
        planId = `${safeName}_${Date.now()}`;
      }
      const planRef = doc(db, "users", user.uid, "plans", planId);
      const versToSave = updatedVersions || versions;
      const payload: any = {
        ...updatedResult,
        id: planId,
        updatedAt: new Date().toISOString(),
        selectedCurrency: updatedResult?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR"),
        activeVersionId: versionIdToSave || activeVersionId,
      };
      if (versToSave && Object.keys(versToSave).length > 0) {
        payload.versions = versToSave;
      }
      await setDoc(planRef, payload, { merge: true });

      if (missingInUrl || searchParams.get("planId") !== planId) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?planId=${encodeURIComponent(planId)}&view=idea`
        );
      }
    } catch (err) {
      console.error("Firestore save error:", err);
    }
  };

  // Stări pentru editarea AI și manuală pe mobil (Bottom-Sheets)
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [showExpertDrawer, setShowExpertDrawer] = useState(false);
  const [selectedExpertCategory, setSelectedExpertCategory] = useState("all");
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Editare Manuală Drawer
  const [editingField, setEditingField] = useState<{key: string, title: string, value: string} | null>(null);

  const renderSwotCategory = (catData: any) => {
    if (!catData) return null;
    if (Array.isArray(catData)) {
      return (
        <ul className="space-y-2 text-zinc-300 text-xs list-none">
          {catData.map((item: any, idx: number) => {
            const title = typeof item === 'string' ? item : (item.titlu || item.titulo || item.title || '');
            const desc = item.explicatie_tehnica || item.explicacion_tecnica || item.explicacion || item.descriere || item.detalii || '';
            return (
              <li key={idx} className="leading-relaxed">
                <strong>✦ {title}</strong>
                {desc && <span className="block pl-4 text-zinc-400 text-[11px]">{desc}</span>}
              </li>
            );
          })}
        </ul>
      );
    }
    return <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(String(catData))}</p>;
  };

  const getSwotString = (catData: any) => {
    if (!catData) return '';
    if (Array.isArray(catData)) {
      return catData.map((item: any) => {
        const title = typeof item === 'string' ? item : (item.titlu || '');
        return `• ${title}`;
      }).join('\n');
    }
    return String(catData);
  };

  // Sincronizare automată Firebase
  useStudioFirebaseSync({
    user,
    onPlanLoaded: (data) => {
      setStudioLoadTimedOut(false);
      setResult(data);
    },
    setVersionsState: setVersions,
    setActiveVersionId,
    setCurrency: (curr) => {
      setResult((prev: any) => (prev ? { ...prev, selectedCurrency: curr } : prev));
    },
    // Fără ecran de eroare: la eșec revenim silențios la Dashboard
    onPlanMissing: () => {
      setStudioLoadTimedOut(true);
      router.replace(ui.routes.dashboard);
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
        return;
      }
      setUser(currentUser);

      // Verificare confirmare email (provider password)
      if (!currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
        setShowVerificationModal(true);
      }
    });
    return () => unsubscribe();
  }, [router, isEn, isEs]);

  useEffect(() => {
    if (!user) {
      setCredits(0);
      setEuFundsUnlocked(false);
      setSubscriptionActive(false);
      setUnlockedPlans([]);
      setUnlockedPlanIds([]);
      setPromoCodeUnlocked(false);
      setIsPaidState(false);
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
        setUnlockedPlans(data.unlockedPlans || []);
        setUnlockedPlanIds(data.unlockedPlanIds || []);
        setPromoCodeUnlocked(data.promoCodeUnlocked || false);
        setIsPaidState(data.isPaid || false);
        setStandardPackageActive(!!data.standardPackageActive);
      } else {
        // Entitlements (credits/isPaid/…) are Admin-only — see firestore.rules
        setDoc(userRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("payment_success") === "true";
    const tier = urlParams.get("tier");
    if (!paymentSuccess) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(
          `/api/verify-checkout?tier=${encodeURIComponent(tier || "")}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          if (tier === "standard") {
            alert(ui.paymentConfirmedEU.replace("{plan}", result?.nume || "Plan"));
          } else if (tier === "eu-funds") {
            alert(t("paymentConfirmedEU", locale));
          } else if (tier === "pro") {
            alert(ui.alertUnlimitedPro);
          }
          stripPaymentSuccessParams();
        }
      } catch (error) {
        console.error("Eroare la verificarea plății:", error);
      }
    })();
  }, [user]);

  const handleAiEdit = async (
    action: string,
    customInput?: string,
    options?: { basePlan?: any; sourceVersionId?: string }
  ) => {
    if (!result || !user) return;

    const isTone = action === "professional_tone";
    const hasProTones = !!(isAdmin || hasProAccess);

    if (isTone && isProToneKey(customInput) && !hasProTones) {
      setShowPricingModal(true);
      return;
    }
    if (isTone && isFreeToneKey(customInput) && !(isAdmin || isStudioPaid || isPlanPaid) && !canUseFreeToneEdit(false)) {
      setShowPricingModal(true);
      return;
    }

    // Optimize budget + alte tool-uri Pro (nu sunt free pe Studio)
    if (!isTone && !isAdmin && !hasProAccess) {
      setShowPricingModal(true);
      return;
    }

    let targetSection = "";
    let budgetPercent: number | null = null;
    if (action === "optimize_budget") {
      let entered = customInput?.trim() || "";
      if (!entered) {
        const promptMsg =
          locale === "en"
            ? "By what percentage do you want to reduce the budgeted costs? (e.g. 20)"
            : locale === "es"
            ? "¿Qué porcentaje deseas reducir de los costos presupuestados? (ej. 20)"
            : "Cu ce procent dorești să reduci costurile bugetate? (ex: 20)";
        entered = (typeof window !== "undefined" ? window.prompt(promptMsg, "20") : null) || "";
      }
      if (!entered) return;
      const percent = parseInt(entered.replace(/%/g, "").trim(), 10);
      if (isNaN(percent) || percent <= 0 || percent > 90) {
        alert(
          locale === "en"
            ? "Please enter a valid percentage between 1 and 90 (e.g. 20)."
            : locale === "es"
            ? "Introduce un porcentaje válido entre 1 y 90 (ej. 20)."
            : "Te rog introdu un procent valid între 1 și 90 (ex: 20)."
        );
        return;
      }
      budgetPercent = percent;
      targetSection = String(percent);
    }

    setActiveAiPrompt(null);
    setAiPromptInput("");

    // Original → sibling tab; non-original / Combine (+) → append on active (or source) tab
    const { isCombine, baseSource, currentStack } = resolveEditBaseForToolRun({
      activeVersionId,
      versions,
      result,
      combineOptions: options,
    });
    const nextStep = toolStepFromAction(action, isTone ? customInput : undefined, budgetPercent);
    let nextStack = currentStack;
    if (nextStep) {
      const gate = gateVersionStackAppend(currentStack, nextStep, versionStackAccess);
      if (!gate.ok) {
        if (gate.reason === "no_access") {
          alert(noCombineAccessMessage(locale));
          setShowPricingModal(true);
          return;
        }
        if (gate.reason === "limit") {
          const isStandardOnly = !!(
            versionStackAccess.hasStandardAccess &&
            !versionStackAccess.hasFullAccess &&
            !versionStackAccess.isAdmin
          );
          alert(stackLimitReachedMessage(locale, gate.limit, isStandardOnly));
          if (isStandardOnly) setShowPricingModal(true);
          return;
        }
        return;
      }
      nextStack = gate.nextStack;
    }

    setIsEditingAi(true);

    try {
      if (!user) {
        window.history.pushState({ login: true }, "", window.location.pathname + "?login=true");
        return;
      }
      const token = await user.getIdToken();
      const editHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch("/api/edit", {
        method: "POST",
        headers: editHeaders,
        body: JSON.stringify({
          result: baseSource,
          action,
          customStyle: isTone ? (customInput || "") : "",
          targetSection: targetSection || (action === "add_sections" ? customInput || "" : ""),
          locale,
          currency: baseSource?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR")
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err?.code === "TONE_LIMIT" || err?.code === "PRO_REQUIRED" || err?.code === "AUTH_REQUIRED") {
          setShowPricingModal(true);
        }
        throw new Error(err?.error || "Eroare editare AI");
      }

      const data = await res.json();
      if (data && data.editedPlan) {
        const parsed = withVersionStack(formatObjectNumbers(data.editedPlan), nextStack);
        const vKey = nextStep
          ? buildStackedVersionKey(nextStack)
          : `edit_${Date.now()}`;
        const originalSnapshot = versions.original ?? (isCombine ? undefined : baseSource);
        const nextVersions = (() => {
          const base = Object.keys(versions).length ? versions : { original: originalSnapshot || baseSource };
          if (!base.original && originalSnapshot) {
            return { ...base, original: originalSnapshot, [vKey]: parsed };
          }
          return { ...base, [vKey]: parsed };
        })();
        setVersions(nextVersions);
        setActiveVersionId(vKey);
        setResult(parsed);
        localStorage.setItem("current_generated_plan", JSON.stringify(parsed));
        if (isTone && isFreeToneKey(customInput) && !(isAdmin || isStudioPaid || isPlanPaid)) {
          consumeFreeToneEdit(false);
        }

        await syncCurrentPlanToFirestore(parsed, nextVersions, vKey);
      }
    } catch (e) {
      console.error(e);
      alert(locale === "en" ? "Could not process AI request." : locale === "es" ? "No se pudo procesar la solicitud de IA." : "Nu s-a putut procesa modificarea AI.");
    } finally {
      setIsEditingAi(false);
    }
  };

  const handleCombineWith = (sourceVersionId: string, combine: CombineAction) => {
    const sourcePlan = versions[sourceVersionId];
    if (!sourcePlan) return;
    setActiveVersionId(sourceVersionId);
    setResult(sourcePlan);
    setCombineMenuFor(null);
    setShowVersionDropdown(false);

    if (combine.action === "optimize_budget") {
      void handleAiEdit("optimize_budget", undefined, {
        basePlan: sourcePlan,
        sourceVersionId,
      });
      return;
    }
    if (combine.action === "professional_tone") {
      void handleAiEdit(combine.action, combine.customStyle, {
        basePlan: sourcePlan,
        sourceVersionId,
      });
      return;
    }
    void handleAiEdit(combine.action, undefined, {
      basePlan: sourcePlan,
      sourceVersionId,
    });
  };

  const handleManualSave = async () => {
    if (!editingField || !result || !user) return;
    
    // Generăm noul obiect plan de afaceri modificat
    const updatedPlan = { ...result };
    const keys = editingField.key.split('.');
    
    if (keys.length === 1) {
      updatedPlan[keys[0]] = editingField.value;
    } else if (keys.length === 2) {
      if (!updatedPlan[keys[0]]) updatedPlan[keys[0]] = {};
      const currentVal = updatedPlan[keys[0]][keys[1]];
      if (keys[0] === 'analiza_swot' && Array.isArray(currentVal)) {
        const lines = editingField.value.split('\n').map(l => l.replace(/^[✦•\-\*\s]+/, '').trim()).filter(Boolean);
        updatedPlan[keys[0]][keys[1]] = lines.map((line, lineIdx) => {
          const originalObj = currentVal[lineIdx] || {};
          return {
            ...originalObj,
            titlu: line,
            explicatie_tehnica: originalObj.explicatie_tehnica || ''
          };
        });
      } else {
        updatedPlan[keys[0]][keys[1]] = editingField.value;
      }
    } else if (keys.length === 3) {
      if (updatedPlan[keys[0]] && Array.isArray(updatedPlan[keys[0]])) {
        const idx = parseInt(keys[1], 10);
        if (updatedPlan[keys[0]][idx]) {
          updatedPlan[keys[0]][idx][keys[2]] = editingField.value;
        }
      }
    }

    setResult(updatedPlan);
    localStorage.setItem("current_generated_plan", JSON.stringify(updatedPlan));
    
    const nextVersions = {
      ...(versions && Object.keys(versions).length ? versions : { original: updatedPlan }),
      [activeVersionId]: updatedPlan,
    };
    setVersions(nextVersions);
    await syncCurrentPlanToFirestore(updatedPlan, nextVersions);
    
    setEditingField(null);
  };

  const handleResendVerification = async () => {
    if (user && user.email) {
      try {
        const res = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, locale }),
        });
        
        if (!res.ok) {
          throw new Error(`API failed with status ${res.status}`);
        }
        setVerificationSent(true);
      } catch (error) {
        console.warn("Eroare trimitere email personalizat, folosim fallback:", error);
        try {
          auth.languageCode = locale;
          const { verificationActionCodeSettings } = await import("@/lib/emailVerification");
          await sendEmailVerification(user, verificationActionCodeSettings(locale));
          setVerificationSent(true);
        } catch (fallbackError) {
          console.error("Eroare fallback trimitere email:", fallbackError);
        }
      }
    }
  };

  const handleShare = async () => {
    if (!result) return;
    if (!user) {
      router.push(locale === "en" ? "/en/login" : locale === "es" ? "/es/login" : "/login");
      return;
    }
    try {
      const token = await user.getIdToken();
      const url = await createAndCopySharedPlanLink(result, locale, token);
      if (url) {
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      } else {
        alert(ui.shareError);
      }
    } catch (err) {
      console.error(err);
      alert(ui.shareError);
    }
  };

  const [showExportModal, setShowExportModal] = useState(false);
  const [pendingDownloadMode, setPendingDownloadMode] = useState<'pdf' | 'pptx' | 'word' | 'pdf-summary' | null>(null);

  const { downloadAction: handleDownloadAction } = useExportActions({
    result,
    locale,
    currency: result?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR"),
    fxRate,
    user,
    isAdmin,
    isPlanPaid: isPlanPaid,
    subscriptionActive,
    euFundsUnlocked,
    credits,
    setIsDownloading,
    setPendingDownloadMode,
    setShowPricingModal,
    setIsSharedView,
    t,
    activeVersionId,
    onPlanUnlockedByCredit: (planName, planId) => {
      setUnlockedPlans((prev) => (prev.includes(planName) ? prev : [...prev, planName]));
      if (planId) {
        setUnlockedPlanIds((prev) => (prev.includes(planId) ? prev : [...prev, planId]));
      }
    },
  });

  const downloadAction = async (mode: 'word' | 'pptx' | 'pdf' | 'pdf-summary') => {
    await handleDownloadAction(mode);
  };

  const [studioLoadTimedOut, setStudioLoadTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  const handleGenerate = async (retryCount = 0) => {
    if (!skill.trim() || (loading && retryCount === 0)) return;
    if (!user) {
      router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
      return;
    }

    let shouldStopLoading = true;

    if (retryCount === 0) {
      const accountPaid = !!(
        isPaid ||
        promoCodeUnlocked ||
        subscriptionActive ||
        euFundsUnlocked
      );
      if (!accountPaid && !isAdmin) {
        try {
          const snap = await getDocs(collection(db, "users", user.uid, "plans"));
          if (snap.size >= FREE_ACCOUNT_PLAN_LIMIT) {
            setShowPricingModal(true);
            return;
          }
        } catch (err) {
          console.error("Eroare verificare limită planuri Firestore:", err);
          const studioCount = parseInt(localStorage.getItem("studioGenerateCount") || "0", 10);
          if (studioCount >= 1) {
            setShowPricingModal(true);
            return;
          }
        }
      }
      setLoading(true);
      setMessageIndex(0);
    }

    try {
      const token = await user.getIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          skill,
          locale,
          currency: locale === "ro" ? "LEI" : "EUR",
          surface: "studio",
        }),
      });

      const resText = await res.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch {
        throw new Error(
          res.ok
            ? t("errorGenerationFallback", locale)
            : t("errorGenerationFallback", locale)
        );
      }

      if (!res.ok) {
        if (data?.error === "LIMIT_REACHED") {
          setShowPricingModal(true);
          return;
        }
        throw new Error(data.error || `Eroare server: ${res.status}`);
      }

      if (data.fx_rate) setFxRate(data.fx_rate);

      if (data?.ideas?.length > 0) {
        const content = data.ideas[0];
        let cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
        cleanJson = cleanJson.replace(/[„“”]/g, '"');
        const startIndex = cleanJson.indexOf("{");
        const endIndex = cleanJson.lastIndexOf("}");
        if (startIndex !== -1 && endIndex !== -1) {
          cleanJson = cleanJson.substring(startIndex, endIndex + 1);
        }

        try {
          cleanJson = cleanJson.replace(/,\s*([}\]])/g, "$1");
          const finalResult = formatObjectNumbers(JSON.parse(cleanJson));
          const planId =
            String(finalResult.nume || "Plan").replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();
          finalResult.id = planId;

          if (retryCount === 0 && !isAdmin) {
            const accountPaid = !!(
              isPaid ||
              promoCodeUnlocked ||
              subscriptionActive ||
              euFundsUnlocked
            );
            if (!accountPaid) {
              const studioCount = parseInt(localStorage.getItem("studioGenerateCount") || "0", 10);
              localStorage.setItem("studioGenerateCount", (studioCount + 1).toString());
            }
          }

          setVersions({ original: finalResult });
          setActiveVersionId("original");
          setResult(finalResult);
          setSkill("");
          localStorage.setItem("current_generated_plan", JSON.stringify(finalResult));
          window.history.pushState(
            { view: "idea" },
            "",
            `${window.location.pathname}?planId=${planId}&view=idea`
          );
          window.scrollTo({ top: 0, behavior: "smooth" });

          await setDoc(doc(db, "users", user.uid, "plans", planId), {
            ...finalResult,
            versions: { original: finalResult },
            activeVersionId: "original",
            createdAt: new Date().toISOString(),
            isPaid: false,
            selectedCurrency: locale === "ro" ? "LEI" : "EUR",
          });
        } catch (parseError) {
          console.error("TEXTUL GENERAT DE AI A FOST:", cleanJson, parseError);
          if (retryCount < 2) {
            shouldStopLoading = false;
            void handleGenerate(retryCount + 1);
            return;
          }
          alert(t("errorSystemOverloaded", locale));
        }
      }
    } catch (error: any) {
      console.error("Eroare:", error);
      alert(error.message || t("errorGenerationFallback", locale));
    } finally {
      if (shouldStopLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (result || typeof window === "undefined") return;
    const planId = new URLSearchParams(window.location.search).get("planId");
    if (!planId || !user) return;
    const timer = setTimeout(() => {
      setStudioLoadTimedOut(true);
      router.replace(ui.routes.dashboard);
    }, 8000);
    return () => clearTimeout(timer);
  }, [result, user, router, ui.routes.dashboard]);

  if (!result) {
    if (!user) {
      return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400 text-sm">{ui.studioLoadingWorkspace}</p>
        </div>
      );
    }

    const planId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("planId")
        : null;

    // Fără planId → formular generare Mobile. Cu planId → spinner (la eșec redirect).
    if (!planId) {
      return (
        <StudioMobileGenerateHint
          locale={locale}
          skill={skill}
          setSkill={setSkill}
          loading={loading}
          loadingMessage={loadingMessages[messageIndex]}
          onGenerate={() => void handleGenerate()}
          onInspire={() => {
            if (usedIdeasRef.current.length >= examplesList.length) {
              usedIdeasRef.current = [];
            }
            let nextIndex = Math.floor(Math.random() * examplesList.length);
            while (
              usedIdeasRef.current.includes(nextIndex) ||
              examplesList[nextIndex].long === skill
            ) {
              nextIndex = Math.floor(Math.random() * examplesList.length);
            }
            usedIdeasRef.current.push(nextIndex);
            setSkill(examplesList[nextIndex].long);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          inputRef={inputRef}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-sm">{ui.studioLoadingWorkspace}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-x-hidden flex flex-col pb-16">
      
      {/* Header */}
      <header className={`h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <Link href={ui.routes.dashboard} className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 min-h-[44px] min-w-[44px]">
          <span>←</span>
          <span>{locale === "en" ? "Dashboard" : locale === "es" ? "Panel" : "Dashboard"}</span>
        </Link>
        <span className="text-sm font-black">{locale === "en" ? "Mobile Studio" : locale === "es" ? "Studio Móvil" : "Studio Mobil"}</span>
        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <button
            onClick={handleShare}
            className="bg-zinc-800 text-white font-bold p-2 rounded-lg text-xs min-h-[44px] min-w-[44px]"
            title={locale === "en" ? "Share" : locale === "es" ? "Compartir" : "Distribui"}
          >
            🔗
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 min-h-[44px]"
          >
            <span>{locale === "en" ? "Export" : locale === "es" ? "Exportar" : "Export"}</span>
            <span>📥</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        
        {showShareSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center py-2 rounded-lg animate-pulse font-bold">
            {ui.shareCopied}
          </div>
        )}

        {/* Studio Info Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex justify-between items-center backdrop-blur-md">
          <div className="min-w-0">
            <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase block w-max mb-1">
              {locale === "en" ? "Edit Mode" : locale === "es" ? "Modo de Edición" : "Mod Editare"}
            </span>
            <h2 className="text-sm font-black text-white truncate">{result.nume || (locale === "en" ? "Business Plan" : locale === "es" ? "Plan de Negocios" : "Plan de Afaceri")}</h2>
          </div>
          <button
            onClick={() => setShowPricingModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 min-h-[44px]"
          >
            {ui.pricing}
          </button>
        </div>

        {/* Tablet split layout container */}
        <div className="flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-6 items-start w-full">
          {/* Left Column (Navigation & Versions) - 4 cols */}
          <div className="w-full md:col-span-4 flex flex-col gap-4 sticky md:top-20 z-20">
            {/* Version History Selector Mobile */}
            {versions && Object.keys(versions).length > 0 && (
              <div className="relative z-20">
                <button 
                  onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <span>📜 {locale === "en" ? "Version History" : locale === "es" ? "Historial de Versiones" : "Istoric Versiuni"} ({Object.keys(versions).length})</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-normal truncate max-w-[140px]">
                      {formatVersionTabTitle(activeVersionId, versions[activeVersionId] || result, locale, ui)}
                    </span>
                    <span className="text-[10px] text-zinc-500">▼</span>
                  </span>
                </button>

                {showVersionDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="text-[9px] uppercase font-black tracking-widest text-zinc-500 px-3 py-2 border-b border-zinc-900 flex justify-between items-center">
                      <span>{locale === "en" ? "Saved Versions" : locale === "es" ? "Versiones Guardadas" : "Versiuni Salvate"}</span>
                      <button type="button" onClick={() => { setShowVersionDropdown(false); setCombineMenuFor(null); }} className="text-zinc-500 hover:text-white text-xs min-w-[44px] min-h-[44px]">✕</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto flex flex-col gap-1 mt-1">
                      {Object.entries(versions).map(([vKey, vData]) => (
                        <div key={vKey} className="flex flex-col gap-1">
                          <div className="flex items-stretch gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveVersionId(vKey);
                                setResult(vData);
                                setShowVersionDropdown(false);
                                setCombineMenuFor(null);
                                void syncCurrentPlanToFirestore(vData, versions, vKey);
                              }}
                              className={`flex-1 text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${activeVersionId === vKey ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                            >
                              <span className="truncate pr-2">
                                {formatVersionTabTitle(vKey, vData, locale, ui)}
                              </span>
                              {activeVersionId === vKey && <span className="text-emerald-400 text-xs shrink-0">✓</span>}
                            </button>
                            {canUseVersionCombine(versionStackAccess) && (
                              <button
                                type="button"
                                title={combineWithLabel(locale)}
                                onClick={() => {
                                  const stack = resolveVersionStack(vKey, vData);
                                  const limit = getVersionStackLimit(versionStackAccess);
                                  if (stack.length >= limit) {
                                    const isStandardOnly = !!(
                                      versionStackAccess.hasStandardAccess &&
                                      !versionStackAccess.hasFullAccess &&
                                      !versionStackAccess.isAdmin
                                    );
                                    alert(stackLimitReachedMessage(locale, limit, isStandardOnly));
                                    if (isStandardOnly) setShowPricingModal(true);
                                    return;
                                  }
                                  setCombineMenuFor(combineMenuFor === vKey ? null : vKey);
                                }}
                                className="shrink-0 px-3 rounded-xl text-emerald-400 border border-emerald-500/25 bg-emerald-500/5 text-xs font-black min-w-[44px] min-h-[44px]"
                              >
                                +
                              </button>
                            )}
                          </div>
                          {combineMenuFor === vKey && (
                            <div className="mx-1 mb-1 p-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                              <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 px-2 py-1">
                                {combineWithLabel(locale)}
                              </p>
                              {getCombineMenuItems(locale, versionStackAccess, ui).map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  className="w-full text-left text-xs px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white font-semibold min-h-[44px]"
                                  onClick={() => handleCombineWith(vKey, item.combine)}
                                >
                                  {item.label}
                                </button>
                              ))}
                              {isStandardOnlyCombineAccess(versionStackAccess) && (
                                <button
                                  type="button"
                                  className="w-full text-left text-[10px] leading-snug px-3 py-2.5 mt-1 rounded-lg text-amber-300/90 bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 font-semibold min-h-[44px]"
                                  onClick={() => {
                                    setCombineMenuFor(null);
                                    setShowVersionDropdown(false);
                                    setShowPricingModal(true);
                                  }}
                                >
                                  {combineFullAccessHint(locale)}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <MobileProToolsPanel
              ui={ui}
              locale={locale}
              t={t}
              user={user}
              result={result}
              hasProAccess={hasProAccess}
              isEditingAi={isEditingAi}
              activeAiPrompt={activeAiPrompt}
              setActiveAiPrompt={setActiveAiPrompt}
              aiPromptInput={aiPromptInput}
              setAiPromptInput={setAiPromptInput}
              handleAiEdit={handleAiEdit}
              onRequireAuth={() => router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login")}
              onRequirePro={() => setShowPricingModal(true)}
              showExpert
              onOpenExpert={() => setShowExpertDrawer(true)}
            />

            {/* Studio tips (RO/EN/ES) — same guidance as Desktop sidebar */}
            <div className="flex flex-col gap-2.5 w-full">
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl w-full">
                <span className="text-emerald-400 mt-0.5 text-base shrink-0">💡</span>
                <p className="text-[12px] text-emerald-100/70 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: ui.editorTip }} />
                </p>
              </div>
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl w-full">
                <span className="text-emerald-400 mt-0.5 text-base shrink-0">🪄</span>
                <p className="text-[12px] text-emerald-100/70 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: ui.versionToolsTip }} />
                </p>
              </div>
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl w-full">
                <span className="text-emerald-400 mt-0.5 text-base shrink-0">🏛️</span>
                <p className="text-[12px] text-emerald-100/70 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: ui.expertLibraryTip }} />
                </p>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="flex md:flex-col bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-1 overflow-x-auto md:overflow-visible scrollbar-none md:gap-1 w-full shadow-inner">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 text-center md:text-left py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 md:px-5 ${activeTab === "overview" ? "bg-zinc-900 text-emerald-400 border border-zinc-800/80 shadow-md shadow-black/40" : "text-zinc-400 hover:text-white border border-transparent"}`}
              >
                {locale === "en" ? "📈 Overview" : locale === "es" ? "📈 Resumen" : "📈 Prezentare"}
              </button>
              <button
                onClick={() => setActiveTab("budget")}
                className={`flex-1 text-center md:text-left py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 md:px-5 ${activeTab === "budget" ? "bg-zinc-900 text-emerald-400 border border-zinc-800/80 shadow-md shadow-black/40" : "text-zinc-400 hover:text-white border border-transparent"}`}
              >
                {locale === "en" ? "💰 Finance" : locale === "es" ? "💰 Finanzas" : "💰 Finanțe"}
              </button>
              <button
                onClick={() => setActiveTab("marketing")}
                className={`flex-1 text-center md:text-left py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 md:px-5 ${activeTab === "marketing" ? "bg-zinc-900 text-emerald-400 border border-zinc-800/80 shadow-md shadow-black/40" : "text-zinc-400 hover:text-white border border-transparent"}`}
              >
                {locale === "en" ? "📣 Marketing" : locale === "es" ? "📣 Marketing" : "📣 Promovare"}
              </button>
              <button
                onClick={() => setActiveTab("swot")}
                className={`flex-1 text-center md:text-left py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 md:px-5 ${activeTab === "swot" ? "bg-zinc-900 text-emerald-400 border border-zinc-800/80 shadow-md shadow-black/40" : "text-zinc-400 hover:text-white border border-transparent"}`}
              >
                {locale === "en" ? "📋 SWOT" : locale === "es" ? "📋 FODA" : "📋 SWOT"}
              </button>
            </div>
          </div>

          {/* Right Column (Content Box) - 8 cols */}
          <div className="w-full md:col-span-8 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-6 md:min-h-[550px]">
             
             {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Business Description" : locale === "es" ? "Descripción del Negocio" : "Descriere Afacere"}</h3>
                  <button
                    onClick={() => {
                      const isNew = result.viziune_strategie?.misiune_valori !== undefined;
                      setEditingField({
                        key: isNew ? "viziune_strategie.misiune_valori" : "descriere",
                        title: locale === "en" ? "Business Description" : locale === "es" ? "Descripción del Negocio" : "Descriere Afacere",
                        value: isNew ? (result.viziune_strategie?.misiune_valori || "") : (result.descriere || "")
                      });
                    }}
                    className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                  >
                    {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.viziune_strategie?.misiune_valori || result.descriere)}</p>
              </div>

              <div className="h-px bg-zinc-800/60"></div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Market Opportunity" : locale === "es" ? "Oportunidad de Mercado" : "Oportunitatea Pieței"}</h3>
                  <button
                    onClick={() => {
                      const isNew = result.analiza_pietei?.concurenta !== undefined;
                      setEditingField({
                        key: isNew ? "analiza_pietei.concurenta" : "oportunitate_piata",
                        title: locale === "en" ? "Market Opportunity" : locale === "es" ? "Oportunidad de Mercado" : "Oportunitatea Pieței",
                        value: isNew ? (result.analiza_pietei?.concurenta || "") : (result.oportunitate_piata || "")
                      });
                    }}
                    className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                  >
                    {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_pietei?.concurenta || result.oportunitate_piata)}</p>
              </div>

              <div className="h-px bg-zinc-800/60"></div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Target Audience" : locale === "es" ? "Público Objetivo" : "Publicul Țintă"}</h3>
                  <button
                    onClick={() => {
                      const isNew = result.analiza_pietei?.clienti_tinta !== undefined;
                      setEditingField({
                        key: isNew ? "analiza_pietei.clienti_tinta" : "public_tinta",
                        title: locale === "en" ? "Target Audience" : locale === "es" ? "Público Objetivo" : "Publicul Țintă",
                        value: isNew ? (result.analiza_pietei?.clienti_tinta || "") : (result.public_tinta || "")
                      });
                    }}
                    className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                  >
                    {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_pietei?.clienti_tinta || result.public_tinta)}</p>
              </div>

              {/* Secțiuni Adiționale (Librăria Experților) */}
              {result.sectiuni_aditionale?.map((sec: any, idx: number) => (
                <div key={idx} id={`custom-section-${idx}`} className="space-y-1 relative group animate-in fade-in duration-200">
                  <div className="h-px bg-zinc-800/60 my-4"></div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-emerald-400 font-bold text-sm">{sec.titlu}</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingField({ key: `sectiuni_aditionale.${idx}.continut`, title: sec.titlu, value: sec.continut || "" })}
                        className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                      >
                        {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                      </button>
                      <button
                        onClick={async () => {
                          const currentSecs = [...(result.sectiuni_aditionale || [])];
                          currentSecs.splice(idx, 1);
                          const updated = { ...result, sectiuni_aditionale: currentSecs };
                          setResult(updated);
                          const nextVersions = {
                            ...(versions && Object.keys(versions).length ? versions : { original: updated }),
                            [activeVersionId]: updated,
                          };
                          setVersions(nextVersions);
                          await syncCurrentPlanToFirestore(updated, nextVersions);
                          localStorage.setItem("current_generated_plan", JSON.stringify(updated));
                        }}
                        className="text-[11px] text-red-500 hover:text-red-450 font-semibold p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                      >
                        {locale === "en" ? "✕ Delete" : locale === "es" ? "✕ Eliminar" : "✕ Șterge"}
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(sec.continut)}</p>
                </div>
              ))}

              {/* Buton Adăugare Secțiune Expertă */}
              <div className="pt-4 border-t border-zinc-800/60 flex justify-center">
                <button
                  onClick={() => setShowExpertDrawer(true)}
                  className="w-full bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98] text-center"
                >
                  ➕ {locale === "en" ? "Add Expert Section" : locale === "es" ? "Añadir Sección Experta" : "Adaugă Secțiune Expertă"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Initial Investment Budget" : locale === "es" ? "Presupuesto Inicial de Inversión" : "Buget Inițial de Investiții"}</h3>
                  <button
                    onClick={() => {
                      if (hasProAccess) {
                        handleAiEdit("optimize_budget");
                      } else {
                        setShowPricingModal(true);
                      }
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded font-black uppercase transition-all ${
                      hasProAccess
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                        : "bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                    }`}
                  >
                    {hasProAccess
                      ? (locale === "en" ? "Optimize Budget with Assistant" : locale === "es" ? "Optimizar Presupuesto con Asistente" : "Optimizează Buget Asistat")
                      : (locale === "en" ? "🔒 Optimize Budget with Assistant" : locale === "es" ? "🔒 Optimizar Presupuesto con Asistente" : "🔒 Optimizați Buget Asistat")
                    }
                  </button>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'];
                    const sortedBudget = [...(result.plan_financiar?.buget_investitii || [])]
                      .map((item) => {
                        const costText = item.cost !== undefined ? item.cost : item.suma_lei;
                        const cost = parseInt(costText?.toString().replace(/[^0-9]/g, '') || '0');
                        return { ...item, costVal: cost };
                      })
                      .filter(item => item.costVal > 0)
                      .sort((a, b) => b.costVal - a.costVal);

                    return sortedBudget.map((item: any, idx: number) => {
                      const label = item.item || item.categorie || '';
                      const price = item.cost !== undefined ? item.cost : item.suma_lei;
                      const planCurrency = result.selectedCurrency || (locale === "ro" ? "LEI" : "EUR");
                      const bulletColor = COLORS[idx % COLORS.length];

                      return (
                        <div key={idx} className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-3 flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-[3px] shrink-0" style={{ backgroundColor: bulletColor }} />
                            <span>{label}</span>
                          </span>
                          <span className="font-black text-emerald-400">
                            {typeof price === 'number' ? price.toLocaleString() : String(price)} {(!price?.toString().toLowerCase().includes('lei') && !price?.toString().toLowerCase().includes('eur')) ? planCurrency : ""}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Chart Container */}
              <div className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 flex flex-col items-center justify-center">
                <h4 className="text-[10px] font-bold text-zinc-400 mb-4 uppercase">{locale === "en" ? "Funds Distribution" : locale === "es" ? "Distribución de Fondos" : "Distribuția Fondurilor"}</h4>
                <div className="w-full h-[280px] sm:h-[350px] flex items-center justify-center">
                      <BudgetPieChart budget={result.plan_financiar?.buget_investitii || []} currency={result.selectedCurrency || (locale === "ro" ? "LEI" : "EUR")} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "marketing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Promotion & Strategy" : locale === "es" ? "Promoción y Estrategia" : "Promovare & Strategie"}</h3>
                  {result.analiza_pietei?.strategie_marketing !== undefined && (
                    <button
                      onClick={() => setEditingField({
                        key: "analiza_pietei.strategie_marketing",
                        title: locale === "en" ? "Marketing Strategy" : locale === "es" ? "Estrategia de Marketing" : "Strategia de Marketing",
                        value: result.analiza_pietei?.strategie_marketing || ""
                      })}
                      className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                    </button>
                  )}
                </div>
                {result.analiza_pietei?.strategie_marketing !== undefined ? (
                  <div className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4">
                    <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_pietei.strategie_marketing)}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.strategie_marketing?.canale_promovare?.map((canal: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 space-y-1 relative">
                        <h4 className="font-bold text-zinc-200 text-xs">{canal.nume}</h4>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">{canal.detalii}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tone Editor inside Studio */}
              <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-200">{locale === "en" ? "Customize Presentation Tone" : locale === "es" ? "Personalizar el Tono de la Presentación" : "Personalizează Tonul Prezentării"}</h4>
                  <p className="text-[10px] text-zinc-400">{locale === "en" ? "Automatically change the tone of the saved plan using Assistant." : locale === "es" ? "Cambia automáticamente el tono del plan guardado usando Asistente." : "Schimbă automat tonul planului salvat folosind asistentul."}</p>
                </div>
                <ToneEditor
                  user={user}
                  locale={locale}
                  hasStandardAccess={isStudioPaid}
                  hasProAccess={hasProAccess}
                  isAdmin={isAdmin}
                  isEditingAi={isEditingAi}
                  setShowAuthModal={() => router.push(locale === "en" ? "/en/login" : locale === "es" ? "/es/login" : "/login")}
                  setShowPricingModal={setShowPricingModal}
                  handleAiEdit={handleAiEdit}
                />
              </div>
            </div>
          )}

          {activeTab === "swot" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "SWOT Analysis" : locale === "es" ? "Análisis FODA" : "Analiza SWOT"}</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-emerald-950/10 border border-emerald-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase">{locale === "en" ? "💪 Strengths" : locale === "es" ? "💪 Fortalezas" : "💪 Puncte Forte"}</span>
                    <button
                      onClick={() => {
                        const isNew = result.analiza_swot?.puncte_tari !== undefined;
                        setEditingField({
                          key: isNew ? "analiza_swot.puncte_tari" : "analiza_swot.puncte_forte",
                          title: locale === "en" ? "Strengths" : locale === "es" ? "Fortalezas" : "Puncte Forte (Strengths)",
                          value: getSwotString(result.analiza_swot?.puncte_tari || result.analiza_swot?.puncte_forte)
                        });
                      }}
                      className="text-[10px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                    </button>
                  </div>
                  {renderSwotCategory(result.analiza_swot?.puncte_tari || result.analiza_swot?.puncte_forte)}
                </div>
                
                <div className="bg-rose-950/10 border border-rose-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-rose-400 font-black tracking-wider uppercase">{locale === "en" ? "⚠️ Weaknesses" : locale === "es" ? "⚠️ Debilidades" : "⚠️ Puncte Slabe"}</span>
                    <button
                      onClick={() => setEditingField({
                        key: "analiza_swot.puncte_slabe",
                        title: locale === "en" ? "Weaknesses" : locale === "es" ? "Debilidades" : "Puncte Slabe (Weaknesses)",
                        value: getSwotString(result.analiza_swot?.puncte_slabe)
                      })}
                      className="text-[10px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                    </button>
                  </div>
                  {renderSwotCategory(result.analiza_swot?.puncte_slabe)}
                </div>

                <div className="bg-blue-950/10 border border-blue-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-blue-400 font-black tracking-wider uppercase">{locale === "en" ? "🚀 Opportunities" : locale === "es" ? "🚀 Oportunidades" : "🚀 Oportunități"}</span>
                    <button
                      onClick={() => setEditingField({
                        key: "analiza_swot.oportunitati",
                        title: locale === "en" ? "Opportunities" : locale === "es" ? "Oportunidades" : "Oportunități (Opportunities)",
                        value: getSwotString(result.analiza_swot?.oportunitati)
                      })}
                      className="text-[10px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                    </button>
                  </div>
                  {renderSwotCategory(result.analiza_swot?.oportunitati)}
                </div>

                <div className="bg-amber-950/10 border border-amber-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-amber-400 font-black tracking-wider uppercase">{locale === "en" ? "☠️ Threats" : locale === "es" ? "☠️ Amenazas" : "☠️ Amenințări"}</span>
                    <button
                      onClick={() => setEditingField({
                        key: "analiza_swot.amenintari",
                        title: locale === "en" ? "Threats" : locale === "es" ? "Amenazas" : "Amenințări (Threats)",
                        value: getSwotString(result.analiza_swot?.amenintari)
                      })}
                      className="text-[10px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                    </button>
                  </div>
                  {renderSwotCategory(result.analiza_swot?.amenintari)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </main>

      {/* Manual Text Editor Bottom-Sheet Drawer */}
      {editingField && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end">
          {/* Backdrop Touch Close */}
          <div className="flex-1" onClick={() => setEditingField(null)}></div>
          
          {/* Drawer Sheet */}
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-300 flex flex-col w-full md:max-w-lg md:mx-auto md:left-1/2 md:-translate-x-1/2 md:right-auto">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <h4 className="text-sm font-black text-white">{editingField.title}</h4>
              <button onClick={() => setEditingField(null)} className="text-xs text-zinc-500 font-bold p-1">{locale === "en" ? "Close" : locale === "es" ? "Cerrar" : "Închide"}</button>
            </div>
            
            <textarea
              value={editingField.value}
              onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
              placeholder={locale === "en" ? "Enter the section content here..." : locale === "es" ? "Introduce el contenido de la sección aquí..." : "Introdu conținutul secțiunii aici..."}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl p-4 text-xs text-white placeholder-zinc-500 h-44 outline-none resize-none transition-all flex-1"
            />
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-center"
              >
                {locale === "en" ? "Cancel" : locale === "es" ? "Cancelar" : "Renunță"}
              </button>
              <button
                onClick={handleManualSave}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-center"
              >
                {locale === "en" ? "Save Changes" : locale === "es" ? "Guardar Cambios" : "Salvează Modificările"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Guard Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm space-y-6 relative text-center">
            <button
              onClick={() => {
                setShowVerificationModal(false);
                router.push(isEn ? "/en/dashboard" : isEs ? "/es/dashboard" : "/dashboard");
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold p-1 text-sm"
            >
              ✕
            </button>
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              ✉️
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black">{locale === "en" ? "Verify your email address" : locale === "es" ? "Verifica tu dirección de correo electrónico" : "Confirmă adresa de email"}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {locale === "en" 
                  ? "We have sent a verification link to your email. Please activate your account to use the Studio." 
                  : locale === "es"
                  ? "Hemos enviado un enlace de verificación a tu correo. Por favor, activa tu cuenta para usar el Studio."
                  : "Ți-am trimis un link de verificare pe adresa ta. Te rugăm să activezi contul pentru a putea folosi Studio."}
              </p>
            </div>

            {verificationSent && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2 px-3 rounded-lg font-semibold">
                {locale === "en" ? "The activation link has been resent successfully!" : locale === "es" ? "¡El enlace de activación ha sido reenviado con éxito!" : "Link-ul de activare a fost retrimis cu succes!"}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleResendVerification}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-95"
              >
                {locale === "en" ? "Resend Activation Email" : locale === "es" ? "Reenviar Correo de Activación" : "Retrimite Email de Activare"}
              </button>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  router.push(isEn ? "/en/dashboard" : isEs ? "/es/dashboard" : "/dashboard");
                }}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl text-xs transition-all active:scale-95"
              >
                {locale === "en" ? "Go to Dashboard" : locale === "es" ? "Ir al Panel" : "Mergi la Dashboard"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSuccess={(tier) => {
          setShowPricingModal(false);
          setPromoCodeUnlocked(true);
          if (tier === "full-access") {
            setSubscriptionActive(true);
            setEuFundsUnlocked(true);
          } else if (tier === "eu-funds") {
            setEuFundsUnlocked(true);
          } else if (tier === "standard") {
            setStandardPackageActive(true);
          }
          alert(locale === "en" ? "Payment simulated successfully! Premium access is now unlocked." : locale === "es" ? "¡Pago simulado con éxito! El acceso premium ya está desbloqueado." : "Plată simulată cu succes! Accesul premium este acum deblocat.");
        }}
        onRequireLogin={() => {
          setShowPricingModal(false);
          router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
        }}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        currency={locale === "es" || locale === "en" ? "EUR" : "LEI"}
        planName={result?.nume || (locale === "en" ? "Business Plan" : locale === "es" ? "Plan de Negocios" : "Plan de Afaceri")}
        planId={result?.id}
        locale={locale}
      />

      {/* Meniu Exporturi Bottom-Sheet */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end">
          {/* Backdrop Touch Close */}
          <div className="flex-1" onClick={() => setShowExportModal(false)}></div>
          
          {/* Drawer Sheet */}
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300 flex flex-col w-full md:max-w-lg md:mx-auto md:left-1/2 md:-translate-x-1/2 md:right-auto">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <h4 className="text-sm font-black text-white">{locale === "en" ? "Export Options" : locale === "es" ? "Opciones de Exportación" : "Opțiuni de Exportare"}</h4>
              <button onClick={() => setShowExportModal(false)} className="text-xs text-zinc-500 font-bold p-1">{locale === "en" ? "Close" : locale === "es" ? "Cerrar" : "Închide"}</button>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* PDF Sumar Gratuit (Always Available) */}
              <button
                onClick={() => {
                  downloadAction("pdf-summary");
                  setShowExportModal(false);
                }}
                disabled={isDownloading !== null}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-left px-4 flex justify-between items-center"
              >
                <span>📄 {locale === "en" ? "Free PDF Summary" : locale === "es" ? "Resumen PDF Gratis" : "Sumar PDF Gratuit"}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">{locale === "en" ? "Free" : locale === "es" ? "Gratis" : "Gratuit"}</span>
              </button>

              {/* Word (DOCX) Premium */}
              <button
                onClick={() => {
                  downloadAction("word");
                  setShowExportModal(false);
                }}
                disabled={isDownloading !== null}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-left px-4 flex justify-between items-center"
              >
                <span>📝 {locale === "en" ? "Word Document (.docx)" : locale === "es" ? "Documento Word (.docx)" : "Document Word (.docx)"}</span>
                {!isStudioPaid && !isPlanPaid && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black uppercase">🔒 PRO</span>}
              </button>

              {/* PowerPoint (PPTX) Premium */}
              <button
                onClick={() => {
                  downloadAction("pptx");
                  setShowExportModal(false);
                }}
                disabled={isDownloading !== null}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-left px-4 flex justify-between items-center"
              >
                <span>📊 {locale === "en" ? "PowerPoint Presentation (.pptx)" : locale === "es" ? "Presentación PowerPoint (.pptx)" : "Prezentare PowerPoint (.pptx)"}</span>
                {!isStudioPaid && !isPlanPaid && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black uppercase">🔒 PRO</span>}
              </button>

              {/* PDF Complet Premium */}
              <button
                onClick={() => {
                  downloadAction("pdf");
                  setShowExportModal(false);
                }}
                disabled={isDownloading !== null}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-left px-4 flex justify-between items-center"
              >
                <span>📕 {locale === "en" ? "Full PDF Document" : locale === "es" ? "Documento PDF Completo" : "Document PDF Complet"}</span>
                {!isStudioPaid && !isPlanPaid && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black uppercase">🔒 PRO</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Librăria de Secțiuni Experte Mobil */}
      {showExpertDrawer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end">
          {/* Backdrop Touch Close */}
          <div className="flex-1" onClick={() => setShowExpertDrawer(false)}></div>
          
          {/* Drawer Sheet */}
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-300 flex flex-col w-full md:max-w-lg md:mx-auto md:left-1/2 md:-translate-x-1/2 md:right-auto">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <h4 className="text-sm font-black text-white">{locale === "en" ? "Expert Modules Library" : locale === "es" ? "Librería de Módulos Expertos" : "Librăria de Secțiuni Experte"}</h4>
              <button onClick={() => setShowExpertDrawer(false)} className="text-xs text-zinc-500 font-bold p-1">{locale === "en" ? "Close" : locale === "es" ? "Cerrar" : "Închide"}</button>
            </div>
            
            {/* Category horizontal scroll bar */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x px-1">
              <button
                onClick={() => setSelectedExpertCategory("all")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold snap-start transition-all ${selectedExpertCategory === "all" ? "bg-emerald-600 text-white" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
              >
                {expertModulesAllFilterLabel(locale)}
              </button>
              {Array.from(new Set(EXPERT_TEMPLATES.map(t => t.category[locale] || t.category.ro))).map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedExpertCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold snap-start transition-all ${selectedExpertCategory === cat ? "bg-emerald-600 text-white" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of templates */}
            <div className="flex flex-col gap-3 overflow-y-auto flex-grow max-h-[50vh] pr-1 scrollbar-none">
              {EXPERT_TEMPLATES.filter(tpl => selectedExpertCategory === "all" || (tpl.category[locale] || tpl.category.ro) === selectedExpertCategory).map((tpl) => {
                const canAddExpert = hasProAccess || isAdmin;
                return (
                  <div 
                    key={tpl.id}
                    className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 inline-block mb-1.5">
                        {tpl.category[locale] || tpl.category.ro}
                      </span>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        {tpl.title[locale] || tpl.title.ro}
                      </h5>
                      <p className="text-[10px] text-zinc-400 leading-normal mt-1">
                        {tpl.desc[locale] || tpl.desc.ro}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!user) {
                          setShowExpertDrawer(false);
                          setShowPricingModal(true);
                          return;
                        }
                        if (!canAddExpert) {
                          setShowExpertDrawer(false);
                          setShowPricingModal(true);
                          return;
                        }
                        const businessName = result?.nume || (locale === "en" ? "Your Business" : locale === "es" ? "Tu Empresa" : "Compania Ta");
                        const rawContent = tpl.content[locale] || tpl.content.ro;
                        const formattedContent = rawContent.replace(/{NUME_AFACERE}/g, businessName);

                        const newSection = {
                          titlu: tpl.title[locale] || tpl.title.ro,
                          continut: formattedContent
                        };

                        const currentSecs = result?.sectiuni_aditionale || [];
                        const newIndex = currentSecs.length;
                        const updated = {
                          ...result,
                          sectiuni_aditionale: [...currentSecs, newSection]
                        };

                        setResult(updated);
                        localStorage.setItem("current_generated_plan", JSON.stringify(updated));
                        
                        const nextVersions = {
                          ...(versions && Object.keys(versions).length ? versions : { original: updated }),
                          [activeVersionId]: updated,
                        };
                        setVersions(nextVersions);
                        await syncCurrentPlanToFirestore(updated, nextVersions);
                        setShowExpertDrawer(false);
                        
                        setTimeout(() => {
                          const el = document.getElementById(`custom-section-${newIndex}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 300);
                      }}
                      className={`w-full py-2.5 rounded-lg text-[11px] font-bold text-center transition-all active:scale-[0.98] ${
                        canAddExpert 
                          ? "bg-emerald-600 text-white" 
                          : "bg-zinc-800 border border-zinc-700 text-zinc-300"
                      }`}
                    >
                      {canAddExpert 
                        ? (locale === "en" ? "Add Section" : locale === "es" ? "Añadir Sección" : "Adaugă Secțiunea") 
                        : (locale === "en" ? "🔒 Add Section (PRO)" : locale === "es" ? "🔒 Añadir (PRO)" : "🔒 Adaugă (PRO)")
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {result && (
        <div className="fixed top-[-9999px] left-[-9999px] w-[1280px] opacity-0 pointer-events-none z-[-50]">
          <StudioPdfSlides 
            result={result} 
            ui={ui} 
            locale={locale} 
            currency={result?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR")}
            formatPrice={(val: any) => formatPriceLocalized(val, locale, result?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR"), fxRate)} 
            truncateText={truncateText} 
            splitTextIntoSlides={splitTextIntoSlides} 
            formatNumberedText={formatNumberedText} 
          />
        </div>
      )}

      {/* Hidden chart for Word export (same as Desktop) */}
      {result && (
        <div
          className="fixed left-[-9999px] top-0 pointer-events-none z-[-1] w-[800px] h-[400px] bg-white flex flex-col items-center justify-center"
          id="docx-export-chart-hidden"
        >
          <BudgetPieChart
            budget={result?.plan_financiar?.buget_investitii}
            currency={result?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR")}
            isPdf={true}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
