import type { AppLocale } from "@/lib/pdfCtaBehavior";

/** Firebase ActionCodeSettings continue URL for password reset / verify (locale-aware). */
export function authActionContinueUrl(locale: AppLocale | "ro" | "en" | "es"): string {
  if (typeof window === "undefined") {
    const prefix = locale === "en" ? "/en" : locale === "es" ? "/es" : "";
    return `https://ideeata.ai${prefix}/auth/action`;
  }
  const prefix = locale === "en" ? "/en" : locale === "es" ? "/es" : "";
  return `${window.location.origin}${prefix}/auth/action`;
}

export function passwordResetActionCodeSettings(locale: AppLocale | "ro" | "en" | "es") {
  return {
    url: authActionContinueUrl(locale),
    handleCodeInApp: false,
  };
}
