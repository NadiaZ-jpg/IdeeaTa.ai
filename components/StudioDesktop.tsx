"use client";
import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import pptxgen from "pptxgenjs";
import { EditForm } from "@/components/EditForm";
import dynamic from 'next/dynamic';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, User, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification, getAuth } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, increment, arrayUnion, collection, getDocs } from 'firebase/firestore';
import { PricingModal } from '@/components/PricingModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AdBanner } from '@/components/AdBanner';
import BuyMeACoffeeModal from '@/components/BuyMeACoffeeModal';
import { generateDocxBlob } from '@/lib/generateDocx';
import { generatePptx } from '@/lib/generatePptx';
import { useStudioFirebaseSync } from '@/hooks/useStudioFirebaseSync';
import { t } from '@/lib/translations';
import { UI_STRINGS } from '@/lib/uiStrings';
import { formatPriceLocalized } from '@/lib/priceHelper';
import { getExamples } from '@/lib/examples';

import { formatObjectNumbers, formatNumberedText } from "@/lib/utils";
import { EXPERT_TEMPLATES, ExpertTemplate } from '@/lib/templatesData';
import { AuthWallModal } from '@/components/modals/AuthWallModal';
import { EmailVerificationModal } from '@/components/modals/EmailVerificationModal';
import { ExpertSectionsDrawer } from '@/components/modals/ExpertSectionsDrawer';
import { StudioPdfSlides } from "@/components/pdf/StudioPdfSlides";
import { StudioLeftSidebar } from "@/components/sidebars/StudioLeftSidebar";
import { StudioBrochurePreview } from "@/components/pdf/StudioBrochurePreview";
import { StudioPresentationSlides } from "@/components/pdf/StudioPresentationSlides";
import { truncateText, splitTextIntoSlides, getDynamicTextSize } from '@/lib/planHelpers';
import { useUIState } from '@/hooks/useUIState';
import { ActionBar } from '@/components/ActionBar';
import { MockupPreview } from '@/components/MockupPreview';
const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });

export default function StudioDesktop({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const isEn = locale === "en";
  const isEs = locale === "es";
  const [skill, setSkill] = useState("");
  const [resultState, setResultState] = useState<any>(null);
  const [versions, setVersionsState] = useState<{ [key: string]: any }>({});
  const activeVersionIdRef = useRef<string>("original");
  const [activeVersionId, _setActiveVersionId] = useState<string>("original");
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const [loading, setLoading] = useState(false);
  const [fxRate, setFxRate] = useState(0.201);
  const [currency, setCurrency] = useState("LEI");
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'pptx' | 'word' | 'pdf-summary' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [activeAiPrompt, setActiveAiPrompt] = useState<{action: string, title: string, placeholder?: string, desc?: string, isConfirm?: boolean} | null>(null);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [showToneOptions, setShowToneOptions] = useState(false);
  const [aiLoadingMessageIndex, setAiLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (activeAiPrompt) {
      setTimeout(() => {
        document.getElementById('ai-prompt-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [activeAiPrompt]);
  const [isPaid, setIsPaid] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingDownloadMode, setPendingDownloadMode] = useState<'pdf' | 'pptx' | 'word' | null>(null);
  const [credits, setCredits] = useState(0);
  const [euFundsUnlocked, setEuFundsUnlocked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [unlockedPlans, setUnlockedPlans] = useState<string[]>([]);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const [lastEditParams, setLastEditParams] = useState<{action: string, customStyle?: string, customInput?: string} | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isCheckingShared, setIsCheckingShared] = useState(true);

  // UI State (modale, dropdown-uri, tab-uri) — gestionate centralizat în useUIState
  const {
    showPricingModal, setShowPricingModal,
    showQrModal, setShowQrModal,
    showBmcModal, setShowBmcModal,
    showAuthModal, setShowAuthModal,
    showPaywall, setShowPaywall,
    showExpertDrawer, setShowExpertDrawer,
    showVerificationModal, setShowVerificationModal,
    verificationSent, setVerificationSent,
    showVersionDropdown, setShowVersionDropdown,
  } = useUIState();

  const syncCurrentPlanToFirestore = async (updatedResult: any, updatedVersions?: any) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let planId = searchParams.get("planId");
      if (!planId) {
        const safeName = updatedResult?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
        planId = safeName + "_" + Date.now();
      }
      const planRef = doc(db, "users", user.uid, "plans", planId);
      const versToSave = updatedVersions || versions;
      const payload: any = {
        ...updatedResult,
        updatedAt: new Date().toISOString(),
      };
      if (versToSave && Object.keys(versToSave).length > 0) {
        payload.versions = versToSave;
      }
      await setDoc(planRef, payload, { merge: true });
      console.log("Plan sincronizat automat în Firestore:", planId);
    } catch (err) {
      console.error("Eroare la sincronizarea planului în Firestore:", err);
    }
  };

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVersionDropdown(false);
      }
    }
    if (showVersionDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVersionDropdown]);

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

  // Pre-rezolva toate string-urile UI pentru locale curent
  const ui = UI_STRINGS[locale];

  const saveEditing = () => {
    setIsEditing(false);
    
    // Update versions object with the new result for the active version
    const nextVersions = {
      ...versions,
      [activeVersionId]: result
    };
    setVersionsState(nextVersions);
    
    syncCurrentPlanToFirestore(result, nextVersions);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("current_generated_plan", JSON.stringify(result));
    }
    
    if (typeof window !== "undefined" && window.location.search.includes('edit=true')) {
      window.history.replaceState({}, document.title, window.location.pathname + '?view=idea');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isContentCopyProtected) {
      e.preventDefault();
      alert(t("alertCopyProtected", locale));
    }
  };

  const handleAiEdit = async (action: string, customStyle?: string, customInput?: string, isRetry?: boolean) => {
    if (isEditingAi) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isActionFree = action === "professional_tone" || action === "optimize_budget";
    if (!isActionFree && !isAdmin && !hasProAccess) {
      setShowPricingModal(true);
      return;
    }

    let targetSection = "";
    if (action === "add_sections") {
      if (!customInput) return; // Anulat
      targetSection = customInput;
    } else if (action === "optimize_budget") {
      if (!customInput) return; // Anulat
      let percent = parseInt(customInput.replace(/%/g, ''));
      if (isNaN(percent) || percent <= 0) {
        alert(t("alertValidPercent", locale));
        return;
      }
      targetSection = percent.toString(); 
    } 

    setIsEditingAi(true);
    setAiEditError(null);
    setLastEditParams({ action, customStyle, customInput });
    setActiveAiPrompt(null);
    setAiPromptInput("");
    setShowToneOptions(false);
    try {
      const baseSource = versions.original || result;
      const [res] = await Promise.all([
        fetch("/api/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result: baseSource, action, customStyle, targetSection, locale, isRetry })
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
          try {
            const errJson = JSON.parse(text);
            if (errJson.error) {
              errorMsg = errJson.error;
            }
          } catch(e) {}
          
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
          
          const vKey = 
            action === "eu_funds_optimization" ? "eu_funds" :
            action === "investor_ready" ? "investor" :
            action === "professional_tone" ? "ton_edit" :
            action === "optimize_budget" ? "budget_edit" :
            action === "add_sections" ? "expert_sections" :
            "custom";
          
          const formattedResult = formatObjectNumbers(parsed);
          
          const nextVersions = {
            ...versions,
            [vKey]: formattedResult
          };
          
          setVersionsState(nextVersions);
          setActiveVersionId(vKey);
          setResult(formattedResult);
          
          syncCurrentPlanToFirestore(formattedResult, nextVersions);
          
          if (typeof window !== "undefined") {
            localStorage.setItem("current_generated_plan", JSON.stringify(formattedResult));
          }
          
          setIsEditingAi(false);
          
          setTimeout(() => {
             let targetId = "";
             if (action === "add_sections") {
                targetId = "section-custom";
             }
             else if (action === "optimize_budget") targetId = "section-financial";
             else if (action === "professional_tone" || action === "eu_funds_optimization" || action === "investor_ready") targetId = "section-general";
             
             if (targetId) {
                const el = document.getElementById(targetId);
                if (action === "add_sections" && el && el.lastElementChild) {
                  el.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    }
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
  const [innerMockupTab, setInnerMockupTab] = useState('SWOT');
  
  const [user, setUser] = useState<User | null>(null);
  const [promoCodeUnlocked, setPromoCodeUnlocked] = useState(false);
  const ADMIN_EMAILS = ['contact@ideeata.ai', 'nadiaramonaz@gmail.com'];
  const isAdmin = user ? ADMIN_EMAILS.includes(user.email || '') : false;
  const isPlanPaid = promoCodeUnlocked || isAdmin || subscriptionActive || (result && unlockedPlans.includes(result.nume)) || isPaid;
  const isStudioPaid = promoCodeUnlocked || isAdmin || subscriptionActive || euFundsUnlocked || isPaid;
  const hasStandardAccess = isPaid || promoCodeUnlocked || isAdmin || subscriptionActive || isPlanPaid || isStudioPaid;
  const hasProAccess = isAdmin || subscriptionActive || euFundsUnlocked;
  const isContentCopyProtected = !hasStandardAccess;
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        window.scrollTo({ top: 0 });
        if (!currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
          setShowVerificationModal(true);
        }
      } else {
        setResult(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("current_generated_plan");
          window.location.href = ui.routes.login.replace("/login", "") || "/";
        }
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
        setPromoCodeUnlocked(data.promoCodeUnlocked || false);
      } else {
        setDoc(userRef, {
          email: user.email,
          credits: 0,
          euFundsUnlocked: false,
          subscriptionActive: false,
          unlockedPlans: [],
          promoCodeUnlocked: false,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [user]);

  useStudioFirebaseSync({ user, setResultState, setVersionsState, setActiveVersionId });

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setVerificationSent(true);
      } catch (error) {
        console.error("Eroare trimitere email:", error);
      }
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("payment_success") === "true";
    const sessionId = urlParams.get("session_id");
    const tier = urlParams.get("tier");

    if (paymentSuccess && sessionId && user) {
      const verifyPayment = async () => {
        try {
          const res = await fetch(`/api/verify-checkout?session_id=${sessionId}`);
          const data = await res.json();
          if (data.success && data.userId === user.uid) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const processedSessions = userSnap.data()?.processedSessions || [];

            if (!processedSessions.includes(sessionId)) {
              if (tier === "standard") {
                const planToUnlock = data.planName || result?.nume || "Plan de Afaceri";
                await setDoc(userRef, {
                  unlockedPlans: arrayUnion(planToUnlock),
                  processedSessions: arrayUnion(sessionId)
                }, { merge: true });
                alert(ui.paymentConfirmedEU.replace("{plan}", planToUnlock));
              } else if (tier === "eu-funds") {
                await setDoc(userRef, {
                  euFundsUnlocked: true,
                  processedSessions: arrayUnion(sessionId)
                }, { merge: true });
                alert(t("paymentConfirmedEU", locale));
              } else if (tier === "pro") {
                await setDoc(userRef, {
                  subscriptionActive: true,
                  processedSessions: arrayUnion(sessionId)
                }, { merge: true });
                alert(ui.alertUnlimitedPro);
              }
            }
            window.history.replaceState({}, document.title, window.location.pathname);
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
      const urlParams = new URLSearchParams(window.location.search);
      const sharedId = urlParams.get("sharedId");
      
      if (sharedId) {
        fetch(`/api/share/${sharedId}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.data) {
              setResult(formatObjectNumbers(data.data));
              setIsSharedView(true);
              if (typeof window !== "undefined") {
                localStorage.setItem('demoGenerateCount', '0');
                localStorage.setItem('demoEditCount', '0');
              }
              window.history.replaceState({}, document.title, window.location.pathname);
            }
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
          if (typeof window !== "undefined" && window.location.search.includes('edit=true')) {
            setBackupResult(JSON.parse(JSON.stringify(v[a])));
            setIsEditing(true);
          }
        } else {
          const saved = localStorage.getItem("current_generated_plan");
          if (saved) {
            const parsedPlan = formatObjectNumbers(JSON.parse(saved));
            setResult(parsedPlan);
            if (typeof window !== "undefined" && window.location.search.includes('edit=true')) {
              setBackupResult(JSON.parse(JSON.stringify(parsedPlan)));
              setIsEditing(true);
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
        setResult(null); // Ne intoarcem la pagina de start
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
      } else {
        localStorage.removeItem("current_generated_plan");
      }
    }
  }, [result]);

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

  // Prevenire inchidere accidentala a paginii
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (result && !isSharedView) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [result, isSharedView]);

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
      await sendPasswordResetEmail(auth, email);
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
          await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userCredential.user.email, locale }),
          });
        } catch (err) {
          console.error("Eroare trimitere email activare:", err);
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

  const loadingMessages = ui.loadingMessagesArray;
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
      // GUARD: Nelogat → auth modal imediat
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      // LIMITATOR STUDIO — Maxim 4 planuri gratuite în Dashboard (inclusiv cele migrate din Demo)
      if (user && !isPlanPaid && !isAdmin) {
        try {
          const plansRef = collection(db, "users", user.uid, "plans");
          const snap = await getDocs(plansRef);
          if (snap.size >= 4) {
            setShowPricingModal(true);
            return;
          }
        } catch (err) {
          console.error("Eroare verificare limită planuri Firestore:", err);
          const studioCount = parseInt(localStorage.getItem('studioGenerateCount') || '0', 10);
          if (studioCount >= 1) {
            setShowPricingModal(true);
            return;
          }
        }
        const studioCount = parseInt(localStorage.getItem('studioGenerateCount') || '0', 10);
        localStorage.setItem('studioGenerateCount', (studioCount + 1).toString());
      }
      setLoading(true);
      setMessageIndex(0);
      setResult(null);
      setIsPaid(false);
    }

    try {
      const [res] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill }),
        }),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      let data;
      try {
        const resText = await res.text();
        try {
          data = JSON.parse(resText);
        } catch (e) {
          throw new Error(res.ok ? "Răspuns neașteptat de la server. Vă rugăm să reîncercați." : "Eroare la comunicarea cu serverul.");
        }

        if (!res.ok) {
          throw new Error(data.error || `Eroare server: ${res.status}`);
        }
      } catch (err: any) {
        throw new Error(err.message || "Eroare de conexiune la server.");
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
          const finalResult = JSON.parse(cleanJson);
          const planId = finalResult.nume.replace(/[^a-zA-Z0-9]/g, '_') + "_" + Date.now();
          finalResult.id = planId;

          setResult(formatObjectNumbers(finalResult));
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
                createdAt: new Date().toISOString(),
                isPaid: isPlanPaid,
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
    if (!user) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("current_generated_plan");
      }
      window.location.href = '/demo';
      return;
    }
    setResult(null);
    setCurrency("LEI");
    setIsPaid(false);
    setIsSharedView(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("current_generated_plan");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const downloadAction = async (mode: 'pdf' | 'pptx' | 'word' | 'pdf-summary', bypassPaymentCheck = false) => {
    const planName = result?.nume || "Plan de Afaceri";

    if (mode !== 'pdf-summary' && !isAdmin && !isPlanPaid && !subscriptionActive && !euFundsUnlocked && !bypassPaymentCheck) {
      if (!user) {
        window.history.pushState({ login: true }, '', window.location.pathname + '?login=true');
        setIsSharedView(false);
        return;
      }
      if (credits > 0) {
        const confirmUnlock = window.confirm(
          locale === "en"
            ? `Downloading this document will consume 1 credit of the ${credits} available. Do you wish to continue?`
            : locale === "es"
            ? `Descargar este documento consumirá 1 crédito de los ${credits} disponibles. ¿Desea continuar?`
            : `Descărcarea acestui document va consuma 1 credit din cele ${credits} disponibile. Dorești să continui?`
        );
        if (!confirmUnlock) return;

        try {
          const userRef = doc(db, "users", user!.uid);
          await setDoc(userRef, {
            credits: increment(-1),
            unlockedPlans: arrayUnion(planName)
          }, { merge: true });
        } catch (e) {
          console.error("Eroare la scaderea creditului:", e);
          alert(t("errorProcessingCredit", locale));
          return;
        }
      } else {
        setPendingDownloadMode(mode as any);
        setShowPricingModal(true);
        return;
      }
    }
    setIsDownloading(mode as any);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      let generatedShareId: string | null = null;
      if (mode === 'pdf-summary' || mode === 'pdf') {
        try {
          const res = await fetch('/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planData: result })
          });
          const data = await res.json();
          if (data.id) generatedShareId = data.id;
        } catch (err) {
          console.error("Eroare generare share link:", err);
        }
      }

      if (mode === 'pptx' || mode === 'pdf' || mode === 'pdf-summary') {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const safeName = result?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';

      if (mode === 'pptx') {
        await generatePptx(result, safeName, currency || (locale === "es" || locale === "en" ? "EUR" : "RON"), 0.201, locale);
      } else if (mode === 'pdf' || mode === 'pdf-summary') {
        let slidesArray = Array.from(document.querySelectorAll('.pdf-presentation-slide'));
        if (slidesArray.length === 0) {
           setIsDownloading(null);
           return;
        }
        
        if (mode === 'pdf-summary') {
          slidesArray = slidesArray.slice(0, 4);
          const ctaSlide = document.querySelector('.pdf-cta-slide');
          if (ctaSlide) {
            slidesArray.push(ctaSlide as Element);
          }
        }

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: [1280, 720]
        });

        // REGULA #5: Folosește domeniul oficial de producție ideeata.ai
        let pdfUrl = 'https://ideeata.ai/';
        const currentShareId = result?.id || generatedShareId;
        if (currentShareId) {
          pdfUrl = `https://ideeata.ai/shared/${currentShareId}`;
        }

        const pdfFooters = {
          ro: "Plan generat inteligent de IdeeaTa.ai",
          en: "Business plan smartly generated by IdeeaTa.ai",
          es: "Plan de negocios generado inteligentemente por IdeeaTa.ai"
        };

        for (let i = 0; i < slidesArray.length; i++) {
          const slideElement = slidesArray[i] as HTMLElement;
          const dataUrl = await toPng(slideElement, { quality: 1.0, pixelRatio: 2 });
          if (i > 0) pdf.addPage([1280, 720], "landscape");
          pdf.addImage(dataUrl, 'PNG', 0, 0, 1280, 720);
          
          // Dacă este ultimul slide (CTA), adăugăm un link invizibil peste toată pagina
          if (i === slidesArray.length - 1 && mode === 'pdf-summary') {
            pdf.link(1280/2 - 200, 720 - 180, 400, 100, { url: pdfUrl });
          }

          // Stamp footer on every page
          pdf.setTextColor(150, 150, 150); // Gray color
          pdf.setFontSize(14);
          pdf.text(pdfFooters[locale] || pdfFooters.ro, 640, 700, { align: 'center' });
          
          // Add invisible link covering the footer area on every page
          pdf.link(300, 680, 680, 40, { url: pdfUrl });
        }
        
        const suffix = mode === 'pdf-summary' ? '_Sumar_Gratuit' : '';
        pdf.save(`IdeeaTa_Prezentare_${safeName}${suffix}.pdf`);
      } else if (mode === 'word') {
          const chartElement = document.getElementById("docx-export-chart-hidden");
          let chartDataUrl = null;
          if (chartElement) {
             try {
                chartDataUrl = await toPng(chartElement, { backgroundColor: '#ffffff' });
             } catch(e) { console.error(e); }
          }
          const blob = await generateDocxBlob(result, chartDataUrl, locale);
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          const safeName2 = result?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
          link.download = `IdeeaTa_Document_${safeName2}.docx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.error("Eroare la generarea documentului", e);
      alert(t("errorSavingDocument", locale));
    } finally {
      setIsDownloading(null);
    }
  };

  const renderSidebar = () => (
    <StudioLeftSidebar 
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

  if (!user && !isSharedView && !result) {
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
        {ui.contentProtected}
      </div>
      {/* Background glow orbs */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse duration-[8000ms] z-0"></div>
      <div className="absolute top-[35%] right-[-15%] w-[650px] h-[650px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none animate-pulse duration-[12000ms] z-0"></div>

      {loading && !result && (
        <div className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-sm z-[100] flex items-center justify-between px-6">
          {/* Left Ad */}
          <div className="hidden lg:flex flex-col items-center justify-center w-[180px] xl:w-[220px] h-[400px] overflow-hidden shrink-0">
            <AdBanner dataAdSlot="3098389905" dataAdFormat="vertical" dataFullWidthResponsive="false" />
          </div>

          {/* Center loading content */}
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-2xl font-bold text-white tracking-widest uppercase text-center transition-all duration-300">
              {locale === "en" 
                ? "Your Idea is coming to life..." 
                : locale === "es" 
                ? "Tu Idea está cobrando vida..." 
                : "Ideea Ta prinde viață..."}
            </p>
            <p className="text-emerald-400 font-medium mt-3 text-center transition-all duration-500 max-w-lg">
              {loadingMessages[messageIndex]}
            </p>
          </div>

          {/* Right Ad */}
          <div className="hidden lg:flex flex-col items-center justify-center w-[180px] xl:w-[220px] h-[400px] overflow-hidden shrink-0">
            <AdBanner dataAdSlot="8674150210" dataAdFormat="vertical" dataFullWidthResponsive="false" />
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
            <p className="text-emerald-400 font-medium mt-3 text-center">
              {ui.downloadQualityNote}
            </p>
          </div>
        </div>
      )}

      {isEditingAi && (
        <div className="fixed inset-0 bg-[#09090b]/95 backdrop-blur-sm z-[100] flex items-center justify-between px-6">
          {/* Left Ad */}
          <div className="hidden lg:flex flex-col items-center justify-center w-[180px] xl:w-[220px] h-[400px] overflow-hidden shrink-0">
            <AdBanner dataAdSlot="3098389905" dataAdFormat="vertical" dataFullWidthResponsive="false" />
          </div>

          {/* Center content */}
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

          {/* Right Ad */}
          <div className="hidden lg:flex flex-col items-center justify-center w-[180px] xl:w-[220px] h-[400px] overflow-hidden shrink-0">
            <AdBanner dataAdSlot="8674150210" dataAdFormat="vertical" dataFullWidthResponsive="false" />
          </div>
        </div>
      )}

      <div className={`${isDownloading === 'pptx' ? 'hidden' : 'flex'} flex-col items-center w-full max-w-[1600px] px-4 md:px-12 relative z-10`}>
        {user && (
          <div className="w-full flex justify-between items-start sm:items-center py-2 border-b border-zinc-800/80 mb-3 print:hidden">
            <div className="flex flex-col gap-2">
              <span className="text-zinc-500 text-xs font-semibold">{ui.studioHeaderSubtitle}</span>
              <button 
                type="button"
                onClick={() => setShowBmcModal(true)}
                className="bg-[#FFDD00] text-black px-3 py-1 rounded-md font-bold text-xs hover:bg-[#FFEA4D] hover:scale-105 transition-all flex items-center gap-1.5 w-max shadow-sm cursor-pointer"
                title={ui.supportCoffeeTitle}
              >
                <span>☕</span> Buy me a coffee
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
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
                  STUDIO &amp; FONDURI
                </span>
              ) : isPlanPaid ? (
                <span className="bg-blue-500/20 border border-blue-500/40 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  STANDARD DEBLOCAT
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
                  onClick={() => setShowPricingModal(true)}
                  className="text-zinc-400 hover:text-white transition-colors font-semibold cursor-pointer"
                >
                  {ui.pricing}
                </button>
              )}
              <button 
                onClick={() => signOut(auth)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {ui.logOut}
              </button>
            </div>
          </div>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-black mt-4 lg:mt-12 mb-6 lg:mb-8 not-italic tracking-tighter cursor-pointer bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer print:hidden self-start lg:self-center" onClick={resetApp}>
          IdeeaTa.ai
        </h1>
        
        {!result && (
          <>
          <div className="w-full flex flex-col items-center justify-center mb-12 lg:mb-16 relative">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-sm font-black uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-emerald-400/50 transition-all duration-300 animate-pulse relative z-10">
              <span className="text-base">✨</span> Nu începe o afacere înainte să verifici IdeeaTa.ai
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
              <h2 className="text-3xl md:text-4xl lg:text-[3.5rem] font-black mb-8 leading-[1.1] not-italic text-white tracking-tighter text-left max-w-[90%]">
                Transformă-ți <span className="text-emerald-400">experiența</span> într-un business validat.
              </h2>
              
              <p className="text-zinc-400 text-xl lg:text-2xl leading-relaxed not-italic font-medium text-left">
                Descrie la ce ești bun, iar noi îți vom genera un plan de afaceri complet.
              </p>
              <p className="text-zinc-400 text-xl lg:text-2xl mt-4 leading-relaxed not-italic font-medium text-left">
                Analiză SWOT, proiecții financiare și strategie de piață.
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
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Timp de generare</p>
                  <p className="text-emerald-400 text-sm font-black">Sub 60 sec</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/30 via-zinc-700/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Format export</p>
                  <p className="text-emerald-400 text-sm font-black">PDF · PPTX · DOCX</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/20 via-zinc-700/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Structură Document</p>
                  <p className="text-emerald-400 text-sm font-black">6 Capitole Standard</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/10 via-zinc-700/30 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Fonduri / Investitori</p>
                  <p className="text-emerald-400 text-sm font-black">Plan Profesional</p>
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
                  {locale === "en" 
                    ? "Build your business plan intelligently. Your vision, our support!" 
                    : locale === "es" 
                    ? "Crea tu plan de negocios inteligentemente. ¡Tu visión, nuestro apoyo!" 
                    : "Construiește planul tău de afaceri inteligent. Viziunea ta, sprijinul nostru!"}
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
                    placeholder={animatedPlaceholder || (ui.animatedPlaceholder)}
                    className="relative w-full h-32 p-6 rounded-2xl bg-[#09090b] border border-zinc-700 outline-none focus:border-emerald-500 transition-all text-xl shadow-inner resize-none placeholder:text-zinc-600 font-medium text-white"
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
                    {ui.inspireMeSparkles}
                  </button>

                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                    {loading ? loadingMessages[messageIndex] : ui.generatePlan}
                    {!loading && <span>&rarr;</span>}
                  </button>
                </div>
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
                <h3 className="text-xl font-bold tracking-tight text-white">
                  {ui.businessExamplesSparkles}
                </h3>
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
                    className="bg-zinc-900/80 border border-zinc-700/80 text-zinc-300 font-medium text-xs sm:text-sm px-2 py-3 rounded-xl transition-all duration-300 hover:bg-emerald-900/60 hover:text-emerald-400 hover:border-emerald-500 hover:scale-[1.02] text-center w-full shadow-sm leading-snug"
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
            Ce conține planul tău de afaceri?
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
                  <h4 className="text-2xl font-bold text-white mb-3">Analiză SWOT Completă</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Puncte tari, slăbiciuni, oportunități și amenințări detaliate cu explicații tehnice adaptate domeniului ales.
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
                  <h4 className="text-2xl font-bold text-white mb-3">Bugetare Detaliată</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Distribuția automată a costurilor de pornire și justificare clară pentru fiecare cheltuială estimată.
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
                  <h4 className="text-2xl font-bold text-white mb-3">Optimizat Fonduri</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Structură și jargon specifice ghidurilor de finanțare pentru a-ți crește șansele de a obține granturi nerambursabile.
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
                  <h4 className="text-2xl font-bold text-white mb-3">Plan Profesionist</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Rescrie complet planul pentru a atrage investitori și bănci. Include limbaj corporativ, metrici financiare (CAC/LTV) și strategii de mitigare a riscului.
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
                  <h4 className="text-2xl font-bold text-white mb-3">Studio Asistat Interactiv</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Adaptează planul din mers. Adaugă secțiuni noi, taie procente din buget sau rescrie textul cu ajutorul asistentului inteligent.
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
                  <h4 className="text-2xl font-bold text-white mb-3">Export Corporate</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Descarcă broșura de prezentare PowerPoint (.pptx), raportul PDF sau documentul editabil Word (.doc).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previzualizare Plan / Mockup - 5 Taburi */}
        <div className="mt-24 w-full max-w-5xl relative z-10">
          <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer text-center">
            Cum arată un plan generat?
          </h3>
          <p className="text-xl lg:text-2xl font-medium text-zinc-400 text-center mb-10">Perspectivă</p>

          {/* Tab buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 0, label: '🎬 Preview cu tabs' },
              { id: 1, label: '📊 Grafice animate' },
              { id: 2, label: '🖥️ Typing live' },
              { id: 4, label: '✨ Înainte & După' },
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
                <span>✏️</span> {ui.editingStudio}
              </h1>
            </div>
            <div className="flex gap-4 shrink-0">
              <button onClick={cancelEditing} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all shadow-xl">
                 ❌ {ui.cancel}
              </button>
              <button onClick={saveEditing} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl border border-emerald-500">
                 ✅ {ui.confirmSaveCheck.replace("✅ ", "")}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            <div className="w-full lg:w-3/5 xl:w-2/3">
              <EditForm 
                result={result} 
                updateField={updateField} 
                removeField={removeField} 
                readOnly={!user} 
                locale={locale}
              />
            </div>
            {renderSidebar()}
          </div>
        </div>
      ) : result && (
        <div className="w-full max-w-6xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10">
          <ActionBar
            mode="studio"
            locale={locale}
            ui={ui}
            onReset={resetApp}
            onStartEditing={startEditing}
            onDownloadAction={downloadAction}
            onShowPricingModal={() => setShowPricingModal(true)}
            currency={currency}
            setCurrency={setCurrency}
            isDownloading={isDownloading}
            isPlanPaid={isPlanPaid}
            isEditing={isEditing}
            showCurrencyToggle={locale === "ro"}
          />

          {Object.keys(versions).length > 0 && !isEditing && (
            <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-zinc-800/80 pb-3 w-full max-w-5xl justify-center sm:justify-start">
              {versions.original && (
                <button 
                  onClick={() => { setActiveVersionId('original'); setResultState(versions.original); }} 
                  className={`px-4 py-2 rounded-xl transition-all duration-200 font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer ${activeVersionId === 'original' ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                >
                  {ui.originalVersion}
                </button>
              )}
              {versions.eu_funds && (
                <button 
                  onClick={() => { setActiveVersionId('eu_funds'); setResultState(versions.eu_funds); }} 
                  className={`px-4 py-2 rounded-xl transition-all duration-200 font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer ${activeVersionId === 'eu_funds' ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                >
                  {ui.euFundsOptimized}
                </button>
              )}
              {versions.investor && (
                <button 
                  onClick={() => { setActiveVersionId('investor'); setResultState(versions.investor); }} 
                  className={`px-4 py-2 rounded-xl transition-all duration-200 font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer ${activeVersionId === 'investor' ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                >
                  {ui.investorsPlan}
                </button>
              )}

              {/* Soluția 1 — Meniu Dropdown Istoric Versiuni */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>📜 {ui.versionHistory || "Istoric Versiuni"} ({Object.keys(versions).length})</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {showVersionDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-[90] animate-in fade-in duration-150">
                    <div className="text-[10px] uppercase font-black tracking-widest text-zinc-500 px-3 py-1.5 border-b border-zinc-900 flex justify-between items-center">
                      <span>{ui.savedVersions || "Versiuni Salvate"}</span>
                      <button onClick={() => setShowVersionDropdown(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto flex flex-col gap-1 mt-1">
                      {Object.entries(versions).map(([vKey, vData]) => (
                        <button
                          key={vKey}
                          onClick={() => {
                            setActiveVersionId(vKey);
                            setResultState(vData);
                            setShowVersionDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${activeVersionId === vKey ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                        >
                          <span className="truncate">
                            {vKey === "original" ? (ui.originalVersion)
                            : vKey === "eu_funds" ? ui.euFundsOptimized
                            : vKey === "investor" ? ui.investorsPlan
                            : `📑 ${vKey}`}
                          </span>
                          {activeVersionId === vKey && <span className="text-emerald-400 text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isEditing && (
            <StudioBrochurePreview 
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
        <StudioPresentationSlides 
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
            <StudioPdfSlides 
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
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => {
          setShowPricingModal(false);
          setPendingDownloadMode(null);
        }}
        onSuccess={() => {
          setPromoCodeUnlocked(true);
          // Resetare contori limitatoare după plată (override freeze studio - Master Plan)
          if (typeof window !== 'undefined') {
            localStorage.setItem('studioGenerateCount', '0');
            localStorage.setItem('studioToneCount', '0');
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
        locale={locale}
      />
      {showAuthModal && (
        <AuthWallModal 
          locale={locale} 
          onClose={() => setShowAuthModal(false)} 
          onLoginClick={() => {
            setShowAuthModal(false);
            window.history.pushState({ login: true }, '', window.location.pathname + '?login=true');
            setIsSharedView(false);
          }} 
        />
      )}
      {showVerificationModal && (
        <EmailVerificationModal
          locale={locale}
          verificationSent={verificationSent}
          onResendVerification={handleResendVerification}
          onClose={() => {
            setShowVerificationModal(false);
            window.location.href = "/dashboard";
          }}
        />
      )}
      <BuyMeACoffeeModal 
        isOpen={showBmcModal} 
        onClose={() => setShowBmcModal(false)} 
        locale={locale} 
      />

      {/* MODAL DRAWER — LIBRĂRIA DE SECȚIUNI EXPERTE */}
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
            setResult(updated);
            syncCurrentPlanToFirestore(updated);
            if (typeof window !== "undefined") {
              localStorage.setItem("current_generated_plan", JSON.stringify(updated));
            }
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
    </main>
  );
}
