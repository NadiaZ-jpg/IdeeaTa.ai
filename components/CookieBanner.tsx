"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hasCookieConsent, setCookieConsentAccepted } from '@/lib/adsenseConsent';

const COOKIE_DECLINED_KEY = "cookie_consent_declined";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const isEn = pathname?.startsWith('/en');
  const isEs = pathname?.startsWith('/es');

  useEffect(() => {
    // Consent only — AdSense script loads via AdSenseLoader / AdBanner on content pages.
    if (hasCookieConsent()) return;
    try {
      if (localStorage.getItem(COOKIE_DECLINED_KEY) === "true") return;
    } catch {
      /* ignore */
    }
    setIsVisible(true);
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.removeItem(COOKIE_DECLINED_KEY);
    } catch {
      /* ignore */
    }
    setCookieConsentAccepted();
    setIsVisible(false);
  };

  const declineCookies = () => {
    try {
      localStorage.setItem(COOKIE_DECLINED_KEY, "true");
    } catch {
      /* ignore */
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 md:p-6 z-[9999] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1 text-zinc-300 text-sm">
        <p>
          {isEn ? (
            <>
              We use essential cookies for authentication and payments. Advertising cookies (AdSense) are loaded only if you accept. See our{" "}
              <Link href="/en/cookies" className="text-emerald-400 hover:underline">
                Cookie Policy
              </Link>
              .
            </>
          ) : isEs ? (
            <>
              Usamos cookies esenciales para autenticación y pagos. Las cookies publicitarias (AdSense) se cargan solo si aceptas. Consulta nuestra{" "}
              <Link href="/es/cookies" className="text-emerald-400 hover:underline">
                Política de Cookies
              </Link>
              .
            </>
          ) : (
            <>
              Folosim cookie-uri esențiale pentru autentificare și plăți. Cookie-urile publicitare (AdSense) se încarcă doar dacă accepți. Vezi{" "}
              <Link href="/cookies" className="text-emerald-400 hover:underline">
                Politica de Cookie-uri
              </Link>
              .
            </>
          )}
        </p>
      </div>
      <div className="flex gap-3 shrink-0 w-full md:w-auto">
        <button
          type="button"
          onClick={declineCookies}
          className="w-full md:w-auto px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-all"
        >
          {isEn ? "Essential only" : isEs ? "Solo esenciales" : "Doar esențiale"}
        </button>
        <button
          type="button"
          onClick={acceptCookies}
          className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
        >
          {isEn ? "Accept" : isEs ? "Aceptar" : "Acceptă"}
        </button>
      </div>
    </div>
  );
}
