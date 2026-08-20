import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css'; // Global styles
import { ScrollToTop } from '@/components/ScrollToTop';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';
import { getSiteMetadata } from '@/lib/siteMetadata';

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = getSiteMetadata('ro');

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const headersList = await headers();
  const localeHeader = headersList.get("x-locale");
  const lang =
    localeHeader === "en" || localeHeader === "es" ? localeHeader : "ro";

  return (
    <html lang={lang} suppressHydrationWarning className="bg-[#09090b]">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5089980515174940" />
      </head>
      <body suppressHydrationWarning className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden">
        <NetworkStatusIndicator />
        {children}
        <Footer />
        <CookieBanner />
        <ScrollToTop />
      </body>
    </html>
  );
}
