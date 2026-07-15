export const FAQ_CATEGORIES = [
  "general",
  "contact-location",
  "working-hours",
  "appointments",
  "doctors",
  "before-visit",
  "after-visit",
  "pricing-payment",
  "general-dentistry",
  "cleaning-gums",
  "teeth-whitening",
  "fillings",
  "root-canal",
  "extraction",
  "wisdom-teeth",
  "implants",
  "crowns-bridges",
  "orthodontics",
  "pediatric-dentistry",
  "dental-emergency",
  "privacy",
  "patient-experiences",
  "before-after",
  "support",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_CATEGORY_LABELS: Record<
  FaqCategory | "all",
  { ar: string; en: string; fr: string }
> = {
  all: { ar: "الكل", en: "All", fr: "Tout" },
  general: {
    ar: "معلومات العيادة",
    en: "Clinic information",
    fr: "Informations sur la clinique",
  },
  "contact-location": {
    ar: "الموقع والتواصل",
    en: "Location & contact",
    fr: "Localisation et contact",
  },
  "working-hours": {
    ar: "ساعات العمل",
    en: "Working hours",
    fr: "Horaires",
  },
  appointments: {
    ar: "الحجز والمواعيد",
    en: "Appointments",
    fr: "Rendez-vous",
  },
  doctors: { ar: "الأطباء", en: "Doctors", fr: "Médecins" },
  "before-visit": {
    ar: "قبل الزيارة",
    en: "Before the visit",
    fr: "Avant la visite",
  },
  "after-visit": {
    ar: "بعد الزيارة",
    en: "After the visit",
    fr: "Après la visite",
  },
  "pricing-payment": {
    ar: "الأسعار والدفع",
    en: "Pricing & payment",
    fr: "Tarifs et paiement",
  },
  "general-dentistry": {
    ar: "فحص الأسنان",
    en: "Dental examination",
    fr: "Examen dentaire",
  },
  "cleaning-gums": {
    ar: "تنظيف الأسنان واللثة",
    en: "Cleaning & gums",
    fr: "Nettoyage et gencives",
  },
  "teeth-whitening": {
    ar: "تبييض الأسنان",
    en: "Teeth whitening",
    fr: "Blanchiment",
  },
  fillings: { ar: "حشوات الأسنان", en: "Fillings", fr: "Obturations" },
  "root-canal": {
    ar: "علاج العصب والجذور",
    en: "Root canal",
    fr: "Traitement de canal",
  },
  extraction: { ar: "خلع الأسنان", en: "Extraction", fr: "Extraction" },
  "wisdom-teeth": {
    ar: "ضروس العقل",
    en: "Wisdom teeth",
    fr: "Dents de sagesse",
  },
  implants: {
    ar: "زراعة الأسنان",
    en: "Dental implants",
    fr: "Implants dentaires",
  },
  "crowns-bridges": {
    ar: "التيجان والجسور",
    en: "Crowns & bridges",
    fr: "Couronnes et bridges",
  },
  orthodontics: {
    ar: "تقويم الأسنان",
    en: "Orthodontics",
    fr: "Orthodontie",
  },
  "pediatric-dentistry": {
    ar: "أسنان الأطفال",
    en: "Pediatric dentistry",
    fr: "Dentisterie pédiatrique",
  },
  "dental-emergency": {
    ar: "طوارئ الأسنان",
    en: "Dental emergency",
    fr: "Urgences dentaires",
  },
  privacy: { ar: "الخصوصية", en: "Privacy", fr: "Confidentialité" },
  "patient-experiences": {
    ar: "تجارب المرضى",
    en: "Patient experiences",
    fr: "Expériences patients",
  },
  "before-after": {
    ar: "قبل وبعد العلاج",
    en: "Before & after",
    fr: "Avant et après",
  },
  support: {
    ar: "الدعم والتواصل",
    en: "Support & contact",
    fr: "Assistance et contact",
  },
};

export const FEATURED_FAQ_SLUGS = [
  "how-to-book-appointment",
  "clinic-location",
  "clinic-working-hours",
  "choose-specific-doctor",
  "no-appointment-confirmation",
  "dental-emergencies",
  "treatment-cost",
  "whatsapp-contact",
] as const;
