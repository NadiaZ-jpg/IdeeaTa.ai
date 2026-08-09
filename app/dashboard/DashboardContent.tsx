"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, sendEmailVerification, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { Plus, FileText, Calendar, ArrowRight, Loader2, Sparkles, Mail, AlertTriangle, Trash2 } from 'lucide-react';
import { migrateLocalPlansToFirebase } from '@/lib/migrationManager';
import { markPlanDeletedLocally, FREE_ACCOUNT_PLAN_LIMIT, clearLocalPlanState, hasUnlimitedGenerateAccess } from '@/lib/planQuota';
import {
  canGenerateWithQuotas,
  readProPackRemaining,
} from '@/lib/proPackQuota';
import { startProTopupCheckout } from '@/lib/proTopupCheckout';
import { ProPackQuotaBar } from '@/components/ProPackQuotaBar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import BuyMeACoffeeModal from '@/components/BuyMeACoffeeModal';
import { PricingModal } from '@/components/PricingModal';
import { UI_STRINGS } from '@/lib/uiStrings';
import { stagePlanForStudioOpen } from '@/lib/studioPlanHandoff';
import {
  stripPaymentSuccessParams,
  pollVerifyCheckout,
  paymentSuccessMessage,
} from '@/lib/paymentReturn';

export default function DashboardContent({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [lifetimePlanCount, setLifetimePlanCount] = useState(0);
  const [proPackRemaining, setProPackRemaining] = useState({
    generate: 0,
    edit: 0,
    combine: 0,
  });
  const [euFundsUnlocked, setEuFundsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showBmcModal, setShowBmcModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  const isEn = locale === "en";
  const isEs = locale === "es";
  const ui = UI_STRINGS[locale] || UI_STRINGS.ro;

  const canGenerate = canGenerateWithQuotas({
    isPaid: isPaidUser,
    subscriptionActive: isPaidUser,
    lifetimePlanCount,
    proPackGenerateRemaining: proPackRemaining.generate,
    freeLimit: FREE_ACCOUNT_PLAN_LIMIT,
  });

  const freeRemaining = Math.max(0, FREE_ACCOUNT_PLAN_LIMIT - lifetimePlanCount);
  const freeLimitReached = freeRemaining <= 0;
  /** One-time Pro Tools pack owner (not subscription unlimited) */
  const hasProPack = euFundsUnlocked && !isPaidUser;

  const showUpgradeCue = !isPaidUser && !canGenerate && !hasProPack;
  const showFreeRemainingCue = !isPaidUser && !freeLimitReached && !hasProPack;

  const handleGenerateNew = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user && !user?.emailVerified && user.providerData[0]?.providerId === 'password') {
      setShowVerificationModal(true);
    } else if (!canGenerate) {
      if (hasProPack) {
        void handleProTopupCheckout();
      } else {
        setShowPricingModal(true);
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("current_generated_plan");
        localStorage.removeItem("current_versions");
        localStorage.removeItem("businessPlan");
        localStorage.removeItem("businessDetails");
        localStorage.removeItem("studioActiveTab");
      }
      router.push(isEn ? '/en/studio' : isEs ? '/es/studio' : '/studio');
    }
  };

  const handleProTopupCheckout = async () => {
    if (!user) return;
    setTopupLoading(true);
    setTopupError(null);
    const result = await startProTopupCheckout({
      getIdToken: () => user.getIdToken(),
      email: user.email,
      locale,
      returnPath: "/dashboard",
    });
    if (!result.ok) {
      console.error(result.error);
      setTopupError(result.error);
      setTopupLoading(false);
      return;
    }
    window.location.href = result.url;
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

  const handleDeletePlan = async (e: React.MouseEvent, planId: string) => {
    e.stopPropagation(); // Previne navigarea la studio
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "plans", planId));
      // Previne re-migrarea planului șters din localStorage la refresh Dashboard
      markPlanDeletedLocally(user.uid, planId, plans.find(p => p.id === planId)?.nume);
      setPlans(plans.filter(p => p.id !== planId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Eroare la ștergerea planului:", err);
      alert(
        isEn 
          ? "An error occurred while deleting the plan. Please try again." 
          : isEs
          ? "Ocurrió un error al eliminar el plan. Por favor, inténtalo de nuevo."
          : "A apărut o eroare la ștergerea planului. Te rugăm să încerci din nou."
      );
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push(isEn ? '/en/login' : isEs ? '/es/login' : '/login');
        return;
      }
      setUser(currentUser);
      
      try {
        // Asigurăm migrarea planurilor locale înainte de a le prelua din Firestore (elimină race condition-ul)
        await migrateLocalPlansToFirebase(currentUser);

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let uData: any = {};
        if (userDocSnap.exists()) {
          uData = userDocSnap.data() || {};
          const isPaid = hasUnlimitedGenerateAccess({
            isPaid: !!uData.isPaid,
            subscriptionActive: !!uData.subscriptionActive,
          });
          setIsPaidUser(isPaid);
          setEuFundsUnlocked(!!uData.euFundsUnlocked);
          setProPackRemaining(readProPackRemaining(uData));
        } else {
          setIsPaidUser(false);
          setEuFundsUnlocked(false);
          setProPackRemaining({ generate: 0, edit: 0, combine: 0 });
        }

        const plansRef = collection(db, "users", currentUser.uid, "plans");
        const q = query(plansRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const fetchedPlans: any[] = [];
        const seenIds = new Set<string>();
        const seenNames = new Set<string>();

        snapshot.forEach((docSnap) => {
          const pData: any = { id: docSnap.id, ...docSnap.data() };
          const pName = pData.nume ? pData.nume.trim().toLowerCase() : "";
          
          if (!seenIds.has(pData.id) && (!pName || !seenNames.has(pName))) {
            seenIds.add(pData.id);
            if (pName) seenNames.add(pName);
            fetchedPlans.push(pData);
          } else {
            // Curățăm automat duplicatul din Firestore în fundal
            deleteDoc(doc(db, "users", currentUser.uid, "plans", docSnap.id)).catch(console.error);
          }
        });
        
        setLifetimePlanCount(
          typeof uData.lifetimePlanCount === "number"
            ? uData.lifetimePlanCount
            : fetchedPlans.length
        );
        setPlans(fetchedPlans);
      } catch (err) {
        console.error("Eroare la încărcarea planurilor:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, isEn, isEs]);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment_success") !== "true") return;
    const tier = urlParams.get("tier");
    (async () => {
      try {
        const ok = await pollVerifyCheckout({
          getIdToken: () => user.getIdToken(),
          tier,
        });
        if (ok) {
          alert(paymentSuccessMessage(tier, locale));
          // Refresh quotas from Firestore
          const userDocSnap = await getDoc(doc(db, "users", user.uid));
          if (userDocSnap.exists()) {
            const uData = userDocSnap.data() || {};
            setEuFundsUnlocked(!!uData.euFundsUnlocked);
            setProPackRemaining(readProPackRemaining(uData));
          }
          stripPaymentSuccessParams();
        }
      } catch (e) {
        console.error("Dashboard payment verify:", e);
      }
    })();
  }, [user, locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-emerald-500/30 font-sans relative overflow-hidden flex flex-col">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header Simplu */}
      <div className="w-full h-20 border-b border-zinc-800/80 flex items-center px-6 md:px-12 justify-between z-20 relative bg-[#09090b]/80 backdrop-blur-md">
        <Link href={isEn ? "/en" : isEs ? "/es" : "/"} className="text-2xl font-black text-white hover:text-emerald-400 transition-colors">
          IdeeaTa<span className="text-emerald-400">.ai</span>
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                type="button"
                onClick={() => setShowBmcModal(true)}
                className="bg-[#FFDD00] text-black px-3 py-1 rounded-md font-bold text-xs hover:bg-[#FFEA4D] hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title={ui.supportCoffeeTitle}
              >
                <span>☕</span> {ui.buyMeACoffee}
              </button>
              <LanguageSwitcher currentLocale={locale} />
              <span className="text-sm text-zinc-400 hidden sm:inline-block font-semibold">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => setShowPricingModal(true)}
                className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {ui.pricing}
              </button>
              <button 
                onClick={async () => {
                  clearLocalPlanState();
                  await signOut(auth);
                }}
                className="text-sm font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {ui.logOut}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl flex-grow">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
              {isEn ? "My Plans" : isEs ? "Mis Planes" : "Proiectele Mele"}
            </h1>
            <p className="text-zinc-400 text-lg">
              {isEn ? "Manage and edit your business plans" : isEs ? "Gestiona y edita tus planes de negocios" : "Gestionează și editează planurile tale de afaceri"}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:max-w-2xl">
            {hasProPack && (
              <div className="w-full">
                <ProPackQuotaBar
                  locale={locale}
                  remaining={proPackRemaining}
                  topupLoading={topupLoading}
                  onTopup={() => void handleProTopupCheckout()}
                  layout="inline"
                />
              </div>
            )}
            <div
              className={`grid gap-3 w-full ${
                !isPaidUser && !hasProPack ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {!isPaidUser && !hasProPack && (
                <div className="flex flex-col items-stretch gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPricingModal(true)}
                    className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black px-4 rounded-xl uppercase tracking-wider text-xs transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-black shrink-0" />
                    <span className="text-center leading-tight">
                      {isEn ? "👑 View Packages & Upgrade" : isEs ? "👑 Ver Paquetes y Mejorar" : "👑 Vezi Pachete & Upgrade"}
                    </span>
                  </button>
                </div>
              )}
              <div className="flex flex-col items-stretch gap-1.5">
                <button
                  type="button"
                  onClick={handleGenerateNew}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl font-black uppercase tracking-wider text-xs transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-5 h-5 shrink-0" />
                  <span className="text-center leading-tight">
                    {isEn ? "Generate New Plan" : isEs ? "Generar Nuevo Plan" : "Generează Plan Nou"}
                  </span>
                </button>
                {showUpgradeCue ? (
                  <button
                    type="button"
                    onClick={() => setShowPricingModal(true)}
                    className="text-[11px] text-amber-400 font-semibold text-center leading-snug hover:underline cursor-pointer min-h-[2.75rem]"
                  >
                    ⚡ {isEn ? "Free plan limit reached — click here to upgrade" : isEs ? "Límite del plan gratuito alcanzado — clic para mejorar" : "Planul gratuit folosit — dă click aici pentru upgrade"}
                  </button>
                ) : showFreeRemainingCue ? (
                  <button
                    type="button"
                    onClick={() => setShowPricingModal(true)}
                    className="text-[11px] text-emerald-400 font-semibold text-center leading-snug hover:underline cursor-pointer min-h-[2.75rem]"
                  >
                    🎁 {isEn
                      ? (freeRemaining === 1 ? "You have 1 free plan generation remaining. Click to view packages." : `You have ${freeRemaining} free plan generations remaining. Click to view packages.`)
                      : isEs
                      ? (freeRemaining === 1 ? "Te queda 1 generación de plan gratuito. Clic para ver paquetes." : `Te quedan ${freeRemaining} generaciones de planes gratuitos. Clic para ver paquetes.`)
                      : (freeRemaining === 1 ? "Mai ai dreptul la 1 plan gratuit. Click pentru pachete." : `Mai ai dreptul la ${freeRemaining} planuri gratuite. Click pentru pachete.`)}
                  </button>
                ) : (
                  <div className="min-h-[2.75rem]" aria-hidden />
                )}
              </div>
            </div>
            {topupError && (
              <p className="text-[11px] text-red-400 font-semibold text-right max-w-sm">{topupError}</p>
            )}
          </div>
        </header>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-zinc-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              {isEn ? "No plans generated yet" : isEs ? "Aún no se han generado planes" : "Niciun plan generat încă"}
            </h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              {isEn 
                ? "Your generated business plans will appear here. Start now and turn your idea into reality!"
                : isEs
                ? "Tus planes de negocios generados aparecerán aquí. ¡Comienza ahora y convierte tu idea en realidad!"
                : "Aici vor apărea toate planurile tale de afaceri. Începe acum și transformă-ți ideea în realitate!"}
            </p>
            <button onClick={handleGenerateNew} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Plus className="w-5 h-5" />
              {isEn ? "Start first project" : isEs ? "Iniciar primer proyecto" : "Începe primul proiect"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => {
                  stagePlanForStudioOpen(plan);
                  router.push(isEn ? `/en/studio?planId=${plan.id}&view=idea` : isEs ? `/es/studio?planId=${plan.id}&view=idea` : `/studio?planId=${plan.id}&view=idea`);
                }}
                className="bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer group flex flex-col hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.3)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      {plan.isPaid && (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          PRO
                        </span>
                      )}
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                        (plan.selectedCurrency || (locale === "ro" ? "LEI" : "EUR")) === "EUR"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {plan.selectedCurrency || (locale === "ro" ? "LEI" : "EUR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold bg-zinc-800/50 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(plan.createdAt || Date.now()).toLocaleDateString(isEn ? 'en-US' : isEs ? 'es-ES' : 'ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{plan.nume || (isEn ? "Unnamed Plan" : isEs ? "Plan Sin Nombre" : "Plan Fără Nume")}</h3>
                <p className="text-zinc-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                  {plan.slogan || (isEn ? "Business project generated with IdeeaTa.ai" : isEs ? "Proyecto de negocio generado con IdeeaTa.ai" : "Proiect de afaceri generat cu IdeeaTa.ai")}
                </p>

                <div className="mt-auto pt-4 border-t border-zinc-800/80 flex justify-between items-center text-emerald-400 font-bold text-sm">
                  {confirmDeleteId === plan.id ? (
                    <div className="flex items-center gap-2 text-xs w-full justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-red-400 font-semibold">{isEn ? "Sure?" : isEs ? "¿Seguro?" : "Sigur?"}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleDeletePlan(e, plan.id)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all cursor-pointer text-xs"
                        >
                          {isEn ? "Yes" : isEs ? "Sí" : "Da"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold transition-all cursor-pointer text-xs"
                        >
                          {isEn ? "No" : isEs ? "No" : "Nu"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span>{isEn ? "Open in Studio" : isEs ? "Abrir en Studio" : "Deschide în Studio"}</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(plan.id);
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 rounded-lg transition-all"
                          title={isEn ? "Delete plan" : isEs ? "Eliminar plan" : "Șterge planul"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verificare Email Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#09090b] border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-8 relative overflow-hidden flex flex-col gap-6 text-center animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mt-2">
              <Mail className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white mb-2">{isEn ? "Confirm email address" : isEs ? "Confirmar dirección de correo" : "Confirmă adresa de email"}</h2>
              <p className="text-zinc-400">
                {isEn 
                  ? "To generate a free plan and receive 3 Premium Edits, please confirm your email address by clicking the link in your Inbox."
                  : isEs
                  ? "Para generar un plan gratuito y recibir 3 Ediciones Premium, por favor confirma tu dirección de correo electrónico haciendo clic en el enlace recibido en tu bandeja de entrada."
                  : "Pentru a genera un plan gratuit și a primi cele 3 Editări Premium, te rugăm să îți confirmi adresa de email dând click pe link-ul primit în Inbox."}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => {
                  window.location.reload(); // Reincarca pentru a verifica starea noua
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all"
              >
                {isEn ? "I confirmed, continue" : isEs ? "Ya confirmé, continuar" : "Am confirmat, continuă"}
              </button>
              
              <button 
                onClick={handleResendVerification}
                disabled={verificationSent}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verificationSent ? (isEn ? "Email sent!" : isEs ? "¡Correo enviado!" : "Email trimis!") : (isEn ? "Resend verification email" : isEs ? "Reenviar correo de verificación" : "Trimite emailul din nou")}
              </button>
              
              <button 
                onClick={() => setShowVerificationModal(false)}
                className="w-full text-zinc-500 hover:text-white font-medium py-2 transition-all mt-2"
              >
                {isEn ? "Close" : isEs ? "Cerrar" : "Închide"}
              </button>
            </div>
          </div>
        </div>
      )}
      <BuyMeACoffeeModal 
        isOpen={showBmcModal} 
        onClose={() => setShowBmcModal(false)} 
        locale={locale} 
      />
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        locale={locale}
        userId={user?.uid || ""}
        userEmail={user?.email || null}
        currency={isEn || isEs ? "EUR" : "LEI"}
      />
    </div>
  );
}
