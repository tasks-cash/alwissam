import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  isLocale,
  locales,
  type Locale,
} from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n/dictionaries";
import { AppChrome } from "../../components/layout/AppChrome";
import { HtmlLangDir } from "../../components/i18n/HtmlLangDir";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = getDictionary(locale);
  return {
    title: dict.brand,
    description: dict.brandSubtitle,
  };
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
  const dict = getDictionary(locale);

  return (
    <>
      <HtmlLangDir locale={locale} />
      <AppChrome locale={locale} dict={dict}>
        {children}
      </AppChrome>
    </>
  );
}
