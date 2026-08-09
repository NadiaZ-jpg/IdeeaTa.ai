"use client";

import {
  PRO_TOPUP_COMBINE_GRANT,
  PRO_TOPUP_EDIT_GRANT,
  PRO_TOPUP_GENERATE_GRANT,
} from "@/lib/proPackQuota";
import { proTopupButtonLabel, proTopupPriceLabel } from "@/lib/proTopupCheckout";

type Locale = "ro" | "en" | "es";

type Remaining = { generate: number; edit: number; combine: number };

function metricLabels(locale: Locale) {
  if (locale === "en") {
    return {
      title: "Pro Tools",
      generate: "Generations",
      edit: "Pro edits",
      combine: "Combinations",
      sharedHint: "Shared across all plans",
    };
  }
  if (locale === "es") {
    return {
      title: "Herramientas Pro",
      generate: "Generaciones",
      edit: "Ediciones Pro",
      combine: "Combinaciones",
      sharedHint: "Compartido en todos los planes",
    };
  }
  return {
    title: "Instrumente Pro",
    generate: "Generări",
    edit: "Editări Pro",
    combine: "Combinații",
    sharedHint: "Comun pe toate planurile",
  };
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const depleted = value <= 0;
  return (
    <div className="flex flex-col min-w-[4.5rem]">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span
        className={`text-sm font-black tabular-nums leading-tight ${
          depleted ? "text-amber-400" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type Props = {
  locale: Locale;
  remaining: Remaining;
  topupLoading?: boolean;
  onTopup: () => void;
  /** Full-width bar under mobile header */
  layout?: "inline" | "bar";
};

/**
 * Compact Pro-pack quota card — Desktop/Mobile, RO/EN/ES.
 * Replaces the amber badge + tiny “Click to add credits” strip.
 */
export function ProPackQuotaBar({
  locale,
  remaining,
  topupLoading = false,
  onTopup,
  layout = "inline",
}: Props) {
  const L = metricLabels(locale);
  const price = proTopupPriceLabel(locale);
  const topupLabel =
    locale === "en"
      ? `Add credits · ${price}`
      : locale === "es"
      ? `Añadir créditos · ${price}`
      : `Adaugă credite · ${price}`;

  const grantsHint =
    locale === "en"
      ? `+${PRO_TOPUP_GENERATE_GRANT} gen · +${PRO_TOPUP_EDIT_GRANT} edits · +${PRO_TOPUP_COMBINE_GRANT} combos`
      : locale === "es"
      ? `+${PRO_TOPUP_GENERATE_GRANT} gen · +${PRO_TOPUP_EDIT_GRANT} ed. · +${PRO_TOPUP_COMBINE_GRANT} comb.`
      : `+${PRO_TOPUP_GENERATE_GRANT} gen · +${PRO_TOPUP_EDIT_GRANT} ed. · +${PRO_TOPUP_COMBINE_GRANT} comb.`;

  const shell =
    layout === "bar"
      ? "w-full border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3"
      : "rounded-xl border border-zinc-700/70 bg-zinc-900/90 px-3.5 py-2.5 shadow-sm";

  return (
    <div className={shell}>
      <div
        className={`flex flex-col gap-2.5 ${
          layout === "bar" ? "max-w-3xl mx-auto" : ""
        } sm:flex-row sm:items-center sm:justify-between sm:gap-4`}
      >
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {L.title}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              {L.sharedHint}
            </span>
          </div>
          <div className="flex items-end gap-4 sm:gap-5">
            <Metric label={L.generate} value={remaining.generate} />
            <Metric label={L.edit} value={remaining.edit} />
            <Metric label={L.combine} value={remaining.combine} />
          </div>
        </div>

        <button
          type="button"
          disabled={topupLoading}
          onClick={onTopup}
          title={`${proTopupButtonLabel(locale)} (${grantsHint})`}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 px-3.5 py-2 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[40px] sm:min-h-[36px]"
        >
          {topupLoading
            ? locale === "en"
              ? "Redirecting…"
              : locale === "es"
              ? "Redirigiendo…"
              : "Se redirecționează…"
            : topupLabel}
        </button>
      </div>
    </div>
  );
}
