"use client";

import { useState, useEffect } from "react";
import { DEVICE_LAYOUT_MOBILE_MQ, layoutFromWidth } from "@/lib/deviceLayout";

/**
 * True → Mobile/Tablet UI tree (DemoMobile / StudioMobile).
 * `ssrIsMobile` avoids hydration mismatch; after mount, width wins (E-B).
 */
export function useDeviceDetect(ssrIsMobile = false): boolean {
  const [isMobile, setIsMobile] = useState(ssrIsMobile);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const apply = () => {
      if (typeof window.matchMedia === "function") {
        setIsMobile(window.matchMedia(DEVICE_LAYOUT_MOBILE_MQ).matches);
      } else {
        setIsMobile(layoutFromWidth(window.innerWidth) === "mobile");
      }
    };

    apply();

    const mq =
      typeof window.matchMedia === "function"
        ? window.matchMedia(DEVICE_LAYOUT_MOBILE_MQ)
        : null;

    if (mq?.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }

    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return isMobile;
}
