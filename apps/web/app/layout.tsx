import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import {
  isLocale,
  localeCookieName,
  localeMeta,
  negotiateLocale,
  type Locale,
} from "../lib/i18n/config";
import { LOCALE_HEADER } from "../lib/i18n/locale-header";
import "./globals.css";

/**
 * Document lang/dir come from the active URL locale (set by middleware),
 * not from cookie alone — so /en/... is LTR and /ar/... is RTL on first paint.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const pathLocale = headerStore.get(LOCALE_HEADER);
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const locale: Locale = isLocale(pathLocale)
    ? pathLocale
    : isLocale(cookieLocale)
      ? cookieLocale
      : negotiateLocale(headerStore.get("accept-language"));
  const meta = localeMeta[locale];

  return (
    <html lang={meta.htmlLang} dir={meta.dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={locale === "ar" ? "font-ar" : "font-latin"}>
        {children}
      </body>
    </html>
  );
}
