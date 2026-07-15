"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Asigură că la refresh pagina începe mereu de sus
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return (
    <div 
      className="min-h-screen bg-[#09090b] text-zinc-100 font-sans select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Background Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <span className="text-xl font-black text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text tracking-tight">IdeeaTa.ai</span>
        </div>
        <div className="flex items-center gap-4">
          {!isLoading && (
            isLoggedIn ? (
              <Link 
                href="/studio" 
                className="text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2 transition-colors"
              >
                Intră în Studio &rarr;
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2 transition-colors"
              >
                Autentificare
              </Link>
            )
          )}
          <Link 
            href="/demo?start=nou" 
            className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Testează Gratuit
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center pt-24 pb-32 px-4 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
            Cel mai avansat asistent pentru antreprenori
          </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1] max-w-4xl">
          De la o simplă idee la un <br className="hidden md:block"/>
          <span className="text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text">Plan de Afaceri</span> complet.
        </h1>
        
        <div className="mb-10 max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-4">
            Generează instantaneu documentația completă pentru a obține finanțare, credite bancare sau fonduri europene.
          </p>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
            Structurat la milimetru, fără bătăi de cap.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link 
            href="/demo?start=nou"
            className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.3)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2">
              Generează Planul Acum <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </span>
          </Link>
          <p className="text-sm text-zinc-500 mt-4 sm:mt-0 sm:ml-4 font-medium">
            * Fără card de credit. Durează doar 60 secunde.
          </p>
        </div>

        {/* COPY-3: Free tier comunicat */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-8 text-sm text-zinc-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">✓</span> Fără card de credit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">✓</span> 3 planuri gratuite în Demo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">✓</span> 1 plan complet gratuit în Studio
          </span>
        </div>

        {/* Mockup Preview */}
        <div className="mt-24 relative w-full max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10"></div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-2 md:p-4 shadow-2xl relative overflow-hidden transform perspective-1000 rotate-x-12 scale-95 opacity-80 hover:opacity-100 hover:scale-100 transition-all duration-700 ease-out">
            <div className="w-full h-8 bg-zinc-800/80 rounded-t-xl flex items-center px-4 gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <img 
              src="/mockup-preview.png" 
              alt="IdeeaTa.ai — Plan de Afaceri Dashboard" 
              className="rounded-lg w-full object-cover opacity-90"
            />
            {/* Overlay UI elements to look like our app */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="bg-zinc-900/90 border border-emerald-500/30 p-6 rounded-2xl backdrop-blur-md shadow-2xl">
                    <h3 className="text-white font-bold text-xl mb-2">Plan Generat cu Succes!</h3>
                    <div className="flex gap-2 items-center text-emerald-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="font-medium text-sm">Gata pentru descărcare</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6 border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16">Tot ce ai nevoie, într-un singur loc.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-800/20 border border-zinc-800 p-8 rounded-3xl hover:bg-zinc-800/40 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 text-2xl mb-6 group-hover:scale-110 transition-transform">🚀</div>
              <h3 className="text-xl font-bold text-white mb-3">Viteză Uimitoare</h3>
              <p className="text-zinc-400 leading-relaxed">Scapă de săptămânile pierdute redactând documente. Platforma face toată treaba grea automat, în mai puțin de un minut.</p>
            </div>
            
            <div className="bg-zinc-800/20 border border-zinc-800 p-8 rounded-3xl hover:bg-zinc-800/40 transition-colors group">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 text-2xl mb-6 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Financiar Perfect</h3>
              <p className="text-zinc-400 leading-relaxed">Grafice, bugete și proiecții financiare calculate automat pe baza modelului tău de business, gata de prezentat investitorilor.</p>
            </div>

            <div className="bg-zinc-800/20 border border-zinc-800 p-8 rounded-3xl hover:bg-zinc-800/40 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 text-2xl mb-6 group-hover:scale-110 transition-transform">🔒</div>
              <h3 className="text-xl font-bold text-white mb-3">Siguranță Absolută</h3>
              <p className="text-zinc-400 leading-relaxed">Ideile tale sunt protejate și salvate automat în "Seiful" tău privat. Le poți edita și descărca oricând dorești.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative z-10 py-24 px-6 text-center border-t border-zinc-800/50">
        <h2 className="text-3xl font-bold text-white mb-6">Pregătit să îți transformi visul în realitate?</h2>
        <Link 
            href="/demo?start=nou"
            className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-transform hover:scale-105 shadow-xl"
          >
            Începe Gratuit Acum
        </Link>
        <div className="mt-16 text-zinc-600 text-sm flex flex-col items-center gap-2">
            <div className="flex gap-4">
                <Link href="/termeni" className="hover:text-zinc-400 transition-colors">Termeni și Condiții</Link>
                <span>&bull;</span>
                <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Politica de Confidențialitate</Link>
            </div>
            <p>&copy; {new Date().getFullYear()} IdeeaTa.ai - Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  );
}
