/**
 * AdSense load gated by cookie consent (EU-friendly).
 * Publisher: ca-pub-5089980515174940
 */

export const ADSENSE_CLIENT = "ca-pub-5089980515174940";
export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
export const COOKIE_CONSENT_KEY = "cookie_consent";

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

/** Inject AdSense script once after consent. Safe to call repeatedly. */
export function loadAdSenseScript(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (!hasCookieConsent()) return false;

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
