import React from "react";
import { headers } from "next/headers";
import LocaleRedirectGuard from "@/components/LocaleRedirectGuard";
import StudioViewportSwitch from "@/components/StudioViewportSwitch";

export default async function StudioPage() {
  const headersList = await headers();
  const deviceType = headersList.get("x-device-type") || "desktop";

  return (
    <>
      <LocaleRedirectGuard pathRo="/studio" />
      <StudioViewportSwitch locale="ro" ssrIsMobile={deviceType === "mobile"} />
    </>
  );
}
