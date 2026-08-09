/**
 * Comportament unic al butonului / link-urilor din PDF (sumar + brochure),
 * pe Desktop + Mobile și RO / EN / ES.
 *
 * IMPORTANT: linkul din PDF deschide DIRECT ruta localizată
 * (`/es/demo?sharedId=…`), NU se bazează pe redirect-ul `/shared/[id]`
 * (care istoric ducea mereu pe `/demo` RO).
 */

import type { jsPDF } from "jspdf";

/** REGULA #5 — domeniul oficial în PDF / share (fără preview Vercel). */
export const PRODUCTION_ORIGIN = "https://ideeata.ai";

export type AppLocale = "ro" | "en" | "es";

export function normalizeAppLocale(value: unknown): AppLocale {
  return value === "en" || value === "es" ? value : "ro";
}

/** Prefix path pentru locale (RO = fără prefix). */
export function localePathPrefix(locale: AppLocale): string {
  if (locale === "en") return "/en";
  if (locale === "es") return "/es";
  return "";
}

/**
 * Destinația unde se deschide planul partajat (Demo Desktop + Mobile).
 * Aceeași rută pe toate dispozitivele — layout-ul e ales de DemoContent.
 */
export function sharedPlanOpenPath(locale: AppLocale, shareId: string): string {
  const id = encodeURIComponent(shareId);
  return `${localePathPrefix(locale)}/demo?sharedId=${id}`;
}

/**
 * URL absolut lipit pe CTA-ul din PDF + footer (REGULA #5: ideeata.ai).
 * Include mereu locale-ul în path — independent de `/shared` redirect.
 */
export function buildPdfCtaUrl(shareId: string, locale: AppLocale): string {
  return `${PRODUCTION_ORIGIN}${sharedPlanOpenPath(normalizeAppLocale(locale), shareId)}`;
}

/** Fallback CTA când share-ul nu s-a creat — Demo localizat, fără sharedId fals. */
export function buildPdfCtaFallbackUrl(locale: AppLocale): string {
  const loc = normalizeAppLocale(locale);
  const start = loc === "en" ? "new" : loc === "es" ? "nuevo" : "nou";
  return `${PRODUCTION_ORIGIN}${localePathPrefix(loc)}/demo?start=${start}`;
}

/**
 * URL scurt pentru clipboard / share social (`/shared/{id}?l=`).
 * `l=` e fallback dacă redirect-ul server nu citește locale din DB.
 */
export function buildShortSharedUrl(shareId: string, locale: AppLocale): string {
  const loc = normalizeAppLocale(locale);
  const q = loc === "ro" ? "" : `?l=${loc}`;
  return `${PRODUCTION_ORIGIN}/shared/${shareId}${q}`;
}

/** Monedă implicită pe view partajat / UI non-RO. */
export function defaultCurrencyForLocale(locale: AppLocale): "LEI" | "EUR" {
  return normalizeAppLocale(locale) === "ro" ? "LEI" : "EUR";
}

export function resolveSharedViewCurrency(
  plan: { selectedCurrency?: string } | null | undefined,
  locale: AppLocale
): string {
  return plan?.selectedCurrency || defaultCurrencyForLocale(locale);
}

/**
 * Toggle LEI/EUR: doar RO și doar când NU e view din PDF/share.
 * EN/ES și shared view → ascuns pe Desktop + Mobile.
 */
export function shouldShowCurrencyToggle(
  locale: AppLocale,
  isSharedView: boolean
): boolean {
  return normalizeAppLocale(locale) === "ro" && !isSharedView;
}

export type AttachPdfCtaLinksOptions = {
  /** Index 0-based al paginii curente în bucla de export */
  pageIndex: number;
  totalPages: number;
  /** true pentru exportul sumar gratuit (ultimul slide = CTA) */
  isSummaryExport: boolean;
  ctaUrl: string;
};

/**
 * Atașează zone clickabile pe pagina PDF:
 * - pe ultimul slide (CTA) → tot slide-ul
 * - pe fiecare pagină → banda footer
 */
export function attachPdfCtaLinks(
  pdf: jsPDF,
  { pageIndex, totalPages, isSummaryExport, ctaUrl }: AttachPdfCtaLinksOptions
): void {
  if (!ctaUrl) return;

  const isLastPage = pageIndex === totalPages - 1;
  if (isSummaryExport && isLastPage) {
    // Întregul slide CTA (1280×720 landscape)
    pdf.link(0, 0, 1280, 720, { url: ctaUrl });
  }

  // Footer pe fiecare pagină
  pdf.link(300, 680, 680, 40, { url: ctaUrl });
}

/**
 * Dacă locale-ul share ≠ pagina curentă → redirect pe ruta corectă.
 * Returnează true dacă a pornit navigarea (oprește load-ul local).
 */
export function redirectToSharedPlanLocale(
  shareLocale: AppLocale,
  pageLocale: AppLocale,
  shareId: string
): boolean {
  if (typeof window === "undefined") return false;
  const target = normalizeAppLocale(shareLocale);
  const current = normalizeAppLocale(pageLocale);
  if (target === current) return false;
  window.location.replace(sharedPlanOpenPath(target, shareId));
  return true;
}
