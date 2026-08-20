import React from "react";
import { headers } from "next/headers";
import LocaleRedirectGuard from "@/components/LocaleRedirectGuard";
import DemoViewportSwitch from "@/components/DemoViewportSwitch";

export default async function DemoPageEs() {
  const headersList = await headers();
  const deviceType = headersList.get("x-device-type") || "desktop";

  return (
    <>
      <LocaleRedirectGuard pathRo="/demo" />
      <DemoViewportSwitch locale="es" ssrIsMobile={deviceType === "mobile"} />
    </>
  );
}
