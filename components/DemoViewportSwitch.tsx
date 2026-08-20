"use client";

import dynamic from "next/dynamic";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";

const shell = () => <div className="min-h-screen bg-[#09090b]" />;

const DemoDesktop = dynamic(() => import("@/components/DemoDesktop"), {
  ssr: false,
  loading: shell,
});

const DemoMobile = dynamic(() => import("@/components/DemoMobile"), {
  ssr: false,
  loading: shell,
});

type Locale = "ro" | "en" | "es";

/** E-B: pick Demo Mobile/Desktop from viewport width; SSR hint only for first paint. */
export default function DemoViewportSwitch({
  locale,
  ssrIsMobile,
}: {
  locale: Locale;
  ssrIsMobile: boolean;
}) {
  const isMobile = useDeviceDetect(ssrIsMobile);
  return isMobile ? <DemoMobile locale={locale} /> : <DemoDesktop locale={locale} />;
}
