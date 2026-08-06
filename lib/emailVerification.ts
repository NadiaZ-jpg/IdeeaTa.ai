import type { ActionCodeSettings } from "firebase/auth";

export type AuthLocale = "ro" | "en" | "es";

export function localeDashboardPath(locale: AuthLocale): string {
  if (locale === "en") return "/en/dashboard";
  if (locale === "es") return "/es/dashboard";
  return "/dashboard";
}

/** Continue URL after Firebase client-SDK email verification (fallback path). */
export function verificationActionCodeSettings(
  locale: AuthLocale
): ActionCodeSettings {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://ideeata.ai";
  return {
    url: `${origin}${localeDashboardPath(locale)}`,
    handleCodeInApp: false,
  };
}
