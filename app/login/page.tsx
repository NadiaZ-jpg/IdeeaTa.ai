"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginContent from './LoginContent';

export default function LoginPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"ro" | "en" | "es">("ro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const preferred = localStorage.getItem("preferred_language");
    if (preferred === "en") { router.replace("/en/login"); return; }
    if (preferred === "es") { router.replace("/es/login"); return; }
    if (!preferred) {
      const lang = (navigator.language || navigator.languages?.[0] || "").toLowerCase();
      if (lang.startsWith("es")) { localStorage.setItem("preferred_language", "es"); router.replace("/es/login"); return; }
      if (lang.startsWith("en")) { localStorage.setItem("preferred_language", "en"); router.replace("/en/login"); return; }
      localStorage.setItem("preferred_language", "ro");
    }
    setLocale("ro");
    setMounted(true);
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;
  return <LoginContent locale={locale} />;
}
