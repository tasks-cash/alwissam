"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  localeCookieName,
  localeMeta,
  locales,
  type Locale,
} from "../../lib/i18n/config";

type Props = {
  locale: Locale;
  label: string;
};

export function LanguageSwitcher({ locale, label }: Props) {
  const pathname = usePathname() || `/${locale}`;

  function hrefFor(next: Locale) {
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = next;
      return segments.join("/") || `/${next}`;
    }
    return `/${next}${pathname === "/" ? "" : pathname}`;
  }

  return (
    <div className="lang-switcher" role="group" aria-label={label}>
      {locales.map((code) => {
        const active = code === locale;
        return (
          <Link
            key={code}
            href={hrefFor(code)}
            hrefLang={localeMeta[code].htmlLang}
            aria-current={active ? "true" : undefined}
            className={active ? "lang-active" : undefined}
            onClick={() => {
              document.cookie = `${localeCookieName}=${code};path=/;max-age=31536000;samesite=lax`;
              void fetch("/api/auth/locale", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ locale: code }),
              }).catch(() => undefined);
            }}
          >
            {localeMeta[code].label}
          </Link>
        );
      })}
    </div>
  );
}
