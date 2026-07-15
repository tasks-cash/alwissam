import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqExplorer } from "../../../components/public/faq/FaqExplorer";
import { FaqJsonLd } from "../../../components/public/faq/FaqJsonLd";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import {
  buildWhatsAppUrl,
  formatPhoneDisplay,
  localizedAddress,
  phoneTelHref,
  resolveClinicContact,
} from "../../../lib/clinic-contact";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../lib/seo/page-metadata";
import {
  fetchPublicFaqs,
  fetchPublicSite,
  localizedClinicName,
  localizedWorkingHours,
} from "../../../lib/public-site";

const FAQ_DESCRIPTION: Record<Locale, string> = {
  ar: "إجابات شاملة عن حجز المواعيد وخدمات طب الأسنان والعناية قبل العلاج وبعده في عيادة الوسام لطب الأسنان.",
  en: "Clear answers about booking, dental services, and care before and after treatment at Al Wissam Dental Clinic.",
  fr: "Réponses claires sur la réservation, les soins dentaires et le suivi avant et après traitement à la Clinique Dentaire El Wissam.",
};

const FAQ_HERO: Record<
  Locale,
  { title: string; description: string; searchShortcut: string }
> = {
  ar: {
    title: "الأسئلة الشائعة",
    description:
      "إجابات واضحة عن الحجز والمواعيد وخدمات طب الأسنان وزيارة العيادة والعناية بعد العلاج.",
    searchShortcut: "ابحث أدناه أو اختر قسمًا",
  },
  en: {
    title: "Frequently Asked Questions",
    description:
      "Clear answers about booking, appointments, dental services, clinic visits, and aftercare.",
    searchShortcut: "Search below or browse a category",
  },
  fr: {
    title: "Questions fréquentes",
    description:
      "Des réponses claires sur la réservation, les rendez-vous, les soins dentaires, la visite et le suivi.",
    searchShortcut: "Recherchez ci-dessous ou choisissez une catégorie",
  },
};

function faqCopy(locale: Locale) {
  if (locale === "en") {
    return {
      searchPlaceholder: "Search a question, service, or treatment…",
      searchLabel: "Search FAQ",
      clearSearch: "Clear",
      resultsCountTemplate: "{n} results",
      featuredTitle: "Popular questions",
      allCategories: "All",
      emptyCategory: "No published questions in this section yet.",
      emptySearch:
        "We could not find a matching question. Contact us directly for help.",
      loadError: "We could not load the FAQ right now.",
      retry: "Retry",
      book: "Book an appointment",
      doctors: "View doctors",
      services: "View services",
      specialties: "View specialties",
      contact: "Contact us",
      whatsapp: "Chat on WhatsApp",
      directions: "Get directions",
      sendInquiry: "Send an inquiry",
      callClinic: "Call the clinic",
      supportTitle: "Didn’t find your answer?",
      supportDesc:
        "Send your question directly or contact the Al Wissam clinic team by phone or WhatsApp.",
      disclaimer:
        "The information in this FAQ is general and does not replace examination and diagnosis by a dentist. Treatment plans vary according to each patient’s condition.",
      relatedService: "Related service",
      relatedSpecialty: "Related specialty",
    };
  }
  if (locale === "fr") {
    return {
      searchPlaceholder: "Rechercher une question, un service ou un soin…",
      searchLabel: "Rechercher dans la FAQ",
      clearSearch: "Effacer",
      resultsCountTemplate: "{n} résultats",
      featuredTitle: "Questions populaires",
      allCategories: "Tout",
      emptyCategory: "Aucune question publiée dans cette section pour le moment.",
      emptySearch:
        "Aucune question ne correspond à votre recherche. Contactez-nous pour obtenir de l’aide.",
      loadError: "Impossible de charger la FAQ pour le moment.",
      retry: "Réessayer",
      book: "Prendre rendez-vous",
      doctors: "Voir les médecins",
      services: "Voir les services",
      specialties: "Voir les spécialités",
      contact: "Nous contacter",
      whatsapp: "Contacter via WhatsApp",
      directions: "Itinéraire",
      sendInquiry: "Envoyer une demande",
      callClinic: "Appeler la clinique",
      supportTitle: "Vous n’avez pas trouvé de réponse ?",
      supportDesc:
        "Envoyez votre question ou contactez l’équipe de la Clinique Dentaire El Wissam par téléphone ou WhatsApp.",
      disclaimer:
        "Les informations de cette FAQ sont générales et ne remplacent pas l’examen et le diagnostic d’un chirurgien-dentiste. Le plan de traitement varie selon chaque patient.",
      relatedService: "Service associé",
      relatedSpecialty: "Spécialité associée",
    };
  }
  return {
    searchPlaceholder: "ابحث عن سؤال، خدمة أو علاج...",
    searchLabel: "بحث في الأسئلة الشائعة",
    clearSearch: "مسح",
    resultsCountTemplate: "{n} نتيجة",
    featuredTitle: "أسئلة شائعة مختارة",
    allCategories: "الكل",
    emptyCategory: "لا توجد أسئلة منشورة في هذا القسم حاليًا.",
    emptySearch:
      "لم نجد سؤالًا مطابقًا لبحثك. يمكنك التواصل معنا مباشرة للحصول على المساعدة.",
    loadError: "تعذر تحميل الأسئلة الشائعة حاليًا.",
    retry: "إعادة المحاولة",
    book: "احجز موعدًا",
    doctors: "عرض الأطباء",
    services: "عرض الخدمات",
    specialties: "عرض التخصصات",
    contact: "تواصل معنا",
    whatsapp: "تواصل عبر واتساب",
    directions: "عرض الاتجاهات",
    sendInquiry: "إرسال استفسار",
    callClinic: "اتصل بالعيادة",
    supportTitle: "لم تجد إجابة عن سؤالك؟",
    supportDesc:
      "يمكنك إرسال استفسارك مباشرة أو التواصل مع فريق عيادة الوسام عبر الهاتف أو واتساب.",
    disclaimer:
      "المعلومات الواردة في قسم الأسئلة الشائعة عامة ولا تغني عن الفحص والتشخيص من طرف طبيب الأسنان. تختلف الخطة العلاجية حسب حالة كل مريض.",
    relatedService: "خدمة ذات صلة",
    relatedSpecialty: "تخصص ذو صلة",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  return buildPublicMetadata({
    locale,
    path: "/faq",
    title: titleSegment(locale, "faq"),
    description: FAQ_DESCRIPTION[locale],
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const hero = FAQ_HERO[locale];
  const faqUi = faqCopy(locale);
  const site = await fetchPublicSite();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const contact = resolveClinicContact(locale, site.clinic);
  const phoneTel = phoneTelHref(site.clinic) || contact.phoneTel;
  const whatsappHref = buildWhatsAppUrl(locale, site.clinic);
  const mapsHref = contact.mapsLink || site.clinic?.mapsLink || "";

  const [faqPayload] = await Promise.all([
    fetchPublicFaqs({ locale, limit: 200 }),
  ]);
  const featuredInitial = faqPayload.faqs.filter((f) => f.isFeatured).slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqPayload.faqs.map((f) => ({
      "@type": "Question",
      name: String(f.question || "").slice(0, 300),
      acceptedAnswer: {
        "@type": "Answer",
        text: String(f.answer || "").slice(0, 5000),
      },
    })),
  };
  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
      clinic={site.clinic}
      phone={site.clinic?.phone}
      email={site.clinic?.email}
      address={localizedAddress(locale, site.clinic) || site.clinic?.address}
      hours={hours}
    >
      <FaqJsonLd json={jsonLdHtml} />
      <PageHero
        title={hero.title}
        description={hero.description}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navFaq },
        ]}
        actions={
          <>
            <Link className="btn btn-primary" href={`/${locale}/book`}>
              {faqUi.book}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/contact`}>
              {faqUi.contact}
            </Link>
            <a className="btn btn-outline" href="#faq-search">
              {hero.searchShortcut}
            </a>
          </>
        }
      />
      <PublicSection className="faq-page-section" id="faq-search">
        <FaqExplorer
          locale={locale}
          initialFaqs={faqPayload.faqs}
          initialCategories={faqPayload.categories}
          initialAllCount={faqPayload.allCount}
          initialFeatured={featuredInitial}
          copy={faqUi}
          phoneTel={phoneTel}
          whatsappHref={whatsappHref}
          mapsHref={mapsHref}
        />
      </PublicSection>
      {(contact.phoneDisplay || formatPhoneDisplay(site.clinic?.phone)) && (
        <PublicSection tone="soft">
          <div className="faq-clinic-strip">
            <div>
              <h2>{name}</h2>
              <p dir="ltr">
                {contact.phoneDisplay ||
                  formatPhoneDisplay(site.clinic?.phone)}
              </p>
              {hours ? <p>{hours}</p> : null}
            </div>
            <div className="faq-clinic-strip-actions">
              {phoneTel ? (
                <a className="btn btn-primary" href={phoneTel} dir="ltr">
                  {faqUi.callClinic}
                </a>
              ) : null}
              <Link className="btn btn-outline" href={`/${locale}/book`}>
                {faqUi.book}
              </Link>
            </div>
          </div>
        </PublicSection>
      )}
    </PublicChrome>
  );
}
