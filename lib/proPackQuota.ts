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
