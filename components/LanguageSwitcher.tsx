"use client";
import React, { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function LanguageSwitcherInner({ currentLocale }: { currentLocale: "ro" | "en" | "es" }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLanguageChange = (newLocale: "ro" | "en" | "es") => {
    if (newLocale === currentLocale) return;
    localStorage.setItem("preferred_language", newLocale);

    // Elimină prefixul de limbă curent din pathname (/en sau /es)
    let cleanPath = pathname;
    if (cleanPath.startsWith('/en')) {
      cleanPath = cleanPath.slice(3) || '/';
    } else if (cleanPath.startsWith('/es')) {
      cleanPath = cleanPath.slice(3) || '/';
    }

    // Adaugă noul prefix de limbă
    let newPath = cleanPath;
    if (newLocale === 'en') {
      newPath = `/en${cleanPath === '/' ? '' : cleanPath}`;
    } else if (newLocale === 'es') {
      newPath = `/es${cleanPath === '/' ? '' : cleanPath}`;
    }

    // Păstrează search params (ex: ?planId=XYZ sau ?sharedId=XYZ)
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
