"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { UI_STRINGS } from "@/lib/uiStrings";
import {
  FREE_TONE_KEYS,
  canUseFreeToneEdit,
  freeToneRemainingLabel,
} from "@/lib/toneQuota";

type Locale = "ro" | "en" | "es";

interface ToneEditorProps {
  user: User | null;
  locale?: Locale;
  /** Standard unlock — skip free-tone quota */
  hasStandardAccess?: boolean;
  /** Pro unlock — persuasive / friendly tones */
  hasProAccess?: boolean;
  isAdmin?: boolean;
  isEditingAi: boolean;
  setShowAuthModal: (v: boolean) => void;
  setShowPricingModal: (v: boolean) => void;
  handleAiEdit: (field: string, instructions: string) => void;
}

/**
 * Mobile rewrite-tone control (Studio + Demo).
 * - Without account → "Gratis cu cont"
 * - Free account → formal + creative (shared FREE_TONE_EDIT_LIMIT)
 * - Persuasive / friendly → Pro (hasProAccess)
 * Quota is consumed by parent handleAiEdit after successful API (not here).
 */
export function ToneEditor({
  user,
  locale = "ro",
  hasStandardAccess = false,
  hasProAccess = false,
  isAdmin = false,
  isEditingAi,
  setShowAuthModal,
  setShowPricingModal,
  handleAiEdit,
}: ToneEditorProps) {
  const [showToneOptions, setShowToneOptions] = useState(false);
  const ui = UI_STRINGS[locale] || UI_STRINGS.ro;
  const canUseProTones = !!(isAdmin || hasProAccess);
  const skipFreeToneQuota = !!(isAdmin || hasStandardAccess || hasProAccess);

  const freeWithAccountBadge =
    locale === "en" ? "Free w/ account" : locale === "es" ? "Gratis con cuenta" : "Gratis cu cont";

  const onToneSelect = (toneKey: string) => {
    setShowToneOptions(false);

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isFreeTone = (FREE_TONE_KEYS as readonly string[]).includes(toneKey);
    if (!isFreeTone && !canUseProTones) {
      setShowPricingModal(true);
      return;
    }

    if (isFreeTone && !skipFreeToneQuota && !canUseFreeToneEdit(false)) {
      setShowPricingModal(true);
      return;
    }

    handleAiEdit("professional_tone", toneKey);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!user) {
            setShowAuthModal(true);
            return;
          }
          setShowToneOptions(!showToneOptions);
        }}
        disabled={isEditingAi}
        className="w-full bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl px-3.5 py-3 font-semibold text-sm text-zinc-200 transition-colors text-left flex items-center justify-between gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base bg-emerald-500/10 text-emerald-400">
            🪄
          </span>
          <span className="truncate">{ui.rewriteTone}</span>
        </span>
        <span className="shrink-0 flex items-center gap-1.5">
          {!user ? (
            <span className="inline-flex items-center justify-center text-[9px] font-bold uppercase tracking-wide text-emerald-400/90 border border-emerald-500/25 bg-emerald-500/5 px-2 py-1 rounded-md whitespace-nowrap">
              {freeWithAccountBadge}
            </span>
          ) : (
            <span className="text-zinc-500 text-xs">{showToneOptions ? "▲" : "▼"}</span>
          )}
        </span>
      </button>

      {showToneOptions && user && (
        <div className="flex flex-col gap-1 p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/50 mt-1 animate-in slide-in-from-top-2">
          {!canUseProTones && (
            <p className="text-[10px] text-zinc-500 px-2 pb-1">
              {freeToneRemainingLabel(locale)}
            </p>
          )}
          <button
            type="button"
            onClick={() => onToneSelect("formal")}
            disabled={isEditingAi}
            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold min-h-[44px]"
          >
            {ui.toneProfessional}
          </button>
          <button
            type="button"
            onClick={() => onToneSelect("creative")}
            disabled={isEditingAi}
            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold min-h-[44px]"
          >
            {ui.toneCreative}
          </button>
          <button
            type="button"
            onClick={() => onToneSelect("persuasive")}
            disabled={isEditingAi}
            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold flex items-center justify-between gap-2 min-h-[44px]"
          >
            <span className="min-w-0">{ui.tonePersuasive}</span>
            {!canUseProTones && (
              <span className="shrink-0 min-w-[3.25rem] text-center text-[9px] font-bold uppercase tracking-wide text-amber-400/90 border border-amber-500/30 bg-amber-500/5 px-2 py-1 rounded-md">
                Pro
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onToneSelect("friendly")}
            disabled={isEditingAi}
            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold flex items-center justify-between gap-2 min-h-[44px]"
          >
            <span className="min-w-0">{ui.toneFriendly}</span>
            {!canUseProTones && (
              <span className="shrink-0 min-w-[3.25rem] text-center text-[9px] font-bold uppercase tracking-wide text-amber-400/90 border border-amber-500/30 bg-amber-500/5 px-2 py-1 rounded-md">
                Pro
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
}
