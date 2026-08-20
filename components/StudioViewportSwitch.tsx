"use client";

import dynamic from "next/dynamic";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";

const shell = () => <div className="min-h-screen bg-[#09090b]" />;

const StudioDesktop = dynamic(() => import("@/components/StudioDesktop"), {
  ssr: false,
  loading: shell,
});

const StudioMobile = dynamic(() => import("@/components/StudioMobile"), {
  ssr: false,
  loading: shell,
});

type Locale = "ro" | "en" | "es";

/** E-B: pick Studio Mobile/Desktop from viewport width; SSR hint only for first paint. */
export default function StudioViewportSwitch({
  locale,
  ssrIsMobile,
}: {
  locale: Locale;
  ssrIsMobile: boolean;
}) {
  const isMobile = useDeviceDetect(ssrIsMobile);
  return isMobile ? <StudioMobile locale={locale} /> : <StudioDesktop locale={locale} />;
}
