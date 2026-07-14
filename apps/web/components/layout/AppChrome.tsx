import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Dictionary } from "../../lib/i18n/dictionaries";
import type { Locale } from "../../lib/i18n/config";

type Props = {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
  variant?: "public" | "dashboard";
};

export function AppChrome({ locale, dict, children, variant = "public" }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link href={`/${locale}`} className="brand-lockup">
            <span className="brand-mark">{dict.brand}</span>
            <span className="brand-sub">{dict.brandSubtitle}</span>
          </Link>
          <LanguageSwitcher locale={locale} label={dict.language} />
        </div>
      </header>
      <div className={variant === "dashboard" ? "app-main dashboard-main" : "app-main"}>
        {children}
      </div>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>{dict.footerRights}</span>
          <LanguageSwitcher locale={locale} label={dict.language} />
        </div>
      </footer>
    </div>
  );
}
