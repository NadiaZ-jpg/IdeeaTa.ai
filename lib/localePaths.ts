/**
 * Locale path mapping for LanguageSwitcher (RO / EN / ES).
 * Prefixed routes that share the same slug still use prefix-only logic.
 */

import { RESOURCE_ARTICLES, RESOURCE_HUB, type ResourceLocale } from "@/lib/resourceContent";

export type AppLocale = ResourceLocale;

/** Exact path triples that differ by locale slug (not just /en|/es prefix). */
const STATIC_LOCALE_PATHS: Array<Record<AppLocale, string>> = [
  { ro: "/", en: "/en", es: "/es" },
  { ro: "/despre-noi", en: "/en/about-us", es: "/es/about-us" },
  { ro: "/contact", en: "/en/contact", es: "/es/contact" },
  { ro: "/termeni", en: "/en/terms", es: "/es/terms" },
  { ro: "/privacy", en: "/en/privacy", es: "/es/privacy" },
  { ro: "/cookies", en: "/en/cookies", es: "/es/cookies" },
  { ro: "/demo", en: "/en/demo", es: "/es/demo" },
  { ro: "/studio", en: "/en/studio", es: "/es/studio" },
  { ro: "/login", en: "/en/login", es: "/es/login" },
  { ro: "/dashboard", en: "/en/dashboard", es: "/es/dashboard" },
  { ro: "/auth/action", en: "/en/auth/action", es: "/es/auth/action" },
  {
    ro: RESOURCE_HUB.ro.path,
    en: RESOURCE_HUB.en.path,
    es: RESOURCE_HUB.es.path,
  },
];

function allMappedTriples(): Array<Record<AppLocale, string>> {
  const articles = RESOURCE_ARTICLES.map((a) => ({
    ro: a.path.ro,
    en: a.path.en,
    es: a.path.es,
  }));
  return [...STATIC_LOCALE_PATHS, ...articles];
}

function normalizePath(pathname: string | null | undefined): string {
  if (!pathname) return "/";
  const p = pathname.split("?")[0] || "/";
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p || "/";
}

/**
 * Switch pathname to another locale, mapping localized slugs when needed.
 * Falls back to /en|/es prefix swap for unmapped routes (e.g. /shared/...).
 */
export function switchLocalePath(
  pathname: string,
  _fromLocale: AppLocale,
  toLocale: AppLocale
): string {
  const current = normalizePath(pathname);

  for (const triple of allMappedTriples()) {
    if (triple.ro === current || triple.en === current || triple.es === current) {
      return triple[toLocale];
    }
  }

  // Prefix-only fallback for unmapped paths
  let cleanPath = current;
  if (cleanPath.startsWith("/en/") || cleanPath === "/en") {
    cleanPath = cleanPath === "/en" ? "/" : cleanPath.slice(3) || "/";
  } else if (cleanPath.startsWith("/es/") || cleanPath === "/es") {
    cleanPath = cleanPath === "/es" ? "/" : cleanPath.slice(3) || "/";
  }

  if (toLocale === "en") {
    return cleanPath === "/" ? "/en" : `/en${cleanPath}`;
  }
  if (toLocale === "es") {
    return cleanPath === "/" ? "/es" : `/es${cleanPath}`;
  }
  return cleanPath;
}
