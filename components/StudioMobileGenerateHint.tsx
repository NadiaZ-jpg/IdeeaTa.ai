"use client";

import Link from "next/link";
import { UI_STRINGS } from "@/lib/uiStrings";

/**
 * Empty-state pe Studio Mobile/Tablet când nu există plan încărcat.
 * Generarea Studio nouă rămâne pe Desktop (S3 Varianta B).
 */
export function StudioMobileGenerateHint({
  locale = "ro",
}: {
  locale?: "ro" | "en" | "es";
}) {
  const ui = UI_STRINGS[locale];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center gap-4">
      <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400/90 border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-full">
        {ui.studioMobileBadge}
      </span>
      <h1 className="text-xl font-black tracking-tight">{ui.studioMobileTitle}</h1>
      <p className="text-zinc-300 text-sm max-w-sm leading-relaxed">
        {ui.studioGenerateDesktopOnly}
      </p>
      <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
        {ui.studioGenerateDesktopHint}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <Link
          href={ui.routes.dashboard}
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
        >
          {ui.studioBackToDashboard}
        </Link>
        <Link
          href={ui.routes.demoNew}
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-sm font-bold transition-colors"
        >
          {ui.studioTryDemoMobile}
        </Link>
      </div>
    </div>
  );
}
