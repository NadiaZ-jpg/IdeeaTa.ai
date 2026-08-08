"use client";

import { RefObject } from "react";
import Link from "next/link";
import { UI_STRINGS } from "@/lib/uiStrings";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * Studio Mobile/Tablet — generate a new plan (parity with Desktop Studio / Demo Mobile).
 */
export function StudioMobileGenerateHint({
  locale = "ro",
  skill,
  setSkill,
  loading,
  loadingMessage,
  onGenerate,
  onInspire,
  inputRef,
}: {
  locale?: "ro" | "en" | "es";
  skill: string;
  setSkill: (v: string) => void;
  loading: boolean;
  loadingMessage: string;
  onGenerate: () => void;
  onInspire: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const ui = UI_STRINGS[locale];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2 max-w-xs">
          <h3 className="font-bold text-lg text-emerald-400">
            {locale === "en"
              ? "Assistant is working"
              : locale === "es"
              ? "El asistente está trabajando"
              : "Asistentul lucrează"}
          </h3>
          <p className="text-sm text-zinc-400 animate-pulse">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-x-hidden flex flex-col pb-16">
      <header className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30">
        <Link
          href={ui.routes.dashboard}
          className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 min-h-[44px] min-w-[44px]"
        >
          <span>←</span>
          <span>{locale === "en" ? "Dashboard" : locale === "es" ? "Panel" : "Dashboard"}</span>
        </Link>
        <span className="text-sm font-black">{ui.studioMobileBadge}</span>
        <LanguageSwitcher currentLocale={locale} />
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6 max-w-lg mx-auto w-full">
        <div className="text-center space-y-2 mt-4">
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {ui.studioMobileBadge}
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-2">{ui.studioMobileTitle}</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">{ui.studioGenerateDesktopHint}</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">
              {locale === "en"
                ? "Business idea"
                : locale === "es"
                ? "Idea de negocio"
                : "Ideea de afacere"}
            </label>
            <textarea
              ref={inputRef}
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder={ui.inputPlaceholder || ui.animatedPlaceholder}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 h-28 outline-none resize-none transition-all min-h-[112px]"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onInspire}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 text-zinc-300 font-bold text-sm px-4 py-3 rounded-xl transition-all hover:bg-zinc-800/50 hover:text-emerald-400 border border-zinc-800"
            >
              {ui.inspireMeSparkles}
            </button>

            <button
              type="button"
              onClick={onGenerate}
              disabled={!skill.trim()}
              className="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{ui.generatePlan}</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <Link
          href={ui.routes.demoNew}
          className="text-center text-xs text-zinc-500 hover:text-emerald-400 font-semibold min-h-[44px] inline-flex items-center justify-center"
        >
          {ui.studioTryDemoMobile}
        </Link>
      </main>
    </div>
  );
}
