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
  "/patient/medical-cases",
  "/patient/files",
  "/patient/instructions",
  "/patient/messages",
  "/patient/follow-up",
  "/patient/notifications",
  "/patient/profile",
  "/patient/security",
  "/patient/privacy",
  "/patient/help",
  "/patient/support",
  "/patient/account",
];

/** Always public within a locale — never bounce these to themselves. */
const PUBLIC_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
  "/auth/invitation",
  "/auth/account-created",
  "/staff/login",
  "/patient/login",
  "/patient/register",
  "/patient/consents",
  "/patients/login",
  "/patients/register",
  "/forgot-password",
  "/reset-password",
  "/activate-account",
];

function stripLocale(pathname: string) {
  return pathname.replace(/^\/(ar|en|fr)(?=\/|$)/, "") || "/";
}

function isPublicPath(pathname: string) {
  const withoutLocale = stripLocale(pathname);
  return PUBLIC_PREFIXES.some(
    (seg) =>
      withoutLocale === seg ||
      withoutLocale.startsWith(`${seg}/`) ||
      withoutLocale.startsWith(`${seg}?`),
  );
}

function isProtectedPath(pathname: string) {
  if (isPublicPath(pathname)) return false;
  const withoutLocale = stripLocale(pathname);
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
        const login = request.nextUrl.clone();
        login.pathname = `/${pathLocale}/auth/login`;
        const nextPath = pathname;
        // Avoid next=/.../auth/login loops
        if (!isPublicPath(nextPath)) {
          login.searchParams.set("next", nextPath);
        }
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

  // Locale normalization — exactly one redirect for unprefixed paths.
  const response = NextResponse.redirect(url);
  response.cookies.set(localeCookieName, locale || defaultLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

void locales;
