"use client";
import { useState, useEffect } from "react";
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Redirectioneaza catre studio daca utilizatorul este deja logat
        router.push('/studio');
      } else {
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleForgotPassword = async () => {
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
      console.error("Eroare resetare parola:", error);
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
    setIsEmailLoading(true);
    setAuthError(null);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Daca are succes, onAuthStateChanged va redirectiona automat
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
      setIsEmailLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center p-4 font-sans relative overflow-y-auto overflow-x-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse duration-[8000ms] z-0"></div>
      <div className="absolute top-[35%] right-[-15%] w-[650px] h-[650px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none animate-pulse duration-[12000ms] z-0"></div>
      
      <div className="w-full max-w-md p-8 md:p-12 bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-800 shadow-2xl relative z-10 flex flex-col items-center my-12 shrink-0">
        <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-center mb-4 tracking-tighter">IdeeaTa.ai</h1>
        <p className="text-zinc-400 text-center mb-10 font-medium">Platforma necesită autentificare pentru a continua.</p>
        
        <form onSubmit={handleEmailAuth} className="w-full mb-6 space-y-4">
          <div>
            <input 
              id="email"
              name="email"
              type="email" 
              placeholder="Adresa de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          {!isForgotMode && (
            <div>
              <input 
                id="password"
                name="password"
                type="password" 
                placeholder="Parola"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          )}
          <button 
            type={isForgotMode ? "button" : "submit"}
            onClick={isForgotMode ? handleForgotPassword : undefined}
            disabled={isEmailLoading}
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {isEmailLoading 
              ? "Se procesează..." 
              : isForgotMode 
                ? "Trimite link de resetare" 
                : (isLoginMode ? "Intră în cont" : "Creează cont nou")}
          </button>

          {resetEmailSent && (
            <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 text-sm font-medium text-center">
                ✅ Link-ul de resetare a fost trimis! Verifică-ți emailul.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mt-2 text-sm">
            {isLoginMode && !isForgotMode && (
              <button 
                type="button" 
                onClick={() => { setIsForgotMode(true); setAuthError(null); setResetEmailSent(false); }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Ai uitat parola?
              </button>
            )}
            {isForgotMode && (
              <button 
                type="button" 
                onClick={() => { setIsForgotMode(false); setAuthError(null); setResetEmailSent(false); }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Înapoi la login
              </button>
            )}
            {!isForgotMode && (
              <button 
                type="button" 
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setEmail("");
                  setPassword("");
                  setAuthError(null);
                }}
                className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors ml-auto"
              >
                {isLoginMode ? "Nu ai cont? Creează unul nou" : "Ai deja cont? Intră aici"}
              </button>
            )}
          </div>
        </form>
        
        {authError && (
          <div className="mt-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-medium text-center break-words">{authError}</p>
          </div>
        )}
      </div>

      {/* Landing/Descriptive Page Section for AdSense Compliance */}
      <div className="w-full max-w-4xl mt-12 mb-20 px-8 py-16 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl relative z-10 flex flex-col gap-10 text-zinc-300 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-4">Generare Inteligentă de Planuri de Afaceri</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            IdeeaTa.ai oferă antreprenorilor români o suită completă de instrumente pentru scrierea, structurarea și editarea planurilor de afaceri, adaptate pentru finanțări, credite bancare sau fonduri europene.
          </p>
        </div>
      </div>
    </div>
  );
}
