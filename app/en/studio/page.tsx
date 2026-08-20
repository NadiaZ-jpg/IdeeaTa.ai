import React from "react";
import { headers } from "next/headers";
import LocaleRedirectGuard from "@/components/LocaleRedirectGuard";
import StudioViewportSwitch from "@/components/StudioViewportSwitch";

export default async function StudioPageEn() {
  const headersList = await headers();
  const deviceType = headersList.get("x-device-type") || "desktop";

  return (
    <>
      <LocaleRedirectGuard pathRo="/studio" />
      <StudioViewportSwitch locale="en" ssrIsMobile={deviceType === "mobile"} />
    </>
  );
}
