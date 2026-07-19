"use client";
import React from 'react';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import StudioDesktop from '@/components/StudioDesktop';
import StudioMobile from '@/components/StudioMobile';

export default function StudioContent({ locale = "ro" }: { locale?: "ro" | "en" | "es" }) {
  const isMobile = useDeviceDetect();

  if (isMobile) {
    return <StudioMobile locale={locale} />;
  }

  return <StudioDesktop locale={locale} />;
}
