"use client";
import React from 'react';

interface ConversionBannersProps {
  isSharedView: boolean;
  user: any;
  result: any;
  onResetApp: () => void;
  onAuthClick: () => void;
  locale?: "ro" | "en" | "es";
}

export const ConversionBanners: React.FC<ConversionBannersProps> = ({
  isSharedView,
  user,
  result,
  onResetApp,
  onAuthClick,
  locale = "ro",
}) => {
  // Banner 1: Planuri partajate (/shared -> /demo?sharedId=...)
  if (isSharedView) {
    return (
      <div className="w-full bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-emerald-950/90 border border-emerald-500/30 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(16,185,129,0.05)] backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:border-emerald-500/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10 text-left">
          <span className="text-3xl select-none animate-bounce duration-1000 shrink-0">💡</span>
          <div>
            <h4 className="text-sm font-extrabold text-emerald-300 tracking-wide uppercase">
              {locale === "en" ? "You are previewing a shared business plan" : locale === "es" ? "Estás previsualizando un plan de negocios compartido" : "Previzualizezi un plan de afaceri partajat"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {locale === "en" 
                ? "Want to generate your own plan completely free, customized in detail by assistant for your business idea?" 
                : locale === "es"
                ? "¿Quieres generar tu propio plan de forma completamente gratuita, personalizado en detalle por el asistente para tu idea de negocio?"
                : "Vrei să generezi propriul tău plan complet gratuit, personalizat în detaliu de asistent pentru ideea ta de afacere?"}
            </p>
          </div>
        </div>
        <button
          onClick={onResetApp}
          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] cursor-pointer relative z-10 shrink-0"
        >
          {locale === "en" ? "Generate Free Plan" : locale === "es" ? "Generar Plan Gratis" : "Generează Plan Gratuit"}
        </button>
      </div>
    );
  }

  // Banner 2: Avertizare/Salvare plan pentru utilizatori nelogați
  if (!user && result) {
    return (
      <div className="w-full bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-amber-950/90 border border-amber-500/30 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.05)] backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:border-amber-500/50">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10 text-left">
          <span className="text-3xl select-none animate-pulse shrink-0">⚠️</span>
          <div>
            <h4 className="text-sm font-extrabold text-amber-400 tracking-wide uppercase">
              {locale === "en" ? "Your plan is only stored temporarily" : locale === "es" ? "Tu plan solo se almacena temporalmente" : "Planul tău este stocat doar temporar"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {locale === "en" 
                ? "To avoid losing this plan when closing the browser, create a free account now and save it permanently." 
                : locale === "es"
                ? "Para evitar perder este plan al cerrar el navegador, crea una cuenta gratuita ahora y guárdalo permanentemente."
                : "Pentru a nu pierde acest plan la închiderea browser-ului, creează un cont gratuit acum și salvează-l permanent."}
            </p>
          </div>
        </div>
        <button
          onClick={onAuthClick}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] cursor-pointer relative z-10 shrink-0"
        >
          {locale === "en" ? "Save Plan to Account" : locale === "es" ? "Guardar Plan en la Cuenta" : "Salvează Planul în Cont"}
        </button>
      </div>
    );
  }

  return null;
};
