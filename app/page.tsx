"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPageContent from '@/components/LandingPageContent';
import { redirectRoEntryIfNeeded } from '@/lib/localeEntry';

export default function LandingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Landing: path RO = "" → /en sau /es (+ query dacă există)
    if (redirectRoEntryIfNeeded(router.replace.bind(router), "")) return;
    setReady(true);
  }, [router]);

  // Avoid blank-only mount: show shell immediately; content after locale check.
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100">
        <div className="w-full px-6 py-6 max-w-7xl mx-auto flex items-center gap-2 opacity-80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600" />
          <span className="text-xl font-black tracking-tight">IdeeaTa.ai</span>
        </div>
      </div>
    );
  }

  return <LandingPageContent locale="ro" />;
}
