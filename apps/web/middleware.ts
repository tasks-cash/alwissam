import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
  negotiateLocale,
} from "./lib/i18n/config";
import { LOCALE_HEADER } from "./lib/i18n/locale-header";

const PROTECTED_SEGMENTS = [
  "/doctor/",
  "/secretary/",
  "/admin/",
  "/patients/",
  "/patient/dashboard",
  "/patient/appointments",
  "/patient/profile",
  "/patient/files",
  "/patient/payments",
];

function isProtectedPath(pathname: string) {
  const withoutLocale = pathname.replace(/^\/(ar|en|fr)(?=\/|$)/, "") || "/";
  return PROTECTED_SEGMENTS.some(
    (seg) =>
      withoutLocale === seg.replace(/\/$/, "") ||
      withoutLocale.startsWith(seg),
  );
}

function withLocaleHeader(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);
  return requestHeaders;
}

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
    if (isProtectedPath(pathname)) {
      const hasAccess =
        request.cookies.get("alwisam_access")?.value ||
        request.cookies.get("alwisam_refresh")?.value;
      if (!hasAccess) {
        const isPatient = pathname.includes("/patient/");
        const login = request.nextUrl.clone();
        login.pathname = isPatient
          ? `/${pathLocale}/patient/login`
          : `/${pathLocale}/staff/login`;
        login.searchParams.set("next", pathname);
        return NextResponse.redirect(login);
      }
    }

    const response = NextResponse.next({
      request: { headers: withLocaleHeader(request, pathLocale) },
    });
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

void locales;
