"use client";
import React from "react";
import {
  CombineAction,
  VersionLocale,
  VersionStackAccess,
  formatVersionTabTitle,
} from "@/lib/versionStack";

interface VersionSelectorProps {
  versions: Record<string, any>;
  activeVersionId: string;
  onSelectVersion: (versionId: string, versionData: any) => void;
  ui: any;
  locale?: VersionLocale;
  /** Kept for call-site compatibility — Combine (+) UI removed. */
  access?: VersionStackAccess;
  onCombineWith?: (sourceVersionId: string, combine: CombineAction) => void;
  onRequireUpgrade?: () => void;
}

export function VersionSelector({
  versions,
  activeVersionId,
  onSelectVersion,
  ui,
  locale = "ro",
}: VersionSelectorProps) {
  const versionKeys = Object.keys(versions);
  if (versionKeys.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl w-full max-w-full mb-6 shadow-sm relative">
      {Object.entries(versions).map(([vKey, vData]) => {
        const isActive = activeVersionId === vKey;
        const title = formatVersionTabTitle(vKey, vData, locale, ui);

        return (
          <div key={vKey} className="relative shrink-0 max-w-full">
            <button
              type="button"
              onClick={() => onSelectVersion(vKey, vData)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 whitespace-nowrap transition-all duration-300 cursor-pointer min-h-[44px] ${
                isActive
                  ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]"
                  : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              {title}
            </button>
          </div>
        );
      })}
    </div>
  );
}
