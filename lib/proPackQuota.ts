/**
 * One-time Pro Tools pack (~20 €) quotas.
 * Unlock via euFundsUnlocked + remaining counters (not unlimited generate).
 */

export const PRO_PACK_GENERATE_GRANT = 10;
export const PRO_PACK_EDIT_GRANT = 8;
export const PRO_PACK_COMBINE_GRANT = 4;

/** 5 € top-up (only if Pro Tools pack already unlocked) */
export const PRO_TOPUP_GENERATE_GRANT = 5;
export const PRO_TOPUP_EDIT_GRANT = 4;
export const PRO_TOPUP_COMBINE_GRANT = 2;

export const PRO_PACK_QUOTA_VERSION = 1;

export type ProPackLocale = "ro" | "en" | "es";

export type ProPackUserFields = {
  isPaid?: boolean;
  subscriptionActive?: boolean;
  euFundsUnlocked?: boolean;
  proPackGenerateRemaining?: number;
  proPackEditRemaining?: number;
  proPackCombineRemaining?: number;
  proPackQuotaInitialized?: boolean;
  proPackQuotaVersion?: number;
  lifetimePlanCount?: number;
};

/** True unlimited generate (subscription / legacy isPaid). One-time Pro pack is NOT unlimited. */
export function hasUnlimitedProGenerate(opts: {
  isPaid?: boolean;
  subscriptionActive?: boolean;
  isAdmin?: boolean;
}): boolean {
  return !!(opts.isAdmin || opts.isPaid || opts.subscriptionActive);
}

export function hasProToolsPackAccess(opts: {
  isAdmin?: boolean;
  subscriptionActive?: boolean;
  euFundsUnlocked?: boolean;
}): boolean {
  return !!(
    opts.isAdmin ||
    opts.subscriptionActive ||
    opts.euFundsUnlocked
  );
}

/** Subscription keeps Pro edits/combines uncapped; one-time pack uses counters. */
export function hasUnlimitedProEdits(opts: {
  isAdmin?: boolean;
  subscriptionActive?: boolean;
}): boolean {
  return !!(opts.isAdmin || opts.subscriptionActive);
}

export function readProPackRemaining(data: ProPackUserFields | null | undefined): {
  generate: number;
  edit: number;
  combine: number;
} {
  return {
    generate:
      typeof data?.proPackGenerateRemaining === "number"
        ? Math.max(0, data.proPackGenerateRemaining)
        : 0,
    edit:
      typeof data?.proPackEditRemaining === "number"
        ? Math.max(0, data.proPackEditRemaining)
        : 0,
    combine:
      typeof data?.proPackCombineRemaining === "number"
        ? Math.max(0, data.proPackCombineRemaining)
        : 0,
  };
}

export function canGenerateWithQuotas(opts: {
  isAdmin?: boolean;
  isPaid?: boolean;
  subscriptionActive?: boolean;
  lifetimePlanCount?: number;
  plansCount?: number;
  proPackGenerateRemaining?: number;
  freeLimit: number;
}): boolean {
  if (hasUnlimitedProGenerate(opts)) return true;
  const lifetime =
    typeof opts.lifetimePlanCount === "number"
      ? opts.lifetimePlanCount
      : typeof opts.plansCount === "number"
        ? opts.plansCount
        : 0;
  if (lifetime < opts.freeLimit) return true;
  return (opts.proPackGenerateRemaining ?? 0) > 0;
}

/** Firestore payload when granting / topping up the one-time Pro pack. */
export function proPackGrantFields(increment: (n: number) => unknown): Record<string, unknown> {
  return {
    euFundsUnlocked: true,
    standardPackageActive: true,
    proPackQuotaInitialized: true,
    proPackQuotaVersion: PRO_PACK_QUOTA_VERSION,
    proPackGenerateRemaining: increment(PRO_PACK_GENERATE_GRANT),
    proPackEditRemaining: increment(PRO_PACK_EDIT_GRANT),
    proPackCombineRemaining: increment(PRO_PACK_COMBINE_GRANT),
  };
}

/** Credits only — requires existing Pro Tools unlock (enforced in checkout/webhook). */
export function proTopupGrantFields(increment: (n: number) => unknown): Record<string, unknown> {
  return {
    proPackQuotaInitialized: true,
    proPackQuotaVersion: PRO_PACK_QUOTA_VERSION,
    proPackGenerateRemaining: increment(PRO_TOPUP_GENERATE_GRANT),
    proPackEditRemaining: increment(PRO_TOPUP_EDIT_GRANT),
    proPackCombineRemaining: increment(PRO_TOPUP_COMBINE_GRANT),
    proPackLastTopupAt: new Date().toISOString(),
  };
}

export function proPackRemainingLabel(
  locale: ProPackLocale,
  remaining: { generate: number; edit: number; combine: number }
): string {
  if (locale === "en") {
    return `Left: ${remaining.generate} gens · ${remaining.edit} Pro edits · ${remaining.combine} combinations`;
  }
  if (locale === "es") {
    return `Quedan: ${remaining.generate} gen. · ${remaining.edit} ed. Pro · ${remaining.combine} combinaciones`;
  }
  return `Rămase: ${remaining.generate} generări · ${remaining.edit} editări Pro · ${remaining.combine} combinații`;
}

export function proPackLimitMessage(
  locale: ProPackLocale,
  kind: "generate" | "edit" | "combine"
): string {
  if (kind === "generate") {
    if (locale === "en") {
      return `You used all ${PRO_PACK_GENERATE_GRANT} plan generations from your package. Purchase again to continue.`;
    }
    if (locale === "es") {
      return `Usaste las ${PRO_PACK_GENERATE_GRANT} generaciones de plan del paquete. Compra de nuevo para continuar.`;
    }
    return `Ai folosit cele ${PRO_PACK_GENERATE_GRANT} generări de plan din pachet. Cumpără din nou pentru a continua.`;
  }
  if (kind === "edit") {
    if (locale === "en") {
      return `You used all ${PRO_PACK_EDIT_GRANT} Pro edits from your package. Purchase again to continue.`;
    }
    if (locale === "es") {
      return `Usaste las ${PRO_PACK_EDIT_GRANT} ediciones Pro del paquete. Compra de nuevo para continuar.`;
    }
    return `Ai folosit cele ${PRO_PACK_EDIT_GRANT} editări Pro din pachet. Cumpără din nou pentru a continua.`;
  }
  if (locale === "en") {
    return `You used all ${PRO_PACK_COMBINE_GRANT} combinations from your package. Purchase again to continue.`;
  }
  if (locale === "es") {
    return `Usaste las ${PRO_PACK_COMBINE_GRANT} combinaciones del paquete. Compra de nuevo para continuar.`;
  }
  return `Ai folosit cele ${PRO_PACK_COMBINE_GRANT} combinații din pachet. Cumpără din nou pentru a continua.`;
}

/** confirm() — OK → top-up; Cancel → stay on page. Desktop+Mobile RO/EN/ES. */
export function proPackTopupConfirmDialog(
  locale: ProPackLocale,
  kind: "generate" | "edit" | "combine"
): boolean {
  if (typeof window === "undefined") return false;
  const suffix =
    locale === "en"
      ? "OK opens top-up checkout. Cancel keeps you on this page."
      : locale === "es"
      ? "Aceptar abre el pago de recarga. Cancelar te deja en esta página."
      : "OK deschide plata pentru reîncărcare. Anulează = rămâi pe pagină.";
  return window.confirm(`${proPackLimitMessage(locale, kind)}\n\n${suffix}`);
}

/**
 * B2: guidance before upgrade when edit/combine quota blocks a Pro tool.
 * Explains Original = edit (new tab) vs other tab = combine (+ edit for Pro tools).
 */
export function proPackQuotaBlockedGuidance(
  locale: ProPackLocale,
  kind: "edit" | "combine",
  remaining: { edit: number; combine: number },
  activeVersionId?: string | null
): string {
  const onOriginal = !activeVersionId || activeVersionId === "original";
  const base = proPackLimitMessage(locale, kind);

  if (locale === "en") {
    if (kind === "edit") {
      const extra = onOriginal
        ? remaining.combine > 0
          ? `\n\nTip: You still have ${remaining.combine} combination(s). Open an existing Pro variant tab and run a tool there to combine — or top up edits to create a new tab from Original.`
          : `\n\nTip: On Original, each Pro tool uses 1 edit and creates a new tab. Download always exports the active tab.`
        : `\n\nTip: On a variant tab, Pro tools use 1 edit + 1 combination. Switch to Original to create a sibling tab with edit only (if you have edits left).`;
      return base + extra;
    }
    return (
      base +
      `\n\nTip: Switch to Original to create a new variant (uses edit, not combination). Download always exports the active tab.`
    );
  }

  if (locale === "es") {
    if (kind === "edit") {
      const extra = onOriginal
        ? remaining.combine > 0
          ? `\n\nConsejo: Aún te quedan ${remaining.combine} combinación(es). Abre una pestaña de variante Pro y ejecuta una herramienta allí para combinar — o recarga ediciones para crear una pestaña nueva desde Original.`
          : `\n\nConsejo: En Original, cada herramienta Pro usa 1 edición y crea una pestaña nueva. La descarga exporta siempre la pestaña activa.`
        : `\n\nConsejo: En una variante, las herramientas Pro usan 1 edición + 1 combinación. Cambia a Original para crear una pestaña hermana solo con edición (si te quedan).`;
      return base + extra;
    }
    return (
      base +
      `\n\nConsejo: Cambia a Original para crear una variante nueva (usa edición, no combinación). La descarga exporta siempre la pestaña activa.`
    );
  }

  if (kind === "edit") {
    const extra = onOriginal
      ? remaining.combine > 0
        ? `\n\nSfat: Mai ai ${remaining.combine} combinație/combinații. Deschide un tab Pro existent și rulează o unealtă acolo pentru a combina — sau reîncarcă editări ca să creezi tab nou din Original.`
        : `\n\nSfat: Pe Original, fiecare unealtă Pro folosește 1 editare și creează un tab nou. Descărcarea exportă mereu tab-ul activ.`
      : `\n\nSfat: Pe un tab variantă, uneltele Pro folosesc 1 editare + 1 combinație. Treci pe Original ca să creezi un tab frate doar cu editare (dacă mai ai editări).`;
    return base + extra;
  }
  return (
    base +
    `\n\nSfat: Treci pe Original ca să creezi o variantă nouă (folosește editare, nu combinație). Descărcarea exportă mereu tab-ul activ.`
  );
}

/** Alert + returns true if caller should open top-up/pricing (always true after alert). */
export function notifyProPackQuotaBlocked(
  locale: ProPackLocale,
  kind: "edit" | "combine",
  remaining: { edit: number; combine: number },
  activeVersionId?: string | null
): void {
  if (typeof window === "undefined") return;
  try {
    window.alert(
      proPackQuotaBlockedGuidance(locale, kind, remaining, activeVersionId)
    );
  } catch {
    /* ignore */
  }
}
