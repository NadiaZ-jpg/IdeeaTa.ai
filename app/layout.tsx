import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ScrollToTop } from '@/components/ScrollToTop';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import { getSiteMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = getSiteMetadata('ro');

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ro">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5089980515174940" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5089980515174940" crossOrigin="anonymous"></script>
      </head>
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        {children}
        <Footer />
        <CookieBanner />
        <ScrollToTop />
      </body>
    </html>
  );
}
