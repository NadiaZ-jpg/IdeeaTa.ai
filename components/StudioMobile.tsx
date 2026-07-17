"use client";
import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import pptxgen from "pptxgenjs";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { PricingModal } from '@/components/PricingModal';
import { AdBanner } from '@/components/AdBanner';
import { useStudioFirebaseSync } from '@/hooks/useStudioFirebaseSync';
import { ToneEditor } from '@/components/ToneEditor';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function StudioMobile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<any>(null);
  const [versions, setVersions] = useState<any>({});
  const [activeVersionId, setActiveVersionId] = useState<string>("original");
  
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "marketing" | "swot">("overview");
  const [loading, setLoading] = useState(false);
  const [fxRate, setFxRate] = useState(0.201);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | 'pptx' | null>(null);
  
  // Stări pentru editarea AI și manuală pe mobil (Bottom-Sheets)
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  // Editare Manuală Drawer
  const [editingField, setEditingField] = useState<{key: string, title: string, value: string} | null>(null);

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

  const handleAiEdit = async (action: string, customInput?: string) => {
    if (!result || !user) return;
    setIsEditingAi(true);

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          customInput: customInput || "",
          currentPlan: result
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
      alert("Nu s-a putut procesa modificarea AI.");
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
      updatedPlan[keys[0]][keys[1]] = editingField.value;
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
    if (user) {
      try {
        await sendEmailVerification(user);
        setVerificationSent(true);
      } catch (error) {
        console.error(error);
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

  const handleDownload = () => {
    setShowPricingModal(true); // Descărcările necesită Premium
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-sm">Se încarcă spațiul tău de lucru Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-x-hidden flex flex-col pb-16">
      
      {/* Header */}
      <header className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30">
        <Link href="/dashboard" className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1">
          <span>←</span>
          <span>Dashboard</span>
        </Link>
        <span className="text-sm font-black">Studio Mobil</span>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="bg-zinc-800 text-white font-bold p-2 rounded-lg text-xs"
            title="Distribui"
          >
            🔗
          </button>
          <button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1"
          >
            <span>Export</span>
            <span>📥</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        
        {showShareSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center py-2 rounded-lg animate-pulse font-bold">
            Link copiat în clipboard!
          </div>
        )}

        {/* Studio Info Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex justify-between items-center backdrop-blur-md">
          <div className="min-w-0">
            <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase block w-max mb-1">
              Mod Editare
            </span>
            <h2 className="text-sm font-black text-white truncate">{result.nume || "Plan de Afaceri"}</h2>
          </div>
          <button
            onClick={() => setShowPricingModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0"
          >
            ⚡ Upgrade PRO
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-zinc-950 border border-zinc-800/80 rounded-xl p-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 ${activeTab === "overview" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            📈 Prezentare
          </button>
          <button
            onClick={() => setActiveTab("budget")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 ${activeTab === "budget" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            💰 Finanțe
          </button>
          <button
            onClick={() => setActiveTab("marketing")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 ${activeTab === "marketing" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            📣 Promovare
          </button>
          <button
            onClick={() => setActiveTab("swot")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-4 ${activeTab === "swot" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            📋 SWOT
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-6">
          
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">Descriere Afacere</h3>
                  <button
                    onClick={() => setEditingField({ key: "descriere", title: "Descriere Afacere", value: result.descriere || "" })}
                    className="text-[11px] text-zinc-500 hover:text-white"
                  >
                    ✏️ Editează
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.descriere)}</p>
              </div>

              <div className="h-px bg-zinc-800/60"></div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">Oportunitatea Pieței</h3>
                  <button
                    onClick={() => setEditingField({ key: "oportunitate_piata", title: "Oportunitatea Pieței", value: result.oportunitate_piata || "" })}
                    className="text-[11px] text-zinc-500 hover:text-white"
                  >
                    ✏️ Editează
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.oportunitate_piata)}</p>
              </div>

              <div className="h-px bg-zinc-800/60"></div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">Publicul Țintă</h3>
                  <button
                    onClick={() => setEditingField({ key: "public_tinta", title: "Publicul Țintă", value: result.public_tinta || "" })}
                    className="text-[11px] text-zinc-500 hover:text-white"
                  >
                    ✏️ Editează
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.public_tinta)}</p>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 font-bold text-sm">Buget Inițial de Investiții</h3>
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-black uppercase"
                  >
                    🔒 Optimizați Buget AI
                  </button>
                </div>
                <div className="space-y-2">
                  {result.plan_financiar?.buget_investitii?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-3 flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-300">{item.categorie}</span>
                      <span className="font-black text-emerald-400">{item.suma_lei?.toLocaleString()} LEI</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Container */}
              <div className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 flex flex-col items-center justify-center">
                <h4 className="text-[10px] font-bold text-zinc-400 mb-4 uppercase">Distribuția Fondurilor</h4>
                <div className="w-full max-w-[200px] aspect-square flex items-center justify-center">
                      <BudgetPieChart budget={result.plan_financiar?.buget_investitii || []} currency="LEI" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "marketing" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-emerald-400 font-bold text-sm">Canale de Promovare</h3>
                <div className="space-y-3">
                  {result.strategie_marketing?.canale_promovare?.map((canal: any, idx: number) => (
                    <div key={idx} className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 space-y-1 relative">
                      <h4 className="font-bold text-zinc-200 text-xs">{canal.nume}</h4>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">{canal.detalii}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tone Editor inside Studio */}
              <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-200">Personalizează Tonul Prezentării</h4>
                  <p className="text-[10px] text-zinc-400">Schimbă automat tonul planului salvat folosind AI-ul.</p>
                </div>
                <ToneEditor
                  user={user}
                  isStudioPaid={false}
                  isAdmin={false}
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
              <h3 className="text-emerald-400 font-bold text-sm">Analiza SWOT</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-emerald-950/10 border border-emerald-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase">💪 Puncte Forte</span>
                    <button
                      onClick={() => setEditingField({ key: "analiza_swot.puncte_forte", title: "Puncte Forte (Strengths)", value: result.analiza_swot?.puncte_forte || "" })}
                      className="text-[10px] text-zinc-500 hover:text-white"
                    >
                      ✏️ Editează
                    </button>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_swot?.puncte_forte)}</p>
                </div>
                
                <div className="bg-rose-950/10 border border-rose-800/20 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-rose-400 font-black tracking-wider uppercase">⚠️ Puncte Slabe</span>
                    <button
                      onClick={() => setEditingField({ key: "analiza_swot.puncte_slabe", title: "Puncte Slabe (Weaknesses)", value: result.analiza_swot?.puncte_slabe || "" })}
                      className="text-[10px] text-zinc-500 hover:text-white"
                    >
                      ✏️ Editează
                    </button>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">{formatNumberedText(result.analiza_swot?.puncte_slabe)}</p>
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
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <h4 className="text-sm font-black text-white">{editingField.title}</h4>
              <button onClick={() => setEditingField(null)} className="text-xs text-zinc-500 font-bold p-1">Închide</button>
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
                Renunță
              </button>
              <button
                onClick={handleManualSave}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 text-center"
              >
                Salvează Modificările
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
              <h3 className="text-lg font-black">Confirmă adresa de email</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ți-am trimis un link de verificare pe adresa ta. Te rugăm să activezi contul pentru a putea folosi Studio.
              </p>
            </div>

            {verificationSent && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2 px-3 rounded-lg font-semibold">
                Link-ul de activare a fost retrimis cu succes!
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleResendVerification}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-95"
              >
                Retrimite Email de Activare
              </button>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  router.push('/dashboard');
                }}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl text-xs transition-all active:scale-95"
              >
                Mergi la Dashboard
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
          alert("Plată simulată cu succes! Accesul premium este acum deblocat.");
        }}
        onRequireLogin={() => {
          setShowPricingModal(false);
          router.push("/login");
        }}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        currency="LEI"
        planName={result?.nume || "Plan de Afaceri"}
      />
    </div>
  );
}
