"use client";
import React from 'react';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import DemoDesktop from '@/components/DemoDesktop';
import DemoMobile from '@/components/DemoMobile';

export default function DemoContent({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const isMobile = useDeviceDetect();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#09090b]" />;
  }

  if (isMobile) {
    return <DemoMobile locale={locale} />;
  }

  return <DemoDesktop locale={locale} />;
}
