"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { t } from '@/lib/translations';

export function Footer() {
  const pathname = usePathname();
  const isEn = pathname?.startsWith('/en');
  const locale = isEn ? 'en' : 'ro';

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
          <Link href={isEn ? "/en/about-us" : "/despre-noi"} className="hover:text-emerald-400 transition-colors">
            {t('aboutUs', locale)}
          </Link>
          <Link href={isEn ? "/en/contact" : "/contact"} className="hover:text-emerald-400 transition-colors">
            {t('contact', locale)}
          </Link>
          <Link href={isEn ? "/en/terms" : "/termeni"} className="hover:text-emerald-400 transition-colors">
            {t('termsAndConditions', locale)}
          </Link>
          <Link href={isEn ? "/en/privacy" : "/privacy"} className="hover:text-emerald-400 transition-colors">
            {t('privacyPolicy', locale)}
          </Link>
          <Link href={isEn ? "/en/cookies" : "/cookies"} className="hover:text-emerald-400 transition-colors">
            {t('cookiePolicy', locale)}
          </Link>
        </div>
      </div>
    </footer>
  );
}
