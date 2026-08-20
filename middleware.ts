import { NextRequest, NextResponse } from "next/server";
import { DEVICE_LAYOUT_MOBILE_MAX_PX } from "@/lib/deviceLayout";

/**
 * Sets x-locale from path so root layout can SSR correct <html lang>.
 * Must forward on the REQUEST (headers()) — response headers alone are invisible to SSR.
 *
 * x-device-type (E-B): prefer Sec-CH-Viewport-Width when the browser sends it;
 * else UA hint for SSR first paint. Client Demo/Studio switches re-check width.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let locale = "ro";
  if (pathname === "/en" || pathname.startsWith("/en/")) locale = "en";
  else if (pathname === "/es" || pathname.startsWith("/es/")) locale = "es";

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", locale);

  const viewportW = req.headers.get("sec-ch-viewport-width");
  const parsedW = viewportW ? Number.parseInt(viewportW, 10) : NaN;
  let deviceType: "mobile" | "desktop";
  if (Number.isFinite(parsedW) && parsedW > 0) {
    deviceType = parsedW < DEVICE_LAYOUT_MOBILE_MAX_PX ? "mobile" : "desktop";
  } else {
    const userAgent = req.headers.get("user-agent") || "";
    const uaMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    deviceType = uaMobile ? "mobile" : "desktop";
  }
  requestHeaders.set("x-device-type", deviceType);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });
  res.headers.set("x-locale", locale);
  res.headers.set("x-device-type", deviceType);
  // Ask browsers for viewport width on later navigations (E-B SSR hint).
  res.headers.set("Accept-CH", "Sec-CH-Viewport-Width");
  res.headers.append("Vary", "Sec-CH-Viewport-Width");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ads.txt|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
