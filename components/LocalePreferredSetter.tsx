"use client";

import { useEffect } from "react";

interface LocalePreferredSetterProps {
  locale: "ro" | "en" | "es";
}

export default function LocalePreferredSetter({ locale }: LocalePreferredSetterProps) {
  useEffect(() => {
    try {
      localStorage.setItem("preferred_language", locale);
    } catch (err) {
      console.warn("Failed to set preferred language in localStorage:", err);
    }
  }, [locale]);

  return null;
}
