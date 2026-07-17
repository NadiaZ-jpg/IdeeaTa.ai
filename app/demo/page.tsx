"use client";
import React from 'react';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import DemoDesktop from '@/components/DemoDesktop';
import DemoMobile from '@/components/DemoMobile';

export default function Home() {
  const isMobile = useDeviceDetect();

  if (isMobile) {
    return <DemoMobile />;
  }

  return <DemoDesktop />;
}
