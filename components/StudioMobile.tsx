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
import { MobileHeaderMenu } from '@/components/MobileHeaderMenu';
import BuyMeACoffeeModal from '@/components/BuyMeACoffeeModal';
import { useStudioFirebaseSync } from '@/hooks/useStudioFirebaseSync';
import { ToneEditor } from '@/components/ToneEditor';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/translations';
import { UI_STRINGS } from '@/lib/uiStrings';
import { buildGenerateRequestBody } from '@/lib/generateRequest';
import { createAndCopySharedPlanLink } from '@/lib/sharePlan';
import { StudioMobileGenerateHint } from '@/components/StudioMobileGenerateHint';
import { getExamples } from '@/lib/examples';
import { FREE_ACCOUNT_PLAN_LIMIT, hasUnlimitedGenerateAccess, clearLocalPlanState } from '@/lib/planQuota';
import {
  persistCurrentVersions,
  notifyVersionPersistFailed,
} from '@/lib/persistVersionMap';
import { canGenerateWithQuotas, readProPackRemaining, proPackTopupConfirmDialog, notifyProPackQuotaBlocked } from '@/lib/proPackQuota';
import { startProTopupCheckout } from '@/lib/proTopupCheckout';
import { ProPackQuotaBar } from '@/components/ProPackQuotaBar';
import { isAdminEmail } from '@/lib/adminEmails';
import { isPlanExportUnlocked, hasAccountStandardAccess } from '@/lib/planUnlock';
import { stripPaymentSuccessParams, pollVerifyCheckout, paymentSuccessMessage } from '@/lib/paymentReturn';
import dynamic from 'next/dynamic';
import { useExportActions } from "@/hooks/useExportActions";
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCompleteMissingPlanFields } from "@/hooks/useCompleteMissingPlanFields";
import { useSharedPlanLoader } from "@/hooks/useSharedPlanLoader";
import { resolveLoadedStudioPlan, exportActiveTabDisplayLabel } from "@/lib/studioActiveVersion";
import { StudioPdfSlides } from "@/components/pdf/StudioPdfSlides";
import { truncateText, splitTextIntoSlides } from "@/lib/planHelpers";
import { formatPriceLocalized } from "@/lib/priceHelper";
import { normalizePlanCurrency } from "@/lib/planCurrency";
import { formatObjectNumbers, formatNumberedText } from "@/lib/utils";
import { canUseFreeToneEdit, consumeFreeToneEdit, isFreeToneKey, isProToneKey, toneVersionKey } from "@/lib/toneQuota";
import {
  buildStackedVersionKey,
  formatVersionTabTitle,
  gateVersionStackAppend,
  noCombineAccessMessage,
  resolveEditBaseForToolRun,
  stackLimitReachedMessage,
  toolStepFromAction,
  withVersionStack,
  toneOnlyFromOriginalMessage,
  applyExpertLibrarySection,
  type VersionStackAccess,
} from "@/lib/versionStack";

import { MobileProToolsPanel, type MobileAiPrompt } from '@/components/tools/MobileProToolsPanel';
import { ExpertSectionsDrawer } from '@/components/modals/ExpertSectionsDrawer';

const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });

export default function StudioMobile({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const ui = UI_STRINGS[locale];
  const isEn = locale === "en";
  const isEs = locale === "es";
  const router = useRouter();
  const [isSharedView, setIsSharedView] = useState(false);
  const [resultState, setResultState] = useState<any>(null);
  const [versions, setVersionsState] = useState<any>({});
  const activeVersionIdRef = useRef<string>("original");
  const [activeVersionId, _setActiveVersionId] = useState<string>("original");

  const setActiveVersionId = (id: string) => {
    activeVersionIdRef.current = id;
    _setActiveVersionId(id);
  };

  const setVersions = (valOrFn: any) => {
    setVersionsState((prev: any) => {
      const nextVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      const persisted = persistCurrentVersions(nextVal, activeVersionIdRef.current);
      if (!persisted.ok && persisted.quotaExceeded) {
        const msg =
          (UI_STRINGS[locale] || UI_STRINGS.ro).versionPersistFailed;
        queueMicrotask(() => notifyVersionPersistFailed(msg));
      }
      return nextVal;
    });
  };

  /** Keep versions[active] in sync (auto-fill + edits) — same as Studio Desktop / Demo Mobile. */
  const setResult = (valOrFn: any) => {
    setResultState((prev: any) => {
      const nextVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (nextVal === null) {
        setVersions({});
        setActiveVersionId("original");
      } else {
        setVersions((prevVers: any) => ({
          ...prevVers,
          [activeVersionIdRef.current]: nextVal,
        }));
      }
      return nextVal;
    });
  };

  const result = resultState;
  useCompleteMissingPlanFields(result, setResult, locale);

  const { isCheckingShared, shareError } = useSharedPlanLoader({
    pageLocale: locale,
    onLoaded: (plan) => {
      const { versions: v, activeVersionId: a, displayResult } = resolveLoadedStudioPlan(plan);
      setVersionsState(v);
      setActiveVersionId(a);
      setResultState(displayResult);
      try {
        localStorage.setItem("current_generated_plan", JSON.stringify(displayResult));
        persistCurrentVersions(v, a);
      } catch {
        /* ignore */
      }
    },
    onSharedView: () => setIsSharedView(true),
    resetDemoCounters: false,
  });
  
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "marketing" | "swot">("overview");
  const [loading, setLoading] = useState(false);
  const [fxRate, setFxRate] = useState(0.201);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showBmcModal, setShowBmcModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | 'pptx' | 'pdf-summary' | null>(null);
  
  const [topupLoading, setTopupLoading] = useState(false);

  const handleProTopupCheckout = async () => {
    if (!user) {
      router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
      return;
    }
    setTopupLoading(true);
    const result = await startProTopupCheckout({
      getIdToken: () => user.getIdToken(),
      email: user.email,
      locale,
      returnPath: "/studio",
    });
    if (!result.ok) {
      alert(result.error);
      setTopupLoading(false);
      return;
    }
    window.location.href = result.url;
  };

  const openUpgradeForPackOrPricing = (kind: "generate" | "edit" | "combine" = "generate") => {
    if (hasProPackQuota) {
      if (!proPackTopupConfirmDialog(locale, kind)) return;
      void handleProTopupCheckout();
      return;
    }
    setShowPricingModal(true);
  };
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
        selectedCurrency: updatedResult?.selectedCurrency || (locale === "ro" ? "RON" : "EUR"),
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

  // === Auth & Entitlements — gestionate centralizat de useAuthUser ===
  const {
    user, isAuthLoading,
    credits, euFundsUnlocked, subscriptionActive, proPackRemaining,
    lifetimePlanCount, unlockedPlans, unlockedPlanIds, promoCodeUnlocked,
    isPaid, standardPackageActive,
    isAdmin, hasStandardAccess, hasProAccess, hasProPackQuota, versionStackAccess,
  } = useAuthUser(locale, {
    onUserChanged: (currentUser) => {
      if (!currentUser) {
        router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
        return;
      }
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        if (!sp.get("sharedId") && !sp.get("shareId")) setIsSharedView(false);
      }
      if (!currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
        setShowVerificationModal(true);
      }
    },
    createUserDocIfMissing: true,
  });
  // Derivate locale (depind de result, rămân în componentă)
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
  const isStudioPaid = hasStandardAccess;
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [showExpertDrawer, setShowExpertDrawer] = useState(false);
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

  // Prevenire reîncărcare accidentală când există plan activ pe mobil (Pull-to-Refresh guard)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (result && !isSharedView && !isDownloading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [result, isSharedView, isDownloading]);

  // Ascultă evenimentul de back/forward (popstate) pentru sincronizare gesturi pe mobil
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const isIdea = searchParams.get('view') === 'idea' || searchParams.has('sharedId') || searchParams.has('shareId');
      
      if (isIdea) {
        setResult((prevResult: any) => {
          if (!prevResult) {
            const savedVersionsStr = localStorage.getItem("current_versions");
            if (savedVersionsStr) {
              try {
                const { versions: v, activeVersionId: a } = JSON.parse(savedVersionsStr);
                setVersions(v);
                setActiveVersionId(a);
                return v[a];
              } catch (e) {
                console.error(e);
              }
            }
            const saved = localStorage.getItem("current_generated_plan");
            if (saved && saved !== "null" && saved !== "undefined") {
              try {
                const parsed = formatObjectNumbers(JSON.parse(saved));
                setVersions({ original: parsed });
                setActiveVersionId("original");
                return parsed;
              } catch (e) {
                console.error(e);
              }
            }
            return null;
          }
          return prevResult;
        });
      }

      if (user && !searchParams.has("sharedId") && !searchParams.has("shareId")) {
        setIsSharedView(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Editare Manuală Drawer
  const [editingField, setEditingField] = useState<{key: string, title: string, value: string} | null>(null);
  const [editingBudgetItem, setEditingBudgetItem] = useState<{ index: number | 'new'; item: string; cost: string } | null>(null);

  const handleSaveBudgetItem = async () => {
    if (!editingBudgetItem || !editingBudgetItem.item.trim()) return;
    const currentBudget = [...(result?.plan_financiar?.buget_investitii || [])];
    const costNum = parseInt(editingBudgetItem.cost.toString().replace(/[^0-9]/g, '') || '0', 10);

    if (editingBudgetItem.index === 'new') {
      currentBudget.push({
        item: editingBudgetItem.item.trim(),
        cost: costNum,
        categorie: editingBudgetItem.item.trim(),
        suma_lei: costNum,
      });
    } else {
      const idx = editingBudgetItem.index;
      currentBudget[idx] = {
        ...currentBudget[idx],
        item: editingBudgetItem.item.trim(),
        cost: costNum,
        categorie: editingBudgetItem.item.trim(),
        suma_lei: costNum,
      };
    }

    const updated = {
      ...result,
      plan_financiar: {
        ...(result?.plan_financiar || {}),
        buget_investitii: currentBudget,
      },
    };

    setResult(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("current_generated_plan", JSON.stringify(updated));
    }
    const nextVersions = {
      ...(versions && Object.keys(versions).length ? versions : { original: updated }),
      [activeVersionId]: updated,
    };
    setVersions(nextVersions);
    await syncCurrentPlanToFirestore(updated, nextVersions);
    setEditingBudgetItem(null);
  };

  const handleDeleteBudgetItem = async (idx: number) => {
    const currentBudget = [...(result?.plan_financiar?.buget_investitii || [])];
    currentBudget.splice(idx, 1);
    const updated = {
      ...result,
      plan_financiar: {
        ...(result?.plan_financiar || {}),
        buget_investitii: currentBudget,
      },
    };

    setResult(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("current_generated_plan", JSON.stringify(updated));
    }
    const nextVersions = {
      ...(versions && Object.keys(versions).length ? versions : { original: updated }),
      [activeVersionId]: updated,
    };
    setVersions(nextVersions);
    await syncCurrentPlanToFirestore(updated, nextVersions);
  };

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
      // setResultState (nu setResult) — versions e deja setat de hook; evită race pe mapă
      setResultState(data);
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
    if (typeof window === "undefined" || !user) return;
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("payment_success") === "true";
    const tier = urlParams.get("tier");
    if (!paymentSuccess) return;
    (async () => {
      try {
        const ok = await pollVerifyCheckout({
          getIdToken: () => user.getIdToken(),
          tier,
        });
        if (ok) {
          alert(paymentSuccessMessage(tier, locale, result?.nume || undefined));
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

    const usesPackQuota = !!(euFundsUnlocked && !subscriptionActive && !isAdmin);
    const isProTone = isTone && isProToneKey(customInput);
    if (usesPackQuota && ((!isTone && proPackRemaining.edit <= 0) || (isProTone && proPackRemaining.edit <= 0))) {
      notifyProPackQuotaBlocked(locale, "edit", proPackRemaining, activeVersionId);
      openUpgradeForPackOrPricing("edit");
      return;
    }

    let targetSection = "";
    let budgetPercent: number | null = null;
    if (action === "optimize_budget") {
      let entered = customInput?.trim() || "";
      if (!entered) {
        const promptMsg = ui.budgetReducePrompt;
        entered = (typeof window !== "undefined" ? window.prompt(promptMsg, "20") : null) || "";
      }
      if (!entered) return;
      const percent = parseInt(entered.replace(/%/g, "").trim(), 10);
      if (isNaN(percent) || percent <= 0 || percent > 90) {
        alert(ui.alertValidPercentRange);
        return;
      }
      budgetPercent = percent;
      targetSection = String(percent);
    }

    setActiveAiPrompt(null);
    setAiPromptInput("");

    // Tone → always from Original (never tone-on-tone)
    const { isCombine, baseSource, currentStack } = resolveEditBaseForToolRun({
      activeVersionId,
      versions,
      result,
      combineOptions: options,
      forceSiblingFromOriginal: isTone,
    });

    if (usesPackQuota && isCombine && proPackRemaining.combine <= 0) {
      notifyProPackQuotaBlocked(locale, "combine", proPackRemaining, activeVersionId);
      openUpgradeForPackOrPricing("combine");
      return;
    }

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
        if (gate.reason === "invalid" && nextStep.type === "tone") {
          alert(toneOnlyFromOriginalMessage(locale));
          return;
        }
        return;
      }
      nextStack = gate.nextStack;
    }

    if (!user) {
      router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
      return;
    }

    setIsEditingAi(true);

    try {
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
          currency: baseSource?.selectedCurrency || (locale === "ro" ? "RON" : "EUR"),
          isCombine,
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err?.code === "AUTH_REQUIRED") {
          router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
        } else if (
          err?.code === "TONE_LIMIT" ||
          err?.code === "PRO_REQUIRED"
        ) {
          setShowPricingModal(true);
        } else if (err?.code === "PRO_PACK_EDIT_LIMIT") {
          openUpgradeForPackOrPricing("edit");
        } else if (err?.code === "PRO_PACK_COMBINE_LIMIT") {
          openUpgradeForPackOrPricing("combine");
        }
        throw new Error(err?.error || "Eroare la editare");
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
      alert(ui.errorEditProcessFailed);
    } finally {
      setIsEditingAi(false);
    }
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
      router.push(ui.routes.login);
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
    currency: result?.selectedCurrency || (locale === "ro" ? "RON" : "EUR"),
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
    activeVersionId,
    versions,
    onPlanUnlockedByCredit: () => {
      // Firestore onSnapshot în useAuthUser actualizează automat unlockedPlans/unlockedPlanIds
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
      if (
        !isAdmin &&
        !canGenerateWithQuotas({
          isPaid,
          subscriptionActive,
          lifetimePlanCount,
          proPackGenerateRemaining: proPackRemaining.generate,
          freeLimit: FREE_ACCOUNT_PLAN_LIMIT,
        })
      ) {
        openUpgradeForPackOrPricing("generate");
        return;
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
        body: JSON.stringify(
          buildGenerateRequestBody({
            skill,
            locale,
            surface: "studio",
          })
        ),
      });

      const resText = await res.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch {
        throw new Error(ui.errorGenerationFallback);
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
            const accountPaid = hasUnlimitedGenerateAccess({
              isPaid,
              subscriptionActive,
            });
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
            selectedCurrency: locale === "ro" ? "RON" : "EUR",
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
      alert(error.message || ui.errorGenerationFallback);
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

  if (isCheckingShared) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-sm">{ui.studioLoadingWorkspace}</p>
      </div>
    );
  }

  if (!result) {
    if (shareError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 max-w-sm">
            <p className="text-amber-200 font-bold text-sm">{ui.sharedPlanNotFound}</p>
            <p className="text-zinc-400 text-xs mt-1">{ui.sharedPlanNotFoundHint}</p>
          </div>
          <Link
            href={isEn ? "/en/studio" : isEs ? "/es/studio" : "/studio"}
            className="text-emerald-400 text-sm font-bold underline"
          >
            {ui.studioBackToStudio}
          </Link>
        </div>
      );
    }

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
          <span>{ui.dashboardShort}</span>
        </Link>
        <span className="text-sm font-black">{ui.studioMobileBadge}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="bg-zinc-800 text-white font-bold p-2 rounded-lg text-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={ui.shareBtn}
          >
            🔗
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 min-h-[44px]"
          >
            <span>{ui.exportBtn}</span>
            <span>📥</span>
          </button>
          <MobileHeaderMenu
            locale={locale}
            user={user}
            isAdmin={isAdmin}
            hasProAccess={hasProAccess}
            hasStandardAccess={hasStandardAccess}
            subscriptionActive={subscriptionActive}
            onOpenCoffee={() => setShowBmcModal(true)}
            onOpenPricing={() => setShowPricingModal(true)}
            onRequireLogin={() => router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login")}
            onLogout={async () => {
              clearLocalPlanState();
              await signOut(auth);
            }}
          />
        </div>
      </header>

      {hasProPackQuota && (
        <ProPackQuotaBar
          locale={locale}
          remaining={proPackRemaining}
          topupLoading={topupLoading}
          onTopup={() => void handleProTopupCheckout()}
          layout="bar"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        
        {showShareSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center py-2 rounded-lg animate-pulse font-bold">
            {ui.shareCopied}
          </div>
        )}

        {/* Studio Info Card — title full-width above actions */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-md">
          <div className="w-full min-w-0 space-y-1.5">
            <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase inline-block">
              {ui.editingStudio}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white leading-snug break-words w-full">
              {result.nume || ui.businessPlan}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setVersions({});
                setActiveVersionId("original");
                setIsSharedView(false);
                setSkill("");
                if (typeof window !== "undefined") {
                  localStorage.removeItem("current_generated_plan");
                  localStorage.removeItem("current_versions");
                  const path = window.location.pathname;
                  window.history.replaceState({}, document.title, path);
                }
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] min-h-[44px] whitespace-nowrap"
            >
              {ui.anotherIdea}
            </button>
            <button
              onClick={() => setShowPricingModal(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 min-h-[44px] ml-auto"
            >
              {ui.pricing}
            </button>
          </div>
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
                    <span>📜 {ui.versionHistory} ({Object.keys(versions).length})</span>
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
                      <span>{ui.savedVersions}</span>
                      <button type="button" onClick={() => setShowVersionDropdown(false)} className="text-zinc-500 hover:text-white text-xs min-w-[44px] min-h-[44px]">✕</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto flex flex-col gap-1 mt-1">
                      {Object.entries(versions).map(([vKey, vData]) => (
                        <button
                          key={vKey}
                          type="button"
                          onClick={() => {
                            setActiveVersionId(vKey);
                            setResult(vData);
                            setShowVersionDropdown(false);
                            void syncCurrentPlanToFirestore(vData, versions, vKey);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${activeVersionId === vKey ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                        >
                          <span className="truncate pr-2">
                            {formatVersionTabTitle(vKey, vData, locale, ui)}
                          </span>
                          {activeVersionId === vKey && <span className="text-emerald-400 text-xs shrink-0">✓</span>}
                        </button>
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
              {hasProPackQuota && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 p-3.5 rounded-2xl w-full">
                  <span className="text-amber-400 mt-0.5 text-base shrink-0">⏱️</span>
                  <p className="text-[12px] text-amber-100/80 leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: ui.proPackQuotaTip }} />
                  </p>
                </div>
              )}
            </div>

            {/* Tab Selection */}
            <div className="flex md:flex-col bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-1 overflow-x-auto md:overflow-visible scrollbar-none md:gap-1 w-full shadow-inner">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 text-center md:text-left py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 md:px-5 ${activeTab === "overview" ? "bg-zinc-900 text-emerald-400 border border-zinc-800/80 shadow-md shadow-black/40" : "text-zinc-400 hover:text-white border border-transparent"}`}
              >
                {ui.tabOverview}
              </button>
              <button
                onClick={() => setActiveTab("budget")}
                className={`flex-1 text-center md:text-left py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 md:px-5 ${activeTab === "budget" ? "bg-zinc-900 text-emerald-400 border border-zinc-800/80 shadow-md shadow-black/40" : "text-zinc-400 hover:text-white border border-transparent"}`}
              >
                {ui.tabFinance}
              </button>
              <button
                onClick={() => setActiveTab("marketing")}
                className={`flex-1 text-center md:text-left py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 md:px-5 ${activeTab === "marketing" ? "bg-zinc-900 text-emerald-400 border border-zinc-800/80 shadow-md shadow-black/40" : "text-zinc-400 hover:text-white border border-transparent"}`}
              >
                {ui.tabMarketing}
              </button>
              <button
                onClick={() => setActiveTab("swot")}
                className={`flex-1 text-center md:text-left py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 md:px-5 ${activeTab === "swot" ? "bg-zinc-900 text-emerald-400 border border-zinc-800/80 shadow-md shadow-black/40" : "text-zinc-400 hover:text-white border border-transparent"}`}
              >
                {ui.tabSwot}
              </button>
            </div>
          </div>

          {/* Right Column (Content Box) - 8 cols */}
          <div className="w-full md:col-span-8 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-6 md:min-h-[550px]">
             
             {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{ui.businessDescription}</h3>
                  <button
                    onClick={() => {
                      const isNew = result.viziune_strategie?.misiune_valori !== undefined;
                      setEditingField({
                        key: isNew ? "viziune_strategie.misiune_valori" : "descriere",
                        title: ui.businessDescription,
                        value: isNew ? (result.viziune_strategie?.misiune_valori || "") : (result.descriere || "")
                      });
                    }}
                    className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                  >
                    {`✏️ ${ui.editBtn}`}
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.viziune_strategie?.misiune_valori || result.descriere)}</p>
              </div>

              <div className="h-px bg-zinc-800/60"></div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{ui.marketOpportunity}</h3>
                  <button
                    onClick={() => {
                      const isNew = result.analiza_pietei?.concurenta !== undefined;
                      setEditingField({
                        key: isNew ? "analiza_pietei.concurenta" : "oportunitate_piata",
                        title: ui.marketOpportunity,
                        value: isNew ? (result.analiza_pietei?.concurenta || "") : (result.oportunitate_piata || "")
                      });
                    }}
                    className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                  >
                    {`✏️ ${ui.editBtn}`}
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_pietei?.concurenta || result.oportunitate_piata)}</p>
              </div>

              <div className="h-px bg-zinc-800/60"></div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{ui.targetAudience}</h3>
                  <button
                    onClick={() => {
                      const isNew = result.analiza_pietei?.clienti_tinta !== undefined;
                      setEditingField({
                        key: isNew ? "analiza_pietei.clienti_tinta" : "public_tinta",
                        title: ui.targetAudience,
                        value: isNew ? (result.analiza_pietei?.clienti_tinta || "") : (result.public_tinta || "")
                      });
                    }}
                    className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                  >
                    {`✏️ ${ui.editBtn}`}
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
                        {`✏️ ${ui.editBtn}`}
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
                        {`✕ ${ui.deleteBtn}`}
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
                  ➕ {ui.addExpertSection}
                </button>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{ui.investmentBudget}</h3>
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
                      ? ui.optimizeBudgetAssistant
                      : ui.optimizeBudgetLocked
                    }
                  </button>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'];
                    const planCurrency = normalizePlanCurrency(result.selectedCurrency, locale);
                    const budgetList = Array.isArray(result.plan_financiar?.buget_investitii) ? result.plan_financiar.buget_investitii : [];
                    const enriched = budgetList.map((item: any, idx: number) => {
                      const costText = item.cost !== undefined ? item.cost : item.suma_lei;
                      const costVal = parseInt(costText?.toString().replace(/[^0-9]/g, '') || '0');
                      return { item, idx, costVal, costText };
                    });
                    const totalCost = enriched.reduce((sum: number, row: { costVal: number }) => sum + (row.costVal > 0 ? row.costVal : 0), 0);

                    return (
                      <>
                        {enriched.map(({ item, idx, costVal, costText }: { item: any; idx: number; costVal: number; costText: any }) => {
                          const label = item.item || item.categorie || '';
                          const bulletColor = COLORS[idx % COLORS.length];
                          const percent = totalCost > 0 && costVal > 0 ? Math.round((costVal / totalCost) * 100) : 0;
                          const amountLabel = formatPriceLocalized(costText, locale, planCurrency, fxRate);

                          return (
                            <div key={idx} className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-3 flex gap-2 items-start text-xs">
                              <span className="font-semibold text-zinc-300 flex items-start gap-2 flex-1 min-w-0">
                                <span className="w-2 h-2 rounded-[3px] shrink-0 mt-1.5" style={{ backgroundColor: bulletColor }} />
                                <span className="leading-snug break-words">
                                  {label}{' '}
                                  {costVal > 0 ? (
                                    <span className="text-zinc-500 font-medium">({percent}%)</span>
                                  ) : null}
                                </span>
                              </span>
                              <div className="flex items-start gap-1 shrink-0">
                                <span className="font-black text-emerald-400 whitespace-nowrap tabular-nums text-right pt-0.5">
                                  {amountLabel}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => setEditingBudgetItem({ index: idx, item: label, cost: String(costText || '0') })}
                                    className="text-[11px] text-zinc-500 hover:text-white p-2 -m-1 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                                    title={ui.editBtn}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBudgetItem(idx)}
                                    className="text-[11px] text-red-500 hover:text-red-400 p-2 -m-1 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                                    title={ui.deleteBtn}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Buton Adaugă Cheltuială Nouă */}
                        <button
                          onClick={() => setEditingBudgetItem({ index: 'new', item: '', cost: '' })}
                          className="w-full mt-2 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] text-center flex items-center justify-center gap-1.5"
                        >
                          <span>➕</span>
                          <span>{ui.addInvestmentItem}</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Chart Container */}
              <div className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 flex flex-col items-center justify-center">
                <h4 className="text-[10px] font-bold text-zinc-400 mb-3 uppercase">{ui.fundsDistribution}</h4>
                <div className="w-full min-h-[240px] flex items-center justify-center">
                      <BudgetPieChart
                        budget={result.plan_financiar?.buget_investitii || []}
                        currency={normalizePlanCurrency(result.selectedCurrency, locale)}
                        locale={locale}
                      />
                </div>
              </div>
            </div>
          )}

          {activeTab === "marketing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{ui.promotionAndStrategy}</h3>
                  {result.analiza_pietei?.strategie_marketing !== undefined && (
                    <button
                      onClick={() => setEditingField({
                        key: "analiza_pietei.strategie_marketing",
                        title: ui.marketingStrategy,
                        value: result.analiza_pietei?.strategie_marketing || ""
                      })}
                      className="text-[11px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {`✏️ ${ui.editBtn}`}
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
                  <h4 className="text-xs font-bold text-zinc-200">{ui.toneCustomizeTitle}</h4>
                  <p className="text-[10px] text-zinc-400">{ui.toneCustomizeDesc}</p>
                </div>
                <ToneEditor
                  user={user}
                  locale={locale}
                  hasStandardAccess={isStudioPaid}
                  hasProAccess={hasProAccess}
                  isAdmin={isAdmin}
                  isEditingAi={isEditingAi}
                  setShowAuthModal={() => router.push(ui.routes.login)}
                  setShowPricingModal={setShowPricingModal}
                  handleAiEdit={handleAiEdit}
                />
              </div>
            </div>
          )}

          {activeTab === "swot" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h3 className="text-emerald-400 font-bold text-sm">{ui.swotTitle}</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-emerald-950/10 border border-emerald-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase">{`💪 ${ui.strengths}`}</span>
                    <button
                      onClick={() => {
                        const isNew = result.analiza_swot?.puncte_tari !== undefined;
                        setEditingField({
                          key: isNew ? "analiza_swot.puncte_tari" : "analiza_swot.puncte_forte",
                          title: ui.strengths,
                          value: getSwotString(result.analiza_swot?.puncte_tari || result.analiza_swot?.puncte_forte)
                        });
                      }}
                      className="text-[10px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {`✏️ ${ui.editBtn}`}
                    </button>
                  </div>
                  {renderSwotCategory(result.analiza_swot?.puncte_tari || result.analiza_swot?.puncte_forte)}
                </div>
                
                <div className="bg-rose-950/10 border border-rose-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-rose-400 font-black tracking-wider uppercase">{`⚠️ ${ui.weaknesses}`}</span>
                    <button
                      onClick={() => setEditingField({
                        key: "analiza_swot.puncte_slabe",
                        title: ui.weaknesses,
                        value: getSwotString(result.analiza_swot?.puncte_slabe)
                      })}
                      className="text-[10px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {`✏️ ${ui.editBtn}`}
                    </button>
                  </div>
                  {renderSwotCategory(result.analiza_swot?.puncte_slabe)}
                </div>

                <div className="bg-blue-950/10 border border-blue-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-blue-400 font-black tracking-wider uppercase">{`🚀 ${ui.opportunities}`}</span>
                    <button
                      onClick={() => setEditingField({
                        key: "analiza_swot.oportunitati",
                        title: ui.opportunities,
                        value: getSwotString(result.analiza_swot?.oportunitati)
                      })}
                      className="text-[10px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {`✏️ ${ui.editBtn}`}
                    </button>
                  </div>
                  {renderSwotCategory(result.analiza_swot?.oportunitati)}
                </div>

                <div className="bg-amber-950/10 border border-amber-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-amber-400 font-black tracking-wider uppercase">{`☠️ ${ui.threats}`}</span>
                    <button
                      onClick={() => setEditingField({
                        key: "analiza_swot.amenintari",
                        title: ui.threats,
                        value: getSwotString(result.analiza_swot?.amenintari)
                      })}
                      className="text-[10px] text-zinc-500 hover:text-white p-2 -m-2 inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                      {`✏️ ${ui.editBtn}`}
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
              <button onClick={() => setEditingField(null)} className="text-xs text-zinc-500 font-bold p-1">{ui.closeBtn}</button>
            </div>
            
            <textarea
              value={editingField.value}
              onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
              placeholder={ui.sectionContentPlaceholder}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl p-4 text-xs text-white placeholder-zinc-500 h-44 outline-none resize-none transition-all flex-1"
            />
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-center"
              >
                {ui.dismissBtn}
              </button>
              <button
                onClick={handleManualSave}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-center"
              >
                {ui.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Item Editor Bottom-Sheet Drawer */}
      {editingBudgetItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="flex-1" onClick={() => setEditingBudgetItem(null)}></div>
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-300 flex flex-col w-full md:max-w-lg md:mx-auto md:left-1/2 md:-translate-x-1/2 md:right-auto">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <h4 className="text-sm font-black text-white">
                {editingBudgetItem.index === 'new'
                  ? ui.addBudgetItemTitle
                  : ui.editBudgetItemTitle}
              </h4>
              <button onClick={() => setEditingBudgetItem(null)} className="text-xs text-zinc-500 font-bold p-1">
                {ui.closeBtn}
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  {ui.budgetItemNameLabel}
                </label>
                <input
                  type="text"
                  value={editingBudgetItem.item}
                  onChange={(e) => setEditingBudgetItem({ ...editingBudgetItem, item: e.target.value })}
                  placeholder={ui.budgetItemNamePlaceholder}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl p-3.5 text-base md:text-xs text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  {`${ui.costLabel} (${result?.selectedCurrency || (locale === "ro" ? "RON" : "EUR")})`}
                </label>
                <input
                  type="number"
                  value={editingBudgetItem.cost}
                  onChange={(e) => setEditingBudgetItem({ ...editingBudgetItem, cost: e.target.value })}
                  placeholder="0"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl p-3.5 text-base md:text-xs text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setEditingBudgetItem(null)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-center"
              >
                {ui.dismissBtn}
              </button>
              <button
                onClick={handleSaveBudgetItem}
                disabled={!editingBudgetItem.item.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-center"
              >
                {ui.saveBtn}
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
              <h3 className="text-lg font-black">{ui.emailVerifyTitle}</h3>
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
                {ui.emailVerifyResentOk}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleResendVerification}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-95"
              >
                {ui.emailVerifyResend}
              </button>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  router.push(isEn ? "/en/dashboard" : isEs ? "/es/dashboard" : "/dashboard");
                }}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl text-xs transition-all active:scale-95"
              >
                {ui.goToDashboard}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSuccess={() => {
          setShowPricingModal(false);
          // Firestore onSnapshot în useAuthUser actualizează automat entitlements după confirmarea plății
        }}
        onRequireLogin={() => {
          setShowPricingModal(false);
          router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
        }}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        currency={locale === "es" || locale === "en" ? "EUR" : "RON"}
        planName={result?.nume || (ui.businessPlan)}
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
              <h4 className="text-sm font-black text-white">{ui.exportOptionsTitle}</h4>
              <button onClick={() => setShowExportModal(false)} className="text-xs text-zinc-500 font-bold p-1">{ui.closeBtn}</button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed -mt-2">
              {ui.exportActiveTabHint}{" "}
              <span className="text-emerald-400 font-bold">
                {exportActiveTabDisplayLabel(activeVersionId, versions[activeVersionId] || result, locale)}
              </span>
            </p>
            
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
                <span>📄 {ui.freePdfSummary}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">{ui.freeBadge}</span>
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
                <span>📝 {ui.wordDocxLabel}</span>
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
                <span>📊 {ui.pptxLabel}</span>
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
                <span>📕 {ui.fullPdfLabel}</span>
                {!isStudioPaid && !isPlanPaid && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black uppercase">🔒 PRO</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Librăria de Secțiuni Experte Mobil */}
      {showExpertDrawer && (
        <ExpertSectionsDrawer
          locale={locale}
          user={user}
          hasProAccess={hasProAccess}
          isAdmin={isAdmin}
          businessName={result?.nume || (ui.yourBusiness)}
          onRequireAuth={() => {
            setShowExpertDrawer(false);
            router.push(isEn ? "/en/login" : isEs ? "/es/login" : "/login");
          }}
          onRequirePro={() => {
            setShowExpertDrawer(false);
            openUpgradeForPackOrPricing("edit");
          }}
          onAddSection={(newSection) => {
            const applied = applyExpertLibrarySection({
              activeVersionId,
              versions,
              result,
              newSection,
              access: versionStackAccess,
            });
            if (!applied.ok) {
              setShowExpertDrawer(false);
              if (applied.reason === "no_access") {
                alert(noCombineAccessMessage(locale));
                setShowPricingModal(true);
                return;
              }
              if (applied.reason === "limit") {
                const isStandardOnly = !!(
                  versionStackAccess.hasStandardAccess &&
                  !versionStackAccess.hasFullAccess &&
                  !versionStackAccess.isAdmin
                );
                alert(stackLimitReachedMessage(locale, applied.limit, isStandardOnly));
                if (isStandardOnly) setShowPricingModal(true);
                return;
              }
              return;
            }

            setResult(applied.plan);
            if (typeof window !== "undefined") {
              localStorage.setItem("current_generated_plan", JSON.stringify(applied.plan));
            }
            setVersions(applied.versions);
            setActiveVersionId(applied.activeVersionId);
            void syncCurrentPlanToFirestore(applied.plan, applied.versions);
            setShowExpertDrawer(false);

            setTimeout(() => {
              const el = document.getElementById(`custom-section-${applied.sectionIndex}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
          }}
          onClose={() => setShowExpertDrawer(false)}
        />
      )}
      {result && (
        <div className="fixed top-[-9999px] left-[-9999px] w-[1280px] opacity-0 pointer-events-none z-[-50]">
          <StudioPdfSlides 
            result={result} 
            ui={ui} 
            locale={locale} 
            currency={result?.selectedCurrency || (locale === "ro" ? "RON" : "EUR")}
            formatPrice={(val: any) => formatPriceLocalized(val, locale, result?.selectedCurrency || (locale === "ro" ? "RON" : "EUR"), fxRate)} 
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
            currency={result?.selectedCurrency || (locale === "ro" ? "RON" : "EUR")}
            isPdf={true}
            locale={locale}
          />
        </div>
      )}

      {/* Buy Me a Coffee Modal */}
      <BuyMeACoffeeModal
        isOpen={showBmcModal}
        onClose={() => setShowBmcModal(false)}
        locale={locale}
      />
    </div>
  );
}
