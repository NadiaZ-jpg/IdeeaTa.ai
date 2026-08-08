import type { MetadataRoute } from "next";
import { RESOURCE_ARTICLES, RESOURCE_HUB } from "@/lib/resourceContent";

const ORIGIN = "https://ideeata.ai";

const STATIC_PATHS = [
  "/",
  "/demo",
  "/despre-noi",
  "/contact",
  "/termeni",
  "/privacy",
  "/cookies",
  "/en",
  "/en/demo",
  "/en/about-us",
  "/en/contact",
  "/en/terms",
  "/en/privacy",
  "/en/cookies",
  "/es",
  "/es/demo",
  "/es/about-us",
  "/es/contact",
  "/es/terms",
  "/es/privacy",
  "/es/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: path === "/" ? ORIGIN : `${ORIGIN}${path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/en" || path === "/es" ? "weekly" : "monthly",
    priority: path === "/" || path === "/en" || path === "/es" ? 1 : 0.6,
  }));

  const hubEntries: MetadataRoute.Sitemap = (["ro", "en", "es"] as const).map((locale) => ({
    url: `${ORIGIN}${RESOURCE_HUB[locale].path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const articleEntries: MetadataRoute.Sitemap = RESOURCE_ARTICLES.flatMap((article) =>
    (["ro", "en", "es"] as const).map((locale) => ({
      url: `${ORIGIN}${article.path[locale]}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }))
  );

  return [...staticEntries, ...hubEntries, ...articleEntries];
}
