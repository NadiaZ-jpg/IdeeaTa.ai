"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudioContent from './StudioContent';

export default function StudioPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"ro" | "en" | "es">("ro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const preferred = localStorage.getItem("preferred_language");
    if (preferred === "en") { router.replace("/en/studio"); return; }
    if (preferred === "es") { router.replace("/es/studio"); return; }
    if (!preferred) {
      const lang = (navigator.language || navigator.languages?.[0] || "").toLowerCase();
      if (lang.startsWith("es")) { localStorage.setItem("preferred_language", "es"); router.replace("/es/studio"); return; }
      if (lang.startsWith("en")) { localStorage.setItem("preferred_language", "en"); router.replace("/en/studio"); return; }
      localStorage.setItem("preferred_language", "ro");
    }
    setLocale("ro");
    setMounted(true);
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;
  return <StudioContent locale={locale} />;
}
