"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DemoContent from './DemoContent';

export default function DemoPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"ro" | "en" | "es">("ro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const preferred = localStorage.getItem("preferred_language");
    if (preferred === "en") { router.replace("/en/demo"); return; }
    if (preferred === "es") { router.replace("/es/demo"); return; }
    if (!preferred) {
      const lang = (navigator.language || navigator.languages?.[0] || "").toLowerCase();
      if (lang.startsWith("es")) { localStorage.setItem("preferred_language", "es"); router.replace("/es/demo"); return; }
      if (lang.startsWith("en")) { localStorage.setItem("preferred_language", "en"); router.replace("/en/demo"); return; }
      localStorage.setItem("preferred_language", "ro");
    }
    setLocale("ro");
    setMounted(true);
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;
  return <DemoContent locale={locale} />;
}
