/** Client-side Lemon checkout for Pro Tools top-up (5 EUR / 25 RON). */

export type ProTopupLocale = "ro" | "en" | "es";

export function proTopupPriceLabel(locale: ProTopupLocale | string): string {
  return locale === "en" || locale === "es" ? "5 EUR" : "25 RON";
}

export function proTopupButtonLabel(locale: ProTopupLocale | string): string {
  const price = proTopupPriceLabel(locale);
  if (locale === "en") return `Add credits — ${price}`;
  if (locale === "es") return `Añadir créditos — ${price}`;
  return `Adaugă credite — ${price}`;
}

export function proTopupHintLabel(
  locale: ProTopupLocale | string,
  grants: { generate: number; edit: number; combine: number }
): string {
  const g = `+${grants.generate} · +${grants.edit} · +${grants.combine}`;
  if (locale === "en") return `Click to add credits (${g})`;
  if (locale === "es") return `Clic para añadir créditos (${g})`;
  return `Click pentru credite (${g})`;
}

export function proTopupCheckoutError(locale: ProTopupLocale | string): string {
  if (locale === "en") {
    return "Could not start checkout. Check Lemon env / restart server.";
  }
  if (locale === "es") {
    return "No se pudo iniciar el pago. Revisa env Lemon / reinicia el servidor.";
  }
  return "Nu s-a putut porni plata. Verifică env Lemon / restartează serverul.";
}

export async function startProTopupCheckout(opts: {
  getIdToken: () => Promise<string>;
  email?: string | null;
  locale: ProTopupLocale | string;
  /** App path without locale, e.g. /studio — where Lemon redirects after pay */
  returnPath?: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const locale = opts.locale || "ro";
  try {
    const token = await opts.getIdToken();
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tier: "pro-topup",
        email: opts.email,
        locale,
        returnPath: opts.returnPath || "/dashboard",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) {
      return {
        ok: false,
        error:
          (typeof data?.error === "string" && data.error) ||
          proTopupCheckoutError(locale),
      };
    }
    return { ok: true, url: String(data.url) };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || proTopupCheckoutError(locale),
    };
  }
}
