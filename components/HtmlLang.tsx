"use client";

import { useEffect } from "react";
import { getSiteMetadata, type SiteLocale } from "@/lib/siteMetadata";

/** Setează <html lang> + document.title pe client pentru /en și /es. */
export function HtmlLang({ locale }: { locale: SiteLocale }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    const meta = getSiteMetadata(locale);
    const title =
      typeof meta.title === "object" && meta.title && "absolute" in meta.title
        ? String(meta.title.absolute || "")
        : typeof meta.title === "string"
        ? meta.title
        : "";
    if (title) document.title = title;
  }, [locale]);

  return null;
}
