import React from "react";
import { headers } from "next/headers";
import LocaleRedirectGuard from "@/components/LocaleRedirectGuard";
import DemoViewportSwitch from "@/components/DemoViewportSwitch";

export default async function DemoPageEn() {
  const headersList = await headers();
  const deviceType = headersList.get("x-device-type") || "desktop";

  return (
    <>
      <LocaleRedirectGuard pathRo="/demo" />
      <DemoViewportSwitch locale="en" ssrIsMobile={deviceType === "mobile"} />
    </>
  );
}
