"use client";
import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import pptxgen from "pptxgenjs";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { PricingModal } from '@/components/PricingModal';
import { AdBanner } from '@/components/AdBanner';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useStudioFirebaseSync } from '@/hooks/useStudioFirebaseSync';
import { ToneEditor } from '@/components/ToneEditor';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/translations';
import dynamic from 'next/dynamic';
import { generateDocxBlob } from '@/lib/generateDocx';
import { generatePptx } from '@/lib/generatePptx';
import { formatObjectNumbers, formatNumberedText } from "@/lib/utils";

import { EXPERT_TEMPLATES } from '@/lib/templatesData';

const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });

export default function StudioMobile({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const isEn = locale === "en";
  const isEs = locale === "es";
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<any>(null);
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
  const [promoCodeUnlocked, setPromoCodeUnlocked] = useState(false);
  
  const isAdmin = !!(user && (user.email === "adrian@ideeata.ai" || user.email === "contact@ideeata.ai" || user.email === "nadiaramonaz@gmail.com"));
  const [isPaidState, setIsPaidState] = useState(false);
  const isPaid = (typeof window !== 'undefined' && localStorage.getItem(`isPaid_${result?.nume}`) === "true") || isPaidState;

  const isPlanPaid = promoCodeUnlocked || isAdmin || subscriptionActive || (result && unlockedPlans.includes(result.nume)) || isPaid;
  const isStudioPaid = promoCodeUnlocked || isAdmin || subscriptionActive || euFundsUnlocked || isPaid;

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
            const title = typeof item === 'string' ? item : (item.titlu || '');
            const desc = item.explicatie_tehnica || '';
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
    setResultState: setResult,
    setVersionsState: setVersions,
    setActiveVersionId,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Verificare confirmare email (provider password)
      if (!currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
        setShowVerificationModal(true);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) {
      setCredits(0);
      setEuFundsUnlocked(false);
      setSubscriptionActive(false);
      setUnlockedPlans([]);
      setPromoCodeUnlocked(false);
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
        setIsPaidState(data.isPaid || false);
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

  const handleAiEdit = async (action: string, customInput?: string) => {
    if (!result || !user) return;
    setIsEditingAi(true);

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result,
          action,
          customStyle: customInput || "",
          locale
        })
      });

      if (!res.ok) throw new Error("Eroare editare AI");

      const data = await res.json();
      if (data && data.editedPlan) {
        const parsed = data.editedPlan;
        setResult(parsed);
        localStorage.setItem("current_generated_plan", JSON.stringify(parsed));

        // Salvare în Firestore
        const searchParams = new URLSearchParams(window.location.search);
        const planId = searchParams.get("planId");
        if (planId) {
          await updateDoc(doc(db, "users", user.uid, "plans", planId), parsed);
        }
      }
    } catch (e) {
      console.error(e);
      alert(locale === "en" ? "Could not process AI request." : locale === "es" ? "No se pudo procesar la solicitud de IA." : "Nu s-a putut procesa modificarea AI.");
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
    
    // Salvare în Firestore
    const searchParams = new URLSearchParams(window.location.search);
    const planId = searchParams.get("planId");
    if (planId) {
      try {
        await updateDoc(doc(db, "users", user.uid, "plans", planId), updatedPlan);
      } catch (err) {
        console.error("Firestore save error:", err);
      }
    }
    
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
          await sendEmailVerification(user);
          setVerificationSent(true);
        } catch (fallbackError) {
          console.error("Eroare fallback trimitere email:", fallbackError);
        }
      }
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 2000);
    }
  };

  const [showExportModal, setShowExportModal] = useState(false);
  const [pendingDownloadMode, setPendingDownloadMode] = useState<'pdf' | 'pptx' | 'word' | 'pdf-summary' | null>(null);

  const downloadAction = async (mode: 'word' | 'pptx' | 'pdf' | 'pdf-summary') => {
    const planName = result?.nume || "Plan de Afaceri";

    if (mode !== 'pdf-summary' && !isAdmin && !isPlanPaid && !subscriptionActive && !euFundsUnlocked) {
      setPendingDownloadMode(mode);
      setShowPricingModal(true);
      return;
    }

    setIsDownloading(mode);
    try {
      const safeName = result?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
      
      if (mode === 'word') {
        const blob = await generateDocxBlob(result, null, locale);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `IdeeaTa_Document_${safeName}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (mode === 'pptx') {
        await generatePptx(result, safeName, locale === "es" || locale === "en" ? "EUR" : "LEI", fxRate, locale);
      } else if (mode === 'pdf' || mode === 'pdf-summary') {
        const docPdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4"
        });
        
        docPdf.setFontSize(22);
        docPdf.setTextColor(16, 185, 129); // Emerald
        docPdf.text(result.nume || "Plan de Afaceri", 50, 80);
        
        docPdf.setFontSize(14);
        docPdf.setTextColor(100, 100, 100);
        docPdf.text(result.slogan || "", 50, 105);
        
        docPdf.setFontSize(12);
        docPdf.setTextColor(40, 40, 40);
        
        let yPos = 140;
        const addSection = (title: string, content: string) => {
          if (yPos > 700) {
            docPdf.addPage();
            yPos = 50;
          }
          docPdf.setFontSize(13);
          docPdf.setTextColor(16, 185, 129);
          docPdf.text(title, 50, yPos);
          yPos += 20;
          
          docPdf.setFontSize(10);
          docPdf.setTextColor(60, 60, 60);
          const lines = docPdf.splitTextToSize(content || "", 500);
          docPdf.text(lines, 50, yPos);
          yPos += (lines.length * 15) + 25;
        };

        addSection(locale === "en" ? "1. Business Description" : locale === "es" ? "1. Descripción del Negocio" : "1. Descriere Afacere", result.descriere || "");
        addSection(locale === "en" ? "2. Market Opportunity" : locale === "es" ? "2. Oportunidad de Mercado" : "2. Oportunitatea Pieței", result.oportunitate_piata || "");
        addSection(locale === "en" ? "3. Target Audience" : locale === "es" ? "3. Público Objetivo" : "3. Publicul Țintă", result.public_tinta || "");
        
        const formatSwot = (label: string, text: string) => {
          return `${label}: ${text || ""}`;
        };
        
        const swotText = `${formatSwot(locale === "en" ? "Strengths" : "Puncte Forte", result.analiza_swot?.puncte_forte)}\n\n${formatSwot(locale === "en" ? "Weaknesses" : "Puncte Slabe", result.analiza_swot?.puncte_slabe)}`;
        addSection(locale === "en" ? "4. SWOT Analysis" : locale === "es" ? "4. Análisis SWOT" : "4. Analiza SWOT", swotText);
        
        const suffix = mode === 'pdf-summary' ? '_Sumar_Gratuit' : '';
        docPdf.save(`IdeeaTa_Document_${safeName}${suffix}.pdf`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.error(e);
      alert(locale === "en" ? "Error generating document" : locale === "es" ? "Error al generar el documento" : "Eroare la generarea documentului");
    } finally {
      setIsDownloading(null);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-sm">{locale === "en" ? "Loading your Studio workspace..." : locale === "es" ? "Cargando tu espacio de trabajo de Studio..." : "Se încarcă spațiul tău de lucru Studio..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-x-hidden flex flex-col pb-16">
      
      {/* Header */}
      <header className={`h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <Link href="/dashboard" className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1">
          <span>←</span>
          <span>{locale === "en" ? "Dashboard" : locale === "es" ? "Panel" : "Dashboard"}</span>
        </Link>
        <span className="text-sm font-black">{locale === "en" ? "Mobile Studio" : locale === "es" ? "Studio Móvil" : "Studio Mobil"}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="bg-zinc-800 text-white font-bold p-2 rounded-lg text-xs"
            title={locale === "en" ? "Share" : locale === "es" ? "Compartir" : "Distribui"}
          >
            🔗
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1"
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
            {locale === "en" ? "Link copied to clipboard!" : locale === "es" ? "¡Enlace copiado al portapapeles!" : "Link copiat în clipboard!"}
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
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0"
          >
            ⚡ Upgrade PRO
          </button>
        </div>

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
                <span className="text-[10px] text-zinc-400 font-normal">
                  {activeVersionId === "original" ? (locale === "en" ? "Original" : locale === "es" ? "Original" : "Originală")
                  : activeVersionId === "eu_funds" ? (locale === "en" ? "EU Funds" : locale === "es" ? "Fondos UE" : "Fonduri UE")
                  : activeVersionId === "investor" ? (locale === "en" ? "Investors" : locale === "es" ? "Inversores" : "Investitori")
                  : activeVersionId}
                </span>
                <span className="text-[10px] text-zinc-500">▼</span>
              </span>
            </button>

            {showVersionDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[9px] uppercase font-black tracking-widest text-zinc-500 px-3 py-2 border-b border-zinc-900 flex justify-between items-center">
                  <span>{locale === "en" ? "Saved Versions" : locale === "es" ? "Versiones Guardadas" : "Versiuni Salvate"}</span>
                  <button onClick={() => setShowVersionDropdown(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
                </div>
                <div className="max-h-48 overflow-y-auto flex flex-col gap-1 mt-1">
                  {Object.entries(versions).map(([vKey, vData]) => (
                    <button
                      key={vKey}
                      onClick={() => {
                        setActiveVersionId(vKey);
                        setResult(vData);
                        setShowVersionDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${activeVersionId === vKey ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                    >
                      <span className="truncate">
                        {vKey === "original" ? (locale === "en" ? "📝 Original Version" : locale === "es" ? "📝 Versión Original" : "📝 Varianta Originală")
                        : vKey === "eu_funds" ? (locale === "en" ? "🇪🇺 EU Funds" : locale === "es" ? "🇪🇺 Fondos UE" : "🇪🇺 Optimizat Fonduri UE")
                        : vKey === "investor" ? (locale === "en" ? "🏦 Investors Plan" : locale === "es" ? "🏦 Plan Inversores" : "🏦 Plan Investitori")
                        : `📑 ${vKey}`}
                      </span>
                      {activeVersionId === vKey && <span className="text-emerald-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex bg-zinc-950 border border-zinc-800/80 rounded-xl p-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 ${activeTab === "overview" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {locale === "en" ? "📈 Overview" : locale === "es" ? "📈 Resumen" : "📈 Prezentare"}
          </button>
          <button
            onClick={() => setActiveTab("budget")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 ${activeTab === "budget" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {locale === "en" ? "💰 Finance" : locale === "es" ? "💰 Finanzas" : "💰 Finanțe"}
          </button>
          <button
            onClick={() => setActiveTab("marketing")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 ${activeTab === "marketing" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {locale === "en" ? "📣 Marketing" : locale === "es" ? "📣 Marketing" : "📣 Promovare"}
          </button>
          <button
            onClick={() => setActiveTab("swot")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 ${activeTab === "swot" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {locale === "en" ? "📋 SWOT" : locale === "es" ? "📋 FODA" : "📋 SWOT"}
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-6">
          
          {activeTab === "overview" && (
            <div className="space-y-5">
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
                    className="text-[11px] text-zinc-500 hover:text-white"
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
                    className="text-[11px] text-zinc-500 hover:text-white"
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
                    className="text-[11px] text-zinc-500 hover:text-white"
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
                        className="text-[11px] text-zinc-500 hover:text-white"
                      >
                        {locale === "en" ? "✏️ Edit" : locale === "es" ? "✏️ Editar" : "✏️ Editează"}
                      </button>
                      <button
                        onClick={async () => {
                          const currentSecs = [...(result.sectiuni_aditionale || [])];
                          currentSecs.splice(idx, 1);
                          const updated = { ...result, sectiuni_aditionale: currentSecs };
                          setResult(updated);
                          const searchParams = new URLSearchParams(window.location.search);
                          const planId = searchParams.get("planId");
                          if (planId && user) {
                            try {
                              await updateDoc(doc(db, "users", user.uid, "plans", planId), updated);
                            } catch(e) { console.error(e); }
                          }
                          localStorage.setItem("current_generated_plan", JSON.stringify(updated));
                        }}
                        className="text-[11px] text-red-500 hover:text-red-450 font-semibold"
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
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Initial Investment Budget" : locale === "es" ? "Presupuesto Inicial de Inversión" : "Buget Inițial de Investiții"}</h3>
                  <button
                    onClick={() => {
                      if (isStudioPaid || isPlanPaid) {
                        handleAiEdit("optimize_budget");
                      } else {
                        setShowPricingModal(true);
                      }
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded font-black uppercase transition-all ${
                      (isStudioPaid || isPlanPaid)
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                        : "bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                    }`}
                  >
                    {(isStudioPaid || isPlanPaid)
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
            <div className="space-y-6">
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
                      className="text-[11px] text-zinc-500 hover:text-white"
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
                  isStudioPaid={isStudioPaid}
                  isAdmin={isAdmin}
                  isEditingAi={isEditingAi}
                  setShowAuthModal={() => {}}
                  setShowPricingModal={setShowPricingModal}
                  handleAiEdit={handleAiEdit}
                />
              </div>
            </div>
          )}

          {activeTab === "swot" && (
            <div className="space-y-5">
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
                      className="text-[10px] text-zinc-500 hover:text-white"
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
                      className="text-[10px] text-zinc-500 hover:text-white"
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
                      className="text-[10px] text-zinc-500 hover:text-white"
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
                      className="text-[10px] text-zinc-500 hover:text-white"
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

        <AdBanner dataAdSlot="3098389905" className="my-4" />
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
                router.push('/dashboard');
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
                  router.push('/dashboard');
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
            setIsPaidState(true);
          }
          alert(locale === "en" ? "Payment simulated successfully! Premium access is now unlocked." : locale === "es" ? "¡Pago simulado con éxito! El acceso premium ya está desbloqueado." : "Plată simulată cu succes! Accesul premium este acum deblocat.");
        }}
        onRequireLogin={() => {
          setShowPricingModal(false);
          router.push("/login");
        }}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        currency={locale === "es" || locale === "en" ? "EUR" : "LEI"}
        planName={result?.nume || (locale === "en" ? "Business Plan" : locale === "es" ? "Plan de Negocios" : "Plan de Afaceri")}
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
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">{locale === "en" ? "Free" : "Gratis"}</span>
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
                {locale === "en" ? "All Modules" : locale === "es" ? "Todos" : "Toate"}
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
                const isPaid = isStudioPaid || isPlanPaid;
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
                        if (!isPaid && !isAdmin) {
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
                        
                        const searchParams = new URLSearchParams(window.location.search);
                        const planId = searchParams.get("planId");
                        if (planId && user) {
                          try {
                            await updateDoc(doc(db, "users", user.uid, "plans", planId), updated);
                          } catch(e) { console.error(e); }
                        }
                        setShowExpertDrawer(false);
                        
                        setTimeout(() => {
                          const el = document.getElementById(`custom-section-${newIndex}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 300);
                      }}
                      className={`w-full py-2.5 rounded-lg text-[11px] font-bold text-center transition-all active:scale-[0.98] ${
                        isPaid 
                          ? "bg-emerald-600 text-white" 
                          : "bg-zinc-800 border border-zinc-700 text-zinc-300"
                      }`}
                    >
                      {isPaid 
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
    </div>
  );
}
