"use client";
import React from 'react';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import DemoDesktop from '@/components/DemoDesktop';
import DemoMobile from '@/components/DemoMobile';

export default function DemoContent({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const isMobile = useDeviceDetect();

  if (isMobile) {
    return <DemoMobile locale={locale} />;
  }

  return <DemoDesktop locale={locale} />;
}
