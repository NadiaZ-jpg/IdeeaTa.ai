"use client";
import React from "react";

interface VersionSelectorProps {
  versions: Record<string, any>;
  activeVersionId: string;
  onSelectVersion: (versionId: string, versionData: any) => void;
  ui: any;
}

export function VersionSelector({ versions, activeVersionId, onSelectVersion, ui }: VersionSelectorProps) {
  const versionKeys = Object.keys(versions);
  if (versionKeys.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar mb-6 shadow-sm">
      {Object.entries(versions).map(([vKey, vData]) => {
        const isActive = activeVersionId === vKey;
        
        // Decodificăm dinamic tipul versiunii din cheia ei
        let title = `📑 ${vKey}`;
        if (vKey === "original") {
          title = `📝 ${ui.versionOriginal || "Varianta Originala"}`;
        } else if (vKey.startsWith("ton_")) {
          const parts = vKey.split("_");
          const toneType = parts[1]; // formal, prietenos, etc.
          let label = ui.versionTone || "Ton Rescris";
          if (toneType === "formal") label = ui.toneProfessional || "Profesional";
          else if (toneType === "creative") label = ui.toneCreative || "Creativ";
          else if (toneType === "persuasive") label = ui.tonePersuasive || "Persuasiv";
          else if (toneType === "friendly") label = ui.toneFriendly || "Prietenos";
          title = `🪄 ${label}`;
        } else if (vKey.startsWith("budget_")) {
          title = `📉 ${ui.versionBudget || "Buget Optimizat"}`;
        } else if (vKey.startsWith("eu_funds")) {
          title = `🇪🇺 ${ui.versionEuFunds || "Optimizat Fonduri UE"}`;
        } else if (vKey.startsWith("investor")) {
          title = `🏦 ${ui.versionInvestor || "Plan Investitori"}`;
        } else if (vKey.startsWith("expert_")) {
          title = `🏛️ ${ui.versionExpert || "Sectiuni Expert"}`;
        }

        return (
          <button
            key={vKey}
            onClick={() => onSelectVersion(vKey, vData)}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 whitespace-nowrap transition-all duration-300 cursor-pointer ${
              isActive
                ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]"
                : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            {title}
          </button>
        );
      })}
    </div>
  );
}
