import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css'; // Global styles
import { ScrollToTop } from '@/components/ScrollToTop';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import { AdSenseLoader } from '@/components/AdSenseLoader';
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
    <html lang={lang}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5089980515174940" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        <NetworkStatusIndicator />
        <AdSenseLoader />
        {children}
        <Footer />
        <CookieBanner />
        <ScrollToTop />
      </body>
    </html>
  );
}
