import Link from "next/link";
import type { Metadata } from "next";
import { Fragment } from "react";
import { AdBanner } from "@/components/AdBanner";
import LocaleRedirectGuard from "@/components/LocaleRedirectGuard";
import {
  getResourceBySlug,
  RESOURCE_ARTICLES,
  RESOURCE_HUB,
  type ResourceLocale,
  type ResourceSlug,
} from "@/lib/resourceContent";

/** Primary mid-article unit — content pages, Desktop + Mobile, all locales. */
const CONTENT_AD_SLOT_A = "3098389905";
/** End-of-article unit (slot C from AdSense inventory). */
const CONTENT_AD_SLOT_C = "8674150210";

export function resourceMetadata(
  locale: ResourceLocale,
  slug: ResourceSlug
): Metadata {
  const article = getResourceBySlug(slug);
  return {
    title: `${article.title[locale]} | IdeeaTa.ai`,
    description: article.description[locale],
    alternates: {
      canonical: `https://ideeata.ai${article.path[locale]}`,
      languages: {
        ro: `https://ideeata.ai${article.path.ro}`,
        en: `https://ideeata.ai${article.path.en}`,
        es: `https://ideeata.ai${article.path.es}`,
      },
    },
  };
}

export function hubMetadata(locale: ResourceLocale): Metadata {
  const hub = RESOURCE_HUB[locale];
  return {
    title: `${hub.title} | IdeeaTa.ai`,
    description: hub.description,
    alternates: {
      canonical: `https://ideeata.ai${hub.path}`,
      languages: {
        ro: `https://ideeata.ai${RESOURCE_HUB.ro.path}`,
        en: `https://ideeata.ai${RESOURCE_HUB.en.path}`,
        es: `https://ideeata.ai${RESOURCE_HUB.es.path}`,
      },
    },
  };
}

export function ResourceArticlePage({
  locale,
  slug,
}: {
  locale: ResourceLocale;
  slug: ResourceSlug;
}) {
  const article = getResourceBySlug(slug);
  const hub = RESOURCE_HUB[locale];
  const sections = article.sections[locale];
  const backLabel =
    locale === "en" ? "All resources" : locale === "es" ? "Todos los recursos" : "Toate resursele";
  /** After 2nd section (or mid-article) — ad beside publisher content. */
  const adAfterIndex = Math.min(1, Math.max(0, sections.length - 2));

  return (
    <>
      {locale === "ro" ? <LocaleRedirectGuard pathRo={article.path.ro} /> : null}
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-16 md:py-24 px-4 sm:px-8">
      <article className="max-w-3xl mx-auto">
        <nav className="mb-8 text-sm">
          <Link href={hub.path} className="text-emerald-400 hover:text-emerald-300 font-semibold">
            ← {backLabel}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {article.title[locale]}
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed mb-10">{article.intro[locale]}</p>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <Fragment key={section.heading}>
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{section.heading}</h2>
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className="text-zinc-300 leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-2 text-zinc-300 mt-3">
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
              {index === adAfterIndex && (
                <div className="w-full min-h-[90px] py-2">
                  <AdBanner dataAdSlot={CONTENT_AD_SLOT_A} className="w-full max-w-3xl mx-auto" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div className="w-full min-h-[90px] mt-12 mb-4">
          <AdBanner dataAdSlot={CONTENT_AD_SLOT_C} className="w-full max-w-3xl mx-auto" />
        </div>

        <div className="flex justify-center mt-10">
          <Link
            href={article.ctaHref[locale]}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline"
          >
            {article.ctaLabel[locale]}
          </Link>
        </div>
      </article>
    </div>
    </>
  );
}

export function ResourcesHubPage({ locale }: { locale: ResourceLocale }) {
  const hub = RESOURCE_HUB[locale];
  const readMore =
    locale === "en" ? "Read" : locale === "es" ? "Leer" : "Citește";

  return (
    <>
      {locale === "ro" ? <LocaleRedirectGuard pathRo={hub.path} /> : null}
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-16 md:py-24 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 text-center">{hub.title}</h1>
        <p className="text-lg text-zinc-400 leading-relaxed mb-12 text-center">{hub.description}</p>

        <div className="flex flex-col gap-5">
          {RESOURCE_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={article.path[locale]}
              className="block bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all no-underline"
            >
              <h2 className="text-lg font-bold text-white mb-2">{article.title[locale]}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                {article.description[locale]}
              </p>
              <span className="text-emerald-400 text-sm font-bold">{readMore} →</span>
            </Link>
          ))}
        </div>

        <div className="w-full min-h-[90px] mt-12">
          <AdBanner dataAdSlot={CONTENT_AD_SLOT_A} className="w-full max-w-3xl mx-auto" />
        </div>
      </div>
    </div>
    </>
  );
}
