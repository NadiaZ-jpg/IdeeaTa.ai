import type { Metadata } from "next";

export type SiteLocale = "ro" | "en" | "es";

type SiteCopy = {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogLocale: string;
  path: string;
};

const SITE_COPY: Record<SiteLocale, SiteCopy> = {
  ro: {
    title: "IdeeaTa.ai - Generează un Plan de Afaceri în 2 Secunde",
    description:
      "Validează-ți ideea de afaceri în doar 2 secunde cu Inteligența Artificială. Obține analiză SWOT completă, proiecție de buget optimizată și documente pregătite pentru investitori.",
    keywords: [
      "plan de afaceri",
      "idei de afaceri",
      "generator plan de afaceri",
      "fonduri europene",
      "startup romania",
      "AI business plan",
    ],
    ogTitle: "IdeeaTa.ai - Plan de Afaceri Generat de AI",
    ogDescription:
      "Transformă-ți ideea într-un plan de afaceri complet în câteva secunde. Include Buget, SWOT și analize financiare.",
    ogLocale: "ro_RO",
    path: "/",
  },
  en: {
    title: "IdeeaTa.ai - Generate a Business Plan in 2 Seconds",
    description:
      "Validate your business idea in just 2 seconds with Artificial Intelligence. Get a complete SWOT analysis, optimized budget projection and investor-ready documents.",
    keywords: [
      "business plan",
      "business ideas",
      "business plan generator",
      "EU funding",
      "startup",
      "AI business plan",
    ],
    ogTitle: "IdeeaTa.ai - AI-Generated Business Plan",
    ogDescription:
      "Turn your idea into a complete business plan in seconds. Includes Budget, SWOT and financial analysis.",
    ogLocale: "en_US",
    path: "/en",
  },
  es: {
    title: "IdeeaTa.ai - Genera un Plan de Negocios en 2 Segundos",
    description:
      "Valida tu idea de negocio en solo 2 segundos con Inteligencia Artificial. Obtén un análisis DAFO completo, proyección de presupuesto optimizada y documentos listos para inversores.",
    keywords: [
      "plan de negocios",
      "ideas de negocio",
      "generador plan de negocios",
      "fondos europeos",
      "startup",
      "plan de negocios IA",
    ],
    ogTitle: "IdeeaTa.ai - Plan de Negocios Generado por IA",
    ogDescription:
      "Convierte tu idea en un plan de negocios completo en segundos. Incluye Presupuesto, DAFO y análisis financieros.",
    ogLocale: "es_ES",
    path: "/es",
  },
};

/** Metadata SEO/Open Graph localizată (REGULA #21 — RO/EN/ES). */
export function getSiteMetadata(locale: SiteLocale): Metadata {
  const copy = SITE_COPY[locale];
  const url = `https://ideeata.ai${copy.path === "/" ? "" : copy.path}`;

  return {
    // `absolute` — previne ca title-ul RO din root layout să rămână pe /en|/es
    title: { absolute: copy.title },
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: url,
      languages: {
        ro: "https://ideeata.ai",
        en: "https://ideeata.ai/en",
        es: "https://ideeata.ai/es",
        "x-default": "https://ideeata.ai",
      },
    },
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url,
      siteName: "IdeeaTa.ai",
      images: [
        {
          url: "https://ideeata.ai/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "IdeeaTa.ai Preview",
        },
      ],
      locale: copy.ogLocale,
      type: "website",
    },
  };
}
