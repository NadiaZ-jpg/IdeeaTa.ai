"use client";
import React, { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { switchLocalePath, type AppLocale } from '@/lib/localePaths';

function LanguageSwitcherInner({ currentLocale, touch = false }: { currentLocale: AppLocale; touch?: boolean }) {
  // `touch`: ținte de atingere 44px înălțime (Mobile); implicit rămâne compact pe Desktop
  const touchCls = touch ? ' min-w-[36px] min-h-[44px] inline-flex items-center justify-center' : '';
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
    <div className={`flex items-center gap-1.5 text-xs font-bold text-zinc-500 bg-zinc-950/40 border border-zinc-800/60 rounded-xl relative z-50 ${touch ? 'px-1 py-0' : 'px-2.5 py-1.5'}`}>
      <button 
        type="button"
        onClick={() => handleLanguageChange("ro")} 
        aria-current={currentLocale === 'ro' ? 'true' : undefined}
        className={`hover:text-white transition-colors uppercase${touchCls} ${currentLocale === 'ro' ? 'text-emerald-400 font-black font-sans' : 'font-sans'}`}
      >
        RO
      </button>
      <span className="text-zinc-800">|</span>
      <button 
        type="button"
        onClick={() => handleLanguageChange("en")} 
        aria-current={currentLocale === 'en' ? 'true' : undefined}
        className={`hover:text-white transition-colors uppercase${touchCls} ${currentLocale === 'en' ? 'text-emerald-400 font-black font-sans' : 'font-sans'}`}
      >
        EN
      </button>
      <span className="text-zinc-800">|</span>
      <button 
        type="button"
        onClick={() => handleLanguageChange("es")} 
        aria-current={currentLocale === 'es' ? 'true' : undefined}
        className={`hover:text-white transition-colors uppercase${touchCls} ${currentLocale === 'es' ? 'text-emerald-400 font-black font-sans' : 'font-sans'}`}
      >
        ES
      </button>
    </div>
  );
}

export function LanguageSwitcher({ currentLocale, touch = false }: { currentLocale: "ro" | "en" | "es"; touch?: boolean }) {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-950/40 border border-zinc-800/60 px-2.5 py-1.5 rounded-xl">
        <span className="font-sans">...</span>
      </div>
    }>
      <LanguageSwitcherInner currentLocale={currentLocale} touch={touch} />
    </Suspense>
  );
}
