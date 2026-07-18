"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, sendEmailVerification, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Plus, FileText, Calendar, ArrowRight, Loader2, Sparkles, Mail, AlertTriangle, Trash2 } from 'lucide-react';
import { migrateLocalPlansToFirebase } from '@/lib/migrationManager';

export default function DashboardContent({ locale = "ro" }: { locale?: "ro" | "en" }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const isEn = locale === "en";

  // FEAT-3: Avertizare vizuală dacă utilizatorul gratuit a consumat generarea
  const studioLimitUsed = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem('studioGenerateCount') || '0', 10) >= 1
    : false;

  const handleGenerateNew = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user && !user?.emailVerified && user.providerData[0]?.providerId === 'password') {
      setShowVerificationModal(true);
    } else {
      // Curatam memoria locala ca sa fim siguri ca form-ul de Studio e curat
      if (typeof window !== "undefined") {
        localStorage.removeItem("current_generated_plan");
        localStorage.removeItem("current_versions");
        localStorage.removeItem("businessPlan");
        localStorage.removeItem("businessDetails");
        localStorage.removeItem("studioActiveTab");
      }
      router.push(isEn ? '/en/studio' : '/studio');
    }
  };

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

  const handleDeletePlan = async (e: React.MouseEvent, planId: string) => {
    e.stopPropagation(); // Previne navigarea la studio
    if (!user) return;
    
    const confirmDelete = window.confirm(
      isEn 
        ? "Are you sure you want to permanently delete this business plan? This action cannot be undone."
        : "Ești sigur că dorești să ștergi definitiv acest plan de afaceri? Această acțiune nu poate fi anulată."
    );
    if (!confirmDelete) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "plans", planId));
      setPlans(plans.filter(p => p.id !== planId));
    } catch (err) {
      console.error("Eroare la ștergerea planului:", err);
      alert(
        isEn 
          ? "An error occurred while deleting the plan. Please try again." 
          : "A apărut o eroare la ștergerea planului. Te rugăm să încerci din nou."
      );
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push(isEn ? '/en/login' : '/login');
        return;
      }
      setUser(currentUser);
      
      try {
        // Asigurăm migrarea planurilor locale înainte de a le prelua din Firestore (elimină race condition-ul)
        await migrateLocalPlansToFirebase(currentUser);

        const plansRef = collection(db, "users", currentUser.uid, "plans");
        const q = query(plansRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const fetchedPlans: any[] = [];
        snapshot.forEach((doc) => {
          fetchedPlans.push({ id: doc.id, ...doc.data() });
        });
        
        setPlans(fetchedPlans);
      } catch (err) {
        console.error("Eroare la încărcarea planurilor:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, isEn]);

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
        <Link href={isEn ? "/en" : "/"} className="text-2xl font-black text-white hover:text-emerald-400 transition-colors">
          IdeeaTa<span className="text-emerald-400">.ai</span>
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400 hidden sm:inline-block font-semibold">
                {user.email}
              </span>
              <button 
                onClick={() => signOut(auth)}
                className="text-sm font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {isEn ? "Log Out" : "Ieși din cont"}
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
              {isEn ? "My Plans" : "Proiectele Mele"}
            </h1>
            <p className="text-zinc-400 text-lg">
              {isEn ? "Manage and edit your business plans" : "Gestionează și editează planurile tale de afaceri"}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            <button onClick={handleGenerateNew} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-1">
              <Plus className="w-5 h-5" />
              {isEn ? "Generate New Plan" : "Generează Plan Nou"}
            </button>
            {studioLimitUsed && (
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                ⚡ {isEn ? "Free plan limit reached — upgrade required for new plan" : "Planul gratuit folosit — upgrade necesar pentru plan nou"}
              </span>
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
              {isEn ? "No plans generated yet" : "Niciun plan generat încă"}
            </h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              {isEn 
                ? "Your generated business plans will appear here. Start now and turn your idea into reality!"
                : "Aici vor apărea toate planurile tale de afaceri. Începe acum și transformă-ți ideea în realitate!"}
            </p>
            <button onClick={handleGenerateNew} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Plus className="w-5 h-5" />
              {isEn ? "Start first project" : "Începe primul proiect"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => router.push(isEn ? `/en/studio?planId=${plan.id}` : `/studio?planId=${plan.id}`)}
                className="bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer group flex flex-col hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.3)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {plan.isPaid ? (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        PRO
                      </span>
                    ) : (
                      <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        {isEn ? "Free" : "Gratuit"}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold bg-zinc-800/50 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(plan.createdAt || Date.now()).toLocaleDateString(isEn ? 'en-US' : 'ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{plan.nume || (isEn ? "Unnamed Plan" : "Plan Fără Nume")}</h3>
                <p className="text-zinc-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                  {plan.slogan || (isEn ? "Business project generated with IdeeaTa.ai" : "Proiect de afaceri generat cu IdeeaTa.ai")}
                </p>

                <div className="mt-auto pt-4 border-t border-zinc-800/80 flex justify-between items-center text-emerald-400 font-bold text-sm">
                  <span>{isEn ? "Open in Studio" : "Deschide în Studio"}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleDeletePlan(e, plan.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 rounded-lg transition-all"
                      title={isEn ? "Delete plan" : "Șterge planul"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
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
              <h2 className="text-2xl font-black text-white mb-2">{isEn ? "Confirm email address" : "Confirmă adresa de email"}</h2>
              <p className="text-zinc-400">
                {isEn 
                  ? "To generate a free plan and receive 3 Premium Edits, please confirm your email address by clicking the link in your Inbox."
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
                {isEn ? "I confirmed, continue" : "Am confirmat, continuă"}
              </button>
              
              <button 
                onClick={handleResendVerification}
                disabled={verificationSent}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verificationSent ? (isEn ? "Email sent!" : "Email trimis!") : (isEn ? "Resend verification email" : "Trimite emailul din nou")}
              </button>
              
              <button 
                onClick={() => setShowVerificationModal(false)}
                className="w-full text-zinc-500 hover:text-white font-medium py-2 transition-all mt-2"
              >
                {isEn ? "Close" : "Închide"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
