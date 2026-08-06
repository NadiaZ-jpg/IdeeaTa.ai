/**
 * Free-account tone rewrite quota (Studio + Demo).
 * First 2 tones (formal / creative) — max FREE_TONE_EDIT_LIMIT uses total.
 * Persuasive / friendly require Standard/Pro.
 */

export const FREE_TONE_KEYS = ["formal", "creative"] as const;
export const PRO_TONE_KEYS = ["persuasive", "friendly"] as const;
export const FREE_TONE_EDIT_LIMIT = 3;
export const TONE_EDIT_COUNT_KEY = "demoToneEditCount";

export type ToneKey = "formal" | "creative" | "persuasive" | "friendly";

export function normalizeToneKey(customStyle?: string | null): ToneKey | null {
  if (!customStyle) return null;
  const key = String(customStyle).trim().toLowerCase();
  if (
    key === "formal" ||
    key === "creative" ||
    key === "persuasive" ||
    key === "friendly"
  ) {
    return key;
  }
  // Legacy Romanian / descriptive strings from older UI
  if (key.includes("creativ") || key.includes("entuziast") || key.includes("enthusiastic")) {
    return "creative";
  }
  if (key.includes("persuasiv") || key.includes("vânzări") || key.includes("vanza") || key.includes("sales")) {
    return "persuasive";
  }
  if (key.includes("prietenos") || key.includes("casual") || key.includes("friendly") || key.includes("amigable")) {
    return "friendly";
  }
  if (key.includes("formal") || key.includes("corporat") || key.includes("profesion")) {
    return "formal";
  }
  return null;
}

export function isFreeToneKey(customStyle?: string | null): boolean {
  const key = normalizeToneKey(customStyle);
  return !!key && (FREE_TONE_KEYS as readonly string[]).includes(key);
}

export function isProToneKey(customStyle?: string | null): boolean {
  const key = normalizeToneKey(customStyle);
  return !!key && (PRO_TONE_KEYS as readonly string[]).includes(key);
}

export function getFreeToneEditCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(TONE_EDIT_COUNT_KEY) || "0", 10) || 0;
}

export function canUseFreeToneEdit(hasPaidToneAccess: boolean): boolean {
  if (hasPaidToneAccess) return true;
  return getFreeToneEditCount() < FREE_TONE_EDIT_LIMIT;
}

/** Call only after a successful tone rewrite. */
export function consumeFreeToneEdit(hasPaidToneAccess: boolean): void {
  if (hasPaidToneAccess || typeof window === "undefined") return;
  const next = getFreeToneEditCount() + 1;
  localStorage.setItem(TONE_EDIT_COUNT_KEY, String(next));
}

export function toneVersionKey(customStyle?: string | null): string {
  const toneType = normalizeToneKey(customStyle) || "formal";
  return `ton_${toneType}_${Date.now()}`;
}
