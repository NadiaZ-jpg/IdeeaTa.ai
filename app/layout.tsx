import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css'; // Global styles
import { ScrollToTop } from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'IdeeaTa.ai - Nu începe o afacere înainte să ne verifici',
  description: 'Validează-ți ideea de afaceri în doar 2 secunde. Obține analiză SWOT completă, proiecție de buget optimizată și documente pregătite pentru parteneri sau finanțare.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ro">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5089980515174940"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
