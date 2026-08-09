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
      return "Credits added successfully! Your Pro Tools quotas were topped up.";
    }
    if (locale === "es") {
      return "¡Créditos añadidos con éxito! Se recargaron tus cuotas de Herramientas Pro.";
    }
    return "Credite adăugate cu succes! Cotele Instrumente Pro au fost reîncărcate.";
  }
  if (tier === "pro") {
    if (locale === "en") return "Unlimited Pro access is now active!";
    if (locale === "es") return "¡El acceso Pro ilimitado ya está activo!";
    return "Accesul Pro nelimitat este acum activ!";
  }
  if (tier === "eu-funds") {
    if (locale === "en") {
      return "Pro Tools package unlocked! You now have generations, Pro edits, and combinations.";
    }
    if (locale === "es") {
      return "¡Paquete Herramientas Pro desbloqueado! Ya tienes generaciones, ediciones Pro y combinaciones.";
    }
    return "Pachetul Instrumente Pro este deblocat! Ai generări, editări Pro și combinații.";
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
