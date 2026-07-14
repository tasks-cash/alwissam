import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
  negotiateLocale,
} from "./lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathLocale = pathname.split("/")[1];
  if (isLocale(pathLocale)) {
    const response = NextResponse.next();
    if (request.cookies.get(localeCookieName)?.value !== pathLocale) {
      response.cookies.set(localeCookieName, pathLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : negotiateLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/"
      ? `/${locale}`
      : `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(localeCookieName, locale || defaultLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

// Keep locales referenced for tree analysis / future rewrites.
void locales;
