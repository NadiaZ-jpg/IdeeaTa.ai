"use client";
import React from 'react';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import StudioDesktop from '@/components/StudioDesktop';
import StudioMobile from '@/components/StudioMobile';

export default function StudioContent({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const isMobile = useDeviceDetect();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#09090b]" />;
  }

  if (isMobile) {
    return <StudioMobile locale={locale} />;
  }

  return <StudioDesktop locale={locale} />;
}
