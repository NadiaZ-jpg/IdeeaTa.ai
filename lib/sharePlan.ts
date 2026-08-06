/**
 * Creare link-uri durable de share pe domeniul oficial (REGULA #5).
 * Folosit de Mobile Share și de export PDF.
 */

export const PRODUCTION_ORIGIN = "https://ideeata.ai";

export function buildSharedPlanUrl(shareId: string): string {
  return `${PRODUCTION_ORIGIN}/shared/${shareId}`;
}

/** POST /api/share — returnează id-ul documentului sau null. */
export async function createSharedPlan(
  planData: any,
  locale: "ro" | "en" | "es" = "ro"
): Promise<string | null> {
  if (!planData?.nume) return null;
  try {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planData, locale }),
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
 * Creează share durable și copiază https://ideeata.ai/shared/{id} în clipboard.
 * Returnează URL-ul sau null la eșec.
 */
export async function createAndCopySharedPlanLink(
  planData: any,
  locale: "ro" | "en" | "es" = "ro"
): Promise<string | null> {
  const id = await createSharedPlan(planData, locale);
  if (!id) return null;
  const url = buildSharedPlanUrl(id);
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  }
  return url;
}
