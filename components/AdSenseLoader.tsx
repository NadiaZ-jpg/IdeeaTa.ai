"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  hasCookieConsent,
  isAdSenseContentPath,
  loadAdSenseScript,
} from "@/lib/adsenseConsent";

/**
 * Loads AdSense only after cookie consent AND only on Landing + Resurse.
 * Demo / Studio / login / dashboard never get the script (policy: no ads on tool screens).
 */
export function AdSenseLoader() {
  const pathname = usePathname();

  useEffect(() => {
    const tryLoad = () => {
      if (!hasCookieConsent()) return;
      if (!isAdSenseContentPath(pathname)) return;
      loadAdSenseScript(pathname);
    };
    tryLoad();
    window.addEventListener("ideeta-cookie-consent", tryLoad);
    return () => window.removeEventListener("ideeta-cookie-consent", tryLoad);
  }, [pathname]);

  return null;
}
