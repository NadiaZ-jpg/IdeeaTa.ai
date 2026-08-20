/**
 * Intrare pe rutele RO fără prefix (/demo, /studio, /privacy, /resurse, …):
 * - preferință limba (localStorage) + detecție browser
 * - păstrează query-ul (?sharedId=, ?start=nou, …)
 * - mapare slug-uri localizate (despre-noi ↔ about-us, resurse ↔ resources)
 * - NU forțează redirect pe preferred când există sharedId
 */

import { switchLocalePath } from "@/lib/localePaths";

export type AppLocale = "ro" | "en" | "es";

export function readPreferredLanguage(): AppLocale | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem("preferred_language");
  return v === "en" || v === "es" || v === "ro" ? v : null;
}

export function detectBrowserLocale(): AppLocale {
  if (typeof window === "undefined") return "ro";
  const lang = (navigator.language || navigator.languages?.[0] || "").toLowerCase();
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("en")) return "en";
  return "ro";
}

/** Query curent (`?sharedId=…`) — gol dacă nu există. */
export function currentSearch(): string {
  if (typeof window === "undefined") return "";
  return window.location.search || "";
}

export function hasSharedPlanQuery(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.has("sharedId") || q.has("shareId");
}

/**
 * Path localizat: pathRo = "/demo" | "/studio" | "/login" | "/dashboard" | "".
 * Preferă switchLocalePath (slug-uri EN/ES); fallback prefix.
 */
export function localizedPath(locale: AppLocale, pathRo: string): string {
  const clean = pathRo === "/" ? "/" : pathRo || "/";
  if (locale === "ro") return clean === "/" ? "/" : clean;
  const mapped = switchLocalePath(clean, "ro", locale);
  if (mapped && mapped !== clean) return mapped;
  if (locale === "en") return clean === "/" ? "/en" : `/en${clean}`;
  if (locale === "es") return clean === "/" ? "/es" : `/es${clean}`;
  return clean;
}

type ReplaceFn = (url: string) => void;

/**
 * Pe rutele RO: redirecționează spre EN/ES dacă preferred/browser o cer.
 * Returnează true dacă a pornit redirect (nu mai monta pagina RO).
 *
 * Excepție: ?sharedId= — nu redirecta după preferred.
 * F2: folosește pathname curent + switchLocalePath (legal/resurse).
 */
export function redirectRoEntryIfNeeded(
  replace: ReplaceFn,
  pathRo: string
): boolean {
  if (typeof window === "undefined") return false;

  if (hasSharedPlanQuery()) return false;

  const search = currentSearch();
  const preferred = readPreferredLanguage();
  const currentPath = window.location.pathname || pathRo || "/";

  const go = (locale: "en" | "es") => {
    const target = switchLocalePath(currentPath, "ro", locale);
    if (!target || target === currentPath) {
      replace(`${localizedPath(locale, pathRo || currentPath)}${search}`);
      return;
    }
    replace(`${target}${search}`);
  };

  // Already on preferred locale path — no redirect (EN/ES pages that also mount the guard).
  if (preferred === "en" && (currentPath === "/en" || currentPath.startsWith("/en/"))) {
    return false;
  }
  if (preferred === "es" && (currentPath === "/es" || currentPath.startsWith("/es/"))) {
    return false;
  }

  if (preferred === "en" || preferred === "es") {
    go(preferred);
    return true;
  }

  if (!preferred) {
    const detected = detectBrowserLocale();
    localStorage.setItem("preferred_language", detected);
    if (detected === "en" || detected === "es") {
      go(detected);
      return true;
    }
  }

  return false;
}
