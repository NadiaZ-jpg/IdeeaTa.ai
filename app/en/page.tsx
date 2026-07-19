"use client";
import React, { useEffect } from 'react';
import LandingPageContent from '@/components/LandingPageContent';

export default function LandingPageEn() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_language", "en");
    }
  }, []);

  return <LandingPageContent locale="en" />;
}
