"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  CombineAction,
  VersionLocale,
  VersionStackAccess,
  canUseVersionCombine,
  combineWithLabel,
  formatVersionTabTitle,
  getCombineMenuItems,
  getVersionStackLimit,
  resolveVersionStack,
  stackLimitReachedMessage,
} from "@/lib/versionStack";

interface VersionSelectorProps {
  versions: Record<string, any>;
  activeVersionId: string;
  onSelectVersion: (versionId: string, versionData: any) => void;
  ui: any;
  locale?: VersionLocale;
  /** When set, shows "Combină cu…" on the active tab (Standard/Full). */
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
  access,
  onCombineWith,
  onRequireUpgrade,
}: VersionSelectorProps) {
  const versionKeys = Object.keys(versions);
  if (versionKeys.length <= 1) return null;

  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuFor) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuFor(null);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuFor]);

  const showCombine = !!(access && onCombineWith && canUseVersionCombine(access));
  const combineItems = showCombine ? getCombineMenuItems(locale, access!, ui) : [];
  const limit = access ? getVersionStackLimit(access) : 0;

  const openCombine = (vKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!access || !canUseVersionCombine(access)) {
      onRequireUpgrade?.();
      return;
    }
    const stack = resolveVersionStack(vKey, versions[vKey]);
    if (stack.length >= limit) {
      const isStandardOnly = !!(access.hasStandardAccess && !access.hasFullAccess && !access.isAdmin);
      alert(stackLimitReachedMessage(locale, limit, isStandardOnly));
      if (isStandardOnly) onRequireUpgrade?.();
      return;
    }
    setMenuFor(menuFor === vKey ? null : vKey);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar mb-6 shadow-sm relative">
      {Object.entries(versions).map(([vKey, vData]) => {
        const isActive = activeVersionId === vKey;
        const title = formatVersionTabTitle(vKey, vData, locale, ui);

        return (
          <div key={vKey} className="relative shrink-0" ref={menuFor === vKey ? menuRef : undefined}>
            <div className="flex items-center gap-0.5">
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
              {showCombine && isActive && (
                <button
                  type="button"
                  onClick={(e) => openCombine(vKey, e)}
                  title={combineWithLabel(locale)}
                  className="px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide text-emerald-400/90 border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/15 min-h-[44px] min-w-[44px] sm:min-w-0"
                >
                  +
                </button>
              )}
            </div>

            {menuFor === vKey && combineItems.length > 0 && (
              <div className="absolute top-full left-0 mt-1 z-40 min-w-[220px] max-w-[90vw] bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-1">
                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 px-2 py-1.5">
                  {combineWithLabel(locale)}
                </p>
                {combineItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left text-xs px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white font-semibold min-h-[44px]"
                    onClick={() => {
                      setMenuFor(null);
                      onCombineWith?.(vKey, item.combine);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
