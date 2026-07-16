"use client";
import React from 'react';

interface ConversionBannersProps {
  isSharedView: boolean;
  user: any;
  result: any;
  onResetApp: () => void;
  onAuthClick: () => void;
}

export const ConversionBanners: React.FC<ConversionBannersProps> = ({
  isSharedView,
  user,
  result,
  onResetApp,
  onAuthClick,
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
              Previzualizezi un plan de afaceri partajat
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Vrei să generezi propriul tău plan complet gratuit, personalizat în detaliu de AI pentru ideea ta de afacere?
            </p>
          </div>
        </div>
        <button
          onClick={onResetApp}
          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] cursor-pointer relative z-10 shrink-0"
        >
          Generează Plan Gratuit
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
              Planul tău este stocat doar temporar
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Pentru a nu pierde acest plan la închiderea browser-ului, creează un cont gratuit acum și salvează-l permanent.
            </p>
          </div>
        </div>
        <button
          onClick={onAuthClick}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] cursor-pointer relative z-10 shrink-0"
        >
          Salvează Planul în Cont
        </button>
      </div>
    );
  }

  return null;
};
