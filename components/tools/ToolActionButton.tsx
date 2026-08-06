import React from "react";

export type ToolAccessBadge = "locked" | "free" | "pro" | "modules" | "none";

type Locale = "ro" | "en" | "es";

interface ToolActionButtonProps {
  icon: string;
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  locale?: Locale;
  badge?: ToolAccessBadge;
  badgeLabel?: string;
  trailing?: React.ReactNode;
  accent?: "neutral" | "emerald" | "amber";
  className?: string;
}

const FREE_LABEL: Record<Locale, string> = {
  ro: "Gratis",
  en: "Free",
  es: "Gratis",
};

const LOCKED_LABEL: Record<Locale, string> = {
  ro: "Gratis cu cont",
  en: "Free w/ account",
  es: "Gratis con cuenta",
};

/**
 * Unified tools row for Demo/Studio sidebars — consistent icon, title wrap, short access chip.
 * Guests always see a lock chip; after login, free / pro / modules apply.
 */
export function ToolActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  locale = "ro",
  badge = "none",
  badgeLabel,
  trailing,
  accent = "neutral",
  className = "",
}: ToolActionButtonProps) {
  const iconTone =
    accent === "emerald"
      ? "bg-emerald-500/10 text-emerald-400"
      : accent === "amber"
      ? "bg-amber-500/10 text-amber-400"
      : "bg-zinc-800/80 text-zinc-300";

  const chip =
    badge === "locked" ? (
      <span className="shrink-0 inline-flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide text-emerald-400/90 border border-emerald-500/25 bg-emerald-500/5 px-2 py-1 rounded-md whitespace-nowrap">
        {badgeLabel || LOCKED_LABEL[locale]}
      </span>
    ) : badge === "free" ? (
      <span className="shrink-0 min-w-[3.25rem] text-center text-[9px] font-bold uppercase tracking-wide text-emerald-400/90 border border-emerald-500/25 bg-emerald-500/5 px-2 py-1 rounded-md">
        {badgeLabel || FREE_LABEL[locale]}
      </span>
    ) : badge === "pro" ? (
      <span className="shrink-0 min-w-[3.25rem] text-center text-[9px] font-bold uppercase tracking-wide text-amber-400/90 border border-amber-500/30 bg-amber-500/5 px-2 py-1 rounded-md">
        {badgeLabel || "Pro"}
      </span>
    ) : badge === "modules" ? (
      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-emerald-400/90 border border-emerald-500/25 bg-emerald-500/5 px-2 py-1 rounded-md whitespace-nowrap">
        {badgeLabel}
      </span>
    ) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left flex items-center gap-3 rounded-xl px-3.5 py-3 font-semibold text-sm text-zinc-200 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 ${className}`}
    >
      <span
        className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base ${iconTone} group-hover:scale-[1.03] transition-transform`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0 leading-snug">{label}</span>
      <span className="shrink-0 flex items-center gap-1.5">
        {chip}
        {trailing}
      </span>
    </button>
  );
}
