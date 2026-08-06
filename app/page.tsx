"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPageContent from '@/components/LandingPageContent';
import { redirectRoEntryIfNeeded } from '@/lib/localeEntry';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Landing: path RO = "" → /en sau /es (+ query dacă există)
    if (redirectRoEntryIfNeeded(router.replace.bind(router), "")) return;
    setMounted(true);
  }, [router]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#09090b]"></div>;
  }

  return <LandingPageContent locale="ro" />;
}
