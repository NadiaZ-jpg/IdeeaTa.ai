"use client";
/**
 * ActionBar — Reset / Edit / Currency / Download.
 * - Labels from UI_STRINGS[locale] (nu fallback RO pe EN/ES).
 * - Shared view guest (din PDF, nelogat): doar download localizat — fără Altă idee / Studio / LEI.
 * - Cont logat: mereu Altă idee + Studio, chiar dacă a deschis un link shared.
 */

import React from "react";
import { UI_STRINGS } from "@/lib/uiStrings";

type Locale = "ro" | "en" | "es";

interface ActionBarProps {
  mode: "demo" | "studio";
  locale: Locale | string;
  ui?: any;
  onReset: () => void;
  onStartEditing: () => void;
  onDownloadAction: (type: "pdf-summary" | "pdf" | "pptx" | "word") => void;
  onShowPricingModal: () => void;
  onShowExportModal?: () => void;
  /** Desktop D1: create/copy share link (parent opens auth if guest). */
  onShare?: () => void;
  shareBusy?: boolean;
  currency: string;
  setCurrency: (c: string) => void;
  isDownloading: string | null;
  isPlanPaid: boolean;
  isEditing?: boolean;
  showCurrencyToggle?: boolean;
  /** Plan deschis din PDF /shared — ascunde edit/reset/LEI doar pentru vizitatori nelogați */
  isSharedView?: boolean;
  /** Dacă e setat, shared preview nu mai blochează Altă idee / Studio */
  user?: { uid?: string } | null;
}

function normalizeLocale(locale: string): Locale {
  return locale === "en" || locale === "es" ? locale : "ro";
}

function stripLeadingEmoji(s: string): string {
  return String(s || "")
    .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\uFE0F?\s*/u, "")
    .trim();
}

export function ActionBar({
  mode,
  locale = "ro",
  ui: uiProp,
  onReset,
  onStartEditing,
  onDownloadAction,
  onShowPricingModal,
  onShowExportModal,
  onShare,
  shareBusy = false,
  currency,
  setCurrency,
  isDownloading,
  isPlanPaid,
  isEditing = false,
  showCurrencyToggle = true,
  isSharedView = false,
  user = null,
}: ActionBarProps) {
  const loc = normalizeLocale(String(locale));
  // Sursă unică pe locale — nu depinde de ui greșit din parent
  const ui = UI_STRINGS[loc] || uiProp || UI_STRINGS.ro;

  const editLabel = `🪄 ${stripLeadingEmoji(ui.editingStudio)}`;
  const resetLabel = `💡 ${stripLeadingEmoji(ui.anotherIdea)}`;
  const shareLabel = `🔗 ${stripLeadingEmoji(ui.shareBtn)}`;
  // Guest shared preview only — logged-in users always keep Otra idea / Another idea / Altă idee
  const guestSharedPreview = !!(isSharedView && !user);
  const allowCurrency = showCurrencyToggle && !guestSharedPreview && loc === "ro";
  const showShare = typeof onShare === "function" && !guestSharedPreview;

  const downloadBlock = (
    <div className="relative group w-full md:w-auto flex-none">
      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/60 p-1 rounded-xl h-10 w-full md:w-auto overflow-x-auto md:overflow-visible">
        {!isPlanPaid ? (
          <button
            type="button"
            onClick={() => onDownloadAction("pdf-summary")}
            disabled={isDownloading !== null}
            className="flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-[12px] h-full px-5 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            {isDownloading === "pdf-summary"
              ? ui.downloadingAlt || ui.downloading
              : ui.downloadFreeSummaryBtn || ui.downloadFreeSummary}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onDownloadAction("pdf")}
              disabled={isDownloading !== null}
              className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
            >
              {isDownloading === "pdf" ? "⏳..." : ui.presentationBtn}
            </button>
            <div className="w-px h-4 bg-zinc-800 flex-none" />
            <button
              type="button"
              onClick={() => onDownloadAction("pptx")}
              disabled={isDownloading !== null}
              className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
            >
              {isDownloading === "pptx" ? "⏳..." : ui.brochureBtn}
            </button>
            <div className="w-px h-4 bg-zinc-800 flex-none" />
            <button
              type="button"
              onClick={() => onDownloadAction("word")}
              disabled={isDownloading !== null}
              className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
            >
              {isDownloading === "word" ? "⏳..." : ui.documentBtn}
            </button>
          </>
        )}

        {!isPlanPaid && (
          <>
            <div className="w-px h-4 bg-zinc-800 flex-none" />
            <button
              type="button"
              onClick={onShowPricingModal}
              className="flex-none text-xs text-amber-500 hover:text-amber-400 cursor-pointer px-3 h-full rounded-lg flex items-center justify-center hover:bg-zinc-800/50 hover:scale-110 transition-all"
              title={ui.unlockDownloads || ui.unlockDownloadsTitle}
            >
              🔒
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Din PDF / share (guest): doar download + CTA cont (fără butoane RO/edit/LEI)
  if (guestSharedPreview) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        {downloadBlock}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
      <button
        type="button"
        onClick={onReset}
        className="w-full md:flex-1 h-10 bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-zinc-700 flex items-center justify-center gap-2 text-xs whitespace-nowrap"
      >
        {resetLabel}
      </button>

      <div className="relative group w-full md:flex-1">
        <button
          type="button"
          onClick={onStartEditing}
          className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-zinc-700/60 flex items-center justify-center gap-2 text-xs whitespace-nowrap cursor-pointer"
        >
          {editLabel}
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-250 scale-95 group-hover:scale-100 z-50">
          <div className="relative rounded-xl p-px" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)" }}>
            <div className="rounded-xl bg-zinc-950 px-4 py-3" style={{ boxShadow: "0 0 24px 2px rgba(16,185,129,0.13)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400 text-sm">✏️</span>
                <span className="text-emerald-300 text-[11px] font-black uppercase tracking-widest">
                  {stripLeadingEmoji(ui.editingStudio)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                  <span className="text-emerald-500">▸</span> {ui.directEditing}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                  <span className="text-emerald-500">▸</span> {ui.allTools}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                  <span className="text-emerald-500">▸</span> {ui.grantOpt}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShare && (
        <button
          type="button"
          onClick={onShare}
          disabled={shareBusy || isDownloading !== null}
          title={ui.shareLinkTitle}
          className="w-full md:flex-1 h-10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-zinc-700/60 flex items-center justify-center gap-2 text-xs whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {shareBusy ? "…" : shareLabel}
        </button>
      )}

      <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center justify-between">
        {allowCurrency && (
          <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-700 h-10 w-full md:w-32 flex-none">
            <button
              type="button"
              onClick={() => setCurrency("LEI")}
              className={`w-1/2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currency === "LEI" ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-white"}`}
            >
              LEI
            </button>
            <button
              type="button"
              onClick={() => setCurrency("EUR")}
              className={`w-1/2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currency === "EUR" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-white"}`}
            >
              EUR
            </button>
          </div>
        )}
        {downloadBlock}
      </div>
    </div>
  );
}
