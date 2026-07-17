"use client";
import React from 'react';
import Link from 'next/link';

export default function DemoMobile() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
        <span className="text-2xl">📱</span>
      </div>
      <h1 className="text-3xl font-black mb-4">Interfață Mobil / Tabletă</h1>
      <p className="text-zinc-400 max-w-md mb-8">
        Optimizăm spațiul de lucru Demo pentru ecrane de telefoane și tablete. Rămâi pe fază!
      </p>
      <Link href="/" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all">
        Mergi la Landing Page
      </Link>
    </div>
  );
}
