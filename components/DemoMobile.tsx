"use client";
import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import pptxgen from "pptxgenjs";
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, increment, arrayUnion, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { PricingModal } from '@/components/PricingModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MobileHeaderMenu } from '@/components/MobileHeaderMenu';
import BuyMeACoffeeModal from '@/components/BuyMeACoffeeModal';
import { useExportActions } from "@/hooks/useExportActions";
import { useCompleteMissingPlanFields } from "@/hooks/useCompleteMissingPlanFields";
import { DemoPdfSlides } from "@/components/pdf/DemoPdfSlides";
import { truncateText, splitTextIntoSlides } from "@/lib/planHelpers";
import { formatPriceLocalized } from "@/lib/priceHelper";
import { ConversionBanners } from '@/components/ConversionBanners';
import { migrateLocalPlansToFirebase } from '@/lib/migrationManager';
import { ToneEditor } from '@/components/ToneEditor';
import { MobileProToolsPanel, type MobileAiPrompt } from '@/components/tools/MobileProToolsPanel';
import { ExpertSectionsDrawer } from '@/components/modals/ExpertSectionsDrawer';
import Link from 'next/link';
import { getExamples } from '@/lib/examples';
import { t } from '@/lib/translations';
import { UI_STRINGS } from '@/lib/uiStrings';
import dynamic from 'next/dynamic';
import { formatObjectNumbers, formatNumberedText } from "@/lib/utils";
import { useSharedPlanLoader } from "@/hooks/useSharedPlanLoader";
import { useAuthUser } from '@/hooks/useAuthUser';
import { createAndCopySharedPlanLink } from "@/lib/sharePlan";
import { FREE_ACCOUNT_PLAN_LIMIT, GUEST_DEMO_PLAN_LIMIT, hasUnlimitedGenerateAccess, clearLocalPlanState, appendGuestPlanToLocalList } from "@/lib/planQuota";
import {
  persistCurrentVersions,
  notifyVersionPersistFailed,
} from "@/lib/persistVersionMap";
import { canGenerateWithQuotas, readProPackRemaining, proPackTopupConfirmDialog, notifyProPackQuotaBlocked } from "@/lib/proPackQuota";
import { startProTopupCheckout } from "@/lib/proTopupCheckout";
import { ProPackQuotaBar } from "@/components/ProPackQuotaBar";
import { isAdminEmail } from "@/lib/adminEmails";
import { isPlanExportUnlocked, hasAccountStandardAccess } from "@/lib/planUnlock";
import { stripPaymentSuccessParams, pollVerifyCheckout, paymentSuccessMessage } from "@/lib/paymentReturn";
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
import { exportActiveTabDisplayLabel } from "@/lib/studioActiveVersion";

const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });
export default function DemoMobile({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const ui = UI_STRINGS[locale];
  const isEn = locale === "en";
  const isEs = locale === "es";
  const ALL_EXAMPLES = getExamples(locale);
  const randomIdeas = ALL_EXAMPLES;
  const usedIdeasRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const examplesCarouselRef = useRef<HTMLDivElement | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [skill, setSkill] = useState("");
  const [demoCount, setDemoCount] = useState(0);
  const [resultState, setResultState] = useState<any>(null);
  const [versions, setVersionsState] = useState<any>({});
  const activeVersionIdRef = useRef<string>("original");
  const [activeVersionId, _setActiveVersionId] = useState<string>("original");
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

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
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "marketing" | "swot">("overview");
  const [loading, setLoading] = useState(false);
  const [fxRate, setFxRate] = useState(0.201);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | 'pptx' | 'pdf-summary' | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showBmcModal, setShowBmcModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [skipLocalRestore, setSkipLocalRestore] = useState(false);

  // === Auth & Entitlements — gestionate centralizat de useAuthUser ===
  const {
    user, isAuthLoading,
    credits, euFundsUnlocked, subscriptionActive, proPackRemaining,
    lifetimePlanCount, unlockedPlans, unlockedPlanIds, promoCodeUnlocked,
    isPaid, standardPackageActive,
    isAdmin, hasStandardAccess, hasProAccess, hasProPackQuota, versionStackAccess,
  } = useAuthUser(locale, {
    onUserChanged: async (currentUser) => {
      if (currentUser) {
        if (typeof window !== "undefined") {
          const sp = new URLSearchParams(window.location.search);
          if (!sp.get("sharedId") && !sp.get("shareId")) setIsSharedView(false);
        }
        await migrateLocalPlansToFirebase(currentUser);
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
  const [topupLoading, setTopupLoading] = useState(false);

  const handleProTopupCheckout = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setTopupLoading(true);
    const result = await startProTopupCheckout({
      getIdToken: () => user.getIdToken(),
      email: user.email,
      locale,
      returnPath: "/demo",
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

  const syncCurrentPlanToFirestore = async (
    updatedResult: any,
    updatedVersions?: Record<string, any>,
    versionIdToSave?: string
  ) => {
    if (!user || !updatedResult?.id) return;
    try {
      const planRef = doc(db, "users", user.uid, "plans", updatedResult.id);
      const versToSave = updatedVersions || versions;
      const payload: any = {
        ...updatedResult,
        updatedAt: new Date().toISOString(),
        selectedCurrency: updatedResult?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR"),
        activeVersionId: versionIdToSave || activeVersionId,
      };
      if (versToSave && Object.keys(versToSave).length > 0) {
        payload.versions = versToSave;
      }
      await setDoc(planRef, payload, { merge: true });
    } catch (err) {
      console.error("Firestore save error:", err);
    }
  };



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

  const [pendingDownloadMode, setPendingDownloadMode] = useState<'pdf' | 'pptx' | 'word' | 'pdf-summary' | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const { downloadAction: handleDownloadAction } = useExportActions({
    result,
    locale,
    currency: result?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR"),
    fxRate,
    user,
    isAdmin,
    isPlanPaid,
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
  
  // Stările pentru asistentul AI Bottom-Sheet
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [activeAiPrompt, setActiveAiPrompt] = useState<MobileAiPrompt | null>(null);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [showExpertDrawer, setShowExpertDrawer] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
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

  const [examplesList, setExamplesList] = useState<any[]>(ALL_EXAMPLES.slice(0, 18));

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDemoCount(parseInt(localStorage.getItem("demoGenerateCount") || "0", 10));
    }
    // Schimbare automată o dată la 14 zile
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    const epoch = 1700000000000; 
    const startIndex = (Math.floor((Date.now() - epoch) / twoWeeksMs) * 18) % ALL_EXAMPLES.length;
    const currentExamples = [];
    for (let i = 0; i < 18; i++) {
      currentExamples.push(ALL_EXAMPLES[(startIndex + i) % ALL_EXAMPLES.length]);
    }
    setExamplesList(currentExamples);
  }, [locale]);

  // Progressive loading messages
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = locale === "en" ? [
    "Generating innovative business ideas...",
    "Analyzing competition and market opportunities...",
    "Calculating investment budget and financial estimates...",
    "Building promotion strategy and optimal channels...",
    "Identifying strengths, weaknesses, opportunities, and threats...",
    "Assembling the final document tailored just for you..."
  ] : locale === "es" ? [
    "Generando ideas de negocio innovadoras...",
    "Analizando la competencia y oportunidades del mercado...",
    "Calculando el presupuesto de inversión y estimaciones financieras...",
    "Construyendo la estrategia de promoción y canales óptimos...",
    "Identificando fortalezas, debilidades, oportunidades y amenazas...",
    "Ensamblando el documento final especialmente para ti..."
  ] : [
    "Generăm idei inovatoare de afaceri...",
    "Analizăm competiția și oportunitățile pieței...",
    "Calculăm bugetul de investiții și estimările financiare...",
    "Clădim strategia de promovare și canalele optime...",
    "Identificăm punctele forte, slabe, oportunitățile și amenințările...",
    "Asamblăm documentul final special pentru tine..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);



  // Încărcare plan partajat (?sharedId=) — același helper ca pe Desktop
  const { isCheckingShared, shareError } = useSharedPlanLoader({
    pageLocale: locale,
    onLoaded: (plan) => {
      setSkipLocalRestore(true);
      setResult(plan);
    },
    onSharedView: () => setIsSharedView(true),
    resetDemoCounters: true,
    setDemoCount,
  });

  // Restaurare plan din localStorage la mount (doar dacă nu e sharedId)
  useEffect(() => {
    if (typeof window === "undefined" || isCheckingShared || skipLocalRestore) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("sharedId") || urlParams.get("shareId")) return;

    const isStartNou = ["nou", "new", "nuevo"].includes(
      (urlParams.get("start") || "").toLowerCase()
    );
    if (isStartNou) {
      localStorage.removeItem("current_versions");
      localStorage.removeItem("current_generated_plan");
      localStorage.removeItem("resultState");
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const saved = localStorage.getItem("current_generated_plan");
    const savedVersionsStr = localStorage.getItem("current_versions");
    if (saved) {
      try {
        if (savedVersionsStr) {
          const {versions: v, activeVersionId: a} = JSON.parse(savedVersionsStr);
          setVersionsState(v);
          setActiveVersionId(a);
        }
        setResultState(formatObjectNumbers(JSON.parse(saved)));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isCheckingShared, skipLocalRestore]);

  // Prevenire părăsire accidentală când există plan activ (ca pe Desktop)
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
      const isLogin = searchParams.get('login') === 'true';

      if (isLogin) {
        setShowAuthModal(true);
      }

      if (isIdea) {
        setResultState((prevResult: any) => {
          if (!prevResult) {
            const savedVersionsStr = localStorage.getItem("current_versions");
            if (savedVersionsStr) {
              try {
                const { versions: v, activeVersionId: a } = JSON.parse(savedVersionsStr);
                setVersionsState(v);
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
                setVersionsState({ original: parsed });
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

  const handleGenerate = async (nicheExample?: string) => {
    const inputSkill = nicheExample || skill;
    if (!inputSkill.trim()) return;

    if (!user) {
      const count = parseInt(localStorage.getItem("demoGenerateCount") || "0", 10);
      if (count >= GUEST_DEMO_PLAN_LIMIT) {
        setShowAuthModal(true);
        return;
      }
    } else if (
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
    setResult(null);

    let attempts = 0;
    const maxAttempts = 2;
    let success = false;

    while (attempts < maxAttempts && !success) {
      attempts++;
      try {
        const token = user ? await user.getIdToken() : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/generate", {
          method: "POST",
          headers,
          body: JSON.stringify({
            skill: inputSkill,
            locale,
            currency: locale === "ro" ? "LEI" : "EUR",
            surface: "demo",
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          if (errBody?.error === "LIMIT_REACHED") {
            if (!user) setShowAuthModal(true);
            else openUpgradeForPackOrPricing("generate");
            setLoading(false);
            return;
          }
          if (attempts >= maxAttempts) {
            throw new Error(errBody?.message || "Eroare la generare");
          }
          continue;
        }

        const data = await res.json();
        if (data.fx_rate) setFxRate(data.fx_rate);

        if (data && data.ideas && data.ideas.length > 0) {
          const content = data.ideas[0];
          let cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
          cleanJson = cleanJson.replace(/[„“”]/g, '"');
          const startIndex = cleanJson.indexOf('{');
          const endIndex = cleanJson.lastIndexOf('}');
          if (startIndex !== -1 && endIndex !== -1) cleanJson = cleanJson.substring(startIndex, endIndex + 1);

          cleanJson = cleanJson.replace(/,\s*([}\]])/g, '$1');
          const finalResult = formatObjectNumbers(JSON.parse(cleanJson));
          const planId =
            String(finalResult.nume || "Plan").replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();
          finalResult.id = planId;
          const initialVersions = { original: finalResult };
          setActiveVersionId("original");
          setVersions(initialVersions);
          setResultState(finalResult);
          setSkill("");
          localStorage.setItem("current_generated_plan", JSON.stringify(finalResult));
          localStorage.setItem(
            "current_versions",
            JSON.stringify({ versions: initialVersions, activeVersionId: "original" })
          );
          if (typeof window !== "undefined") {
            window.history.pushState({ view: "idea" }, "", window.location.pathname + "?view=idea");
          }

          // Guest counter + list: use live auth (A1 — avoid stale user when signup overlaps).
          const liveUser = auth.currentUser;
          if (!liveUser) {
            const count = parseInt(localStorage.getItem("demoGenerateCount") || "0", 10);
            localStorage.setItem("demoGenerateCount", (count + 1).toString());
            setDemoCount(count + 1);
            appendGuestPlanToLocalList(finalResult);
          } else {
            try {
              await setDoc(doc(db, "users", liveUser.uid, "plans", planId), {
                ...finalResult,
                versions: initialVersions,
                activeVersionId: "original",
                createdAt: new Date().toISOString(),
                isPaid: false,
              });
            } catch (fsError) {
              console.error("Firestore save error:", fsError);
            }
          }
          success = true;
        }
      } catch (error: any) {
        if (attempts >= maxAttempts) {
          console.error("Eroare generare:", error);
          alert(
            locale === "en"
              ? "An error occurred during generation. Please try again."
              : locale === "es"
              ? "Ocurrió un error al generar. Por favor, inténtelo de nuevo."
              : "A apărut o eroare la generare. Vă rugăm să încercați din nou."
          );
        }
      }
    }
    setLoading(false);
  };

  const handleAiEdit = async (
    action: string,
    customInput?: string,
    options?: { basePlan?: any; sourceVersionId?: string }
  ) => {
    if (!result) return;

    const isTone = action === "professional_tone";
    const hasProTones = !!(isAdmin || subscriptionActive || euFundsUnlocked);
    const hasFreeToneBypass = !!(
      isAdmin ||
      isPaid ||
      promoCodeUnlocked ||
      subscriptionActive ||
      euFundsUnlocked ||
      hasStandardAccess
    );

    if (isTone && isProToneKey(customInput) && !hasProTones) {
      setShowPricingModal(true);
      return;
    }
    if (isTone && isFreeToneKey(customInput) && !hasFreeToneBypass) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      if (!canUseFreeToneEdit(false)) {
        setShowPricingModal(true);
        return;
      }
    }

    if (!isTone && !isAdmin && !hasProAccess) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setShowPricingModal(true);
      return;
    }

    const usesPackQuota = !!(euFundsUnlocked && !subscriptionActive && !isAdmin);
    if (
      usesPackQuota &&
      ((!isTone && proPackRemaining.edit <= 0) ||
        (isTone && isProToneKey(customInput) && proPackRemaining.edit <= 0))
    ) {
      notifyProPackQuotaBlocked(locale, "edit", proPackRemaining, activeVersionId);
      openUpgradeForPackOrPricing("edit");
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

    setIsEditingAi(true);
    setActiveAiPrompt(null);

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
          customStyle: isTone ? (customInput || aiPromptInput) : "",
          targetSection: targetSection || (action === "add_sections" ? customInput || aiPromptInput || "" : ""),
          locale,
          currency: baseSource?.selectedCurrency || (locale === "ro" ? "LEI" : "EUR"),
          isCombine,
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (
          err?.code === "TONE_LIMIT" ||
          err?.code === "PRO_REQUIRED" ||
          err?.code === "AUTH_REQUIRED"
        ) {
          setShowPricingModal(true);
        } else if (err?.code === "PRO_PACK_EDIT_LIMIT") {
          openUpgradeForPackOrPricing("edit");
        } else if (err?.code === "PRO_PACK_COMBINE_LIMIT") {
          openUpgradeForPackOrPricing("combine");
        }
        throw new Error(err?.error || "Eroare editare");
      }

      const data = await res.json();
      if (data && data.editedPlan) {
        const parsed = withVersionStack(formatObjectNumbers(data.editedPlan), nextStack);
        const vKey = nextStep
          ? buildStackedVersionKey(nextStack)
          : (action === "eu_funds_optimization"
              ? `eu_funds_${Date.now()}`
              : action === "investor_ready"
              ? `investor_${Date.now()}`
              : isTone
              ? toneVersionKey(customInput)
              : `edit_${Date.now()}`);
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
        setResultState(parsed);
        localStorage.setItem("current_generated_plan", JSON.stringify(parsed));
        if (isTone && isFreeToneKey(customInput) && !hasFreeToneBypass) {
          consumeFreeToneEdit(false);
        }
        await syncCurrentPlanToFirestore(parsed, nextVersions, vKey);
      }
    } catch (e) {
      console.error(e);
      alert(locale === "en" ? "Could not process the request." : locale === "es" ? "No se pudo procesar la solicitud." : "Nu s-a putut procesa comanda.");
    } finally {
      setIsEditingAi(false);
      setAiPromptInput("");
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setAuthError(null);
    setVerificationEmailSent(false);
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      await signInWithPopup(auth, authProvider);
      setShowAuthModal(false);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      setAuthError(
        locale === "en"
          ? "Social sign-in failed. Please try again."
          : locale === "es"
          ? "Error al iniciar sesión con la red social. Inténtalo de nuevo."
          : "Eroare la autentificare cu partenerul social."
      );
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setAuthError(null);
    setVerificationEmailSent(false);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
        setShowAuthModal(false);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        try {
          const res = await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userCredential.user.email, locale }),
          });
          if (!res.ok) throw new Error("API fallback");
        } catch (apiError) {
          console.warn("Eroare API la trimitere email initial, folosim fallback:", apiError);
          try {
            auth.languageCode = locale;
            const { verificationActionCodeSettings } = await import("@/lib/emailVerification");
            await sendEmailVerification(
              userCredential.user,
              verificationActionCodeSettings(locale)
            );
          } catch (fallbackError) {
            console.error("Eroare fallback trimitere email initial:", fallbackError);
          }
        }
        setVerificationEmailSent(true);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError(
          locale === "en"
            ? "An account already exists with this email. Please log in."
            : locale === "es"
            ? "Ya existe una cuenta con este correo. Por favor, inicia sesión."
            : "Există deja un cont cu acest email. Te rugăm să te loghezi."
        );
      } else if (error.code === 'auth/weak-password') {
        setAuthError(
          locale === "en"
            ? "Password must be at least 6 characters."
            : locale === "es"
            ? "La contraseña debe tener al menos 6 caracteres."
            : "Parola trebuie să aibă cel puțin 6 caractere."
        );
      } else if (error.code === 'auth/invalid-email') {
        setAuthError(
          locale === "en"
            ? "Invalid email address."
            : locale === "es"
            ? "Correo electrónico no válido."
            : "Adresă de email invalidă."
        );
      } else {
        setAuthError(
          locale === "en"
            ? "Incorrect email or password."
            : locale === "es"
            ? "Correo o contraseña incorrectos."
            : "Email sau parolă incorectă."
        );
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const downloadAction = async (mode: 'word' | 'pptx' | 'pdf' | 'pdf-summary') => {
    await handleDownloadAction(mode);
  };

  const handleDownload = async (format?: string) => {
    setShowExportModal(true);
  };

  const handleShare = async () => {
    if (!result) return;
    if (!user) {
      setShowAuthModal(true);
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

  if (isAuthLoading || isCheckingShared) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-x-hidden flex flex-col pb-16">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <header className={`h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <Link href={isEn ? "/en" : isEs ? "/es" : "/"} className="text-xl font-black tracking-tight">
          IdeeaTa<span className="text-emerald-500">.ai</span>
        </Link>
        <MobileHeaderMenu
          locale={locale}
          user={user}
          isAdmin={isAdmin}
          hasProAccess={hasProAccess}
          hasStandardAccess={hasStandardAccess}
          subscriptionActive={subscriptionActive}
          onOpenCoffee={() => setShowBmcModal(true)}
          onOpenPricing={() => setShowPricingModal(true)}
          onRequireLogin={() => setShowAuthModal(true)}
          onLogout={async () => {
            clearLocalPlanState();
            await signOut(auth);
          }}
        />
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
      <main className="flex-1 p-4 flex flex-col gap-6">
        
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-6">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="space-y-2 max-w-xs">
              <h3 className="font-bold text-lg text-emerald-400">{locale === "en" ? "Assistant is working" : locale === "es" ? "El asistente está trabajando" : "Asistentul lucrează"}</h3>
              <p className="text-sm text-zinc-400 animate-pulse">{loadingMessages[loadingMessageIndex]}</p>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {shareError && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                <p className="text-amber-200 font-bold text-sm">{ui.sharedPlanNotFound}</p>
                <p className="text-zinc-400 text-xs mt-1">{ui.sharedPlanNotFoundHint}</p>
              </div>
            )}
            <div className="text-center space-y-2 mt-4">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {locale === "en" ? "Free Demo" : locale === "es" ? "Demo Gratis" : "Demo Gratuit"}
              </span>
              <h1 className="text-3xl font-black tracking-tight leading-none mt-2">{t("generatePlanNow", locale)}</h1>
              <p className="text-zinc-400 text-sm">{locale === "en" ? "Turn any idea into a complete plan in 60 seconds." : locale === "es" ? "Convierte cualquier idea en un plan completo en 60 segundos." : "Transformă orice idee într-un plan complet în 60 de secunde."}</p>
            </div>

            {/* Form Card */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("businessIdeaLabel", locale)}</label>
                <textarea
                  ref={inputRef}
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder={ui.inputPlaceholder}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 h-28 outline-none resize-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (usedIdeasRef.current.length >= randomIdeas.length) {
                      usedIdeasRef.current = [];
                    }
                    let nextIndex = Math.floor(Math.random() * randomIdeas.length);
                    while (
                      usedIdeasRef.current.includes(nextIndex) ||
                      randomIdeas[nextIndex].long === skill
                    ) {
                      nextIndex = Math.floor(Math.random() * randomIdeas.length);
                    }
                    usedIdeasRef.current.push(nextIndex);
                    setSkill(randomIdeas[nextIndex].long);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 text-zinc-300 font-bold text-sm px-4 py-3 rounded-xl transition-all hover:bg-zinc-800/50 hover:text-emerald-400 border border-zinc-800"
                >
                  {ui.inspireMeSparkles}
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={!skill.trim()}
                  className="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>{ui.generatePlan}</span>
                  <span>→</span>
                </button>
              </div>
              {!user && (
                <div className="text-left mt-2 w-full">
                  <span className="text-[11px] font-bold text-emerald-400 leading-snug block">
                    {demoCount >= GUEST_DEMO_PLAN_LIMIT ? (
                      `🔒 ${ui.limitReached}`
                    ) : (
                      `🎁 ${ui.limitRemaining.replace("{{count}}", String(GUEST_DEMO_PLAN_LIMIT - demoCount))}`
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Examples Carousel — același nr. ca Desktop (18), cu UX de vizibilitate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <h4 className="text-sm font-bold text-white">{ui.businessExamplesTitle}</h4>
                <span className="text-[11px] font-bold text-emerald-400 tabular-nums shrink-0">
                  {ui.examplesCounter
                    .replace("{{current}}", String(exampleIndex + 1))
                    .replace("{{total}}", String(examplesList.length))}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 px-1">{ui.examplesSwipeHint} →</p>
              <div className="relative">
                <div
                  ref={examplesCarouselRef}
                  onScroll={() => {
                    const el = examplesCarouselRef.current;
                    if (!el || el.children.length === 0) return;
                    const first = el.children[0] as HTMLElement;
                    const style = window.getComputedStyle(el);
                    const gap = parseFloat(style.columnGap || style.gap || "12") || 12;
                    const step = first.offsetWidth + gap;
                    if (step <= 0) return;
                    const idx = Math.round(el.scrollLeft / step);
                    setExampleIndex(Math.min(Math.max(idx, 0), examplesList.length - 1));
                  }}
                  className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory px-1 scroll-pl-1"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {examplesList.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSkill(ex.long);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className={`flex-shrink-0 bg-zinc-900/60 border rounded-xl p-4 w-[78%] max-w-[280px] text-left snap-start transition-all min-h-[44px] ${
                        idx === exampleIndex
                          ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                          : "border-zinc-800 hover:border-emerald-500/30"
                      }`}
                    >
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                        {ex.short}
                      </span>
                      <p className="text-xs font-semibold text-zinc-200 line-clamp-2">{ex.long}</p>
                    </button>
                  ))}
                </div>
                {/* Fade pe dreapta = semnal că mai sunt carduri */}
                {exampleIndex < examplesList.length - 1 && (
                  <div className="pointer-events-none absolute top-0 right-0 bottom-3 w-10 bg-gradient-to-l from-[#09090b] to-transparent" />
                )}
              </div>
              <div className="flex justify-center gap-1 flex-wrap px-2 max-w-full">
                {examplesList.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i === exampleIndex ? "bg-emerald-400 scale-125" : "bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && result && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            {/* Sticky mini header */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4 backdrop-blur-md">
              <div className="min-w-0">
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider block w-max mb-1">
                  {locale === "en" ? "Plan Generated" : locale === "es" ? "Plan Generado" : "Plan Generat"}
                </span>
                <h2 className="text-sm font-black text-white truncate">{result.nume || (locale === "en" ? "Business Plan" : locale === "es" ? "Plan de Negocios" : "Plan de Afaceri")}</h2>
              </div>
              <div className="flex gap-2 shrink-0">
                {!isSharedView || user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setVersions({});
                      setActiveVersionId("original");
                      setIsSharedView(false);
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("current_generated_plan");
                        localStorage.removeItem("current_versions");
                      }
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-2.5 py-2 rounded-lg text-[10px] transition-all active:scale-95 inline-flex items-center justify-center min-h-[44px] whitespace-nowrap"
                    title={ui.anotherIdea}
                  >
                    {ui.anotherIdea}
                  </button>
                ) : null}
                <button
                  onClick={handleShare}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2 -m-1 rounded-lg text-xs transition-all active:scale-95 inline-flex items-center justify-center min-w-[44px] min-h-[44px]"
                  title={ui.shareLinkTitle}
                >
                  🔗
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-all active:scale-95 inline-flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <span>{locale === "en" ? "Export" : locale === "es" ? "Exportar" : "Export"}</span>
                  <span>📥</span>
                </button>
              </div>
            </div>

            {showShareSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center py-2 rounded-lg animate-pulse font-bold">
                {ui.shareCopied}
              </div>
            )}

            {/* Tablet split layout container */}
            <div className="flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-6 items-start w-full">
              {/* Left Column (Navigation & Versions) - 4 cols */}
              <div className="w-full md:col-span-4 flex flex-col gap-4 sticky md:top-20 z-20">
                {/* Version History Selector Mobile */}
                {!isSharedView && versions && Object.keys(versions).length > 0 && (
                  <div className="relative z-20 font-sans">
                    <button 
                      onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>📜 {locale === "en" ? "Version History" : locale === "es" ? "Historial de Versiones" : "Istoric Versiuni"} ({Object.keys(versions).length})</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 font-normal truncate max-w-[9rem]">
                          {formatVersionTabTitle(activeVersionId, versions[activeVersionId] || result, locale, ui)}
                        </span>
                        <span className="text-[10px] text-zinc-500">▼</span>
                      </span>
                    </button>

                    {showVersionDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="text-[9px] uppercase font-black tracking-widest text-zinc-500 px-3 py-2 border-b border-zinc-900 flex justify-between items-center">
                          <span>{locale === "en" ? "Saved Versions" : locale === "es" ? "Versiones Guardadas" : "Versiuni Salvate"}</span>
                          <button type="button" onClick={() => setShowVersionDropdown(false)} className="text-zinc-500 hover:text-white text-xs min-w-[44px] min-h-[44px]">✕</button>
                        </div>
                        <div className="max-h-64 overflow-y-auto flex flex-col gap-1 mt-1">
                          {Object.entries(versions).map(([vKey, vData]) => (
                            <button
                              key={vKey}
                              type="button"
                              onClick={() => {
                                setActiveVersionId(vKey);
                                setResultState(vData);
                                setShowVersionDropdown(false);
                                if (typeof window !== "undefined") {
                                  localStorage.setItem(
                                    "current_versions",
                                    JSON.stringify({ versions, activeVersionId: vKey })
                                  );
                                  localStorage.setItem("current_generated_plan", JSON.stringify(vData));
                                }
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

                {!isSharedView && (
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
                  onRequireAuth={() => setShowAuthModal(true)}
                  onRequirePro={() => setShowPricingModal(true)}
                  showExpert
                  onOpenExpert={() => setShowExpertDrawer(true)}
                />
                )}

                {!isSharedView && (
                <div className="flex flex-col gap-2.5 w-full">
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
                )}

                {/* Mobile Tab bar */}
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

                {/* Conversion banners under tabs */}
                <ConversionBanners 
                  isSharedView={isSharedView} 
                  user={user} 
                  result={result} 
                  onResetApp={() => {
                    setResult(null);
                    setIsSharedView(false);
                    localStorage.removeItem("current_generated_plan");
                  }} 
                  onAuthClick={() => setShowAuthModal(true)} 
                  locale={locale}
                />
              </div>

              {/* Right Column (Content Box) - 8 cols */}
              <div className="w-full md:col-span-8 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-6 md:min-h-[550px]">
                
                {activeTab === "overview" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="space-y-1">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Business Description" : locale === "es" ? "Descripción del Negocio" : "Descriere Afacere"}</h3>
                    <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.viziune_strategie?.misiune_valori || result.descriere)}</p>
                  </div>
                  <div className="h-px bg-zinc-800/60"></div>
                  <div className="space-y-1">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Market Opportunity" : locale === "es" ? "Oportunidad de Mercado" : "Oportunitatea Pieței"}</h3>
                    <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_pietei?.concurenta || result.oportunitate_piata)}</p>
                  </div>
                  <div className="h-px bg-zinc-800/60"></div>
                  <div className="space-y-1">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Target Audience" : locale === "es" ? "Público Objetivo" : "Publicul Țintă"}</h3>
                    <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_pietei?.clienti_tinta || result.public_tinta)}</p>
                  </div>
                </div>
              )}

              {activeTab === "budget" && (
                <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="space-y-3">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Initial Investment Budget" : locale === "es" ? "Presupuesto Inicial de Inversión" : "Buget Inițial de Investiții"}</h3>
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

                  {/* Budget Chart (Dynamic container) */}
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
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Promotion & Strategy" : locale === "es" ? "Promoción y Estrategia" : "Promovare & Strategie"}</h3>
                    {result.analiza_pietei?.strategie_marketing ? (
                      <div className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4">
                        <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_pietei.strategie_marketing)}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.strategie_marketing?.canale_promovare?.map((canal: any, idx: number) => (
                          <div key={idx} className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 space-y-1">
                            <h4 className="font-bold text-zinc-200 text-xs">{canal.nume}</h4>
                            <p className="text-zinc-400 text-[11px] leading-relaxed">{canal.detalii}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tone Editor Bottom Element */}
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4 space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-200">{locale === "en" ? "Customize Presentation Tone" : locale === "es" ? "Personalizar el Tono de la Presentación" : "Personalizează Tonul Prezentării"}</h4>
                      <p className="text-[10px] text-zinc-400">{locale === "en" ? "Automatically rewrite the business plan in a formal, commercial, or friendly style." : locale === "es" ? "Reescribe automáticamente el plan de negocios en un estilo formal, comercial o amigable." : "Rescrie automat planul de afaceri într-un stil formal, comercial sau prietenos."}</p>
                    </div>
                    <ToneEditor
                      user={user}
                      locale={locale}
                      hasStandardAccess={hasStandardAccess}
                      hasProAccess={hasProAccess}
                      isAdmin={isAdmin}
                      isEditingAi={isEditingAi}
                      setShowAuthModal={setShowAuthModal}
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
                    <div className="bg-emerald-950/10 border border-emerald-800/20 rounded-xl p-4">
                      <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase block mb-1">{locale === "en" ? "💪 Strengths" : locale === "es" ? "💪 Fortalezas" : "💪 Puncte Forte (Strengths)"}</span>
                      {renderSwotCategory(result.analiza_swot?.puncte_tari || result.analiza_swot?.puncte_forte)}
                    </div>
                    <div className="bg-rose-950/10 border border-rose-800/20 rounded-xl p-4">
                      <span className="text-[10px] text-rose-400 font-black tracking-wider uppercase block mb-1">{locale === "en" ? "⚠️ Weaknesses" : locale === "es" ? "⚠️ Debilidades" : "⚠️ Puncte Slabe (Weaknesses)"}</span>
                      {renderSwotCategory(result.analiza_swot?.puncte_slabe)}
                    </div>
                    <div className="bg-blue-950/10 border border-blue-800/20 rounded-xl p-4">
                      <span className="text-[10px] text-blue-400 font-black tracking-wider uppercase block mb-1">{locale === "en" ? "🚀 Opportunities" : locale === "es" ? "🚀 Oportunidades" : "🚀 Oportunități (Opportunities)"}</span>
                      {renderSwotCategory(result.analiza_swot?.oportunitati)}
                    </div>
                    <div className="bg-amber-950/10 border border-amber-800/20 rounded-xl p-4">
                      <span className="text-[10px] text-amber-400 font-black tracking-wider uppercase block mb-1">{locale === "en" ? "☠️ Threats" : locale === "es" ? "☠️ Amenazas" : "☠️ Amenințări (Threats)"}</span>
                      {renderSwotCategory(result.analiza_swot?.amenintari)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Back Button / Reset App */}
            <button
              onClick={() => {
                setResult(null);
                setVersions({});
                setActiveVersionId("original");
                setIsSharedView(false);
                localStorage.removeItem("current_generated_plan");
                localStorage.removeItem("current_versions");
              }}
              className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-400 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-98 text-center"
            >
              {ui.anotherIdea}
            </button>
          </div>
        )}

      </main>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm space-y-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold text-sm p-2 -m-2 inline-flex items-center justify-center min-w-[44px] min-h-[44px]"
            >
              ✕
            </button>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black">
                {isLoginMode 
                  ? (locale === "en" ? "Log in to your account" : locale === "es" ? "Inicia sesión en tu cuenta" : "Intră în contul tău") 
                  : (locale === "en" ? "Create free account" : locale === "es" ? "Crear cuenta gratis" : "Creează cont gratuit")}
              </h3>
              <p className="text-xs text-zinc-400">
                {locale === "en" ? "To save and download generated plans." : locale === "es" ? "Para guardar y descargar los planes generados." : "Pentru a salva și descărca planurile generate."}
              </p>
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs py-2 px-3 rounded-lg text-center font-semibold">
                {authError}
              </div>
            )}

            {verificationEmailSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3 px-3 rounded-xl text-center font-semibold space-y-3">
                <p>
                  {locale === "en"
                    ? "Account created! Check your inbox and confirm your email."
                    : locale === "es"
                    ? "¡Cuenta creada! Revisa tu bandeja de entrada y confirma tu correo."
                    : "Cont creat! Verifică inbox-ul și confirmă adresa de email."}
                </p>
                <p className="text-[10px] text-emerald-400/80 font-medium">
                  {locale === "en"
                    ? "The confirmation page opens in English."
                    : locale === "es"
                    ? "La página de confirmación se abre en español."
                    : "Pagina de confirmare se deschide în română."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    setVerificationEmailSent(false);
                  }}
                  className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs"
                >
                  {locale === "en" ? "Got it" : locale === "es" ? "Entendido" : "Am înțeles"}
                </button>
              </div>
            ) : (
            <>
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <input
                type="email"
                placeholder={ui.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <input
                type="password"
                placeholder={ui.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 min-h-[44px]"
              >
                {isEmailLoading 
                  ? (locale === "en" ? "Processing..." : locale === "es" ? "Procesando..." : "Se procesează...") 
                  : (isLoginMode ? (locale === "en" ? "Log In" : locale === "es" ? "Iniciar sesión" : "Conectare") : (locale === "en" ? "Register" : locale === "es" ? "Registrarse" : "Înregistrare"))}
              </button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-zinc-800"></div>
              <span className="px-3 text-[10px] text-zinc-500 font-bold uppercase">{locale === "en" ? "Or" : locale === "es" ? "O" : "Sau"}</span>
              <div className="flex-1 h-px bg-zinc-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-xs font-bold py-2.5 rounded-xl transition-all inline-flex items-center justify-center gap-2 min-h-[44px]"
              >
                Google
              </button>
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-xs font-bold py-2.5 rounded-xl transition-all inline-flex items-center justify-center gap-2 min-h-[44px]"
              >
                Facebook
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setAuthError(null);
                  setVerificationEmailSent(false);
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold p-2 -m-2 inline-flex items-center justify-center min-h-[44px]"
              >
                {isLoginMode 
                  ? (locale === "en" ? "Don't have an account? Register" : locale === "es" ? "¿No tienes una cuenta? Regístrate" : "Nu ai cont? Înregistrează-te") 
                  : (locale === "en" ? "Already have an account? Log in" : locale === "es" ? "¿Ya tienes una cuenta? Inicia sesión" : "Ai deja cont? Conectează-te")}
              </button>
            </div>
            </>
            )}
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
          setShowAuthModal(true);
        }}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        currency={locale === "ro" ? "LEI" : "EUR"}
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
              <button onClick={() => setShowExportModal(false)} className="text-xs text-zinc-500 font-bold p-2 -m-2 inline-flex items-center justify-center min-w-[44px] min-h-[44px]">{locale === "en" ? "Close" : locale === "es" ? "Cerrar" : "Închide"}</button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed -mt-2">
              {ui.exportActiveTabHint}{" "}
              <span className="text-emerald-400 font-bold">
                {exportActiveTabDisplayLabel(activeVersionId, versions[activeVersionId] || result, locale)}
              </span>
            </p>
            
            <div className="flex flex-col gap-3">
              {/* PDF Sumar Gratuit */}
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
                {!isPlanPaid && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black uppercase">🔒 PRO</span>}
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
                {!isPlanPaid && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black uppercase">🔒 PRO</span>}
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
                {!isPlanPaid && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black uppercase">🔒 PRO</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="fixed top-[-9999px] left-[-9999px] w-[1280px] opacity-0 pointer-events-none z-[-50]">
          <DemoPdfSlides 
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

      {showExpertDrawer && (
        <ExpertSectionsDrawer
          locale={locale}
          user={user}
          hasProAccess={hasProAccess}
          isAdmin={isAdmin}
          businessName={result?.nume || ui.yourBusiness}
          onRequireAuth={() => setShowAuthModal(true)}
          onRequirePro={() => setShowPricingModal(true)}
          onAddSection={(newSection) => {
            const applied = applyExpertLibrarySection({
              activeVersionId,
              versions,
              result,
              newSection,
              access: versionStackAccess,
            });
            if (!applied.ok) {
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
            setVersions(applied.versions);
            setActiveVersionId(applied.activeVersionId);
            setResultState(applied.plan);
            if (typeof window !== "undefined") {
              localStorage.setItem("current_generated_plan", JSON.stringify(applied.plan));
            }
            void syncCurrentPlanToFirestore(applied.plan, applied.versions, applied.activeVersionId);
            setShowExpertDrawer(false);
          }}
          onClose={() => setShowExpertDrawer(false)}
        />
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
