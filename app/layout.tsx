import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'IdeeaTa.ai - Nu începe o afacere înainte să ne verifici',
  description: 'Validează-ți ideea de afaceri în doar 2 secunde. Obține analiză SWOT completă, proiecție de buget optimizată și documente pregătite pentru parteneri sau finanțare.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ro">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
