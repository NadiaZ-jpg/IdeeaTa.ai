import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css'; // Global styles
import { ScrollToTop } from '@/components/ScrollToTop';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';

export const metadata: Metadata = {
  title: 'IdeeaTa.ai - Generează un Plan de Afaceri în 2 Secunde',
  description: 'Validează-ți ideea de afaceri în doar 2 secunde cu Inteligența Artificială. Obține analiză SWOT completă, proiecție de buget optimizată și documente pregătite pentru investitori.',
  keywords: ['plan de afaceri', 'idei de afaceri', 'generator plan de afaceri', 'fonduri europene', 'startup romania', 'AI business plan'],
  openGraph: {
    title: 'IdeeaTa.ai - Plan de Afaceri Generat de AI',
    description: 'Transformă-ți ideea într-un plan de afaceri complet în câteva secunde. Include Buget, SWOT și analize financiare.',
    url: 'https://ideeata.ai',
    siteName: 'IdeeaTa.ai',
    images: [
      {
        url: 'https://ideeata.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IdeeaTa.ai Preview',
      },
    ],
    locale: 'ro_RO',
    type: 'website',
  },
};

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
