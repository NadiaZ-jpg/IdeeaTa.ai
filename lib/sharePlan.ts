/**
 * Creare link-uri durable de share pe domeniul oficial (REGULA #5).
 * Folosit de Mobile Share și de export PDF.
 *
 * Comportamentul CTA din PDF (locale RO/EN/ES, Desktop+Mobile) → `lib/pdfCtaBehavior.ts`.
 */

import {
  PRODUCTION_ORIGIN,
  buildPdfCtaUrl,
  buildShortSharedUrl,
  normalizeAppLocale,
  type AppLocale,
} from "@/lib/pdfCtaBehavior";

export { PRODUCTION_ORIGIN };
export type { AppLocale };

/**
 * URL pentru PDF CTA / footer — path localizat direct (`/es/demo?sharedId=`).
 * Nu depinde de redirect-ul `/shared` (istoric RO-only).
 */
export function buildSharedPlanUrl(
  shareId: string,
  locale: AppLocale = "ro"
): string {
  return buildPdfCtaUrl(shareId, normalizeAppLocale(locale));
}

/** URL scurt `/shared/{id}?l=` pentru clipboard / share social. */
export function buildClipboardShareUrl(
  shareId: string,
  locale: AppLocale = "ro"
): string {
  return buildShortSharedUrl(shareId, normalizeAppLocale(locale));
}

/** POST /api/share — returnează id-ul documentului sau null. */
export async function createSharedPlan(
  planData: any,
  locale: AppLocale = "ro"
): Promise<string | null> {
  if (!planData?.nume) return null;
  try {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planData, locale: normalizeAppLocale(locale) }),
    });
    const data = await res.json();
    if (!res.ok || !data?.id) return null;
    return data.id as string;
  } catch (err) {
    console.error("Eroare generare share link:", err);
    return null;
  }
}

/**
 * Creează share durable și copiază linkul scurt în clipboard.
 * Returnează URL-ul sau null la eșec.
 */
export async function createAndCopySharedPlanLink(
  planData: any,
  locale: AppLocale = "ro"
): Promise<string | null> {
  const id = await createSharedPlan(planData, locale);
  if (!id) return null;
  const url = buildClipboardShareUrl(id, locale);
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  }
  return url;
}
