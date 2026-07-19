"use client";
import { useState, useEffect } from "react";
import { auth } from '@/lib/firebase';
import { migrateLocalPlansToFirebase } from '@/lib/migrationManager';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function LoginContent({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const router = useRouter();
  const isEn = locale === "en";
  const isEs = locale === "es";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await migrateLocalPlansToFirebase(currentUser);
        router.push(isEn ? '/en/dashboard' : isEs ? '/es/dashboard' : '/dashboard');
      } else {
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, isEn, isEs]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setAuthError(null);
    try {
      const authProvider = provider === 'google'
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();
      await signInWithPopup(auth, authProvider);
      // onAuthStateChanged redirectează automat la /dashboard
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      if (error.code === 'auth/account-exists-with-different-credential') {
        setAuthError(
          isEn 
            ? "An account already exists with this email. Try logging in with a different method."
            : isEs
            ? "Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión con un método diferente."
            : "Există deja un cont cu acest email. Încearcă cu altă metodă de login."
        );
      } else {
        setAuthError(
          isEn 
            ? "Authentication error. Please try again." 
            : isEs
            ? "Error de autenticación. Por favor, inténtalo de nuevo."
            : "Eroare la autentificare. Încearcă din nou."
        );
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError(
        isEn 
          ? "Enter your email address to receive the reset link." 
          : isEs
          ? "Introduce tu dirección de correo electrónico para recibir el enlace de restablecimiento."
          : "Introdu adresa de email pentru a primi link-ul de resetare."
      );
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
        setAuthError(
          isEn 
            ? "There is no account with this email address." 
            : isEs
            ? "No existe ninguna cuenta con esta dirección de correo electrónico."
            : "Nu există niciun cont cu această adresă de email."
        );
      } else {
        setAuthError(error.message || (isEn ? "An error occurred. Please try again." : isEs ? "Ocurrió un error. Por favor, inténtalo de nuevo." : "A apărut o eroare. Încearcă din nou."));
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        // onAuthStateChanged va redirectiona automat la /dashboard
      }
      // Daca are succes, onAuthStateChanged va redirectiona automat
    } catch (error: any) {
      console.error("Eroare email auth:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setAuthError(isEn ? "Incorrect email or password." : isEs ? "Correo electrónico o contraseña incorrectos." : "Email sau parolă incorectă.");
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError(isEn ? "An account already exists with this email. Please log in." : isEs ? "Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión." : "Există deja un cont cu acest email. Te rugăm să te loghezi.");
      } else if (error.code === 'auth/weak-password') {
        setAuthError(isEn ? "Password must be at least 6 characters long." : isEs ? "La contraseña debe tener al menos 6 caracteres." : "Parola trebuie să aibă cel puțin 6 caractere.");
      } else {
        setAuthError(error.message || (isEn ? "An unknown authentication error occurred." : isEs ? "Ocurrió un error de autenticación desconocido." : "A apărut o eroare necunoscută la autentificare."));
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
        
        {/* Logo */}
        <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-center mb-2 tracking-tighter">IdeeaTa.ai</h1>
        <p className="text-zinc-400 text-center mb-8 font-medium text-sm">
          {isLoginMode && !isForgotMode && (isEn ? "Welcome back! Log in to your account." : isEs ? "¡Bienvenido de nuevo! Inicia sesión en tu cuenta." : "Bine ai revenit! Intră în contul tău.")}
          {!isLoginMode && (isEn ? "Create your free account in a few seconds." : isEs ? "Crea tu cuenta gratuita en unos pocos segundos." : "Creează-ți contul gratuit în câteva secunde.")}
          {isForgotMode && (isEn ? "We will send you a password reset link." : isEs ? "Te enviaremos un enlace para restablecer tu contraseña." : "Îți trimitem un link de resetare a parolei.")}
        </p>

        {/* ── Social Login Buttons ── */}
        {!isForgotMode && (
          <div className="w-full flex flex-col gap-3 mb-6">
            <button
              type="button"
              id="btn-google-login"
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isEn ? "Continue with Google" : isEs ? "Continuar con Google" : "Continuă cu Google"}
            </button>

            <button
              type="button"
              id="btn-facebook-login"
              onClick={() => handleSocialLogin('facebook')}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#1877F2] hover:bg-[#1565D8] text-white font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {isEn ? "Continue with Facebook" : isEs ? "Continuar con Facebook" : "Continuă cu Facebook"}
            </button>
          </div>
        )}

        {/* ── Separator ── */}
        {!isForgotMode && (
          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-zinc-600 text-xs font-medium tracking-widest uppercase">{isEn ? "or" : isEs ? "o" : "sau"}</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>
        )}

        {/* ── Formular Email + Parolă ── */}
        <form onSubmit={handleEmailAuth} className="w-full mb-4 space-y-4">
          <div>
            <input 
              id="email"
              name="email"
              type="email" 
              placeholder={isEn ? "Email address" : isEs ? "Dirección de correo electrónico" : "Adresa de email"}
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
                placeholder={isEn ? "Password" : isEs ? "Contraseña" : "Parola"}
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
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isEmailLoading 
              ? (isEn ? "Processing..." : isEs ? "Procesando..." : "Se procesează...") 
              : isForgotMode 
                ? (isEn ? "Send reset link" : isEs ? "Enviar enlace" : "Trimite link de resetare") 
                : (isLoginMode ? (isEn ? "Log In" : isEs ? "Iniciar sesión" : "Intră în cont") : (isEn ? "Create Account" : isEs ? "Crear cuenta" : "Creează cont nou"))}
          </button>

          {resetEmailSent && (
            <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 text-sm font-medium text-center">
                {isEn ? "✅ Reset link has been sent! Check your email." : isEs ? "✅ ¡El enlace de restablecimiento ha sido enviado! Revisa tu correo." : "✅ Link-ul de resetare a fost trimis! Verifică-ți emailul."}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mt-2 text-sm">
            {isLoginMode && !isForgotMode && (
              <button 
                type="button" 
                onClick={() => { setIsForgotMode(true); setAuthError(null); setResetEmailSent(false); }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {isEn ? "Forgot password?" : isEs ? "¿Olvidaste tu contraseña?" : "Ai uitat parola?"}
              </button>
            )}
            {isForgotMode && (
              <button 
                type="button" 
                onClick={() => { setIsForgotMode(false); setAuthError(null); setResetEmailSent(false); }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {isEn ? "← Back to login" : isEs ? "← Volver al inicio de sesión" : "← Înapoi la login"}
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
                className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors ml-auto cursor-pointer"
              >
                {isLoginMode 
                  ? (isEn ? "Don't have an account? Sign up" : isEs ? "¿No tienes una cuenta? Regístrate" : "Nu ai cont? Creează unul nou") 
                  : (isEn ? "Already have an account? Log in" : isEs ? "¿Ya tienes una cuenta? Inicia sesión" : "Ai deja cont? Intră aici")}
              </button>
            )}
          </div>
        </form>
        
        {authError && (
          <div className="mt-2 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-medium text-center break-words">{authError}</p>
          </div>
        )}

        {/* ── QR Code — Demo pe mobil ── */}
        <div className="w-full mt-8 pt-8 border-t border-zinc-800 flex items-center gap-5">
          <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
            <QRCodeSVG
              value="https://ideeata.ai/demo?start=nou"
              size={88}
              bgColor="#ffffff"
              fgColor="#09090b"
              level="M"
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1.5">
              {isEn ? "Test on phone 📱" : isEs ? "Probar en el teléfono 📱" : "Testează pe telefon 📱"}
            </p>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {isEn 
                ? "Scan the QR code and generate your first business plan directly from your mobile."
                : isEs
                ? "Escanea el código QR y genera tu primer plan de negocios directamente desde tu móvil."
                : "Scanează codul QR și generează primul tău plan de afaceri direct de pe mobil."}
            </p>
            <span className="text-emerald-400 text-xs font-semibold mt-2 block">
              → ideeata.ai/demo
            </span>
          </div>
        </div>
      </div>

      {/* Landing/Descriptive Page Section for AdSense Compliance */}
      <div className="w-full max-w-4xl mt-4 mb-20 px-8 py-16 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl relative z-10 flex flex-col gap-10 text-zinc-300 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            {isEn ? "Intelligent Business Plan Generation" : isEs ? "Generación Inteligente de Planes de Negocios" : "Generare Inteligentă de Planuri de Afaceri"}
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            {isEn 
              ? "IdeeaTa.ai offers entrepreneurs a complete suite of tools to write, structure and edit business plans, adapted for financing, bank loans or European funds."
              : isEs
              ? "IdeeaTa.ai ofrece a los emprendedores una suite completa de herramientas para escribir, estructurar y editar planes de negocios, adaptados para financiación, préstamos bancarios o fondos europeos."
              : "IdeeaTa.ai oferă antreprenorilor români o suită completă de instrumente pentru scrierea, structurarea și editarea planurilor de afaceri, adaptate pentru finanțări, credite bancare sau fonduri europene."}
          </p>
        </div>
      </div>
    </div>
  );
}
