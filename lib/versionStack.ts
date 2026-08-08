/**
 * Version history + "Combine with…" rules for Studio (Desktop & Mobile).
 * Locales: RO / EN / ES.
 *
 * Product rules (frozen):
 * - Free: no combine stack (limit 0)
 * - Standard: max 2 tools per version stack
 * - Full Access: max 4 tools per version stack
 * - Toolbar tools (sidebar): each run creates a NEW sibling tab from Original (stack depth 1)
 * - Combine (+) on a tab: applies on that tab's content → NEW tab with appended stack
 * - Download uses the active tab's plan
 */

export const STANDARD_STACK_LIMIT = 2;
export const FULL_STACK_LIMIT = 4;
/** Free can create a single-tool tab (e.g. tone), but cannot combine further. */
export const FREE_STACK_LIMIT = 1;

export type VersionLocale = "ro" | "en" | "es";

export type VersionToolType =
  | "tone"
  | "budget"
  | "eu_funds"
  | "investor"
  | "expert";

export type VersionToneStyle = "formal" | "creative" | "persuasive" | "friendly";

export type VersionToolStep = {
  type: VersionToolType;
  /** Required when type === "tone" */
  tone?: VersionToneStyle;
  /** Optional when type === "budget" (percent 1–90) */
  percent?: number;
};

export type VersionStackAccess = {
  isAdmin?: boolean;
  /** Full / Pro: subscription, full-access promo, EU funds unlock */
  hasFullAccess?: boolean;
  /** Standard package (or any paid that includes standard tools) */
  hasStandardAccess?: boolean;
  /** Can run EU funds + investor + budget optimize tools */
  hasProTools?: boolean;
};

export type CombineAction =
  | { action: "professional_tone"; customStyle: VersionToneStyle }
  | { action: "optimize_budget" }
  | { action: "eu_funds_optimization" }
  | { action: "investor_ready" }
  | { action: "add_sections" };

const STACK_META_KEY = "_versionStack";

/** Max tools allowed on one version chain for this user. */
export function getVersionStackLimit(access: VersionStackAccess): number {
  if (access.isAdmin || access.hasFullAccess) return FULL_STACK_LIMIT;
  if (access.hasStandardAccess) return STANDARD_STACK_LIMIT;
  return FREE_STACK_LIMIT;
}

export function canUseVersionCombine(access: VersionStackAccess): boolean {
  // Combine menu only for Standard+ (limit >= 2)
  return getVersionStackLimit(access) >= STANDARD_STACK_LIMIT;
}

export function getVersionStack(planOrMeta: any): VersionToolStep[] {
  if (!planOrMeta || typeof planOrMeta !== "object") return [];
  const raw = planOrMeta[STACK_META_KEY] ?? planOrMeta.stack;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s: any): VersionToolStep | null => {
      if (!s || typeof s !== "object") return null;
      const type = s.type as VersionToolType;
      if (!["tone", "budget", "eu_funds", "investor", "expert"].includes(type)) {
        return null;
      }
      const step: VersionToolStep = { type };
      if (type === "tone" && s.tone) step.tone = s.tone;
      if (type === "budget" && typeof s.percent === "number") step.percent = s.percent;
      return step;
    })
    .filter(Boolean) as VersionToolStep[];
}

export function withVersionStack<T extends Record<string, any>>(
  plan: T,
  stack: VersionToolStep[]
): T {
  return { ...plan, [STACK_META_KEY]: stack };
}

export function stripVersionStackMeta<T extends Record<string, any>>(plan: T): T {
  if (!plan || typeof plan !== "object") return plan;
  const next = { ...plan };
  delete (next as any)[STACK_META_KEY];
  return next;
}

export function toolStepFromAction(
  action: string,
  customStyle?: string | null,
  percent?: number | null
): VersionToolStep | null {
  if (action === "professional_tone") {
    const tone = (String(customStyle || "formal").toLowerCase() ||
      "formal") as VersionToneStyle;
    return { type: "tone", tone };
  }
  if (action === "optimize_budget") {
    return {
      type: "budget",
      percent: percent && percent > 0 ? percent : undefined,
    };
  }
  if (action === "eu_funds_optimization") return { type: "eu_funds" };
  if (action === "investor_ready") return { type: "investor" };
  if (action === "add_sections") return { type: "expert" };
  return null;
}

export function inferStackFromVersionKey(vKey: string): VersionToolStep[] {
  if (!vKey || vKey === "original") return [];
  if (vKey.startsWith("ton_")) {
    const tone = (vKey.split("_")[1] || "formal") as VersionToneStyle;
    return [{ type: "tone", tone }];
  }
  if (vKey.startsWith("budget_")) return [{ type: "budget" }];
  if (vKey.startsWith("eu_funds")) return [{ type: "eu_funds" }];
  if (vKey.startsWith("investor")) return [{ type: "investor" }];
  if (vKey.startsWith("expert_")) return [{ type: "expert" }];
  if (vKey.startsWith("stack_")) {
    // Encoded as stack_<types...>_<timestamp> — prefer meta on plan when present
    return [];
  }
  return [];
}

export function resolveVersionStack(vKey: string, plan: any): VersionToolStep[] {
  const embedded = getVersionStack(plan);
  if (embedded.length > 0) return embedded;
  return inferStackFromVersionKey(vKey);
}

export type StackGateResult =
  | { ok: true; nextStack: VersionToolStep[] }
  | { ok: false; reason: "no_access" | "limit" | "invalid"; limit: number; current: number };

/** Gate before running a combine / tool that creates a new history tab. */
export function gateVersionStackAppend(
  currentStack: VersionToolStep[],
  nextStep: VersionToolStep,
  access: VersionStackAccess
): StackGateResult {
  const limit = getVersionStackLimit(access);
  if (limit <= 0) {
    return { ok: false, reason: "no_access", limit, current: currentStack.length };
  }
  if (currentStack.length >= limit) {
    return { ok: false, reason: "limit", limit, current: currentStack.length };
  }
  return { ok: true, nextStack: [...currentStack, nextStep] };
}

/** Build a stable unique version key for a combined (or single) stack. */
export function buildStackedVersionKey(stack: VersionToolStep[]): string {
  if (stack.length === 0) return "original";
  if (stack.length === 1) {
    const s = stack[0];
    const ts = Date.now();
    if (s.type === "tone") return `ton_${s.tone || "formal"}_${ts}`;
    if (s.type === "budget") return `budget_${ts}`;
    if (s.type === "eu_funds") return `eu_funds_${ts}`;
    if (s.type === "investor") return `investor_${ts}`;
    if (s.type === "expert") return `expert_${ts}`;
  }
  const parts = stack.map((s) => {
    if (s.type === "tone") return `t${(s.tone || "formal").slice(0, 3)}`;
    if (s.type === "budget") return "bgt";
    if (s.type === "eu_funds") return "eu";
    if (s.type === "investor") return "inv";
    return "exp";
  });
  return `stack_${parts.join("-")}_${Date.now()}`;
}

/** Loose UI string bag (UI_STRINGS[locale] has mixed fields). */
export type VersionUiStrings = Record<string, unknown>;

function uiStr(ui: VersionUiStrings | undefined, key: string): string | undefined {
  const v = ui?.[key];
  return typeof v === "string" ? v : undefined;
}

function stepLabel(step: VersionToolStep, locale: VersionLocale, ui?: VersionUiStrings): string {
  if (step.type === "eu_funds") {
    return uiStr(ui, "versionEuFunds") || (locale === "en" ? "EU Funds" : locale === "es" ? "Fondos UE" : "Fonduri UE");
  }
  if (step.type === "investor") {
    return uiStr(ui, "versionInvestor") || (locale === "en" ? "Investors" : locale === "es" ? "Inversores" : "Investitori");
  }
  if (step.type === "budget") {
    const base =
      uiStr(ui, "versionBudget") ||
      (locale === "en" ? "Budget" : locale === "es" ? "Presupuesto" : "Buget");
    return step.percent ? `${base} -${step.percent}%` : base;
  }
  if (step.type === "expert") {
    return uiStr(ui, "versionExpert") || (locale === "en" ? "Expert" : locale === "es" ? "Experto" : "Expert");
  }
  // tone
  const tone = step.tone || "formal";
  if (tone === "creative") {
    return uiStr(ui, "toneCreative") || (locale === "en" ? "Creative" : locale === "es" ? "Creativo" : "Creativ");
  }
  if (tone === "persuasive") {
    return uiStr(ui, "tonePersuasive") || (locale === "en" ? "Persuasive" : locale === "es" ? "Persuasivo" : "Persuasiv");
  }
  if (tone === "friendly") {
    return uiStr(ui, "toneFriendly") || (locale === "en" ? "Friendly" : locale === "es" ? "Amigable" : "Prietenos");
  }
  return uiStr(ui, "toneProfessional") || (locale === "en" ? "Professional" : locale === "es" ? "Profesional" : "Profesional");
}

function stepIcon(step: VersionToolStep): string {
  if (step.type === "eu_funds") return "🇪🇺";
  if (step.type === "investor") return "🏦";
  if (step.type === "budget") return "📉";
  if (step.type === "expert") return "🏛️";
  return "🪄";
}

/** Short tab title for Desktop/Mobile history (RO/EN/ES via ui + locale fallback). */
export function formatVersionTabTitle(
  vKey: string,
  plan: any,
  locale: VersionLocale,
  ui?: VersionUiStrings
): string {
  if (vKey === "original") {
    return `📝 ${uiStr(ui, "versionOriginal") || (locale === "en" ? "Original Version" : locale === "es" ? "Versión Original" : "Varianta Originală")}`;
  }
  const stack = resolveVersionStack(vKey, plan);
  if (stack.length === 0) {
    return `📑 ${vKey}`;
  }
  if (stack.length === 1) {
    const s = stack[0];
    return `${stepIcon(s)} ${stepLabel(s, locale, ui)}`;
  }
  // Combined: "🇪🇺 Fondos UE + 🪄 Persuasivo"
  return stack.map((s) => `${stepIcon(s)} ${stepLabel(s, locale, ui)}`).join(" + ");
}

export type CombineMenuItem = {
  id: string;
  label: string;
  combine: CombineAction;
  requiresProTools?: boolean;
};

/** Tools shown in "Combină cu…" for the given access + locale. */
export function getCombineMenuItems(
  locale: VersionLocale,
  access: VersionStackAccess,
  ui?: VersionUiStrings
): CombineMenuItem[] {
  if (!canUseVersionCombine(access)) return [];

  const items: CombineMenuItem[] = [
    {
      id: "tone_formal",
      label: uiStr(ui, "toneProfessional") || (locale === "en" ? "Professional tone" : locale === "es" ? "Tono profesional" : "Ton profesional"),
      combine: { action: "professional_tone", customStyle: "formal" },
    },
    {
      id: "tone_creative",
      label: uiStr(ui, "toneCreative") || (locale === "en" ? "Creative tone" : locale === "es" ? "Tono creativo" : "Ton creativ"),
      combine: { action: "professional_tone", customStyle: "creative" },
    },
    {
      id: "tone_persuasive",
      label: uiStr(ui, "tonePersuasive") || (locale === "en" ? "Persuasive tone" : locale === "es" ? "Tono persuasivo" : "Ton persuasiv"),
      combine: { action: "professional_tone", customStyle: "persuasive" },
    },
    {
      id: "tone_friendly",
      label: uiStr(ui, "toneFriendly") || (locale === "en" ? "Friendly tone" : locale === "es" ? "Tono amigable" : "Ton prietenos"),
      combine: { action: "professional_tone", customStyle: "friendly" },
    },
  ];

  if (access.hasProTools || access.hasFullAccess || access.isAdmin) {
    items.push(
      {
        id: "budget",
        label: uiStr(ui, "optimizeBudget") || (locale === "en" ? "Optimize budget" : locale === "es" ? "Optimizar presupuesto" : "Optimizează bugetul"),
        combine: { action: "optimize_budget" },
        requiresProTools: true,
      },
      {
        id: "eu_funds",
        label: uiStr(ui, "versionEuFunds") || (locale === "en" ? "EU Funds" : locale === "es" ? "Fondos UE" : "Fonduri UE"),
        combine: { action: "eu_funds_optimization" },
        requiresProTools: true,
      },
      {
        id: "investor",
        label: uiStr(ui, "versionInvestor") || (locale === "en" ? "Investors plan" : locale === "es" ? "Plan inversores" : "Plan investitori"),
        combine: { action: "investor_ready" },
        requiresProTools: true,
      }
    );
  }

  return items;
}

export function combineWithLabel(locale: VersionLocale): string {
  if (locale === "en") return "Combine with…";
  if (locale === "es") return "Combinar con…";
  return "Combină cu…";
}

/** Standard (not Full/Admin): show upgrade hint under Combine menu. */
export function isStandardOnlyCombineAccess(access: VersionStackAccess): boolean {
  return !!(
    access.hasStandardAccess &&
    !access.hasFullAccess &&
    !access.hasProTools &&
    !access.isAdmin
  );
}

export function combineFullAccessHint(locale: VersionLocale): string {
  if (locale === "en") {
    return "Full Access unlocks: Optimize budget, EU Funds, and Investors plan in this menu.";
  }
  if (locale === "es") {
    return "Full Access desbloquea: Optimizar presupuesto, Fondos UE y Plan inversores en este menú.";
  }
  return "Full Access deblochează: Optimizează bugetul, Fonduri UE și Plan investitori în acest meniu.";
}

export function stackLimitReachedMessage(
  locale: VersionLocale,
  limit: number,
  isStandardOnly: boolean
): string {
  if (locale === "en") {
    return isStandardOnly
      ? `Standard allows up to ${limit} tools per version. Upgrade to Full Access for up to ${FULL_STACK_LIMIT}.`
      : `You reached the limit of ${limit} tools on this version stack.`;
  }
  if (locale === "es") {
    return isStandardOnly
      ? `Standard permite hasta ${limit} herramientas por versión. Mejora a Full Access para hasta ${FULL_STACK_LIMIT}.`
      : `Alcanzaste el límite de ${limit} herramientas en esta combinación.`;
  }
  return isStandardOnly
    ? `Standard permite maxim ${limit} instrumente pe versiune. Upgrade la Full Access pentru până la ${FULL_STACK_LIMIT}.`
    : `Ai atins limita de ${limit} instrumente pe această combinație.`;
}

export function noCombineAccessMessage(locale: VersionLocale): string {
  if (locale === "en") return "Version combinations require a Standard or Full Access plan.";
  if (locale === "es") return "Las combinaciones de versiones requieren el plan Standard o Full Access.";
  return "Combinațiile de versiuni necesită pachetul Standard sau Full Access.";
}
