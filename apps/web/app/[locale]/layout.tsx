import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  isLocale,
  locales,
  type Locale,
} from "../../lib/i18n/config";
import { HtmlLangDir } from "../../components/i18n/HtmlLangDir";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <>
      <HtmlLangDir locale={locale} />
      {children}
    </>
  );
}
