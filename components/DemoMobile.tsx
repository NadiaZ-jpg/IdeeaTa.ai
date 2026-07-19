"use client";
import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import pptxgen from "pptxgenjs";
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, increment, arrayUnion } from 'firebase/firestore';
import { PricingModal } from '@/components/PricingModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AdBanner } from '@/components/AdBanner';
import { generateDocxBlob } from '@/lib/generateDocx';
import { ConversionBanners } from '@/components/ConversionBanners';
import { migrateLocalPlansToFirebase } from '@/lib/migrationManager';
import { ToneEditor } from '@/components/ToneEditor';
import Link from 'next/link';
import { getExamples } from '@/lib/examples';
import { t } from '@/lib/translations';
import dynamic from 'next/dynamic';

const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });

const formatNumberedText = (text: string | undefined) => {
  if (typeof text !== 'string') return text;
  let formatted = text;
  formatted = formatted.replace(/^(?:În primul an:?|În următorii(?:\s*\d+(?:-\d+)?\s*ani)?:?|Obiective(?:le)?[^:]*:?|Pentru primul an:?|Pe termen scurt:?|Pe termen mediu:?)\s*/i, '');
  formatted = formatted.replace(/\*\*/g, '');
  formatted = formatted.replace(/^\s*\*\s*/gm, '');
  formatted = formatted.replace(/\s*\*\s*$/gm, '');
  formatted = formatted.replace(/\n\s*\n+/g, '\n\n');
  formatted = formatted.replace(/\n+\s*(\d+\.)\s+/g, '\n$1 ');
  formatted = formatted.replace(/([.!?])\s+(\d+\.)\s+/g, '$1\n$2 ');
  formatted = formatted.replace(/^[\s,;.-]+/, '');
  formatted = formatted.replace(/(^|\n|[.!?]\s+)([^a-zA-ZăâîșțĂÂÎȘȚ]*)([a-zăâîșț])/g, (match, p1, p2, p3) => {
    return p1 + p2 + p3.toUpperCase();
  });
  return formatted;
};

const formatObjectNumbers = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (/^\s*\d+(?:\.\d+)?\s*$/.test(obj)) {
      const parsed = parseFloat(obj.trim());
      if (!isNaN(parsed)) return parsed;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => formatObjectNumbers(item));
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = formatObjectNumbers(obj[key]);
      }
    }
    return newObj;
  }
}
export default function DemoMobile({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const isEn = locale === "en";
  const isEs = locale === "es";
  const ALL_EXAMPLES = getExamples(locale);
  const [skill, setSkill] = useState("");
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "marketing" | "swot">("overview");
  const [loading, setLoading] = useState(false);
  const [fxRate, setFxRate] = useState(0.201);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | 'pptx' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Stările pentru asistentul AI Bottom-Sheet
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [activeAiPrompt, setActiveAiPrompt] = useState<{action: string, title: string, placeholder?: string} | null>(null);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [showShareSuccess, setShowShareSuccess] = useState(false);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        await migrateLocalPlansToFirebase(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Restaurare plan din localStorage la mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("current_generated_plan");
      if (saved) {
        try {
          setResult(formatObjectNumbers(JSON.parse(saved)));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleGenerate = async (nicheExample?: string) => {
    const inputSkill = nicheExample || skill;
    if (!inputSkill.trim()) return;

    if (!user) {
      const count = parseInt(localStorage.getItem("demoGenerateCount") || "0", 10);
      if (count >= 3) {
        setShowAuthModal(true);
        return;
      }
      localStorage.setItem("demoGenerateCount", (count + 1).toString());
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: inputSkill, locale }),
      });

      if (!res.ok) throw new Error("Eroare la generare");

      const data = await res.json();
      if (data.fx_rate) setFxRate(data.fx_rate);

      if (data && data.ideas && data.ideas.length > 0) {
        const content = data.ideas[0];
        let cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        cleanJson = cleanJson.replace(/[„“”]/g, '"');
        const startIndex = cleanJson.indexOf('{');
        const endIndex = cleanJson.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) cleanJson = cleanJson.substring(startIndex, endIndex + 1);

        const finalResult = formatObjectNumbers(JSON.parse(cleanJson));
        setResult(finalResult);
        localStorage.setItem("current_generated_plan", JSON.stringify(finalResult));
        
        // Adăugăm în demo_plans_list
        try {
          const listStr = localStorage.getItem("demo_plans_list");
          let list = listStr ? JSON.parse(listStr) : [];
          if (!Array.isArray(list)) list = [];
          const planToSave = { ...finalResult };
          if (!planToSave.id) {
            const safeName = planToSave.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Plan';
            planToSave.id = `${safeName}_${Date.now()}`;
          }
          const exists = list.some((p: any) => p.nume === planToSave.nume || p.id === planToSave.id);
          if (!exists) {
            list.push(planToSave);
            localStorage.setItem("demo_plans_list", JSON.stringify(list));
          }
        } catch (err) {
          console.error(err);
        }

        if (user) {
          try {
            const planId = finalResult.nume.replace(/[^a-zA-Z0-9]/g, '_') + "_" + Date.now();
            await setDoc(doc(db, "users", user.uid, "plans", planId), {
              ...finalResult,
              createdAt: new Date().toISOString(),
              isPaid: false
            });
          } catch (fsError) {
            console.error("Firestore save error:", fsError);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert("A apărut o eroare la generare. Vă rugăm să încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiEdit = async (action: string, customInput?: string) => {
    if (!result) return;
    setIsEditingAi(true);
    setActiveAiPrompt(null);

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          customInput: customInput || aiPromptInput,
          currentPlan: result
        })
      });

      if (!res.ok) throw new Error("Eroare editare AI");

      const data = await res.json();
      if (data && data.editedPlan) {
        const parsed = formatObjectNumbers(data.editedPlan);
        setResult(parsed);
        localStorage.setItem("current_generated_plan", JSON.stringify(parsed));
      }
    } catch (e) {
      console.error(e);
      alert("Nu s-a putut procesa comanda AI.");
    } finally {
      setIsEditingAi(false);
      setAiPromptInput("");
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setAuthError(null);
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      await signInWithPopup(auth, authProvider);
      setShowAuthModal(false);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      setAuthError("Eroare la autentificare cu partenerul social.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setAuthError(null);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setShowAuthModal(false);
    } catch (error: any) {
      setAuthError("Email sau parolă incorectă.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Logica de Export PDF/Word simplificată pentru demo mobil
  const handleDownload = async (format: 'pdf' | 'word') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowPricingModal(true); // În demo, descărcările necesită upgrade
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-x-hidden flex flex-col pb-16">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <header className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30">
        <Link href="/" className="text-xl font-black tracking-tight">
          IdeeaTa<span className="text-emerald-500">.ai</span>
        </Link>
        {!result && <LanguageSwitcher currentLocale={locale} />}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-6">
        
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-6">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="space-y-2 max-w-xs">
              <h3 className="font-bold text-lg text-emerald-400">{locale === "en" ? "AI Assistant is working" : locale === "es" ? "El asistente de IA está trabajando" : "Asistentul AI lucrează"}</h3>
              <p className="text-sm text-zinc-400 animate-pulse">{loadingMessages[loadingMessageIndex]}</p>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                <label className="text-xs font-semibold text-zinc-400">{locale === "en" ? "Describe your business briefly" : locale === "es" ? "Describe tu negocio brevemente" : "Descrie afacerea pe scurt"}</label>
                <textarea
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder={locale === "en" ? "E.g. A coffee shop with its own roastery and coworking space..." : locale === "es" ? "Ej: Una cafetería con tostador propio y espacio de co-working..." : "Ex: O cafenea cu prăjitorie proprie și spațiu de co-working..."}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 h-28 outline-none resize-none transition-all"
                />
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={!skill.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{locale === "en" ? "Generate Free Plan" : locale === "es" ? "Generar Plan Gratuito" : "Generează Planul Gratuit"}</span>
                <span>🚀</span>
              </button>
            </div>

            {/* Examples Carousel */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 px-1">{t("getInspiredBy", locale)}</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x px-1">
                {examplesList.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSkill(ex.long);
                      handleGenerate(ex.long);
                    }}
                    className="flex-shrink-0 bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/30 rounded-xl p-4 w-[240px] text-left snap-start transition-all"
                  >
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">{ex.short}</span>
                    <p className="text-xs font-semibold text-zinc-200 line-clamp-2">{ex.long}</p>
                  </button>
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
                <button
                  onClick={handleShare}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-lg text-xs transition-all active:scale-95"
                  title={locale === "en" ? "Copy link" : locale === "es" ? "Copiar enlace" : "Copiază link-ul"}
                >
                  🔗
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>{locale === "en" ? "Export" : locale === "es" ? "Exportar" : "Export"}</span>
                  <span>📥</span>
                </button>
              </div>
            </div>

            {showShareSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center py-2 rounded-lg animate-pulse font-bold">
                {locale === "en" ? "Link copied to clipboard!" : locale === "es" ? "¡Enlace copiado al portapapeles!" : "Link copiat în clipboard!"}
              </div>
            )}

            {/* Mobile Tab bar */}
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

            {/* Conversion banners under tabs */}
            <ConversionBanners 
              isSharedView={false} 
              user={user} 
              result={result} 
              onResetApp={() => {
                setResult(null);
                localStorage.removeItem("current_generated_plan");
              }} 
              onAuthClick={() => setShowAuthModal(true)} 
              locale={locale}
            />

            {/* Tab content wrapper */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-6">
              
              {activeTab === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Business Description" : locale === "es" ? "Descripción del Negocio" : "Descriere Afacere"}</h3>
                    <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.descriere)}</p>
                  </div>
                  <div className="h-px bg-zinc-800/60"></div>
                  <div className="space-y-1">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Market Opportunity" : locale === "es" ? "Oportunidad de Mercado" : "Oportunitatea Pieței"}</h3>
                    <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.oportunitate_piata)}</p>
                  </div>
                  <div className="h-px bg-zinc-800/60"></div>
                  <div className="space-y-1">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Target Audience" : locale === "es" ? "Público Objetivo" : "Publicul Țintă"}</h3>
                    <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.public_tinta)}</p>
                  </div>
                </div>
              )}

              {activeTab === "budget" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-3">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Initial Investment Budget" : locale === "es" ? "Presupuesto Inicial de Inversión" : "Buget Inițial de Investiții"}</h3>
                    <div className="space-y-2">
                      {result.plan_financiar?.buget_investitii?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-3 flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-300">{item.categorie}</span>
                          <span className="font-black text-emerald-400">{item.suma_lei?.toLocaleString()} {locale === "ro" ? "LEI" : "EUR"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Budget Chart (Dynamic container) */}
                  <div className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 flex flex-col items-center justify-center">
                    <h4 className="text-[10px] font-bold text-zinc-400 mb-4 uppercase">{locale === "en" ? "Funds Distribution" : locale === "es" ? "Distribución de Fondos" : "Distribuția Fondurilor"}</h4>
                    <div className="w-full max-w-[200px] aspect-square flex items-center justify-center">
                      <BudgetPieChart budget={result.plan_financiar?.buget_investitii || []} currency={locale === "ro" ? "LEI" : "EUR"} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "marketing" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-3">
                    <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "Promotion Channels" : locale === "es" ? "Canales de Promoción" : "Canale de Promovare"}</h3>
                    <div className="space-y-3">
                      {result.strategie_marketing?.canale_promovare?.map((canal: any, idx: number) => (
                        <div key={idx} className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 space-y-1">
                          <h4 className="font-bold text-zinc-200 text-xs">{canal.nume}</h4>
                          <p className="text-zinc-400 text-[11px] leading-relaxed">{canal.detalii}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tone Editor Bottom Element */}
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4 space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-200">{locale === "en" ? "Customize Presentation Tone" : locale === "es" ? "Personalizar el Tono de la Presentación" : "Personalizează Tonul Prezentării"}</h4>
                      <p className="text-[10px] text-zinc-400">{locale === "en" ? "Automatically rewrite the business plan in a formal, commercial, or friendly style." : locale === "es" ? "Reescribe automáticamente el plan de negocios en un estilo formal, comercial o amigable." : "Rescrie automat planul de afaceri într-un stil formal, comercial sau prietenos."}</p>
                    </div>
                    <ToneEditor
                      user={user}
                      isStudioPaid={false}
                      isAdmin={false}
                      isEditingAi={isEditingAi}
                      setShowAuthModal={setShowAuthModal}
                      setShowPricingModal={setShowPricingModal}
                      handleAiEdit={handleAiEdit}
                    />
                  </div>
                </div>
              )}

              {activeTab === "swot" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <h3 className="text-emerald-400 font-bold text-sm">{locale === "en" ? "SWOT Analysis" : locale === "es" ? "Análisis FODA" : "Analiza SWOT"}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-emerald-950/10 border border-emerald-800/20 rounded-xl p-4">
                      <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase block mb-1">{locale === "en" ? "💪 Strengths" : locale === "es" ? "💪 Fortalezas" : "💪 Puncte Forte (Strengths)"}</span>
                      <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_swot?.puncte_forte)}</p>
                    </div>
                    <div className="bg-rose-950/10 border border-rose-800/20 rounded-xl p-4">
                      <span className="text-[10px] text-rose-400 font-black tracking-wider uppercase block mb-1">{locale === "en" ? "⚠️ Weaknesses" : locale === "es" ? "⚠️ Debilidades" : "⚠️ Puncte Slabe (Weaknesses)"}</span>
                      <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_swot?.puncte_slabe)}</p>
                    </div>
                    <div className="bg-blue-950/10 border border-blue-800/20 rounded-xl p-4">
                      <span className="text-[10px] text-blue-400 font-black tracking-wider uppercase block mb-1">{locale === "en" ? "🚀 Opportunities" : locale === "es" ? "🚀 Oportunidades" : "🚀 Oportunități (Opportunities)"}</span>
                      <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_swot?.oportunitati)}</p>
                    </div>
                    <div className="bg-amber-950/10 border border-amber-800/20 rounded-xl p-4">
                      <span className="text-[10px] text-amber-400 font-black tracking-wider uppercase block mb-1">{locale === "en" ? "☠️ Threats" : locale === "es" ? "☠️ Amenazas" : "☠️ Amenințări (Threats)"}</span>
                      <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_swot?.amenintari)}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Back Button / Reset App */}
            <button
              onClick={() => {
                setResult(null);
                localStorage.removeItem("current_generated_plan");
              }}
              className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-400 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-98 text-center"
            >
              {locale === "en" ? "Delete plan and start a new idea" : locale === "es" ? "Eliminar plan y comenzar una nueva idea" : "Șterge planul și începe o idee nouă"}
            </button>
          </div>
        )}

        <AdBanner dataAdSlot="3098389905" className="my-4" />
      </main>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm space-y-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold p-1 text-sm"
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

            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <input
                type="email"
                placeholder={locale === "en" ? "Email Address" : locale === "es" ? "Dirección de correo electrónico" : "Adresa de email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <input
                type="password"
                placeholder={locale === "en" ? "Password" : locale === "es" ? "Contraseña" : "Parolă"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
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
                className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Google
              </button>
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Facebook
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                {isLoginMode 
                  ? (locale === "en" ? "Don't have an account? Register" : locale === "es" ? "¿No tienes una cuenta? Regístrate" : "Nu ai cont? Înregistrează-te") 
                  : (locale === "en" ? "Already have an account? Log in" : locale === "es" ? "¿Ya tienes una cuenta? Inicia sesión" : "Ai deja cont? Conectează-te")}
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
          alert(locale === "en" ? "Payment simulated successfully! Premium access is now unlocked." : locale === "es" ? "¡Pago simulado con éxito! El acceso premium ya está desbloqueado." : "Plată simulată cu succes! Accesul premium este acum deblocat.");
        }}
        onRequireLogin={() => {
          setShowPricingModal(false);
          setShowAuthModal(true);
        }}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        currency="LEI"
        planName={result?.nume || (locale === "en" ? "Business Plan" : "Plan de Afaceri")}
        locale={locale}
      />
    </div>
  );
}
