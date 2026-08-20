"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirectRoEntryIfNeeded } from "@/lib/localeEntry";

interface LocaleRedirectGuardProps {
  pathRo: string;
}

export default function LocaleRedirectGuard({ pathRo }: LocaleRedirectGuardProps) {
  const router = useRouter();

  useEffect(() => {
    redirectRoEntryIfNeeded(router.replace.bind(router), pathRo);
  }, [router, pathRo]);

  return null;
}
