"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPageContent from '@/components/LandingPageContent';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const preferred = localStorage.getItem("preferred_language");
      if (preferred) {
        if (preferred === "en") {
          router.replace("/en");
          return;
        } else if (preferred === "es") {
          router.replace("/es");
          return;
        }
      } else {
        // Detecție pe baza limbii browserului
        const browserLang = (navigator.language || navigator.languages?.[0] || "").toLowerCase();
        if (browserLang.startsWith("es")) {
          localStorage.setItem("preferred_language", "es");
          router.replace("/es");
          return;
        } else if (browserLang.startsWith("en")) {
          localStorage.setItem("preferred_language", "en");
          router.replace("/en");
          return;
        } else {
          localStorage.setItem("preferred_language", "ro");
        }
      }
      setMounted(true);
    }
  }, [router]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#09090b]"></div>;
  }

  return <LandingPageContent locale="ro" />;
}
