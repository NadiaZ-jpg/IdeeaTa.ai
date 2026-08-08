"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
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
    resetTitle: string;
    resetBody: string;
    resetSubmit: string;
    resetSuccessTitle: string;
    resetSuccessBody: string;
    newPassword: string;
    confirmPassword: string;
    mismatch: string;
    weak: string;
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
    resetTitle: "Setează o parolă nouă",
    resetBody: "Alege o parolă de cel puțin 6 caractere.",
    resetSubmit: "Salvează parola",
    resetSuccessTitle: "Parola a fost actualizată",
    resetSuccessBody: "Te poți conecta cu noua parolă.",
    newPassword: "Parolă nouă",
    confirmPassword: "Confirmă parola",
    mismatch: "Parolele nu coincid.",
    weak: "Parola trebuie să aibă cel puțin 6 caractere.",
  },
  en: {
    verifying: "Verifying your email address...",
    successTitle: "Email address confirmed",
    successBody: "You can now sign in with your new account.",
    continueBtn: "Continue",
    errorTitle: "Invalid or expired link",
    errorBody: "Request a new confirmation email from your account or the login page.",
    loginBtn: "Go to login",
    resetTitle: "Set a new password",
    resetBody: "Choose a password with at least 6 characters.",
    resetSubmit: "Save password",
    resetSuccessTitle: "Password updated",
    resetSuccessBody: "You can sign in with your new password.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    mismatch: "Passwords do not match.",
    weak: "Password must be at least 6 characters.",
  },
  es: {
    verifying: "Confirmando tu correo electrónico...",
    successTitle: "Dirección de correo confirmada",
    successBody: "Ya puedes iniciar sesión con tu nueva cuenta.",
    continueBtn: "Continuar",
    errorTitle: "Enlace inválido o caducado",
    errorBody: "Solicita un nuevo correo de confirmación desde tu cuenta o la página de inicio de sesión.",
    loginBtn: "Ir al login",
    resetTitle: "Establece una nueva contraseña",
    resetBody: "Elige una contraseña de al menos 6 caracteres.",
    resetSubmit: "Guardar contraseña",
    resetSuccessTitle: "Contraseña actualizada",
    resetSuccessBody: "Puedes iniciar sesión con tu nueva contraseña.",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    mismatch: "Las contraseñas no coinciden.",
    weak: "La contraseña debe tener al menos 6 caracteres.",
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
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resetForm">("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    return mode === "resetPassword" ? localeLogin(locale) : localeDashboard(locale);
  }, [continueUrl, locale, mode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!oobCode) {
        if (!cancelled) setStatus("error");
        return;
      }
      if (mode === "verifyEmail") {
        try {
          await checkActionCode(auth, oobCode);
          await applyActionCode(auth, oobCode);
          if (!cancelled) setStatus("success");
        } catch (e) {
          console.error("[AuthAction] verifyEmail", e);
          if (!cancelled) setStatus("error");
        }
        return;
      }
      if (mode === "resetPassword") {
        try {
          await verifyPasswordResetCode(auth, oobCode);
          if (!cancelled) setStatus("resetForm");
        } catch (e) {
          console.error("[AuthAction] resetPassword", e);
          if (!cancelled) setStatus("error");
        }
        return;
      }
      if (!cancelled) setStatus("error");
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, oobCode]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (password.length < 6) {
      setFormError(t.weak);
      return;
    }
    if (password !== confirm) {
      setFormError(t.mismatch);
      return;
    }
    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
    } catch (err) {
      console.error("[AuthAction] confirmPasswordReset", err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const successTitle =
    mode === "resetPassword" ? t.resetSuccessTitle : t.successTitle;
  const successBody =
    mode === "resetPassword" ? t.resetSuccessBody : t.successBody;

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

        {status === "resetForm" && (
          <>
            <h1 className="text-2xl font-black mb-2">{t.resetTitle}</h1>
            <p className="text-zinc-400 mb-6">{t.resetBody}</p>
            <form onSubmit={handleResetSubmit} className="text-left space-y-4">
              <div>
                <label className="text-xs text-zinc-500 font-semibold">{t.newPassword}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-semibold">{t.confirmPassword}</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                  autoComplete="new-password"
                />
              </div>
              {formError && <p className="text-red-400 text-sm">{formError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
              >
                {submitting ? "…" : t.resetSubmit}
              </button>
            </form>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">{successTitle}</h1>
            <p className="text-zinc-400 mb-8">{successBody}</p>
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
