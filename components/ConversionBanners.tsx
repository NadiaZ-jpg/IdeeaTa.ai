"use client";
import React from 'react';
import { UI_STRINGS } from '@/lib/uiStrings';

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
  const ui = UI_STRINGS[locale] || UI_STRINGS.ro;

  if (isSharedView) {
    return (
      <div className="w-full bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-emerald-950/90 border border-emerald-500/30 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(16,185,129,0.05)] backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:border-emerald-500/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10 text-left">
          <span className="text-3xl select-none animate-bounce duration-1000 shrink-0">💡</span>
          <div>
            <h4 className="text-sm font-extrabold text-emerald-300 tracking-wide uppercase">
              {ui.sharedPreviewTitle}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {ui.sharedPreviewDesc}
            </p>
          </div>
        </div>
        <button
          onClick={onResetApp}
          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] cursor-pointer relative z-10 shrink-0"
        >
          {ui.generateFreePlanCta}
        </button>
      </div>
    );
  }

  if (!user && result) {
    return (
      <div className="w-full bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-amber-950/90 border border-amber-500/30 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.05)] backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:border-amber-500/50">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10 text-left">
          <span className="text-3xl select-none animate-pulse shrink-0">⚠️</span>
          <div>
            <h4 className="text-sm font-extrabold text-amber-400 tracking-wide uppercase">
              {ui.planTempStoredTitle}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {ui.planTempStoredDesc}
            </p>
          </div>
        </div>
        <button
          onClick={onAuthClick}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] cursor-pointer relative z-10 shrink-0"
        >
          {ui.savePlanToAccountCta}
        </button>
      </div>
    );
  }

  return null;
};
