/**
 * F4 Phase 1 — canonical i18n entry for IdeeaTa.ai
 *
 * Prefer new imports from here:
 *   import { UI_STRINGS, t, translations, ui } from "@/lib/i18n"
 *
 * Data still lives in uiStrings.ts (Demo/Studio UI) and translations.ts (Landing/Footer).
 * Do NOT add a third string catalog — extend those modules and re-export here.
 */

export type AppLocale = "ro" | "en" | "es";

export { UI_STRINGS } from "@/lib/uiStrings";
export {
  translations,
  t,
  type TranslationKey,
} from "@/lib/translations";

import { UI_STRINGS } from "@/lib/uiStrings";

/** Typed bag for the active locale (fallback RO). */
export function ui(locale: AppLocale | string) {
  const loc = locale === "en" || locale === "es" ? locale : "ro";
  return UI_STRINGS[loc] || UI_STRINGS.ro;
}
