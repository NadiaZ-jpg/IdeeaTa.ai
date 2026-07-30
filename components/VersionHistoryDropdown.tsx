"use client";
/**
 * VersionHistoryDropdown.tsx
 * Extrage meniul de navigare între versiunile planului (Original, Fonduri EU, Investitor).
 * Suportă două moduri:
 * - "studio": Afișează butoane specifice și un dropdown (Soluția 1).
 * - "demo": Afișează un rând de tab-uri.
 * 
 * Sesiunea 6 din planul de refactorizare arhitecturală (30 Iulie 2026).
 */

import React from "react";

interface VersionHistoryDropdownProps {
  mode: "demo" | "studio";
  versions: Record<string, any>;
  activeVersionId: string;
  onSelectVersion: (versionId: string, versionData: any) => void;
  showVersionDropdown?: boolean;
  setShowVersionDropdown?: (show: boolean) => void;
  ui: any;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}

export function VersionHistoryDropdown({
  mode,
  versions,
  activeVersionId,
  onSelectVersion,
  showVersionDropdown,
  setShowVersionDropdown,
  ui,
  dropdownRef,
}: VersionHistoryDropdownProps) {
  if (mode === "demo") {
    if (Object.keys(versions).length <= 1) return null;
    return (
      <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800 pb-2 w-full max-w-5xl justify-center sm:justify-start">
        {Object.entries(versions).map(([vKey, vData]) => {
          const title =
            vKey === "original" ? `📝 ${ui.versionOriginal}` :
            vKey === "ton_edit" ? `🪄 ${ui.versionTone}` :
            vKey === "eu_funds" ? `🇪🇺 ${ui.versionEuFunds}` :
            vKey === "budget_edit" ? `📉 ${ui.versionBudget}` :
            vKey === "expert_sections" ? `🏛️ ${ui.versionExpert}` :
            vKey === "investor" ? `🏦 ${ui.versionInvestor}` :
            `📑 ${vKey}`;
          return (
            <button
              key={vKey}
              onClick={() => onSelectVersion(vKey, vData)}
              className={`px-5 py-2.5 rounded-t-xl transition-all duration-300 font-bold text-sm tracking-wide flex items-center gap-2 ${
                activeVersionId === vKey
                  ? "bg-[#09090b] border-t border-l border-r border-emerald-500/50 text-emerald-400 shadow-[0_-10px_20px_-10px_rgba(16,185,129,0.15)] relative z-10 translate-y-[1px]"
                  : "bg-zinc-900/50 border-t border-l border-r border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {title}
            </button>
          );
        })}
      </div>
    );
  }

  // mode === "studio"
  if (Object.keys(versions).length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-zinc-800/80 pb-3 w-full max-w-5xl justify-center sm:justify-start">
      {versions.original && (
        <button
          onClick={() => onSelectVersion('original', versions.original)}
          className={`px-4 py-2 rounded-xl transition-all duration-200 font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer ${
            activeVersionId === 'original'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          {ui.originalVersion}
        </button>
      )}
      {versions.eu_funds && (
        <button
          onClick={() => onSelectVersion('eu_funds', versions.eu_funds)}
          className={`px-4 py-2 rounded-xl transition-all duration-200 font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer ${
            activeVersionId === 'eu_funds'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          {ui.euFundsOptimized}
        </button>
      )}
      {versions.investor && (
        <button
          onClick={() => onSelectVersion('investor', versions.investor)}
          className={`px-4 py-2 rounded-xl transition-all duration-200 font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer ${
            activeVersionId === 'investor'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          {ui.investorsPlan}
        </button>
      )}

      {/* Soluția 1 — Meniu Dropdown Istoric Versiuni */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowVersionDropdown && setShowVersionDropdown(!showVersionDropdown)}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <span>📜 {ui.versionHistory || "Istoric Versiuni"} ({Object.keys(versions).length})</span>
          <span className="text-[10px]">▼</span>
        </button>

        {showVersionDropdown && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-[90] animate-in fade-in duration-150">
            <div className="text-[10px] uppercase font-black tracking-widest text-zinc-500 px-3 py-1.5 border-b border-zinc-900 flex justify-between items-center">
              <span>{ui.savedVersions || "Versiuni Salvate"}</span>
              <button onClick={() => setShowVersionDropdown && setShowVersionDropdown(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1 mt-1">
              {Object.entries(versions).map(([vKey, vData]) => (
                <button
                  key={vKey}
                  onClick={() => {
                    onSelectVersion(vKey, vData);
                    setShowVersionDropdown && setShowVersionDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeVersionId === vKey
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span className="truncate">
                    {vKey === "original"
                      ? ui.originalVersion
                      : vKey === "eu_funds"
                      ? ui.euFundsOptimized
                      : vKey === "investor"
                      ? ui.investorsPlan
                      : `📑 ${vKey}`}
                  </span>
                  {activeVersionId === vKey && <span className="text-emerald-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
