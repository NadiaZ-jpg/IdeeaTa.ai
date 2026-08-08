"use client";
import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import pptxgen from "pptxgenjs";
import { EditForm } from "@/components/EditForm";
import dynamic from 'next/dynamic';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, User, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, getDocs } from 'firebase/firestore';
import { PricingModal } from '@/components/PricingModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import BuyMeACoffeeModal from '@/components/BuyMeACoffeeModal';
import { ConversionBanners } from '@/components/ConversionBanners';
import { migrateLocalPlansToFirebase } from '@/lib/migrationManager';
import { getExamples } from '@/lib/examples';
import { t } from '@/lib/translations';
import { UI_STRINGS } from '@/lib/uiStrings';
import { formatPriceLocalized } from '@/lib/priceHelper';
import { formatObjectNumbers, formatNumberedText } from "@/lib/utils";
import { EXPERT_TEMPLATES, ExpertTemplate } from '@/lib/templatesData';
import { StudioExportModal } from '@/components/modals/StudioExportModal';
import { AuthWallModal } from '@/components/modals/AuthWallModal';
import { ExpertSectionsDrawer } from '@/components/modals/ExpertSectionsDrawer';
import { DemoPdfSlides } from "@/components/pdf/DemoPdfSlides";
import { DemoLeftSidebar } from "@/components/sidebars/DemoLeftSidebar";
import { DemoBrochurePreview } from "@/components/pdf/DemoBrochurePreview";
import { DemoPresentationSlides } from "@/components/pdf/DemoPresentationSlides";
import { truncateText, splitTextIntoSlides, getDynamicTextSize } from '@/lib/planHelpers';
import { useExportActions } from '@/hooks/useExportActions';
import { fetchSharedPlanPayload, resetDemoShareCounters, clearSharedIdFromUrl, redirectIfSharedLocaleMismatch } from '@/hooks/useSharedPlanLoader';
import { resolveSharedViewCurrency, shouldShowCurrencyToggle } from '@/lib/pdfCtaBehavior';
import { FREE_ACCOUNT_PLAN_LIMIT, GUEST_DEMO_PLAN_LIMIT, clearLocalPlanState } from '@/lib/planQuota';
import { isAdminEmail } from '@/lib/adminEmails';
import { isPlanExportUnlocked, hasAccountStandardAccess } from '@/lib/planUnlock';
import { stripPaymentSuccessParams } from '@/lib/paymentReturn';
import { passwordResetActionCodeSettings } from '@/lib/authActionUrls';
import { canUseFreeToneEdit, consumeFreeToneEdit, isProToneKey, toneVersionKey } from '@/lib/toneQuota';
import { useCompleteMissingPlanFields } from '@/hooks/useCompleteMissingPlanFields';
import { useUIState } from '@/hooks/useUIState';
import { ActionBar } from '@/components/ActionBar';
import { MockupPreview } from '@/components/MockupPreview';
import { VersionSelector } from '@/components/VersionSelector';
import {
  buildStackedVersionKey,
  gateVersionStackAppend,
  noCombineAccessMessage,
  resolveEditBaseForToolRun,
  stackLimitReachedMessage,
  toolStepFromAction,
  withVersionStack,
  type CombineAction,
  type VersionStackAccess,
} from '@/lib/versionStack';

const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });

export default function DemoDesktop({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const [skill, setSkill] = useState("");
  const isEn = locale === "en";
  const isEs = locale === "es";
  const [demoCount, setDemoCount] = useState(0);
  const [resultState, setResultState] = useState<any>(null);
  const [versions, setVersionsState] = useState<{ [key: string]: any }>({});
  const activeVersionIdRef = useRef<string>("original");
  const [activeVersionId, _setActiveVersionId] = useState<string>("original");

  const setActiveVersionId = (id: string) => {
    activeVersionIdRef.current = id;
    _setActiveVersionId(id);
  };

  const setVersions = (valOrFn: any) => {
     setVersionsState((prev: any) => {
        const nextVal = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
        if (typeof window !== "undefined") {
           if (Object.keys(nextVal).length > 0) {
             localStorage.setItem("current_versions", JSON.stringify({versions: nextVal, activeVersionId: activeVersionIdRef.current}));
           } else {
             localStorage.removeItem("current_versions");
           }
        }
        return nextVal;
     });
  };

  const setResult = (valOrFn: any) => {
    setResultState((prev: any) => {
      const nextVal = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      if (nextVal === null) {
        setVersions({});
        setActiveVersionId("original");
      } else {
        setVersions((prevVers: any) => {
           const newVers = { ...prevVers, [activeVersionIdRef.current]: nextVal };
           if (typeof window !== "undefined") {
             localStorage.setItem("current_versions", JSON.stringify({versions: newVers, activeVersionId: activeVersionIdRef.current}));
           }
           return newVers;
        });
      }
      return nextVal;
    });
  };

  const result = resultState;
  useCompleteMissingPlanFields(result, setResult, locale);
  const [loading, setLoading] = useState(false);
  const [fxRate, setFxRate] = useState(0.201);
  const [currency, setCurrency] = useState(() => (locale === "ro" ? "LEI" : "EUR"));

  // EN/ES: nu lăsa LEI din planuri vechi / localStorage
  useEffect(() => {
    if (locale === "en" || locale === "es") {
      setCurrency("EUR");
    }
  }, [locale]);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'pptx' | 'word' | 'pdf-summary' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [activeAiPrompt, setActiveAiPrompt] = useState<{
    action: string;
    title: string;
    placeholder?: string;
    desc?: string;
    isConfirm?: boolean;
    combineOptions?: { basePlan?: any; sourceVersionId?: string };
  } | null>(null);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [showToneOptions, setShowToneOptions] = useState(false);
  const [aiLoadingMessageIndex, setAiLoadingMessageIndex] = useState(0);

  useEffect(() => {
    // Asigura ca la refresh pagina incepe intotdeauna de sus, nu de unde a ramas scrollul
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    if (activeAiPrompt) {
      setTimeout(() => {
        document.getElementById('ai-prompt-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [activeAiPrompt]);
  const [isPaid, setIsPaid] = useState(false);
  const [standardPackageActive, setStandardPackageActive] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingDownloadMode, setPendingDownloadMode] = useState<"PDF" | "DOCX" | "PPTX" | null>(null);
  const [credits, setCredits] = useState(0);
  const [euFundsUnlocked, setEuFundsUnlocked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [unlockedPlans, setUnlockedPlans] = useState<string[]>([]);
  const [unlockedPlanIds, setUnlockedPlanIds] = useState<string[]>([]);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const [lastEditParams, setLastEditParams] = useState<{action: string, customStyle?: string, customInput?: string} | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isCheckingShared, setIsCheckingShared] = useState(true);

  // UI State (modale, dropdown-uri) — gestionate centralizat în useUIState
  const {
    showPricingModal, setShowPricingModal,
    showQrModal, setShowQrModal,
    showBmcModal, setShowBmcModal,
    showAuthModal, setShowAuthModal,
    showPaywall, setShowPaywall,
    showExpertDrawer, setShowExpertDrawer,
    showStudioExportModal, setShowStudioExportModal,
  } = useUIState();

  const usedIdeasRef = useRef<number[]>([]);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'C' || e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')
      ) {
        e.preventDefault();
      }
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const placeholders = ui.placeholdersArray;
    let currentIdx = 0;
    let currentCharIdx = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const tick = () => {
      const fullText = placeholders[currentIdx];
      
      if (!isDeleting) {
        setAnimatedPlaceholder(fullText.substring(0, currentCharIdx + 1));
        currentCharIdx++;

        if (currentCharIdx === fullText.length) {
          isDeleting = true;
          timeout = setTimeout(tick, 2000); 
        } else {
          timeout = setTimeout(tick, 100); 
        }
      } else {
        setAnimatedPlaceholder(fullText.substring(0, currentCharIdx - 1));
        currentCharIdx--;

        if (currentCharIdx === 0) {
          isDeleting = false;
          currentIdx = (currentIdx + 1) % placeholders.length;
          timeout = setTimeout(tick, 500); 
        } else {
          timeout = setTimeout(tick, 50); 
        }
      }
    };

    timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isEditingAi) {
      setAiLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setAiLoadingMessageIndex(prev => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, [isEditingAi]);

  const startEditing = () => {
    setBackupResult(JSON.parse(JSON.stringify(result)));
    window.history.pushState({ isEditing: true }, '', window.location.pathname + '?edit=true');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setResult(backupResult);
    setIsEditing(false);
    if (typeof window !== "undefined" && window.location.search.includes('edit=true')) {
      window.history.replaceState({}, document.title, window.location.pathname + '?view=idea');
    }
  };

  const saveEditing = () => {
    setIsEditing(false);
    const nextVersions = {
      ...versions,
      [activeVersionId]: result
    };
    setVersionsState(nextVersions);
    void syncCurrentPlanToFirestore(result, nextVersions, activeVersionId);
    if (typeof window !== "undefined") {
      localStorage.setItem("current_generated_plan", JSON.stringify(result));
      localStorage.setItem(
        "current_versions",
        JSON.stringify({ versions: nextVersions, activeVersionId })
      );
    }
    if (typeof window !== "undefined" && window.location.search.includes('edit=true')) {
      window.history.replaceState({}, document.title, window.location.pathname + '?view=idea');
    }
  };

  // Pre-rezolvă toate string-urile UI pentru locale curent — elimină ternare inline
  const ui = UI_STRINGS[locale] || UI_STRINGS.ro;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isContentCopyProtected) {
      e.preventDefault();
      alert(t("alertCopyProtected", locale));
    }
  };



  const handleAiEdit = async (
    action: string,
    customStyle?: string,
    customInput?: string,
    isRetry?: boolean,
    options?: { basePlan?: any; sourceVersionId?: string }
  ) => {
    if (isEditingAi) return;

    const isActionFree = action === "professional_tone";
    const isProTone = isActionFree && isProToneKey(customStyle);

    // Tonuri persuasive/friendly necesită Pro (aliniat cu /api/edit)
    if (isProTone && !isAdmin && !hasProAccess) {
      if (!user) setShowAuthModal(true);
      else setShowPricingModal(true);
      return;
    }

    if (!isActionFree && !isAdmin && !hasProAccess) {
      if (!user) {
        setShowAuthModal(true);
      } else {
        setShowPricingModal(true);
      }
      return;
    }

    // Cont gratuit: tonuri free (formal/creative), max FREE_TONE_EDIT_LIMIT (consum după succes)
    if (isActionFree && !isProTone && !isAdmin && !hasStandardAccess) {
       if (!user) {
         setShowAuthModal(true);
         return;
       }
       if (!canUseFreeToneEdit(false)) {
         setShowPricingModal(true);
         return;
       }
    }

    let targetSection = "";
    let budgetPercent: number | null = null;
    if (action === "add_sections") {
      if (!customInput) return; // Anulat
      targetSection = customInput;
    } else if (action === "optimize_budget") {
      if (!customInput) return; // Anulat
      let percent = parseInt(customInput.replace(/%/g, ''));
      if (isNaN(percent) || percent <= 0 || percent > 90) {
        alert(t("alertValidPercent", locale));
        return;
      }
      budgetPercent = percent;
      targetSection = percent.toString(); 
    }

    // Original → sibling tab; non-original / Combine (+) → append on active (or source) tab
    const { isCombine, baseSource, currentStack } = resolveEditBaseForToolRun({
      activeVersionId,
      versions,
      result,
      combineOptions: options,
    });
    const nextStep = toolStepFromAction(action, customStyle, budgetPercent);
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
          const isStandardOnly = !!(versionStackAccess.hasStandardAccess && !versionStackAccess.hasFullAccess && !versionStackAccess.isAdmin);
          alert(stackLimitReachedMessage(locale, gate.limit, isStandardOnly));
          if (isStandardOnly) setShowPricingModal(true);
          return;
        }
        return;
      }
      nextStack = gate.nextStack;
    }

    setIsEditingAi(true);
    setAiEditError(null);
    setLastEditParams({ action, customStyle, customInput });
    setActiveAiPrompt(null);
    setAiPromptInput("");
    setShowToneOptions(false);
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

      const [res] = await Promise.all([
        fetch("/api/edit", {
          method: "POST",
          headers: editHeaders,
          body: JSON.stringify({ result: baseSource, action, customStyle, targetSection, locale, isRetry, currency })
        }),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      let data;
      try {
        if (!res.ok) {
          const text = await res.text();
          console.error("API Error Status:", res.status, "Body:", text);
          if (res.status === 504) {
            setAiEditError(t("errorResponseTimeout", locale));
            return;
          }
          
          let errorMsg = t("errorServerPrefix", locale) + res.status;
          let errCode = "";
          try {
            const errJson = JSON.parse(text);
            if (errJson.error) {
              errorMsg = errJson.error;
            }
            errCode = errJson.code || "";
          } catch(e) {}
          if (errCode === "TONE_LIMIT" || errCode === "PRO_REQUIRED" || errCode === "AUTH_REQUIRED") {
            setShowPricingModal(true);
          }
          
          setAiEditError(errorMsg);
          return;
        }
        data = JSON.parse(await res.text());
      } catch (e) {
        console.error(e);
        setAiEditError(t("errorNetworkError", locale));
        return;
      }
      
      if (data && data.updatedResult) {
        try {
          const parsed = JSON.parse(data.updatedResult);
          
          const vKey = nextStep
            ? buildStackedVersionKey(nextStack)
            : (action === "eu_funds_optimization"
                ? `eu_funds_${Date.now()}`
                : action === "investor_ready"
                ? `investor_${Date.now()}`
                : action === "professional_tone"
                ? toneVersionKey(customStyle)
                : action === "optimize_budget"
                ? `budget_${Date.now()}`
                : action === "add_sections"
                ? `expert_${Date.now()}`
                : activeVersionId);
          
          const formattedResult = withVersionStack(formatObjectNumbers(parsed), nextStack);
          const originalSnapshot = versions.original ?? (isCombine ? undefined : baseSource);
          const base =
            versions && Object.keys(versions).length > 0
              ? versions
              : { original: originalSnapshot || baseSource };
          const nextVersions = {
            ...base,
            ...(!base.original && originalSnapshot ? { original: originalSnapshot } : {}),
            [vKey]: formattedResult,
          };
          
          setVersions(nextVersions);
          setActiveVersionId(vKey);
          setResultState(formattedResult);
          
          if (isActionFree && !isProTone && !isAdmin && !hasStandardAccess) {
            consumeFreeToneEdit(false);
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("current_generated_plan", JSON.stringify(formattedResult));
          }

          void syncCurrentPlanToFirestore(formattedResult, nextVersions, vKey);
          
          setTimeout(() => {
             if (action === "professional_tone" || action === "eu_funds_optimization" || action === "investor_ready") {
                if (typeof window !== "undefined") {
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }
             } else {
                let targetId = "";
                if (action === "add_sections") {
                   targetId = "section-custom";
                } else if (action === "optimize_budget") {
                   targetId = "section-financial";
                }
                
                if (targetId) {
                   const el = document.getElementById(targetId);
                   if (action === "add_sections" && el && el.lastElementChild) {
                     el.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
                   } else if (el) {
                     el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }
                }
             }
           }, 800);
        } catch (err) {
          console.error("Failed to parse JSON:", err);
          setAiEditError(t("errorInvalidFormat", locale));
        }
      } else if (data.error) {
        setAiEditError(data.error);
      }
    } catch (e) {
      console.error(e);
      setAiEditError(t("errorUnexpectedEdit", locale));
    } finally {
      setIsEditingAi(false);
    }
  };

  const handleCombineWith = (sourceVersionId: string, combine: CombineAction) => {
    const sourcePlan = versions[sourceVersionId];
    if (!sourcePlan) return;
    setActiveVersionId(sourceVersionId);
    setResultState(sourcePlan);

    if (combine.action === "optimize_budget") {
      setActiveAiPrompt({
        action: "optimize_budget",
        title: ui.optimizeBudget,
        placeholder: ui.optimizeBudgetPlaceholder,
        desc:
          locale === "en"
            ? "By what percentage do you want to reduce the budgeted costs?"
            : locale === "es"
            ? "¿Qué porcentaje deseas reducir de los costos presupuestados?"
            : "Cu ce procent dorești să reduci costurile bugetate?",
        combineOptions: { basePlan: sourcePlan, sourceVersionId },
      });
      return;
    }
    if (combine.action === "professional_tone") {
      void handleAiEdit(combine.action, combine.customStyle, undefined, false, {
        basePlan: sourcePlan,
        sourceVersionId,
      });
      return;
    }
    void handleAiEdit(combine.action, undefined, undefined, false, {
      basePlan: sourcePlan,
      sourceVersionId,
    });
  };

  const updateField = (path: (string|number)[], value: string) => {
    setResult((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      let curr = next;
      for (let i = 0; i < path.length - 1; i++) {
        curr = curr[path[i]];
      }
      curr[path[path.length - 1]] = value;
      return next;
    });
  };

  const removeField = (path: (string|number)[]) => {
    setResult((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      let curr = next;
      for (let i = 0; i < path.length - 1; i++) {
        curr = curr[path[i]];
      }
      const lastKey = path[path.length - 1];
      if (Array.isArray(curr)) {
         curr.splice(lastKey as number, 1);
      } else {
         delete curr[lastKey];
      }
      return next;
    });
  };

  const [showExamples, setShowExamples] = useState(false); 
  const [mockupTab, setMockupTab] = useState(0);
  const [innerMockupTab, setInnerMockupTab] = useState('swot');
  
  const [user, setUser] = useState<User | null>(null);
  const [promoCodeUnlocked, setPromoCodeUnlocked] = useState(false);
  const isAdmin = user ? isAdminEmail(user.email) : false;
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
  const hasStandardAccess = hasAccountStandardAccess({
    isPaid,
    standardPackageActive,
    promoCodeUnlocked,
    isAdmin,
    subscriptionActive,
    euFundsUnlocked,
  });
  const isStudioPaid = hasStandardAccess;
  const hasProAccess = isAdmin || subscriptionActive || euFundsUnlocked;
  const isContentCopyProtected = !hasStandardAccess;
  const versionStackAccess: VersionStackAccess = {
    isAdmin,
    hasStandardAccess,
    hasFullAccess: isAdmin || subscriptionActive || euFundsUnlocked,
    hasProTools: hasProAccess,
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
        selectedCurrency: updatedResult?.selectedCurrency || currency || (locale === "ro" ? "LEI" : "EUR"),
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

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        window.scrollTo({ top: 0 });
        await migrateLocalPlansToFirebase(currentUser);
      } else {
        // Regula de Aur: Nu ștergem planul pentru utilizatorii de pe demo
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setCredits(0);
      setEuFundsUnlocked(false);
      setSubscriptionActive(false);
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
        setUnlockedPlans(data.unlockedPlans || []);
        setUnlockedPlanIds(data.unlockedPlanIds || []);
        setPromoCodeUnlocked(data.promoCodeUnlocked || false);
        setIsPaid(data.isPaid || false);
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
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("payment_success") === "true";
    const tier = urlParams.get("tier");

    if (paymentSuccess && user) {
      const verifyPayment = async () => {
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
            }
            stripPaymentSuccessParams();
          }
        } catch (error) {
          console.error("Eroare la verificarea plății:", error);
        }
      };
      verifyPayment();
    }
  }, [user]);

  // Incarca planul salvat din localStorage la pornire si verifica daca s-a anulat plata
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDemoCount(parseInt(localStorage.getItem("demoGenerateCount") || "0", 10));
      const urlParams = new URLSearchParams(window.location.search);
      const isStartNou = ["nou", "new", "nuevo"].includes(
        (urlParams.get("start") || "").toLowerCase()
      );
      if (isStartNou) {
        localStorage.removeItem("current_versions");
        localStorage.removeItem("current_generated_plan");
        localStorage.removeItem("resultState");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      const sharedId = urlParams.get("sharedId");
      
      if (sharedId) {
        fetchSharedPlanPayload(sharedId)
          .then(payload => {
            if (!payload) return;
            if (redirectIfSharedLocaleMismatch(payload.locale, locale, sharedId)) return;
            setResult(payload.data);
            setCurrency(resolveSharedViewCurrency(payload.data, payload.locale));
            setIsSharedView(true);
            resetDemoShareCounters(setDemoCount);
            clearSharedIdFromUrl();
          })
          .catch(err => console.error("Eroare incarcare shareId:", err))
          .finally(() => setIsCheckingShared(false));
      } else {
        setIsCheckingShared(false);
        const savedVersionsStr = localStorage.getItem("current_versions");
        if (savedVersionsStr) {
          const {versions: v, activeVersionId: a} = JSON.parse(savedVersionsStr);
          setVersionsState(v);
          setActiveVersionId(a);
          setResultState(v[a]);
          // PLASA DE SIGURANȚĂ: Auto-resume Edit Mode
          setBackupResult(JSON.parse(JSON.stringify(v[a])));
          setIsEditing(true);
          if (typeof window !== "undefined" && !window.location.search.includes('edit=true')) {
            window.history.replaceState({ isEditing: true }, '', window.location.pathname + '?edit=true');
          }
        } else {
          const saved = localStorage.getItem("current_generated_plan");
          if (saved) {
            const parsedPlan = formatObjectNumbers(JSON.parse(saved));
            setResult(parsedPlan);
            // PLASA DE SIGURANȚĂ: Auto-resume Edit Mode
            setBackupResult(JSON.parse(JSON.stringify(parsedPlan)));
            setIsEditing(true);
            if (typeof window !== "undefined" && !window.location.search.includes('edit=true')) {
              window.history.replaceState({ isEditing: true }, '', window.location.pathname + '?edit=true');
            }
          }
        }
      }
      
      const paymentCancelled = urlParams.get("payment_cancelled") === "true";
      if (paymentCancelled) {
        setShowPricingModal(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Asculta evenimentul de back (popstate) pentru a restaura documentul cand utilizatorul da "Inapoi" de la login
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const isEdit = searchParams.get('edit') === 'true';
      const isIdea = searchParams.get('view') === 'idea' || searchParams.has('sharedId');
      const isLogin = searchParams.get('login') === 'true';

      // Gestioneaza Studio Editare
      setIsEditing(isEdit);

      // Gestioneaza Idea vs Start (Daca nu suntem in login, edit sau idea, inseamna ca suntem pe prima pagina)
      if (!isIdea && !isEdit && !isLogin) {
        // PLASA DE SIGURANȚĂ: Nu mai ștergem result-ul! Îl lăsăm în memorie pentru auto-resume.
        // setResult(null); 
        
        // Dacă aveam ceva în state, încercăm să auto-reluăm
        if (resultState || localStorage.getItem("current_versions") || localStorage.getItem("current_generated_plan")) {
          setIsEditing(true);
          window.history.replaceState({ isEditing: true }, '', window.location.pathname + '?edit=true');
        }
      } else if (isIdea && !isEdit) {
        // Suntem pe pagina cu ideea, trebuie sa ne asiguram ca result exista (restauram din localStorage daca e cazul)
        setResultState((prevResult: any) => {
          if (!prevResult) {
            const savedVersionsStr = localStorage.getItem("current_versions");
            if (savedVersionsStr) {
               const {versions: v, activeVersionId: a} = JSON.parse(savedVersionsStr);
               setVersionsState(v);
               setActiveVersionId(a);
               return v[a];
            }
            const saved = localStorage.getItem("current_generated_plan");
            if (saved && saved !== "null" && saved !== "undefined") {
               const parsed = formatObjectNumbers(JSON.parse(saved));
               setVersionsState({ original: parsed });
               setActiveVersionId("original");
               return parsed;
            }
            return null;
          }
          return prevResult;
        });
      }

      // Gestioneaza Login / Share View logic
      if (!user) {
        if (!isLogin) {
          const savedVersionsStr = localStorage.getItem("current_versions");
          const saved = localStorage.getItem("current_generated_plan");
          if (savedVersionsStr || (saved && saved !== "null" && saved !== "undefined")) {
            setIsSharedView(true);
          }
        } else {
          setIsSharedView(false);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Salveaza planul in localStorage cand se schimba rezultatul
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      if (result) {
        localStorage.setItem("current_generated_plan", JSON.stringify(result));
        // Guest only — dacă ești logat, planul e deja în Firestore; lista locală
        // ar duce la duplicate la migrate pe Dashboard.
        if (!user) {
          try {
            const listStr = localStorage.getItem("demo_plans_list");
            let list = listStr ? JSON.parse(listStr) : [];
            if (!Array.isArray(list)) list = [];
            const planToSave = { ...result };
            if (!planToSave.id) {
              const safeName = planToSave.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Plan';
              planToSave.id = `${safeName}_${Date.now()}`;
            }
            const exists = list.some((p: any) => p.nume === planToSave.nume || p.id === planToSave.id);
            if (!exists) {
              list.push(planToSave);
              localStorage.setItem("demo_plans_list", JSON.stringify(list));
            }
          } catch (e) {
            console.error("Eroare la adăugarea planului în demo_plans_list:", e);
          }
        }
      } else {
        localStorage.removeItem("current_generated_plan");
      }
    }
  }, [result, user]);

  // Prevenire copiere conținut dacă este protejat
  useEffect(() => {
    const handleCopyCut = (e: ClipboardEvent) => {
      if (isContentCopyProtected) {
        e.preventDefault();
        alert(t("alertProtectedPreview", locale));
      }
    };

    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    return () => {
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
    };
  }, [isContentCopyProtected]);

  // Prevenire inchidere accidentala a paginii, exceptand cand descarcam un fisier
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (result && !isSharedView && !isDownloading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [result, isSharedView, isDownloading]);

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => { setAuthError(null); })
      .catch((error: any) => {
        console.error("Eroare Google login:", error);
        setAuthError("Nu s-a putut conecta cu Google. Încearcă din nou.");
      });
  };

  const handleFacebookLogin = () => {
    const provider = new FacebookAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => { setAuthError(null); })
      .catch((error: any) => {
        console.error("Eroare Facebook login:", error);
        setAuthError("Nu s-a putut conecta cu Facebook. Încearcă din nou.");
      });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError("Introdu adresa de email pentru a primi link-ul de resetare.");
      return;
    }
    setIsEmailLoading(true);
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email, passwordResetActionCodeSettings(locale));
      setResetEmailSent(true);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setAuthError("Nu există niciun cont cu această adresă de email.");
      } else {
        setAuthError(error.message || "A apărut o eroare. Încearcă din nou.");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsEmailLoading(true);

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
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
      }
      // If successful, onAuthStateChanged will handle the redirect/state update
    } catch (error: any) {
      console.error("Eroare email auth:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setAuthError("Email sau parolă incorectă.");
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError("Există deja un cont cu acest email. Te rugăm să te loghezi.");
      } else if (error.code === 'auth/weak-password') {
        setAuthError("Parola trebuie să aibă cel puțin 6 caractere.");
      } else {
        setAuthError(error.message || "A apărut o eroare necunoscută la autentificare.");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };
  
  const inputRef = useRef<any>(null);
  const brochureRef = useRef<any>(null);
  const presentationRef = useRef<any>(null);
  const pdfPrintRef = useRef<any>(null);

  const ALL_EXAMPLES = getExamples(locale);

  const [examplesList, setExamplesList] = useState<any[]>(ALL_EXAMPLES.slice(0, 18));

  useEffect(() => {
    // Schimbare automată o dată la 14 zile
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    const epoch = 1700000000000; 
    const startIndex = (Math.floor((Date.now() - epoch) / twoWeeksMs) * 18) % ALL_EXAMPLES.length;
    const currentExamples = [];
    for (let i = 0; i < 18; i++) {
      currentExamples.push(ALL_EXAMPLES[(startIndex + i) % ALL_EXAMPLES.length]);
    }
    setExamplesList(currentExamples);
  }, []);

  const randomIdeas = ALL_EXAMPLES;

  const loadingMessages = locale === "en" ? [
    "Initiating market analysis...",
    "Calculating financial requirements...",
    "Structuring the operational plan...",
    "Fetching the updated currency exchange rate...",
    "Finalizing the S.W.O.T. strategy...",
    "Polishing the smart document...",
    "Almost ready..."
  ] : locale === "es" ? [
    "Iniciando el análisis de mercado...",
    "Calculando los requerimientos financieros...",
    "Estructurando el plan operativo...",
    "Obteniendo la tasa de cambio de moneda actualizada...",
    "Finalizando la estrategia F.O.D.A...",
    "Puliendo el documento inteligente...",
    "Casi listo..."
  ] : [
    "Se inițiază analiza de piață...",
    "Se calculează necesarul financiar...",
    "Se structurează planul operațional...",
    "Se preia cursul valutar actualizat...",
    "Se definitivează strategia S.W.O.T...",
    "Se finisează documentul inteligent...",
    "Aproape gata..."
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (loading) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 4000); 
    }
    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  const generate = async (e?: React.FormEvent, retryCount = 0) => {
    if (e) e.preventDefault(); 
    if (!skill.trim() || (loading && retryCount === 0)) return;

    let shouldStopLoading = true;

    if (retryCount === 0) {
      if (typeof window !== "undefined") {
        const accountPaid = !!(
          isPaid ||
          promoCodeUnlocked ||
          subscriptionActive ||
          euFundsUnlocked
        );
        if (!user) {
          const count = parseInt(localStorage.getItem("demoGenerateCount") || "0", 10);
          if (count >= GUEST_DEMO_PLAN_LIMIT) {
            setShowAuthModal(true);
            return;
          }
        } else if (!isAdmin && !accountPaid) {
          try {
            const plansRef = collection(db, "users", user.uid, "plans");
            const snap = await getDocs(plansRef);
            if (snap.size >= FREE_ACCOUNT_PLAN_LIMIT) {
              setShowPricingModal(true);
              return;
            }
          } catch (err) {
            console.error("Eroare verificare limită planuri Firestore:", err);
          }
        }
      }
      setLoading(true);
      setMessageIndex(0);
      setResult(null);
      // Do NOT clear isPaid — account entitlements come from Firestore snapshot.
    }

    try {
      const token = user ? await user.getIdToken() : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [res] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers,
          body: JSON.stringify({
            skill,
            locale,
            currency: locale === "ro" ? currency : "EUR",
            surface: "demo",
          }),
        }),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      let data;
      try {
        const resText = await res.text();
        try {
          data = JSON.parse(resText);
        } catch (e) {
          throw new Error(res.ok ? t("errorInvalidFormat", locale) : t("errorNetworkError", locale));
        }

        if (!res.ok) {
          if (data?.error === "LIMIT_REACHED") {
            setShowPricingModal(true);
            return;
          }
          throw new Error(data.error || `${t("errorServerPrefix", locale)}${res.status}`);
        }
      } catch (err: any) {
        throw new Error(err.message || t("errorNetworkError", locale));
      }
      if (data.fx_rate) setFxRate(data.fx_rate);

      if (data && data.ideas && data.ideas.length > 0) {
        const content = data.ideas[0];
        let cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        cleanJson = cleanJson.replace(/[„“”]/g, '"');
        const startIndex = cleanJson.indexOf('{');
        const endIndex = cleanJson.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) cleanJson = cleanJson.substring(startIndex, endIndex + 1);

        try {
          cleanJson = cleanJson.replace(/,\s*([}\]])/g, '$1');
          const finalResult = formatObjectNumbers(JSON.parse(cleanJson));
          const planId = String(finalResult.nume || "Plan").replace(/[^a-zA-Z0-9]/g, '_') + "_" + Date.now();
          finalResult.id = planId;
          const initialVersions = { original: finalResult };

          setActiveVersionId("original");
          setVersions(initialVersions);
          setResultState(finalResult);
          if (typeof window !== "undefined") {
            localStorage.setItem("current_generated_plan", JSON.stringify(finalResult));
            localStorage.setItem(
              "current_versions",
              JSON.stringify({ versions: initialVersions, activeVersionId: "original" })
            );
            if (!user && retryCount === 0) {
              const count = parseInt(localStorage.getItem("demoGenerateCount") || "0", 10);
              localStorage.setItem("demoGenerateCount", (count + 1).toString());
              setDemoCount(count + 1);
            }
          }
          window.history.pushState({ view: 'idea' }, '', window.location.pathname + '?view=idea');
          setSkill(""); 
          
          // Scroll dynamically to the top of the page to show the top of the new plan
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 100);
          
          if (user) {
            try {
              const planRef = doc(db, "users", user.uid, "plans", planId);
              await setDoc(planRef, {
                ...finalResult,
                versions: initialVersions,
                activeVersionId: "original",
                createdAt: new Date().toISOString(),
              });
              console.log("Plan salvat cu succes în Firestore:", planId);
            } catch (fsError) {
              console.error("Eroare la salvarea planului în Firestore:", fsError);
            }
          }
        } catch (parseError) {
          console.error("TEXTUL GENERAT DE AI A FOST:", cleanJson);
          if (retryCount < 2) {
            console.log("Retrying generation due to invalid JSON...", retryCount + 1);
            shouldStopLoading = false;
            generate(undefined, retryCount + 1);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      generate();
    }
  };


  const resetApp = () => {
    setResult(null);
    setCurrency(locale === "ro" ? "LEI" : "EUR");
    setIsSharedView(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("current_generated_plan");
      window.history.pushState({}, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const { downloadAction } = useExportActions({
    result,
    locale,
    currency,
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
    t,
    activeVersionId,
    onPlanUnlockedByCredit: (planName, planId) => {
      setUnlockedPlans((prev) => (prev.includes(planName) ? prev : [...prev, planName]));
      if (planId) {
        setUnlockedPlanIds((prev) => (prev.includes(planId) ? prev : [...prev, planId]));
      }
    },
  });

  const renderSidebar = () => (
    <DemoLeftSidebar 
      user={user}
      result={result}
      ui={ui}
      locale={locale}
      t={t}
      hasProAccess={hasProAccess}
      hasStandardAccess={hasStandardAccess}
      isAdmin={isAdmin}
      activeAiPrompt={activeAiPrompt}
      setActiveAiPrompt={setActiveAiPrompt}
      isEditingAi={isEditingAi}
      showToneOptions={showToneOptions}
      setShowToneOptions={setShowToneOptions}
      setShowAuthModal={setShowAuthModal}
      setShowPricingModal={setShowPricingModal}
      setShowExpertDrawer={setShowExpertDrawer}
      handleAiEdit={handleAiEdit}
      aiPromptInput={aiPromptInput}
      setAiPromptInput={setAiPromptInput}
    />
  );

  if (isAuthLoading || isCheckingShared) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main 
      className="min-h-screen bg-[#09090b] text-white px-8 pt-2 pb-8 flex flex-col items-center font-sans print:hidden relative overflow-x-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="hidden print:block w-full h-full bg-white text-black text-center p-20 text-3xl font-bold">
        {ui.protectedContentPrint}
      </div>
      {/* Background glow orbs */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse duration-[8000ms] z-0"></div>
      <div className="absolute top-[35%] right-[-15%] w-[650px] h-[650px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none animate-pulse duration-[12000ms] z-0"></div>

      {loading && !result && (
        <div className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-sm z-[100] flex items-center justify-center px-6">
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-2xl font-bold text-white tracking-widest uppercase text-center transition-all duration-300">
              {ui.ideaComingAlive}
            </p>
            <p className="text-emerald-400 font-medium mt-3 text-center transition-all duration-500 max-w-lg">
              {loadingMessages[messageIndex]}
            </p>
          </div>
        </div>
      )}

      {isDownloading && (
        <div className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-2xl font-bold text-white tracking-widest uppercase text-center">
              {isDownloading === 'pptx' 
                ? ui.generatingPptx
                : isDownloading === 'pdf' 
                  ? ui.generatingPdf
                  : ui.generatingDoc}
            </p>
          </div>
        </div>
      )}

      {isEditingAi && (
        <div className="fixed inset-0 bg-[#09090b]/95 backdrop-blur-sm z-[100] flex items-center justify-center px-6">
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            {aiEditError ? (
              <div className="bg-[#121214] border border-red-500/30 rounded-[2rem] p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] ring-1 ring-white/5">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-3xl mb-6 mx-auto animate-bounce">
                  ⚠️
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {ui.processingError}
                </h3>
                <p className="text-zinc-400 text-base leading-relaxed mb-6 whitespace-pre-line">
                  {aiEditError}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setAiEditError(null);
                      if (lastEditParams) {
                        handleAiEdit(lastEditParams.action, lastEditParams.customStyle, lastEditParams.customInput, true);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 animate-pulse"
                  >
                    {ui.retryBtn}
                  </button>
                  <button
                    onClick={() => {
                      setAiEditError(null);
                      setIsEditingAi(false);
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold px-6 py-3 rounded-xl transition-all cursor-pointer hover:text-white"
                  >
                    {ui.closeBtn}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-2xl font-bold text-white tracking-widest uppercase text-center transition-all duration-300">
                  {aiLoadingMessageIndex === 0 && ui.aiLoadingStep0}
                  {aiLoadingMessageIndex === 1 && ui.aiLoadingStep1}
                  {aiLoadingMessageIndex === 2 && ui.aiLoadingStep2}
                  {aiLoadingMessageIndex === 3 && ui.aiLoadingStep3}
                </p>
                <p className="text-emerald-400 font-medium mt-3 text-center transition-all duration-500 max-w-lg">
                  {aiLoadingMessageIndex === 0 && ui.aiLoadingDesc0}
                  {aiLoadingMessageIndex === 1 && ui.aiLoadingDesc1}
                  {aiLoadingMessageIndex === 2 && ui.aiLoadingDesc2}
                  {aiLoadingMessageIndex === 3 && ui.aiLoadingDesc3}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`${isDownloading === 'pptx' ? 'hidden' : 'flex'} flex-col items-center w-full max-w-[1600px] px-4 md:px-12 relative z-10`}>
        <ConversionBanners 
          isSharedView={isSharedView}
          user={user}
          result={result}
          onResetApp={resetApp}
          onAuthClick={() => setShowAuthModal(true)}
          locale={locale}
        />
        <div className="w-full flex justify-between items-start sm:items-center py-2 border-b border-zinc-800/80 mb-3 print:hidden">
          <div className="flex flex-col gap-2">
            <span className="text-zinc-500 text-xs font-semibold">{t('intelligentBusinessProject', locale)}</span>
            <button 
              type="button"
              onClick={() => setShowBmcModal(true)}
              className="bg-[#FFDD00] text-black px-3 py-1 rounded-md font-bold text-xs hover:bg-[#FFEA4D] hover:scale-105 transition-all flex items-center gap-1.5 w-max shadow-sm cursor-pointer"
              title={ui.supportCoffeeTitle}
            >
              <span>☕</span> {ui.buyMeACoffee}
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            {!result && <LanguageSwitcher currentLocale={locale} />}
            {user ? (
              <>
                <span className="text-zinc-400">{user.email}</span>
                {isAdmin ? (
                  <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                     ADMIN ★
                  </span>
                ) : subscriptionActive ? (
                  <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                     PRO
                  </span>
                ) : euFundsUnlocked ? (
                  <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                   {ui.badgeStudioGrants}
                  </span>
                ) : isPlanPaid ? (
                  <span className="bg-blue-500/20 border border-blue-500/40 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    {ui.badgeStandardUnlocked}
                  </span>
                ) : (
                  <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                    {ui.badgePreviewOnly}
                  </span>
                )}
                <a 
                  href={ui.routes.dashboard}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold underline cursor-pointer"
                >
                  {ui.myPlans}
                </a>
                {!subscriptionActive && (
                  <button 
                    onClick={() => { if (!user) { setShowAuthModal(true); } else { setShowPricingModal(true); } }}
                    className="text-zinc-400 hover:text-white transition-colors font-semibold cursor-pointer"
                  >
                    {ui.pricing}
                  </button>
                )}
                <button 
                  onClick={async () => {
                    clearLocalPlanState();
                    await signOut(auth);
                  }}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  {ui.logOut}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href={ui.routes.login}
                  className="text-zinc-400 hover:text-white transition-colors font-semibold cursor-pointer"
                >
                  {ui.logIn}
                </Link>
                <Link 
                  href={ui.routes.demoNew}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition-all ml-2"
                >
                  {ui.tryFree}
                </Link>
              </>
            )}
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-black mt-4 lg:mt-12 mb-6 lg:mb-8 not-italic tracking-tighter cursor-pointer bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer print:hidden self-start lg:self-center" onClick={resetApp}>
          IdeeaTa.ai
        </h1>
        
        {!result && (
          <>
          <div className="w-full flex flex-col items-center justify-center mb-12 lg:mb-16 relative">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-sm font-black uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-emerald-400/50 transition-all duration-300 animate-pulse relative z-10">
              <span className="text-base">✨</span> {ui.badgePreviewOnly === "PREVIEW ONLY" ? "Don't start a business before checking IdeeaTa.ai" : ui.badgePreviewOnly === "SOLO VISTA PREVIA" ? "No empieces un negocio antes de consultar IdeeaTa.ai" : "Nu începe o afacere înainte să verifici IdeeaTa.ai"}
            </div>
            {/* Elegant curved line bridging the gap below the pill */}
            <div className="w-full max-w-2xl mt-4 opacity-50 relative -top-6 -z-10 hidden md:block">
              <svg viewBox="0 0 600 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <path d="M 0 10 C 150 10, 200 70, 300 70 C 400 70, 450 10, 600 10" stroke="url(#paint0_linear)" strokeWidth="1" strokeDasharray="4 4" />
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#10b981" />
                    <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
            <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-20 items-stretch animate-in fade-in zoom-in duration-500 mb-32 mt-4 lg:mt-8">
          {/* Left Column */}
          <div className="flex flex-col justify-between text-left min-h-full">
            
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-[3.5rem] font-black mb-8 leading-[1.1] not-italic text-white tracking-tighter text-left max-w-[90%]" dangerouslySetInnerHTML={{ __html: ui.heroSubtitle.replace("experiența", "<span class='text-emerald-400'>experiența</span>").replace("expertise", "<span class='text-emerald-400'>expertise</span>").replace("experiencia", "<span class='text-emerald-400'>experiencia</span>") }}>
              </h2>
              
              <p className="text-zinc-400 text-xl lg:text-2xl leading-relaxed not-italic font-medium text-left">
                {ui.heroDesc1}
              </p>
              <p className="text-zinc-400 text-xl lg:text-2xl mt-4 leading-relaxed not-italic font-medium text-left">
                {ui.heroDesc2}
              </p>
            </div>

            {/* Animated wave lines - decorative */}
            <div className="relative w-full overflow-hidden my-8 opacity-70">
              <svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <defs>
                  <style>{`
                    @keyframes waveShift {
                      0% { transform: translateX(0px); }
                      100% { transform: translateX(-60px); }
                    }
                    @keyframes waveShift2 {
                      0% { transform: translateX(0px); }
                      100% { transform: translateX(60px); }
                    }
                    .wv1 { animation: waveShift 7s ease-in-out infinite alternate; }
                    .wv2 { animation: waveShift2 9s ease-in-out infinite alternate; }
                    .wv3 { animation: waveShift 11s ease-in-out infinite alternate-reverse; }
                    .wv4 { animation: waveShift2 13s ease-in-out infinite alternate; }
                    .wv5 { animation: waveShift 15s ease-in-out infinite alternate-reverse; }
                  `}</style>
                </defs>
                {/* Group 1 - bright green, top waves */}
                <g className="wv1" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.8">
                  <path d="M-60,18 C-10,-10 60,55 130,15 C200,-25 270,60 340,10 C400,-20 460,45 560,12" />
                  <path d="M-60,36 C-5,5 65,70 135,30 C205,-10 275,75 345,25 C405,-5 462,62 560,28" />
                  <path d="M-60,54 C0,22 70,85 140,45 C210,5 280,90 350,40 C410,10 465,78 560,44" />
                </g>
                {/* Group 2 - mid green, middle waves */}
                <g className="wv2" stroke="#10b981" strokeWidth="0.8" fill="none" opacity="0.5">
                  <path d="M-60,72 C5,40 75,100 145,60 C215,20 285,105 355,55 C415,25 468,92 560,60" />
                  <path d="M-60,90 C10,58 80,115 150,75 C220,35 290,118 360,70 C418,40 470,108 560,76" />
                  <path d="M-60,108 C15,76 85,130 155,90 C225,50 295,132 365,85 C422,55 472,124 560,92" />
                </g>
                {/* Group 3 - light green, bottom waves */}
                <g className="wv3" stroke="#6ee7b7" strokeWidth="0.6" fill="none" opacity="0.28">
                  <path d="M-60,124 C20,92 90,145 160,105 C230,65 300,148 370,100 C426,70 474,138 560,108" />
                  <path d="M-60,140 C25,108 95,160 165,120 C235,80 305,162 375,115 C430,85 476,152 560,124" />
                  <path d="M-60,156 C30,124 100,175 170,135 C240,95 310,175 380,130 C434,100 478,165 560,140" />
                </g>
                {/* Group 4 - extra waves */}
                <g className="wv4" stroke="#6ee7b7" strokeWidth="0.4" fill="none" opacity="0.15">
                  <path d="M-60,172 C35,140 105,190 175,150 C245,110 315,190 385,145 C440,115 480,180 560,156" />
                  <path d="M-60,188 C40,156 110,205 180,165 C250,125 320,205 390,160 C445,130 484,195 560,172" />
                  <path d="M-60,204 C45,172 115,220 185,180 C255,140 325,220 395,175 C450,145 488,210 560,188" />
                </g>
                {/* Group 5 - extra waves, very faded */}
                <g className="wv5" stroke="#34d399" strokeWidth="0.3" fill="none" opacity="0.08">
                  <path d="M-60,220 C50,188 120,235 190,195 C260,155 330,235 400,190 C455,160 492,225 560,204" />
                  <path d="M-60,236 C55,204 125,250 195,210 C265,170 335,250 405,205 C460,175 496,240 560,220" />
                  <path d="M-60,252 C60,220 130,265 200,225 C270,185 340,265 410,220 C465,190 500,255 560,236" />
                </g>
              </svg>
            </div>

            <div className="flex flex-col gap-6 mt-2">

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/40 via-zinc-700/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">{ui.generationTime}</p>
                  <p className="text-emerald-400 text-sm font-black">{ui.generationTimeSub}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/30 via-zinc-700/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">{ui.exportFormat}</p>
                  <p className="text-emerald-400 text-sm font-black">PDF · PPTX · DOCX</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/20 via-zinc-700/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">{ui.documentStructure}</p>
                  <p className="text-emerald-400 text-sm font-black">{ui.documentStructureSub}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/10 via-zinc-700/30 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">{ui.grantsInvestors}</p>
                  <p className="text-emerald-400 text-sm font-black">{ui.investorPlanBtn}</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (Floating Studio UI) */}
          <div className="relative w-full">
            {/* Glow behind the box */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            
            {/* Glassmorphism Container */}
            <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-10 shadow-[0_0_60px_rgba(16,185,129,0.1)] relative z-10 flex flex-col gap-6 ring-1 ring-white/5">
              
              {/* Fake window controls & Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer">IdeeaTa Studio</h2>
                <div className="w-8"></div>
              </div>
              
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <p className="text-zinc-400 font-medium text-lg">
                  {ui.buildPlanIntelligently}
                </p>
              </div>
              
              <form onSubmit={generate} className="flex flex-col gap-4 w-full relative group z-10">
                {skill.length > 35 && (
                  <div className="absolute bottom-full mb-3 left-0 right-0 bg-zinc-800 text-zinc-100 p-4 rounded-xl text-base shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 text-center whitespace-normal break-words border border-zinc-600 pointer-events-none font-medium leading-relaxed">
                    {skill}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-800 transform rotate-45 border-b border-r border-zinc-600"></div>
                  </div>
                )}
                
                <div className="relative group/input">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl blur opacity-20 group-focus-within/input:opacity-50 transition duration-500"></div>
                  <textarea
                    ref={inputRef as any}
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder={ui.inputPlaceholder}
                    className="relative w-full h-32 p-6 rounded-2xl bg-[#09090b] border border-zinc-700 outline-none focus:border-emerald-500 transition-all text-lg shadow-inner resize-none placeholder:text-zinc-600 font-medium text-zinc-400"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (usedIdeasRef.current.length >= randomIdeas.length) {
                        usedIdeasRef.current = [];
                      }
                      let nextIndex = Math.floor(Math.random() * randomIdeas.length);
                      while (usedIdeasRef.current.includes(nextIndex) || randomIdeas[nextIndex].long === skill) {
                        nextIndex = Math.floor(Math.random() * randomIdeas.length);
                      }
                      usedIdeasRef.current.push(nextIndex);
                      setSkill(randomIdeas[nextIndex].long);
                      setShowExamples(false);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="whitespace-nowrap flex-shrink-0 text-zinc-400 font-bold text-lg px-6 py-4 rounded-xl transition-all duration-300 hover:bg-zinc-800/50 hover:text-emerald-400 flex items-center gap-2 w-full sm:w-auto justify-center border border-transparent hover:border-zinc-700/50"
                  >
                    {ui.inspireMe}
                  </button>

                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                    {loading ? loadingMessages[messageIndex] : ui.generatePlan}
                    {!loading && <span>&rarr;</span>}
                  </button>
                </div>
                {!user && (
                  <div className="text-center sm:text-right mt-3">
                    <span className="text-xs font-bold text-emerald-400">
                      {demoCount >= GUEST_DEMO_PLAN_LIMIT ? (
                        `🔒 ${ui.limitReached}`
                      ) : (
                        `🎁 ${ui.limitRemaining.replace('{{count}}', String(GUEST_DEMO_PLAN_LIMIT - demoCount))}`
                      )}
                    </span>
                  </div>
                )}
              </form>
            </div>
          <div className="mt-8 relative w-full">
            <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col gap-4 ring-1 ring-white/5">
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">{ui.businessExamplesTitle}</h3>
                <div className="w-8"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {examplesList.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSkill(ex.long);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="group relative flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 text-zinc-300 font-medium text-xs sm:text-sm px-3 py-4 rounded-xl transition-all duration-300 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:-translate-y-0.5 text-center w-full leading-snug"
                  >
                    {ex.short}
                  </button>
                ))}
              </div>
            </div>
          </div>

          </div>
        </div>

        {/* Grid de Beneficii / Ce conține planul */}
        <div className="mt-10 w-full max-w-5xl relative z-10">
          <h3 className="text-2xl md:text-3xl font-black mb-10 tracking-tighter bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer text-center">
            {t('whatPlanContains', locale)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 text-left">
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    🧠
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">{t('swotCardTitle', locale)}</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    {t('swotCardDesc', locale)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    💸
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">{t('budgetCardTitle', locale)}</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    {t('budgetCardDesc', locale)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    🌟
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">{t('fundsCardTitle', locale)}</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    {t('fundsCardDesc', locale)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    🏦
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">{t('proPlanCardTitle', locale)}</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    {t('proPlanCardDesc', locale)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    🪄
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">{t('studioCardTitle', locale)}</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    {t('studioCardDesc', locale)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    🚀
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">{t('exportCardTitle', locale)}</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    {t('exportCardDesc', locale)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previzualizare Plan / Mockup - 5 Taburi */}
        <div className="mt-24 w-full max-w-5xl relative z-10">
          <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer text-center">
            {ui.howItLooks}
          </h3>
          <p className="text-xl lg:text-2xl font-medium text-zinc-400 text-center mb-10">{ui.perspective}</p>

          {/* Tab buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 0, label: `👀 ${ui.previewTabs}` },
              { id: 1, label: `📈 ${ui.animatedCharts}` },
              { id: 2, label: `💻 ${ui.typingLive}` },
              { id: 4, label: `✨ ${ui.beforeAfter}` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMockupTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                  mockupTab === tab.id
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <MockupPreview
            mockupTab={mockupTab}
            setMockupTab={setMockupTab}
            innerMockupTab={innerMockupTab}
            setInnerMockupTab={setInnerMockupTab}
            ui={ui}
          />


        </div>
            </>
    )}

      {isEditing && result ? (
        <div className="w-full max-w-[98%] xl:max-w-[120rem] animate-in fade-in slide-in-from-bottom-10 print:hidden px-4 2xl:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full mb-8 pb-8 border-b border-zinc-800">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-black text-emerald-400 flex items-center gap-3">
                <span>🪄</span> {ui.editingStudio}
              </h1>
            </div>
            <div className="flex gap-4 shrink-0">
              <button onClick={cancelEditing} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all shadow-xl">
                 {ui.cancelCross}
              </button>
              <button onClick={saveEditing} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl border border-emerald-500">
                 {ui.confirmSaveCheck}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            <div 
              className="w-full lg:w-3/5 xl:w-2/3"
              onCopy={(e) => {
                e.preventDefault();
                alert(ui.copyingDisabled);
              }}
            >
              <EditForm 
                result={result} 
                updateField={updateField} 
                removeField={removeField} 
                readOnly={false} 
                locale={locale}
                currency={currency}
              />
            </div>
            {renderSidebar()}
          </div>
        </div>
      ) : result && (
        <div className="w-full max-w-6xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10">
          <ActionBar
            mode="demo"
            locale={locale}
            ui={ui}
            onReset={resetApp}
            onStartEditing={startEditing}
            onDownloadAction={downloadAction}
            onShowPricingModal={() => setShowPricingModal(true)}
            currency={currency}
            setCurrency={setCurrency}
            isDownloading={isDownloading}
            isPlanPaid={hasStandardAccess}
            isEditing={isEditing}
            isSharedView={isSharedView}
            showCurrencyToggle={shouldShowCurrencyToggle(locale, isSharedView)}
          />

          {!isEditing && (
            <VersionSelector
              versions={versions}
              activeVersionId={activeVersionId}
              onSelectVersion={(vKey, vData) => {
                setActiveVersionId(vKey);
                setResultState(vData);
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "current_versions",
                    JSON.stringify({ versions, activeVersionId: vKey })
                  );
                  localStorage.setItem("current_generated_plan", JSON.stringify(vData));
                }
                void syncCurrentPlanToFirestore(vData, versions, vKey);
              }}
              ui={ui}
              locale={locale}
              access={versionStackAccess}
              onCombineWith={handleCombineWith}
              onRequireUpgrade={() => setShowPricingModal(true)}
            />
          )}
          {!isEditing && (
            <DemoBrochurePreview 
              result={result}
              ui={ui}
              locale={locale}
              currency={currency}
              formatPrice={(val: any) => formatPriceLocalized(val, locale, currency, fxRate)}
              formatNumberedText={formatNumberedText}
              isContentCopyProtected={isContentCopyProtected}
              handleContextMenu={handleContextMenu}
              brochureRef={brochureRef}
            />
          )}
        </div>
      )}
      </div>

      {result && (
        <DemoPresentationSlides 
          result={result}
          ui={ui}
          locale={locale}
          currency={currency}
          formatPrice={(val: any) => formatPriceLocalized(val, locale, currency, fxRate)}
          truncateText={truncateText}
          splitTextIntoSlides={splitTextIntoSlides}
          formatNumberedText={formatNumberedText}
          presentationRef={presentationRef}
        />
      )}

      {/* Hidden chart dedicated for PPTX Export (Dark Mode + Static) */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none z-[-1] w-[1000px] h-[450px] bg-[#09090b] flex flex-col items-center justify-center" id="pptx-export-chart">
        <BudgetPieChart budget={result?.plan_financiar?.buget_investitii} currency={currency} isPptx={true} locale={locale} />
      </div>

      {/* Hidden chart dedicated for DOCX Export (White Mode + Static) */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none z-[-1] w-[800px] h-[400px] bg-white flex flex-col items-center justify-center" id="docx-export-chart-hidden">
        <BudgetPieChart budget={result?.plan_financiar?.buget_investitii} currency={currency} isPdf={true} locale={locale} />
      </div>

      {/* PREZENTARE PDF - ALB CU VERDE, MULTIPLE SLIDES */}
      {result && (
        <div className="fixed top-[-9999px] left-[-9999px] w-[1280px] opacity-0 pointer-events-none z-[-50]">
          <div ref={pdfPrintRef}>
            <DemoPdfSlides 
              result={result} 
              ui={ui} 
              locale={locale} 
              currency={currency} 
              formatPrice={(val: any) => formatPriceLocalized(val, locale, currency, fxRate)} 
              truncateText={truncateText} 
              splitTextIntoSlides={splitTextIntoSlides} 
              formatNumberedText={formatNumberedText} 
            />
          </div>
        </div>
      )}

      {/* Studio Export Modal */}
      {showStudioExportModal && (
        <StudioExportModal locale={locale} onClose={() => setShowStudioExportModal(false)} />
      )}

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => {
          setShowPricingModal(false);
          setPendingDownloadMode(null);
        }}
        onSuccess={(tier) => {
          setPromoCodeUnlocked(true);
          if (tier === "full-access") {
            setSubscriptionActive(true);
            setEuFundsUnlocked(true);
          } else if (tier === "eu-funds") {
            setEuFundsUnlocked(true);
          } else if (tier === "standard") {
            setStandardPackageActive(true);
          }
        }}
        onRequireLogin={() => {
          setShowPricingModal(false);
          setShowAuthModal(true);
        }}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        currency={currency}
        planName={result?.nume || ui.businessPlan}
        planId={result?.id}
        locale={locale}
      />
      {showAuthModal && (
        <AuthWallModal 
          locale={locale} 
          onClose={() => setShowAuthModal(false)} 
          onLoginClick={() => {
            window.location.href = ui.routes.login;
          }} 
        />
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
            const currentSecs = result?.sectiuni_aditionale || [];
            const newIndex = currentSecs.length;
            const updated = {
              ...result,
              sectiuni_aditionale: [...currentSecs, newSection]
            };
            const nextVersions = {
              ...(versions && Object.keys(versions).length ? versions : { original: updated }),
              [activeVersionId]: updated,
            };
            setVersions(nextVersions);
            setResultState(updated);
            if (typeof window !== "undefined") {
              localStorage.setItem("current_generated_plan", JSON.stringify(updated));
            }
            void syncCurrentPlanToFirestore(updated, nextVersions, activeVersionId);
            setTimeout(() => {
              const el = document.getElementById(`custom-section-${newIndex}`) || document.getElementById("section-custom");
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 400);
          }}
          onClose={() => setShowExpertDrawer(false)}
        />
      )}
      <BuyMeACoffeeModal 
        isOpen={showBmcModal} 
        onClose={() => setShowBmcModal(false)} 
        locale={locale} 
      />
    </main>
  );
}
