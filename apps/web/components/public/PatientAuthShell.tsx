import type { ReactNode } from "react";
import type { Locale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n/dictionaries";
import {
  fetchPublicSite,
  localizedClinicName,
  localizedWorkingHours,
} from "../../lib/public-site";
import { PublicChrome } from "./PublicChrome";

type Props = {
  locale: Locale;
  children: ReactNode;
};

/** Shared public Navbar/Footer for unauthenticated patient auth pages. */
export async function PatientAuthShell({ locale, children }: Props) {
  const dict = getDictionary(locale);
  const site = await fetchPublicSite().catch(() => null);
  const brand = localizedClinicName(locale, site?.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site?.clinic);

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={brand}
      clinic={site?.clinic}
      phone={site?.clinic?.phone}
      email={site?.clinic?.email}
      address={site?.clinic?.address}
      hours={hours}
    >
      <div className="patient-auth-page">{children}</div>
    </PublicChrome>
  );
}
