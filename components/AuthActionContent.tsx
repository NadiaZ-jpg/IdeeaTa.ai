"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

type Locale = "ro" | "en" | "es";

const COPY: Record<
  Locale,
  {
    verifying: string;
    successTitle: string;
    successBody: string;
    continueBtn: string;
    errorTitle: string;
    errorBody: string;
    loginBtn: string;
    brand: string;
  }
> = {
  ro: {
    verifying: "Se confirmă adresa de email...",
    successTitle: "Adresa de e-mail a fost confirmată",
    successBody: "Acum te poți conecta cu noul tău cont.",
    continueBtn: "Continuă",
    errorTitle: "Link invalid sau expirat",
    errorBody: "Solicită un email nou de confirmare din cont sau din pagina de login.",
    loginBtn: "Mergi la login",
    brand: "IdeeaTa.ai",
  },
  en: {
    verifying: "Verifying your email address...",
    successTitle: "Email address confirmed",
    successBody: "You can now sign in with your new account.",
    continueBtn: "Continue",
    errorTitle: "Invalid or expired link",
    errorBody: "Request a new confirmation email from your account or the login page.",
    loginBtn: "Go to login",
    brand: "IdeeaTa.ai",
  },
  es: {
    verifying: "Confirmando tu correo electrónico...",
    successTitle: "Dirección de correo confirmada",
    successBody: "Ya puedes iniciar sesión con tu nueva cuenta.",
    continueBtn: "Continuar",
    errorTitle: "Enlace inválido o caducado",
    errorBody: "Solicita un nuevo correo de confirmación desde tu cuenta o la página de inicio de sesión.",
    loginBtn: "Ir al login",
    brand: "IdeeaTa.ai",
  },
};

function localeHome(locale: Locale) {
  return locale === "en" ? "/en" : locale === "es" ? "/es" : "/";
}

function localeLogin(locale: Locale) {
  return locale === "en" ? "/en/login" : locale === "es" ? "/es/login" : "/login";
}

function localeDashboard(locale: Locale) {
  return locale === "en" ? "/en/dashboard" : locale === "es" ? "/es/dashboard" : "/dashboard";
}

export default function AuthActionContent({ locale }: { locale: Locale }) {
  const t = COPY[locale] || COPY.ro;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const mode = searchParams.get("mode") || "";
  const oobCode = searchParams.get("oobCode") || "";
  const continueUrl = searchParams.get("continueUrl") || "";

  const continueHref = useMemo(() => {
    if (continueUrl) {
      try {
        const u = new URL(continueUrl);
        if (u.origin.includes("ideeata.ai") || u.hostname === "localhost") {
          return u.pathname + u.search;
        }
      } catch {
        /* ignore */
      }
    }
    return localeDashboard(locale);
  }, [continueUrl, locale]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!oobCode || mode !== "verifyEmail") {
        if (!cancelled) setStatus("error");
        return;
      }
      try {
        await checkActionCode(auth, oobCode);
        await applyActionCode(auth, oobCode);
        if (!cancelled) setStatus("success");
      } catch (e) {
        console.error("[AuthAction]", e);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, oobCode]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      <Link href={localeHome(locale)} className="text-2xl font-black mb-8 relative z-10 hover:text-emerald-400 transition-colors">
        IdeeaTa<span className="text-emerald-400">.ai</span>
      </Link>

      <div className="relative z-10 w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-300 font-medium">{t.verifying}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">{t.successTitle}</h1>
            <p className="text-zinc-400 mb-8">{t.successBody}</p>
            <button
              type="button"
              onClick={() => router.push(continueHref)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all"
            >
              {t.continueBtn}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">{t.errorTitle}</h1>
            <p className="text-zinc-400 mb-8">{t.errorBody}</p>
            <Link
              href={localeLogin(locale)}
              className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-all"
            >
              {t.loginBtn}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
