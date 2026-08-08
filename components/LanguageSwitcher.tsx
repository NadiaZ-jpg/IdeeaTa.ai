"use client";
import React, { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { switchLocalePath, type AppLocale } from '@/lib/localePaths';

function LanguageSwitcherInner({ currentLocale }: { currentLocale: AppLocale }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLanguageChange = (newLocale: AppLocale) => {
    if (newLocale === currentLocale) return;
    localStorage.setItem("preferred_language", newLocale);

    const newPath = switchLocalePath(pathname || "/", currentLocale, newLocale);
    const paramsStr = searchParams.toString();
    const finalUrl = newPath + (paramsStr ? `?${paramsStr}` : '');
    
    router.push(finalUrl);
  };

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 bg-zinc-950/40 border border-zinc-800/60 px-2.5 py-1.5 rounded-xl relative z-50">
      <button 
        onClick={() => handleLanguageChange("ro")} 
        className={`hover:text-white transition-colors uppercase ${currentLocale === 'ro' ? 'text-emerald-400 font-black font-sans' : 'font-sans'}`}
      >
        RO
      </button>
      <span className="text-zinc-800">|</span>
      <button 
        onClick={() => handleLanguageChange("en")} 
        className={`hover:text-white transition-colors uppercase ${currentLocale === 'en' ? 'text-emerald-400 font-black font-sans' : 'font-sans'}`}
      >
        EN
      </button>
      <span className="text-zinc-800">|</span>
      <button 
        onClick={() => handleLanguageChange("es")} 
        className={`hover:text-white transition-colors uppercase ${currentLocale === 'es' ? 'text-emerald-400 font-black font-sans' : 'font-sans'}`}
      >
        ES
      </button>
    </div>
  );
}

export function LanguageSwitcher({ currentLocale }: { currentLocale: "ro" | "en" | "es" }) {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-950/40 border border-zinc-800/60 px-2.5 py-1.5 rounded-xl">
        <span className="font-sans">...</span>
      </div>
    }>
      <LanguageSwitcherInner currentLocale={currentLocale} />
    </Suspense>
  );
}
