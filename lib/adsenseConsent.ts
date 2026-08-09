/**
 * AdSense load gated by cookie consent (EU-friendly).
 * Publisher: ca-pub-5089980515174940
 *
 * Script is allowed ONLY on Landing + Resurse (publisher content pages).
 * Never on Demo / Studio / login / dashboard / legal (AdSense "screens without publisher-content").
 */

export const ADSENSE_CLIENT = "ca-pub-5089980515174940";
export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
export const COOKIE_CONSENT_KEY = "cookie_consent";

/** Normalize path: strip trailing slash except root. */
function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Landing + Resources hub/articles (RO/EN/ES).
 * Demo, Studio, login, dashboard, legal, auth → false.
 */
export function isAdSenseContentPath(pathname?: string | null): boolean {
  const raw =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "") ??
    "";
  const path = normalizePath(raw);

  if (path === "/" || path === "/en" || path === "/es") return true;
  if (path === "/resurse" || path.startsWith("/resurse/")) return true;
  if (path === "/en/resources" || path.startsWith("/en/resources/")) return true;
  if (path === "/es/recursos" || path.startsWith("/es/recursos/")) return true;
  return false;
}

export function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "true";
  } catch {
    return false;
  }
}

export function setCookieConsentAccepted(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  } catch {
    /* ignore */
  }
  if (typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("ideeta-cookie-consent"));
  }
}

/**
 * Inject AdSense script once after consent, only on content paths.
 * Safe to call repeatedly; no-ops on tool/auth pages.
 */
export function loadAdSenseScript(pathname?: string | null): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (!hasCookieConsent()) return false;
  if (!isAdSenseContentPath(pathname)) return false;

  const existing = document.querySelector(`script[src*="adsbygoogle.js"]`);
  if (existing) return true;

  const script = document.createElement("script");
  script.async = true;
  script.src = ADSENSE_SCRIPT_SRC;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
  return true;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}


declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
