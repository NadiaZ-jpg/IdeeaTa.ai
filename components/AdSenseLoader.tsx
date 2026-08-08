"use client";

import { useEffect } from "react";
import { hasCookieConsent, loadAdSenseScript } from "@/lib/adsenseConsent";

/**
 * Loads AdSense only after cookie consent (Desktop + Mobile, all locales).
 * Keeps meta verification in layout; script is client-gated.
 */
export function AdSenseLoader() {
  useEffect(() => {
    const tryLoad = () => {
      if (hasCookieConsent()) loadAdSenseScript();
    };
    tryLoad();
    window.addEventListener("ideeta-cookie-consent", tryLoad);
    return () => window.removeEventListener("ideeta-cookie-consent", tryLoad);
  }, []);

  return null;
}
