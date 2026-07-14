"use client";

import { useEffect } from "react";
import type { Locale } from "../../lib/i18n/config";
import { localeMeta } from "../../lib/i18n/config";

export function HtmlLangDir({ locale }: { locale: Locale }) {
  useEffect(() => {
    const meta = localeMeta[locale];
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    document.body.classList.toggle("font-ar", locale === "ar");
    document.body.classList.toggle("font-latin", locale !== "ar");
  }, [locale]);
  return null;
}
