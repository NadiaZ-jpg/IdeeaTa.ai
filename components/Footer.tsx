"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { t } from '@/lib/translations';

export function Footer() {
  const pathname = usePathname();
  const isEn = pathname?.startsWith('/en');
  const isEs = pathname?.startsWith('/es');
  const locale = isEn ? 'en' : isEs ? 'es' : 'ro';

  const getLink = (roPath: string, enPath: string, esPath: string) => {
    if (isEn) return enPath;
    if (isEs) return esPath;
    return roPath;
  };

  return (
    <footer className="w-full border-t border-zinc-800 bg-[#09090b] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-emerald-500">💡</span> IdeeaTa.ai
          </div>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} {t('allRightsReserved', locale)}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-400">
          <Link href={getLink("/despre-noi", "/en/about-us", "/es/about-us")} className="hover:text-emerald-400 transition-colors">
            {t('aboutUs', locale)}
          </Link>
          <Link href={getLink("/contact", "/en/contact", "/es/contact")} className="hover:text-emerald-400 transition-colors">
            {t('contact', locale)}
          </Link>
          <Link href={getLink("/termeni", "/en/terms", "/es/terms")} className="hover:text-emerald-400 transition-colors">
            {t('termsAndConditions', locale)}
          </Link>
          <Link href={getLink("/privacy", "/en/privacy", "/es/privacy")} className="hover:text-emerald-400 transition-colors">
            {t('privacyPolicy', locale)}
          </Link>
          <Link href={getLink("/cookies", "/en/cookies", "/es/cookies")} className="hover:text-emerald-400 transition-colors">
            {t('cookiePolicy', locale)}
          </Link>
          <a 
            href="https://buymeacoffee.com/ideeata" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#FFDD00] text-zinc-400 font-bold transition-colors flex items-center gap-1"
            title="Buy me a coffee"
          >
            <span>☕</span> Buy me a coffee
          </a>
        </div>
      </div>
    </footer>
  );
}
