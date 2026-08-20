/**
 * E-B: Mobile vs Desktop UI by viewport width (not User-Agent alone).
 * Threshold matches Tailwind `lg` (1024px): width < 1024 → Mobile UI.
 */
export const DEVICE_LAYOUT_MOBILE_MAX_PX = 1024;

export type DeviceLayout = "mobile" | "desktop";

export function layoutFromWidth(width: number): DeviceLayout {
  return width < DEVICE_LAYOUT_MOBILE_MAX_PX ? "mobile" : "desktop";
}

/** matchMedia query for the mobile layout range */
export const DEVICE_LAYOUT_MOBILE_MQ = `(max-width: ${DEVICE_LAYOUT_MOBILE_MAX_PX - 1}px)`;
