/**
 * E-B / Pasul 3: Mobile vs Desktop UI by viewport width (not User-Agent alone).
 * Threshold matches Tailwind `md` (768px): width < 768 → Mobile UI; Tablets (>= 768px) & Desktop → Desktop UI.
 */
export const DEVICE_LAYOUT_MOBILE_MAX_PX = 768;

export type DeviceLayout = "mobile" | "desktop";

export function layoutFromWidth(width: number): DeviceLayout {
  return width < DEVICE_LAYOUT_MOBILE_MAX_PX ? "mobile" : "desktop";
}

/** matchMedia query for the mobile layout range */
export const DEVICE_LAYOUT_MOBILE_MQ = `(max-width: ${DEVICE_LAYOUT_MOBILE_MAX_PX - 1}px)`;
