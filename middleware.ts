import { NextRequest, NextResponse } from "next/server";

/**
 * Sets x-locale from path so root layout can SSR correct <html lang>.
 * Must forward on the REQUEST (headers()) — response headers alone are invisible to SSR.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let locale = "ro";
  if (pathname === "/en" || pathname.startsWith("/en/")) locale = "en";
  else if (pathname === "/es" || pathname.startsWith("/es/")) locale = "es";

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", locale);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });
  res.headers.set("x-locale", locale);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ads.txt|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
