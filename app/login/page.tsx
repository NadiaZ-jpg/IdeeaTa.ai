"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginContent from './LoginContent';
import { redirectRoEntryIfNeeded } from '@/lib/localeEntry';

export default function LoginPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"ro" | "en" | "es">("ro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (redirectRoEntryIfNeeded(router.replace.bind(router), "/login")) return;
    setLocale("ro");
    setMounted(true);
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;
  return <LoginContent locale={locale} />;
}
