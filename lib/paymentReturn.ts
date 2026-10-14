/** Strip Lemon return params; keep planId/view for Studio/Demo continuity. */
export function stripPaymentSuccessParams(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const planId = url.searchParams.get("planId");
  const view = url.searchParams.get("view");
  const next = new URLSearchParams();
  if (planId) next.set("planId", planId);
  if (view) next.set("view", view);
  const q = next.toString();
  window.history.replaceState({}, document.title, url.pathname + (q ? `?${q}` : ""));
}

export function paymentSuccessMessage(
  tier: string | null,
  locale: string,
  planName?: string
): string {
  if (tier === "pro-topup") {
    if (locale === "en") {
      return "Top-up done! You got +5 plan generations, +4 Pro edits and +2 combinations.";
    }
    if (locale === "es") {
      return "¡Recarga hecha! Recibiste +5 generaciones de plan, +4 ediciones Pro y +2 combinaciones.";
    }
    return "Reîncărcare reușită! Ai primit +5 generări de plan, +4 editări Pro și +2 combinații.";
  }
  if (tier === "pro") {
    if (locale === "en") return "Unlimited Pro access is now active!";
    if (locale === "es") return "¡El acceso Pro ilimitado ya está activo!";
    return "Accesul Pro nelimitat este acum activ!";
  }
  if (tier === "eu-funds") {
    if (locale === "en") {
      return "Editing + Professional Tools Package active! You got +10 plan generations, +8 Pro edits and +4 combinations, shared across all your plans.";
    }
    if (locale === "es") {
      return "¡Paquete de Edición + Herramientas Profesionales activo! Recibiste +10 generaciones de plan, +8 ediciones Pro y +4 combinaciones, compartidas entre todos tus planes.";
    }
    return "Pachetul Editare + Instrumente Profesionale e activ! Ai primit +10 generări de plan, +8 editări Pro și +4 combinații, comune pentru toate planurile tale.";
  }
  if (tier === "standard" && !planName) {
    if (locale === "en") {
      return "Standard package active! You got 1 download credit: open the plan you want and download it in PDF, PPTX or Word.";
    }
    if (locale === "es") {
      return "¡Paquete Standard activo! Recibiste 1 crédito de descarga: abre el plan que quieras y descárgalo en PDF, PPTX o Word.";
    }
    return "Pachetul Standard e activ! Ai primit 1 credit de descărcare: deschide planul dorit și descarcă-l în PDF, PPTX sau Word.";
  }
  if (tier === "standard") {
    const name = planName || (locale === "en" ? "Plan" : locale === "es" ? "Plan" : "Plan");
    if (locale === "en") return `Standard package unlocked for “${name}”.`;
    if (locale === "es") return `Paquete Standard desbloqueado para “${name}”.`;
    return `Pachetul Standard este deblocat pentru „${name}”.`;
  }
  if (locale === "en") return "Payment confirmed! Your access was updated.";
  if (locale === "es") return "¡Pago confirmado! Tu acceso se actualizó.";
  return "Plată confirmată! Accesul tău a fost actualizat.";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Poll verify-checkout while webhook may still be in flight.
 * Returns true if unlocked.
 */
export async function pollVerifyCheckout(opts: {
  getIdToken: () => Promise<string>;
  tier: string | null;
  attempts?: number;
  intervalMs?: number;
}): Promise<boolean> {
  const attempts = opts.attempts ?? 8;
  const intervalMs = opts.intervalMs ?? 1500;
  for (let i = 0; i < attempts; i++) {
    try {
      const token = await opts.getIdToken();
      const res = await fetch(
        `/api/verify-checkout?tier=${encodeURIComponent(opts.tier || "")}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json().catch(() => ({}));
      if (data?.success) return true;
    } catch (e) {
      console.error("verify-checkout poll error:", e);
    }
    if (i < attempts - 1) await sleep(intervalMs);
  }
  return false;
}
