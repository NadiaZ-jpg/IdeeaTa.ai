"use client";
import React, { useEffect } from 'react';
import LandingPageContent from '@/components/LandingPageContent';

export default function LandingPageEs() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_language", "es");
    }
  }, []);

  return <LandingPageContent locale="es" />;
}
