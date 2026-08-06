"use client";

import { useEffect } from "react";

/** Setează <html lang> pe client pentru segmentele /en și /es. */
export function HtmlLang({ locale }: { locale: "ro" | "en" | "es" }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}
