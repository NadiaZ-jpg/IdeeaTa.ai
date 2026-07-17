"use client";
import React from 'react';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import StudioDesktop from '@/components/StudioDesktop';
import StudioMobile from '@/components/StudioMobile';

export default function Home() {
  const isMobile = useDeviceDetect();

  if (isMobile) {
    return <StudioMobile />;
  }

  return <StudioDesktop />;
}
