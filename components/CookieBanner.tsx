"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hasCookieConsent, loadAdSenseScript, setCookieConsentAccepted } from '@/lib/adsenseConsent';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const isEn = pathname?.startsWith('/en');
  const isEs = pathname?.startsWith('/es');

  useEffect(() => {
    if (!hasCookieConsent()) {
      setIsVisible(true);
    } else {
      loadAdSenseScript();
    }
  }, []);

  const acceptCookies = () => {
    setCookieConsentAccepted();
    loadAdSenseScript();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 md:p-6 z-[9999] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1 text-zinc-300 text-sm">
        <p>
          {isEn ? (
            <>
              We use cookies to provide you with an optimal experience on the platform, including for authentication, processing payments and displaying relevant content. By continuing to browse, you agree to our{" "}
              <Link href="/en/cookies" className="text-emerald-400 hover:underline">
                Cookie Policy
              </Link>
              .
            </>
          ) : isEs ? (
            <>
              Utilizamos cookies para ofrecerle una experiencia óptima en la plataforma, incluyendo la autenticación, el procesamiento de pagos y la visualización de contenido relevante. Al continuar navegando, acepta nuestra{" "}
              <Link href="/es/cookies" className="text-emerald-400 hover:underline">
                Política de Cookies
              </Link>
              .
            </>
          ) : (
            <>
              Utilizăm cookie-uri pentru a vă oferi o experiență optimă pe platformă, inclusiv pentru autentificare, procesarea plăților și afișarea de conținut relevant. 
              Continuând să navigați, sunteți de acord cu{" "}
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
          onClick={acceptCookies}
          className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
        >
          {isEn ? "I agree" : isEs ? "Estoy de acuerdo" : "Sunt de acord"}
        </button>
      </div>
    </div>
  );
}
