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
  locale: AppLocale = "ro",
  idToken?: string | null
): Promise<string | null> {
  if (!planData?.nume) return null;
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch("/api/share", {
      method: "POST",
      headers,
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
 * Creează share durable și distribuie via Web Share API sau copiază linkul în clipboard.
 * Returnează URL-ul sau null la eșec.
 */
export async function createAndCopySharedPlanLink(
  planData: any,
  locale: AppLocale = "ro",
  idToken?: string | null
): Promise<string | null> {
  const id = await createSharedPlan(planData, locale, idToken);
  if (!id) return null;
  const url = buildClipboardShareUrl(id, locale);

  if (typeof navigator !== "undefined") {
    // 1. Încercăm Web Share API nativ pe telefoane/tablete
    if (typeof navigator.share === "function") {
      try {
        const title = planData?.nume || "Plan de Afaceri - IdeeaTa.ai";
        await navigator.share({
          title,
          text: locale === "en" 
            ? `Check out this business plan: ${title}` 
            : locale === "es" 
            ? `Mira este plan de negocio: ${title}` 
            : `Vezi acest plan de afaceri: ${title}`,
          url,
        });
        return url;
      } catch (shareErr: any) {
        // Dacă utilizatorul anulează dialogul de share nativ, operațiunea rămâne un succes
        if (shareErr?.name === "AbortError") {
          return url;
        }
        console.warn("Web Share API failed, fallback to clipboard:", shareErr);
      }
    }

    // 2. Fallback la Clipboard securizat cu try/catch pentru prevenire NotAllowedError pe iOS Safari
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
      } catch (clipErr) {
        console.warn("Clipboard writeText failed on mobile:", clipErr);
        if (typeof window !== "undefined" && typeof window.prompt === "function") {
          window.prompt(
            locale === "en" ? "Copy link:" : locale === "es" ? "Copiar enlace:" : "Copiază link-ul:",
            url
          );
        }
      }
    }
  }
  return url;
}
