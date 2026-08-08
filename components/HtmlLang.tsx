"use client";

import { useEffect } from "react";
import type { SiteLocale } from "@/lib/siteMetadata";

/** Setează doar <html lang> pe client pentru /en și /es — nu rescrie document.title. */
export function HtmlLang({ locale }: { locale: SiteLocale }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
