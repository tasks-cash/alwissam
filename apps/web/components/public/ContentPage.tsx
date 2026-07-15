import { notFound } from "next/navigation";
import { PublicChrome } from "./PublicChrome";
import { isLocale, type Locale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n/dictionaries";
import { getPublicCopy, type PublicCopy } from "../../lib/i18n/public-copy";
import {
  contentField,
  fetchPublicSite,
  localizedClinicName,
  localizedWorkingHours,
  policyText,
} from "../../lib/public-site";
import { PublicSection } from "./PublicSection";

type Kind =
  | "patient-information"
  | "before-your-visit"
  | "after-your-visit"
  | "support"
  | "refund-policy"
  | "cancellation-policy"
  | "privacy"
  | "terms"
  | "cookies"
  | "accessibility"
  | "medical-disclaimer";

function resolve(
  kind: Kind,
  locale: Locale,
  copy: PublicCopy,
  site: Awaited<ReturnType<typeof fetchPublicSite>>,
) {
  const policies = site.content?.policies;
  switch (kind) {
    case "patient-information":
      return {
        title: copy.patientInfo,
        body: contentField(locale, site.content, "patientInfo"),
      };
    case "before-your-visit":
      return {
        title: copy.beforeVisit,
        body: contentField(locale, site.content, "beforeVisit"),
      };
    case "after-your-visit":
      return {
        title: copy.afterVisit,
        body: contentField(locale, site.content, "afterVisit"),
      };
    case "support":
      return {
        title: copy.support,
        body: contentField(locale, site.content, "support"),
      };
    case "refund-policy":
      return { title: copy.refund, body: policyText(locale, policies, "refund") };
    case "cancellation-policy":
      return {
        title: copy.cancellation,
        body: policyText(locale, policies, "cancellation"),
      };
    case "privacy":
      return { title: copy.privacy, body: policyText(locale, policies, "privacy") };
    case "terms":
      return { title: copy.terms, body: policyText(locale, policies, "terms") };
    case "cookies":
      return { title: copy.cookies, body: policyText(locale, policies, "cookies") };
    case "accessibility":
      return {
        title: copy.accessibility,
        body: policyText(locale, policies, "accessibility"),
      };
    case "medical-disclaimer":
      return {
        title: copy.disclaimer,
        body: policyText(locale, policies, "disclaimer"),
      };
  }
}

export async function ContentPage({
  params,
  kind,
}: {
  params: Promise<{ locale: string }>;
  kind: Kind;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const site = await fetchPublicSite();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const { title, body } = resolve(kind, locale, copy, site);

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
      clinic={site.clinic}
      phone={site.clinic?.phone}
      email={site.clinic?.email}
      address={site.clinic?.address}
      hours={hours}
    >
      <PublicSection>
        <article className="policy-article">
          <h1>{title}</h1>
          <p className="muted">
            {copy.effective}: 2026-01-01
          </p>
          <div className="policy-body">
            {(body || dict.emptyState).split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </article>
      </PublicSection>
    </PublicChrome>
  );
}
