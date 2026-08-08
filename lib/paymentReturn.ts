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
