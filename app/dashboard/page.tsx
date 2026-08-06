"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardContent from './DashboardContent';
import { redirectRoEntryIfNeeded } from '@/lib/localeEntry';

export default function DashboardPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"ro" | "en" | "es">("ro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (redirectRoEntryIfNeeded(router.replace.bind(router), "/dashboard")) return;
    setLocale("ro");
    setMounted(true);
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;
  return <DashboardContent locale={locale} />;
}
