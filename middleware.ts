import { NextRequest, NextResponse } from "next/server";

/**
 * Sets x-locale from path so root layout can SSR correct <html lang>.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let locale = "ro";
  if (pathname === "/en" || pathname.startsWith("/en/")) locale = "en";
  else if (pathname === "/es" || pathname.startsWith("/es/")) locale = "es";

  const res = NextResponse.next();
  res.headers.set("x-locale", locale);
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets / Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|ads.txt|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
