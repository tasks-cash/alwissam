import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  isLocale,
  locales,
  type Locale,
} from "../../lib/i18n/config";
import { HtmlLangDir } from "../../components/i18n/HtmlLangDir";
import { localeMetadataBase } from "../../lib/seo/page-metadata";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return localeMetadataBase(raw as Locale);
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
