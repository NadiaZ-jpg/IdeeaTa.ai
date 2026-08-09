/**
 * Intrare pe rutele RO fără prefix (/demo, /studio, …):
 * - preferință limba (localStorage) + detecție browser
 * - păstrează query-ul (?sharedId=, ?start=nou, …)
 * - NU forțează redirect pe preferred când există sharedId
 *   (locale-ul planului partajat e sursa de adevăr — vezi pdfCtaBehavior)
 */

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
 * RO rămâne fără prefix; EN/ES → /en… /es…
 */
export function localizedPath(locale: AppLocale, pathRo: string): string {
  const clean = pathRo === "/" ? "" : pathRo;
  if (locale === "en") return `/en${clean}`;
  if (locale === "es") return `/es${clean}`;
  return clean || "/";
}

type ReplaceFn = (url: string) => void;

/**
 * Pe rutele RO: redirecționează spre EN/ES dacă preferred/browser o cer.
 * Returnează true dacă a pornit redirect (nu mai monta pagina RO).
 *
 * Excepție: ?sharedId= — nu redirecta după preferred (evită pierdere query + loop
 * cu redirectIfSharedLocaleMismatch).
 */
export function redirectRoEntryIfNeeded(
  replace: ReplaceFn,
  pathRo: string
): boolean {
  if (typeof window === "undefined") return false;

  // Plan partajat: locale-ul din share decide, nu preferred_language
  if (hasSharedPlanQuery()) return false;

  const search = currentSearch();
  const preferred = readPreferredLanguage();

  if (preferred === "en" || preferred === "es") {
    replace(`${localizedPath(preferred, pathRo)}${search}`);
    return true;
  }

  if (!preferred) {
    const detected = detectBrowserLocale();
    localStorage.setItem("preferred_language", detected);
    if (detected === "en" || detected === "es") {
      replace(`${localizedPath(detected, pathRo)}${search}`);
      return true;
    }
  }

  return false;
}
