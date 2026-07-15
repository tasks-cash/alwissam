import type { Locale } from "./i18n/config";

export type PublicService = {
  id?: string;
  slug: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  nameFr?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  shortDescription?: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  shortDescriptionFr?: string;
  icon?: string;
  image?: string | null;
  specialties?: Array<{ id: string; slug: string; name: string }>;
  doctorCount?: number;
  durationMinutes?: number | null;
  priceFrom?: number | null;
  currency?: string | null;
  requiresConsultation?: boolean;
  isFeatured?: boolean;
};

export type PublicSpecialty = {
  id?: string;
  slug: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  nameFr?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  icon?: string;
  image?: string | null;
  serviceCount?: number;
  doctorCount?: number;
  isFeatured?: boolean;
};

export type PublicFaq = {
  question?: string;
  questionAr?: string;
  questionEn?: string;
  questionFr?: string;
  answer?: string;
  answerAr?: string;
  answerEn?: string;
  answerFr?: string;
};

export type PublicPolicies = Record<string, string | undefined>;

export type PublicSitePayload = {
  ok?: boolean;
  clinic?: {
    nameAr?: string;
    nameEn?: string;
    nameFr?: string;
    clinicNameAr?: string;
    clinicNameEn?: string;
    clinicNameFr?: string;
    phone?: string;
    publicPhone?: string;
    phoneDisplay?: string;
    publicPhoneDisplay?: string;
    phoneInternational?: string;
    publicPhoneInternational?: string;
    telephoneUrl?: string;
    email?: string;
    publicEmail?: string;
    address?: string;
    addressAr?: string;
    addressEn?: string;
    addressFr?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    descriptionFr?: string;
    mapsEmbedUrl?: string;
    mapsLink?: string;
    mapUrl?: string;
    directionsUrl?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
    whatsapp?: string;
    whatsappNumber?: string;
    whatsappEnabled?: boolean;
    whatsappUrl?: string;
    facebookUrl?: string;
    workingHoursAr?: string;
    workingHoursEn?: string;
    workingHoursFr?: string;
    fridayClosed?: boolean;
    city?: string;
    stateOrWilaya?: string;
    postalCode?: string;
    countryAr?: string;
    countryEn?: string;
    countryFr?: string;
  };
  content?: {
    aboutAr?: string;
    aboutEn?: string;
    aboutFr?: string;
    missionAr?: string;
    missionEn?: string;
    missionFr?: string;
    services?: PublicService[];
    specialties?: PublicSpecialty[];
    faqs?: PublicFaq[];
    policies?: PublicPolicies;
    patientInfoAr?: string;
    patientInfoEn?: string;
    patientInfoFr?: string;
    beforeVisitAr?: string;
    beforeVisitEn?: string;
    beforeVisitFr?: string;
    afterVisitAr?: string;
    afterVisitEn?: string;
    afterVisitFr?: string;
    supportAr?: string;
    supportEn?: string;
    supportFr?: string;
    reviews?: PublicReview[];
  };
};

export type PublicReview = {
  id?: string;
  displayName?: string;
  nameAr?: string;
  nameEn?: string;
  nameFr?: string;
  quoteAr?: string;
  quoteEn?: string;
  quoteFr?: string;
  rating?: number;
  verified?: boolean;
  createdAt?: string;
};

export type PublicDoctor = {
  id: string;
  fullName: string;
  type?: string;
  specialtyAr?: string;
  specialtyEn?: string;
  specialtyFr?: string;
  bioAr?: string;
  bioEn?: string;
  bioFr?: string;
  availabilityNoteAr?: string;
  availabilityNoteEn?: string;
  availabilityNoteFr?: string;
  workingHours?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isActive?: boolean;
  }>;
};

function apiBase() {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:4001"
  );
}

export async function fetchPublicSite(): Promise<PublicSitePayload> {
  try {
    const res = await fetch(`${apiBase()}/api/public/site`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    return (await res.json()) as PublicSitePayload;
  } catch {
    return {};
  }
}

export async function fetchPublicSpecialties(opts?: {
  locale?: Locale;
  featured?: boolean;
  limit?: number;
  page?: number;
}): Promise<{ specialties: PublicSpecialty[]; total: number }> {
  try {
    const params = new URLSearchParams({
      locale: opts?.locale || "ar",
      limit: String(Math.min(48, Math.max(1, opts?.limit ?? 24))),
      page: String(Math.max(1, opts?.page ?? 1)),
    });
    if (opts?.featured) params.set("featured", "true");
    const res = await fetch(`${apiBase()}/api/public/specialties?${params}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return { specialties: [], total: 0 };
    const data = await res.json();
    return {
      specialties: Array.isArray(data.specialties) ? data.specialties : [],
      total: Number(data.total) || 0,
    };
  } catch {
    return { specialties: [], total: 0 };
  }
}

export async function fetchPublicSpecialty(
  slug: string,
  locale?: Locale,
): Promise<{
  specialty: PublicSpecialty;
  services: PublicService[];
  doctors: PublicDoctor[];
} | null> {
  try {
    const qs = locale ? `?locale=${locale}` : "";
    const res = await fetch(
      `${apiBase()}/api/public/specialties/${encodeURIComponent(slug)}${qs}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.specialty) return null;
    return {
      specialty: data.specialty,
      services: Array.isArray(data.services) ? data.services : [],
      doctors: Array.isArray(data.doctors) ? data.doctors : [],
    };
  } catch {
    return null;
  }
}

export async function fetchPublicServicesCatalog(opts?: {
  locale?: Locale;
  specialty?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
  search?: string;
}): Promise<{ services: PublicService[]; total: number }> {
  try {
    const params = new URLSearchParams({
      locale: opts?.locale || "ar",
      limit: String(Math.min(48, Math.max(1, opts?.limit ?? 24))),
      page: String(Math.max(1, opts?.page ?? 1)),
    });
    if (opts?.featured) params.set("featured", "true");
    if (opts?.specialty) params.set("specialty", opts.specialty);
    if (opts?.search) params.set("search", opts.search);
    const res = await fetch(`${apiBase()}/api/public/services?${params}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return { services: [], total: 0 };
    const data = await res.json();
    return {
      services: Array.isArray(data.services) ? data.services : [],
      total: Number(data.total) || 0,
    };
  } catch {
    return { services: [], total: 0 };
  }
}

export async function fetchPublicServiceDetail(
  slug: string,
  locale?: Locale,
): Promise<{
  service: PublicService;
  doctors: PublicDoctor[];
} | null> {
  try {
    const qs = locale ? `?locale=${locale}` : "";
    const res = await fetch(
      `${apiBase()}/api/public/services/${encodeURIComponent(slug)}${qs}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.service) return null;
    return {
      service: data.service,
      doctors: Array.isArray(data.doctors) ? data.doctors : [],
    };
  } catch {
    return null;
  }
}

export async function fetchPublicDoctors(opts?: {
  q?: string;
  specialty?: string;
}): Promise<PublicDoctor[]> {
  try {
    const params = new URLSearchParams();
    if (opts?.q) params.set("q", opts.q);
    if (opts?.specialty) params.set("specialty", opts.specialty);
    const qs = params.toString();
    const res = await fetch(
      `${apiBase()}/api/public/doctors${qs ? `?${qs}` : ""}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.doctors) ? data.doctors : [];
  } catch {
    return [];
  }
}

export async function fetchPublicDoctor(
  id: string,
): Promise<PublicDoctor | null> {
  try {
    const res = await fetch(`${apiBase()}/api/public/doctors/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.doctor || null;
  } catch {
    return null;
  }
}

export async function fetchPublicReviews(limit = 24): Promise<PublicReview[]> {
  try {
    const res = await fetch(
      `${apiBase()}/api/public/reviews?limit=${limit}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.reviews)) return [];
    return data.reviews.map(
      (r: {
        id?: string;
        displayName?: string;
        quoteAr?: string;
        quoteEn?: string;
        quoteFr?: string;
        rating?: number;
        verified?: boolean;
        createdAt?: string;
      }) => ({
        id: r.id,
        displayName: r.displayName,
        nameAr: r.displayName,
        nameEn: r.displayName,
        nameFr: r.displayName,
        quoteAr: r.quoteAr,
        quoteEn: r.quoteEn,
        quoteFr: r.quoteFr,
        rating: r.rating,
        verified: r.verified,
        createdAt: r.createdAt,
      }),
    );
  } catch {
    return [];
  }
}

export type PublicPatientExperience = {
  id: string;
  displayName: string;
  review: string;
  rating: number;
  patientImageUrl?: string | null;
  treatmentTitle?: string | null;
  doctorName?: string | null;
  serviceSlug?: string | null;
  isVerifiedPatient?: boolean;
  reviewDate?: string | null;
};

export type PublicBeforeAfterCase = {
  id: string;
  title: string;
  description?: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeAlt: string;
  afterAlt: string;
  doctorName?: string | null;
  specialtySlug?: string | null;
  serviceSlug?: string | null;
  treatmentDuration?: string | null;
  resultDate?: string | null;
};

export async function fetchPublicPatientExperiences(opts?: {
  locale?: Locale;
  featured?: boolean;
  limit?: number;
}): Promise<PublicPatientExperience[]> {
  try {
    const limit = Math.min(10, Math.max(1, opts?.limit ?? 10));
    const qs = new URLSearchParams({
      limit: String(limit),
      locale: opts?.locale || "ar",
    });
    if (opts?.featured) qs.set("featured", "true");
    const res = await fetch(
      `${apiBase()}/api/public/patient-experiences?${qs}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.experiences) ? data.experiences : [];
  } catch {
    return [];
  }
}

export async function fetchPublicBeforeAfter(opts?: {
  locale?: Locale;
  featured?: boolean;
  limit?: number;
}): Promise<PublicBeforeAfterCase[]> {
  try {
    const limit = Math.min(10, Math.max(1, opts?.limit ?? 10));
    const qs = new URLSearchParams({
      limit: String(limit),
      locale: opts?.locale || "ar",
    });
    if (opts?.featured) qs.set("featured", "true");
    const res = await fetch(
      `${apiBase()}/api/public/before-after?${qs}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.cases) ? data.cases : [];
  } catch {
    return [];
  }
}

export async function fetchPublicAppointmentRef(ref: string) {
  try {
    const res = await fetch(
      `${apiBase()}/api/public/appointments/reference/${encodeURIComponent(ref)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.request || null;
  } catch {
    return null;
  }
}

export function localizedClinicName(
  locale: Locale,
  clinic?: PublicSitePayload["clinic"],
) {
  if (!clinic) return "";
  if (locale === "en")
    return clinic.nameEn || clinic.clinicNameEn || clinic.nameAr || clinic.clinicNameAr || "";
  if (locale === "fr")
    return (
      clinic.nameFr ||
      clinic.clinicNameFr ||
      clinic.nameEn ||
      clinic.clinicNameEn ||
      clinic.nameAr ||
      clinic.clinicNameAr ||
      ""
    );
  return clinic.nameAr || clinic.clinicNameAr || clinic.nameEn || clinic.clinicNameEn || "";
}

export function localizedAbout(
  locale: Locale,
  content?: PublicSitePayload["content"],
) {
  if (!content) return "";
  if (locale === "en") return content.aboutEn || content.aboutAr || "";
  if (locale === "fr")
    return content.aboutFr || content.aboutEn || content.aboutAr || "";
  return content.aboutAr || content.aboutEn || "";
}

export function pickLocalized(
  locale: Locale,
  ar?: string,
  en?: string,
  fr?: string,
  fallback = "",
) {
  if (locale === "en") return en || ar || fr || fallback;
  if (locale === "fr") return fr || en || ar || fallback;
  return ar || en || fr || fallback;
}

export function localizedServiceName(locale: Locale, s: PublicService) {
  return pickLocalized(locale, s.nameAr || s.name, s.nameEn, s.nameFr);
}

export function localizedServiceDesc(locale: Locale, s: PublicService) {
  return pickLocalized(
    locale,
    s.shortDescriptionAr || s.descriptionAr || s.shortDescription || s.description,
    s.shortDescriptionEn || s.descriptionEn,
    s.shortDescriptionFr || s.descriptionFr,
  );
}

export function localizedSpecialtyName(locale: Locale, s: PublicSpecialty) {
  return pickLocalized(locale, s.nameAr || s.name, s.nameEn, s.nameFr);
}

export function localizedSpecialtyDesc(locale: Locale, s: PublicSpecialty) {
  return pickLocalized(
    locale,
    s.descriptionAr || s.description,
    s.descriptionEn,
    s.descriptionFr,
  );
}

export function localizedDoctorSpecialty(locale: Locale, d: PublicDoctor) {
  return pickLocalized(locale, d.specialtyAr, d.specialtyEn, d.specialtyFr);
}

export function localizedDoctorBio(locale: Locale, d: PublicDoctor) {
  return pickLocalized(locale, d.bioAr, d.bioEn, d.bioFr);
}

export function localizedFaqQ(locale: Locale, f: PublicFaq) {
  return pickLocalized(locale, f.questionAr || f.question, f.questionEn, f.questionFr);
}

export function localizedFaqA(locale: Locale, f: PublicFaq) {
  return pickLocalized(locale, f.answerAr || f.answer, f.answerEn, f.answerFr);
}

export function policyText(
  locale: Locale,
  policies: PublicPolicies | undefined,
  key: "refund" | "cancellation" | "privacy" | "terms" | "cookies" | "accessibility" | "disclaimer",
) {
  if (!policies) return "";
  const map = {
    refund: ["refundAr", "refundEn", "refundFr"],
    cancellation: ["cancellationAr", "cancellationEn", "cancellationFr"],
    privacy: ["privacyAr", "privacyEn", "privacyFr"],
    terms: ["termsAr", "termsEn", "termsFr"],
    cookies: ["cookiesAr", "cookiesEn", "cookiesFr"],
    accessibility: ["accessibilityAr", "accessibilityEn", "accessibilityFr"],
    disclaimer: ["disclaimerAr", "disclaimerEn", "disclaimerFr"],
  } as const;
  const [ar, en, fr] = map[key];
  return pickLocalized(locale, policies[ar], policies[en], policies[fr]);
}

export function contentField(
  locale: Locale,
  content: PublicSitePayload["content"] | undefined,
  base:
    | "patientInfo"
    | "beforeVisit"
    | "afterVisit"
    | "support"
    | "mission",
) {
  if (!content) return "";
  const c = content as Record<string, string | undefined>;
  return pickLocalized(
    locale,
    c[`${base}Ar`],
    c[`${base}En`],
    c[`${base}Fr`],
  );
}

export function localizedWorkingHours(
  locale: Locale,
  clinic?: PublicSitePayload["clinic"],
) {
  if (!clinic) return "";
  return pickLocalized(
    locale,
    clinic.workingHoursAr,
    clinic.workingHoursEn,
    clinic.workingHoursFr,
  );
}

export function localizedDoctorAvailability(
  locale: Locale,
  d: PublicDoctor,
) {
  return pickLocalized(
    locale,
    d.availabilityNoteAr,
    d.availabilityNoteEn,
    d.availabilityNoteFr,
  );
}

export function verifiedReviews(
  content?: PublicSitePayload["content"],
): PublicReview[] {
  const rows = content?.reviews;
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (r) =>
      r &&
      r.verified !== false &&
      (r.quoteAr || r.quoteEn || r.quoteFr),
  );
}

export function localizedReviewQuote(locale: Locale, r: PublicReview) {
  return pickLocalized(locale, r.quoteAr, r.quoteEn, r.quoteFr);
}

export function localizedReviewName(locale: Locale, r: PublicReview) {
  if (r.displayName) return r.displayName;
  return pickLocalized(locale, r.nameAr, r.nameEn, r.nameFr, "—");
}
