"use client";
/**
 * ActionBar.tsx
 * Bara de acțiuni principală afișată după generarea unui plan de afaceri.
 * Conține: Reset, Edit, Currency Toggle, Download Buttons + Tooltip-uri.
 * Comună pentru StudioDesktop și DemoDesktop (diferențiată prin prop `mode`).
 * Sesiunea 4 din planul de refactorizare arhitecturală (30 Iulie 2026).
 */

import React from "react";

interface ActionBarProps {
  mode: "demo" | "studio";
  locale: string;
  ui: any;
  // Acțiuni
  onReset: () => void;
  onStartEditing: () => void;
  onDownloadAction: (type: 'pdf-summary' | 'pdf' | 'pptx' | 'word') => void;
  onShowPricingModal: () => void;
  onShowExportModal?: () => void; // doar Demo
  // Stare
  currency: string;
  setCurrency: (c: string) => void;
  isDownloading: string | null;
  isPlanPaid: boolean;
  isEditing?: boolean;
  showCurrencyToggle?: boolean; // ascuns pentru EN/ES
}

export function ActionBar({
  mode,
  ui,
  onReset,
  onStartEditing,
  onDownloadAction,
  onShowPricingModal,
  onShowExportModal,
  currency,
  setCurrency,
  isDownloading,
  isPlanPaid,
  isEditing = false,
  showCurrencyToggle = true,
}: ActionBarProps) {

  const editLabel = ui.editingStudio ? `🪄 ${ui.editingStudio.replace("🪄 ", "")}` : "🪄 Studio Editare";
  const resetLabel = ui.anotherIdea ? `💡 ${ui.anotherIdea.replace("💡 ", "")}` : "💡 Altă idee";

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
      {/* Buton Reset */}
      <button
        onClick={onReset}
        className="w-full md:flex-1 h-10 bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-zinc-700 flex items-center justify-center gap-2 text-xs whitespace-nowrap"
      >
        {resetLabel}
      </button>

      {/* Buton Edit cu Tooltip */}
      <div className="relative group w-full md:flex-1">
        <button
          onClick={onStartEditing}
          className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-zinc-700/60 flex items-center justify-center gap-2 text-xs whitespace-nowrap cursor-pointer"
        >
          {editLabel}
        </button>
        {/* Tooltip Studio Editare */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-250 scale-95 group-hover:scale-100 z-50">
          <div className="relative rounded-xl p-px" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)" }}>
            <div className="rounded-xl bg-zinc-950 px-4 py-3" style={{ boxShadow: "0 0 24px 2px rgba(16,185,129,0.13)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400 text-sm">✏️</span>
                <span className="text-emerald-300 text-[11px] font-black uppercase tracking-widest">{ui.editingStudio || "Studio Editare"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> {ui.directEditing || "Editare directă în browser"}</div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> {ui.allTools || "Toate instrumentele incluse"}</div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> {ui.grantOpt || "Optimizare fonduri europene 🇪🇺"}</div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950" style={{ background: "linear-gradient(135deg, transparent 50%, #059669 50%)", clipPath: "polygon(0 0, 100% 100%, 0 100%)", transform: "translateX(-50%) rotate(45deg)" }} />
        </div>
      </div>

      {/* Currency Toggle + Download Buttons */}
      <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Toggle LEI/EUR — ascuns pentru EN/ES */}
        {showCurrencyToggle && (
          <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-700 h-10 w-full md:w-32 flex-none">
            <button
              onClick={() => setCurrency("LEI")}
              className={`w-1/2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currency === "LEI" ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-white"}`}
            >
              LEI
            </button>
            <button
              onClick={() => setCurrency("EUR")}
              className={`w-1/2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currency === "EUR" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-white"}`}
            >
              EUR
            </button>
          </div>
        )}

        {/* Download Buttons cu Tooltip */}
        <div className="relative group w-full md:w-auto flex-none">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/60 p-1 rounded-xl h-10 w-full md:w-auto overflow-x-auto md:overflow-visible">
            {(!isPlanPaid || (mode === "demo" && isEditing)) ? (
              /* Buton gratuit PDF Sumar */
              <button
                onClick={() => onDownloadAction("pdf-summary")}
                disabled={isDownloading !== null}
                className="flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-[12px] h-full px-5 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {isDownloading === "pdf-summary"
                  ? ui.downloadingAlt || "⏳ Se descarcă..."
                  : (ui.downloadFreeSummaryBtn || ui.downloadFreeSummary || "🎁 PDF Gratuit")}
              </button>
            ) : (
              <>
                {/* Butoane download premium */}
                <button
                  onClick={() => mode === "demo" && onShowExportModal ? onShowExportModal() : onDownloadAction("pdf")}
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === "pdf" ? "⏳..." : (ui.presentationBtn || ui.downloadPresentation || "⬇ Prezentare")}
                </button>
                <div className="w-px h-4 bg-zinc-800 flex-none" />
                <button
                  onClick={() => mode === "demo" && onShowExportModal ? onShowExportModal() : onDownloadAction("pptx")}
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === "pptx" ? "⏳..." : (ui.brochureBtn || ui.downloadBrochure || "⬇ Broșură")}
                </button>
                <div className="w-px h-4 bg-zinc-800 flex-none" />
                <button
                  onClick={() => mode === "demo" && onShowExportModal ? onShowExportModal() : onDownloadAction("word")}
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === "word" ? "⏳..." : (ui.documentBtn || ui.downloadDocument || "⬇ Document")}
                </button>
              </>
            )}

            {/* Lacăt upgrade dacă nu este plătit */}
            {!isPlanPaid && (
              <>
                <div className="w-px h-4 bg-zinc-800 flex-none" />
                <button
                  type="button"
                  onClick={onShowPricingModal}
                  className="flex-none text-xs text-amber-500 hover:text-amber-400 cursor-pointer px-3 h-full rounded-lg flex items-center justify-center hover:bg-zinc-800/50 hover:scale-110 transition-all"
                  title={ui.unlockDownloads || ui.unlockDownloadsTitle || "Deblochează"}
                >
                  🔒
                </button>
              </>
            )}
          </div>

          {/* Tooltip Pachet Standard */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-250 scale-95 group-hover:scale-100 z-50">
            <div className="relative rounded-xl p-px" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)" }}>
              <div className="rounded-xl bg-zinc-950 px-4 py-3" style={{ boxShadow: "0 0 24px 2px rgba(16,185,129,0.13)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-400 text-sm">⬇</span>
                  <span className="text-emerald-300 text-[11px] font-black uppercase tracking-widest">
                    {ui.standardPackageBtn || ui.tooltipPackageStandard || "Pachet Standard"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> {ui.pdfPresentation || ui.tooltipPdfPresentation || "Prezentare PDF"}</div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> {ui.pptxBrochure || ui.tooltipPptxBrochure || "Broșură PPTX"}</div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> {ui.wordDocument || ui.tooltipWordDocument || "Document Word"}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3" style={{ background: "linear-gradient(135deg, transparent 50%, #059669 50%)", clipPath: "polygon(0 0, 100% 100%, 0 100%)", transform: "translateX(-50%) rotate(45deg)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
