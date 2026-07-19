import type { Locale } from "./config";

export type PublicCopy = {
  navHome: string;
  navAbout: string;
  navServices: string;
  navSpecialties: string;
  navDoctors: string;
  navReviews: string;
  navFaq: string;
  navContact: string;
  navBook: string;
  navCreateAccount: string;
  navLogin: string;
  navStaff: string;
  heroCtaDoctors: string;
  sectionServices: string;
  sectionSpecialties: string;
  sectionSpecialtiesLead: string;
  sectionDentalServices: string;
  sectionDentalServicesLead: string;
  viewSpecialtyDetails: string;
  viewServiceDetails: string;
  serviceCountLabel: string;
  consultationRequired: string;
  parentSpecialtyLabel: string;
  serviceInfoAction: string;
  emptyServices: string;
  searchSpecialtyService: string;
  medicalTreatmentDisclaimer: string;
  specialtiesHeroTitle: string;
  specialtiesHeroLead: string;
  browseSpecialtiesCta: string;
  featuredSpecialtyBadge: string;
  featuredSpecialtiesTitle: string;
  allSpecialtiesTitle: string;
  specialtyStatsLabel: string;
  serviceAvailableLabel: string;
  specialtyJourneyTitle: string;
  specialtyJourneyLead: string;
  specialtyJourneySteps: string[];
  specialtyDoctorDecidesNote: string;
  specialtyLinkedServicesTitle: string;
  specialtyLinkedServicesLead: string;
  specialtyBookPanelTitle: string;
  specialtyBookPanelLead: string;
  viewDoctorsCta: string;
  specialtyOverviewTitle: string;
  specialtyRelatedLabel: string;
  wizardService: string;
  sectionDoctors: string;
  sectionDoctorsLead: string;
  homeDoctorsLead: string;
  sectionProcess: string;
  sectionFaq: string;
  sectionWhy: string;
  sectionJourney: string;
  sectionJourneyLead: string;
  journeyCta: string;
  allServices: string;
  allSpecialties: string;
  allDoctors: string;
  viewProfile: string;
  bookWithDoctor: string;
  process1: string;
  process2: string;
  process3: string;
  process4: string;
  whyItems: Array<{ title: string; description: string }>;
  journeySteps: Array<{ title: string; description: string }>;
  journeyBefore: string;
  journeyDuring: string;
  journeyAfter: string;
  vision: string;
  visionBody: string;
  valuesTitle: string;
  values: Array<{ title: string; description: string }>;
  careApproach: string;
  careApproachBody: string;
  aboutHeroTitle: string;
  aboutHeroDescription: string;
  clinicIntroTitle: string;
  clinicIntroLead: string;
  clinicIntroFeatures: Array<{ title: string; description: string }>;
  learnMoreAbout: string;
  learnMoreClinic: string;
  locationTitle: string;
  locationLead: string;
  homeLocationLead: string;
  locationImageAlt: string;
  addressLabel: string;
  phoneNumberLabel: string;
  emailLabel: string;
  whatsappLabel: string;
  facebookLabel: string;
  callClinic: string;
  directionsLabel: string;
  openDirectionsMaps: string;
  openDirectionsMapsShort: string;
  mapsUrlLabel: string;
  heroBookDoctor: string;
  heroDirections: string;
  sendEmailAction: string;
  quickCallSupport: string;
  quickWaSupport: string;
  quickEmailSupport: string;
  quickMapsSupport: string;
  selectDoctorAction: string;
  doctorSelectedAction: string;
  contactFinalCtaTitle: string;
  contactFinalCtaLead: string;
  contactClinic: string;
  bookingConvenienceKicker: string;
  bookingConvenienceTitle: string;
  bookingConvenienceSupport: string;
  bookingConvenienceMain: string;
  bookingConvenienceClose: string;
  bookingConveniencePrimary: string;
  bookingConvenienceSecondary: string;
  bookingConvenienceTrust: string;
  bookingConvenienceImageAlt: string;
  bookingConvenienceBenefits: string[];
  bookingSteps: Array<{ label: string; description: string }>;
  bookingFloatAppointment: string;
  bookingFloatCalendar: string;
  bookingFloatConfirm: string;
  patientFloatAppointment: string;
  patientFloatProgress: string;
  patientFloatNotice: string;
  patientFloatFile: string;
  patientSecurityBadge: string;
  emptySpecialties: string;
  emptyFaq: string;
  retryLabel: string;
  doctorCountLabel: string;
  footerClinic: string;
  footerQuick: string;
  footerPatients: string;
  footerLegal: string;
  footerContact: string;
  patientInfo: string;
  beforeVisit: string;
  afterVisit: string;
  support: string;
  refund: string;
  cancellation: string;
  privacy: string;
  terms: string;
  cookies: string;
  accessibility: string;
  disclaimer: string;
  openMenu: string;
  closeMenu: string;
  searchPlaceholder: string;
  emptyDoctors: string;
  emptyReviews: string;
  contactFormTitle: string;
  sendMessage: string;
  sendInquiry: string;
  sendInquiryButton: string;
  sending: string;
  sendingInquiry: string;
  subject: string;
  message: string;
  fullNameLabel: string;
  phoneLabel: string;
  fullNamePlaceholder: string;
  phonePlaceholder: string;
  subjectPlaceholder: string;
  messagePlaceholder: string;
  contactHeroTitle: string;
  contactHeroLead: string;
  inquiryFormLead: string;
  inquirySuccessTitle: string;
  inquirySuccessMessage: string;
  contactInfoSummaryTitle: string;
  addressCardTitle: string;
  addressCardKicker: string;
  whatsappCta: string;
  contactBookingLead: string;
  noBookableDoctors: string;
  tabInquiry: string;
  tabBookDoctor: string;
  noSlots: string;
  loadingSlots: string;
  bookTitle: string;
  bookLead: string;
  consent: string;
  firstName: string;
  lastName: string;
  preferredDate: string;
  preferredTime: string;
  visitReason: string;
  confirmationTitle: string;
  confirmationLead: string;
  queueLabel: string;
  backHome: string;
  effective: string;
  mission: string;
  relatedCta: string;
  /** @deprecated use whyItems */
  why1: string;
  why2: string;
  why3: string;
  hoursLabel: string;
  reviewsTitle: string;
  reviewsLead: string;
  reviewsAnonymous: string;
  reviewsVerifiedBadge: string;
  reviewsReadMore: string;
  reviewsReadLess: string;
  reviewsSearchPlaceholder: string;
  reviewsSearchLabel: string;
  reviewsClearSearch: string;
  reviewsFilterRating: string;
  reviewsFilterVerified: string;
  reviewsFilterFeatured: string;
  reviewsAllRatings: string;
  reviewsResultsCount: string;
  reviewsFeaturedTitle: string;
  reviewsLoadError: string;
  reviewsStatsPublished: string;
  reviewsStatsAverage: string;
  reviewsStatsVerified: string;
  reviewsPrevPage: string;
  reviewsNextPage: string;
  reviewsPageLabel: string;
  wizardSpecialtyOptional: string;
  wizardServiceOptional: string;
  wizardDoctorOptional: string;
  reviewNoSpecialty: string;
  reviewNoService: string;
  reviewNoDoctor: string;
  confirmationPendingAssignment: string;
  confirmationPendingAssignmentLead: string;
  doctorNoSchedule: string;
  experiencesTitle: string;
  experiencesLead: string;
  experiencesEmpty: string;
  experiencesError: string;
  experiencesVerified: string;
  experiencesRating: string;
  experiencesPrev: string;
  experiencesNext: string;
  experiencesPause: string;
  experiencesReadMore: string;
  experiencesReadLess: string;
  beforeAfterTitle: string;
  beforeAfterLead: string;
  beforeAfterDisclaimer: string;
  beforeAfterPublicationNote: string;
  beforeAfterEmpty: string;
  beforeAfterError: string;
  beforeLabel: string;
  afterLabel: string;
  beforeAfterPrev: string;
  beforeAfterNext: string;
  comparisonControl: string;
  bookTreatmentCta: string;
  availabilityLabel: string;
  heroVisualCaption: string;
  heroEyebrow: string;
  heroTrustHome: string;
  heroTrustDoctor: string;
  heroTrustFollowUp: string;
  heroOverlayMain: string;
  heroOverlayAccent: string;
  heroOverlayBadge: string;
  quickBookTitle: string;
  quickBookCta: string;
  wizardSpecialty: string;
  wizardDoctor: string;
  wizardSchedule: string;
  wizardPatient: string;
  wizardReview: string;
  next: string;
  previous: string;
  anyDoctor: string;
  preferredSlotNote: string;
  pastDateError: string;
  reviewSummary: string;
  stepLabel: string;
  patientAccountKicker: string;
  patientAccountTitle: string;
  patientAccountLead: string;
  patientAccountRegister: string;
  patientAccountLogin: string;
  patientAccountImageAlt: string;
  patientAccountMockLabel: string;
  locationEmailAction: string;
  locationWhatsappAction: string;
  locationContactPage: string;
  benefitAppointments: string;
  benefitStatus: string;
  benefitHistory: string;
  benefitFiles: string;
  benefitInstructions: string;
  benefitReminders: string;
  benefitProfile: string;
  benefitMessaging: string;
  reasons: Record<string, string>;
};

function baseReasons(locale: Locale): Record<string, string> {
  if (locale === "en") {
    return {
      GENERAL_EXAM: "General examination",
      EMERGENCY: "Emergency",
      TOOTHACHE: "Toothache",
      CLEANING: "Cleaning",
      FILLING: "Filling",
      EXTRACTION: "Extraction",
      ROOT_CANAL: "Root canal",
      ORTHO_CONSULT: "Orthodontic consult",
      ORTHO_FOLLOWUP: "Orthodontic follow-up",
      PROSTHETICS: "Prosthetics",
      SURGERY_CONSULT: "Surgery consult",
      SURGERY: "Surgery",
      POST_OP_FOLLOWUP: "Post-op follow-up",
      OTHER: "Other",
    };
  }
  if (locale === "fr") {
    return {
      GENERAL_EXAM: "Examen général",
      EMERGENCY: "Urgence",
      TOOTHACHE: "Mal de dents",
      CLEANING: "Nettoyage",
      FILLING: "Plombage",
      EXTRACTION: "Extraction",
      ROOT_CANAL: "Traitement de canal",
      ORTHO_CONSULT: "Consultation orthodontique",
      ORTHO_FOLLOWUP: "Suivi orthodontique",
      PROSTHETICS: "Prothèses",
      SURGERY_CONSULT: "Consultation chirurgicale",
      SURGERY: "Chirurgie",
      POST_OP_FOLLOWUP: "Suivi post-opératoire",
      OTHER: "Autre",
    };
  }
  return {
    GENERAL_EXAM: "فحص عام",
    EMERGENCY: "حالة طارئة",
    TOOTHACHE: "ألم أسنان",
    CLEANING: "تنظيف",
    FILLING: "حشو",
    EXTRACTION: "قلع",
    ROOT_CANAL: "علاج عصب",
    ORTHO_CONSULT: "استشارة تقويم",
    ORTHO_FOLLOWUP: "متابعة تقويم",
    PROSTHETICS: "تركيبات",
    SURGERY_CONSULT: "استشارة جراحة",
    SURGERY: "جراحة",
    POST_OP_FOLLOWUP: "متابعة بعد العملية",
    OTHER: "أخرى",
  };
}

const ar: PublicCopy = {
  navHome: "الرئيسية",
  navAbout: "من نحن",
  navServices: "الخدمات",
  navSpecialties: "التخصصات",
  navDoctors: "الأطباء",
  navReviews: "التقييمات",
  navFaq: "الأسئلة",
  navContact: "تواصل",
  navBook: "احجز موعدًا",
  navCreateAccount: "إنشاء حساب جديد",
  navLogin: "تسجيل الدخول",
  navStaff: "دخول الطاقم",
  heroCtaDoctors: "تعرّف على الأطباء",
  sectionServices: "خدماتنا",
  sectionSpecialties: "تخصصاتنا الطبية",
  sectionSpecialtiesLead: "مجموعة من تخصصات طب الأسنان لتوفير التشخيص والعلاج المناسب لكل حالة.",
  sectionDentalServices: "خدمات طب الأسنان",
  sectionDentalServicesLead: "اختر الخدمة التي تحتاجها، ثم اطّلع على الأطباء والمواعيد المتاحة للحجز.",
  viewSpecialtyDetails: "عرض التخصص",
  viewServiceDetails: "تفاصيل الخدمة",
  serviceCountLabel: "خدمة متاحة",
  consultationRequired: "تحتاج إلى فحص أولي",
  parentSpecialtyLabel: "التخصص",
  serviceInfoAction: "معلومات الخدمة",
  emptyServices: "لا تتوفر خدمات عامة للعرض حاليًا.",
  searchSpecialtyService: "ابحث عن تخصص أو خدمة...",
  medicalTreatmentDisclaimer: "تحدد ملاءمة الخدمة وخطتها بعد الفحص والتقييم من طرف الطبيب، وقد تختلف الخطة والنتائج من حالة إلى أخرى.",
  specialtiesHeroTitle: "تخصصات طب الأسنان",
  specialtiesHeroLead:
    "استعرض تخصصات عيادة الوسام والخدمات المرتبطة بكل تخصص، وتعرّف على الأطباء المتاحين للحجز.",
  browseSpecialtiesCta: "استعرض التخصصات",
  featuredSpecialtyBadge: "مميز",
  featuredSpecialtiesTitle: "تخصصات مميزة",
  allSpecialtiesTitle: "كل التخصصات",
  specialtyStatsLabel: "إحصاءات التخصص",
  serviceAvailableLabel: "متاحة للحجز",
  specialtyJourneyTitle: "كيف تبدأ زيارتك؟",
  specialtyJourneyLead: "مسار واضح من اختيار التخصص حتى المتابعة الطبية.",
  specialtyJourneySteps: [
    "اختر التخصص",
    "اختر الخدمة أو اترك الاختيار للطبيب",
    "اختر الطبيب أو اطلب مساعدة الاستقبال",
    "حدد الموعد",
    "يتم الفحص والتقييم",
    "يوضح الطبيب الخطة المناسبة",
    "تبدأ المتابعة حسب الحالة",
  ],
  specialtyDoctorDecidesNote:
    "يحدد الطبيب الخدمة والخطة العلاجية المناسبة بعد الفحص والتقييم.",
  specialtyLinkedServicesTitle: "الخدمات المرتبطة بالتخصص",
  specialtyLinkedServicesLead:
    "تعرّف على الخدمات المتاحة ضمن هذا التخصص واختر الخدمة المناسبة عند حجز موعدك.",
  specialtyBookPanelTitle: "احجز موعدًا لهذا التخصص",
  specialtyBookPanelLead:
    "اختر الخدمة والطبيب والموعد المناسب، أو اترك اختيار الطبيب لفريق الاستقبال لمراجعة طلبك.",
  viewDoctorsCta: "عرض الأطباء",
  specialtyOverviewTitle: "نظرة عامة على التخصص",
  specialtyRelatedLabel: "خدمات مرتبطة بهذا التخصص",
  wizardService: "الخدمة",
  sectionDoctors: "أطباؤنا",
  sectionDoctorsLead:
    "تعرّف على فريق عيادة الوسام واختر الطبيب المناسب لحجز موعدك.",
  homeDoctorsLead:
    "فريق طبي متخصص لمساعدتك في اختيار الرعاية المناسبة وحجز موعدك بسهولة.",
  sectionProcess: "مسار الحجز",
  sectionFaq: "أسئلة شائعة",
  sectionWhy: "لماذا عيادتنا؟",
  sectionJourney: "رحلة المريض في عيادة الوسام",
  sectionJourneyLead:
    "خطوات واضحة تبدأ من اختيار الخدمة وتنتهي بالمتابعة بعد الزيارة.",
  journeyCta: "ابدأ رحلتك واحجز موعدك",
  allServices: "عرض جميع الخدمات",
  allSpecialties: "عرض جميع التخصصات",
  allDoctors: "عرض جميع الأطباء",
  viewProfile: "عرض ملف الطبيب",
  bookWithDoctor: "احجز موعدًا",
  process1: "اختر التخصص أو الطبيب",
  process2: "حدّد التاريخ المفضّل",
  process3: "أرسل طلب الحجز",
  process4: "يؤكّد الاستقبال الموعد",
  whyItems: [
    { title: "فريق طبي متعدد التخصصات", description: "أطباء باختصاصات واضحة تساعدكم على الوصول للرعاية المناسبة بسرعة." },
    { title: "سهولة اختيار الطبيب المناسب", description: "تصفّحوا الملفات العامة واختاروا الطبيب وفق التخصص والتوفر." },
    { title: "تنظيم واضح ومرن للمواعيد", description: "طلب حجز منظّم عبر الموقع مع تأكيد من الاستقبال حسب الجدول الفعلي." },
    { title: "احترام خصوصية المريض", description: "نتعامل مع بياناتكم للتواصل والرعاية فقط، بحدود واضحة." },
    { title: "متابعة منظمة بعد الزيارة", description: "يمكن تنظيم مواعيد المتابعة وفق توجيه الطبيب عبر الاستقبال." },
    { title: "معلومات واضحة قبل الزيارة وبعدها", description: "صفحات جاهزة توضّح ما يُفضَّل إحضاره وكيف تتم المتابعة." },
    { title: "ساعات عمل مناسبة", description: "من السبت إلى الخميس 08:00–17:00، والجمعة مغلق." },
    { title: "تجربة مريحة من الحجز إلى المتابعة", description: "مسار واضح: تخصص، طبيب، موعد، تأكيد، زيارة، ثم متابعة." },
  ],
  why1: "فريق طبي متعدد التخصصات",
  why2: "تنظيم واضح ومرن للمواعيد",
  why3: "احترام خصوصية المريض",
  journeySteps: [
    {
      title: "اختيار الخدمة أو التخصص",
      description: "حددوا الخدمة أو التخصص الأنسب لسبب الزيارة.",
    },
    {
      title: "اختيار الطبيب أو ترك الاختيار للاستقبال",
      description:
        "اختاروا طبيبًا منشورًا، أو اتركوا لفريق الاستقبال توجيه الطلب.",
    },
    {
      title: "اختيار التاريخ والوقت المناسب",
      description: "اختاروا التاريخ والوقت المفضّلين ضمن ساعات عمل العيادة.",
    },
    {
      title: "إرسال طلب الحجز",
      description: "أرسلوا بياناتكم وسبب الزيارة عبر نموذج الحجز الآمن.",
    },
    {
      title: "مراجعة وتأكيد الموعد",
      description: "يراجع الاستقبال الطلب ويؤكّد الموعد النهائي معكم.",
    },
    {
      title: "زيارة العيادة",
      description: "عند الوصول يسجّل الاستقبال حضوركم ويوجّهكم للطبيب.",
    },
    {
      title: "استلام التعليمات والمتابعة",
      description:
        "تستلمون التعليمات بعد الزيارة وتحجزون المتابعة عند الحاجة.",
    },
  ],
  journeyBefore: "قبل الزيارة",
  journeyDuring: "أثناء الزيارة",
  journeyAfter: "بعد الزيارة",
  footerClinic: "العيادة",
  footerQuick: "روابط سريعة",
  footerPatients: "للمرضى",
  footerLegal: "قانوني",
  footerContact: "التواصل",
  patientInfo: "معلومات المريض",
  beforeVisit: "قبل زيارتك",
  afterVisit: "بعد زيارتك",
  support: "الدعم",
  refund: "سياسة الاسترداد",
  cancellation: "سياسة الإلغاء",
  privacy: "الخصوصية",
  terms: "الشروط",
  cookies: "ملفات الارتباط",
  accessibility: "إمكانية الوصول",
  disclaimer: "إخلاء طبي",
  openMenu: "القائمة",
  closeMenu: "إغلاق",
  searchPlaceholder: "ابحث بالاسم",
  emptyDoctors: "لا يوجد أطباء منشورون حاليًا.",
  emptyReviews: "لا توجد تقييمات معتمدة للعرض حاليًا.",
  contactFormTitle: "إرسال استفسار",
  sendMessage: "إرسال الرسالة",
  sendInquiry: "إرسال استفسار",
  sendInquiryButton: "إرسال الاستفسار",
  sending: "جارٍ الإرسال...",
  sendingInquiry: "جارٍ إرسال الاستفسار...",
  subject: "موضوع الاستفسار",
  message: "تفاصيل الاستفسار",
  fullNameLabel: "الاسم الكامل",
  phoneLabel: "رقم الهاتف",
  fullNamePlaceholder: "أدخل اسمك الكامل",
  phonePlaceholder: "أدخل رقم هاتفك",
  subjectPlaceholder: "اكتب موضوع استفسارك",
  messagePlaceholder: "اكتب تفاصيل استفسارك هنا",
  contactHeroTitle: "تواصل معنا واحجز موعدك بكل سهولة",
  contactHeroLead:
    "فريق عيادة الوسام جاهز للإجابة عن استفساراتك ومساعدتك في اختيار الطبيب والموعد المناسب قبل زيارتك للعيادة.",
  inquiryFormLead:
    "اكتب استفسارك وسيقوم فريق العيادة بالتواصل معك عبر رقم الهاتف الذي أدخلته.",
  inquirySuccessTitle: "تم إرسال استفسارك بنجاح",
  inquirySuccessMessage:
    "سيتواصل معك فريق عيادة الوسام في أقرب وقت ممكن.",
  contactInfoSummaryTitle: "معلومات التواصل",
  addressCardTitle: "موقع عيادة الوسام",
  addressCardKicker: "العنوان",
  whatsappCta: "تواصل عبر واتساب",
  contactBookingLead:
    "اختر التخصص والطبيب والموعد المناسب، ثم أرسل طلب الحجز وانتظر تأكيد فريق العيادة.",
  noBookableDoctors:
    "لا يوجد أطباء متاحون للحجز حاليًا. يرجى التواصل مع العيادة للمساعدة.",
  tabInquiry: "إرسال استفسار",
  tabBookDoctor: "حجز موعد مع طبيب",
  noSlots: "لا تتوفر أوقات في هذا اليوم. جرّب تاريخًا آخر.",
  loadingSlots: "جارٍ تحميل الأوقات المتاحة...",
  bookTitle: "طلب موعد",
  bookLead: "أدخلوا بياناتكم وسنتواصل لتأكيد الموعد عبر الاستقبال.",
  consent: "أوافق على سياسة العيادة واستخدام بياناتي لإدارة الموعد.",
  firstName: "الاسم",
  lastName: "اللقب",
  preferredDate: "التاريخ المفضّل",
  preferredTime: "الوقت المفضّل",
  visitReason: "سبب الزيارة",
  confirmationTitle: "تم إرسال طلب الحجز بنجاح",
  confirmationLead:
    "تم تسجيل طلبك، وسيتواصل معك فريق عيادة الوسام لتأكيد الموعد.",
  queueLabel: "رقم المرجع",
  backHome: "العودة للرئيسية",
  effective: "تاريخ السريان / آخر تحديث",
  mission: "رسالتنا",
  vision: "رؤيتنا",
  visionBody: "أن تكون العيادة مرجعًا محليًا لرعاية فموية منظمة، واضحة، وتحترم المريض في كل خطوة من الحجز إلى المتابعة.",
  valuesTitle: "قيم العيادة",
  values: [
    { title: "الاحترام", description: "تعامل مهني يحفظ كرامة المريض ووقته." },
    { title: "الخصوصية", description: "حماية بيانات التواصل والرعاية ضمن نطاق الاستخدام السريري." },
    { title: "الوضوح", description: "معلومات واضحة عن التخصصات والمواعيد وخطوات الزيارة." },
    { title: "التنظيم", description: "مسار حجز ومتابعة مرتّب من الاستقبال إلى الطبيب." },
    { title: "المسؤولية", description: "تواصل صادق حول التوفر والتأكيدات والتوجيه الإداري." },
    { title: "المتابعة", description: "استمرارية الرعاية بعد الزيارة عند الحاجة." },
    { title: "التعاون الطبي", description: "تنسيق بين التخصصات والاستقبال لصالح المريض." },
    { title: "الاهتمام براحة المريض", description: "تجربة هادئة وواضحة من الحجز حتى مغادرة العيادة." },
  ],
  careApproach: "نهج رعاية المريض",
  careApproachBody: "نبدأ بفهم احتياجكم، ثم توجيهكم للتخصص والطبيب المناسب، مع مواعيد واضحة ومتابعة منظمة بعد الزيارة.",
  aboutHeroTitle: "رعاية أسنان قائمة على الثقة والاهتمام",
  aboutHeroDescription:
    "تجمع عيادة الوسام بين التنظيم الطبي، سهولة الحجز، وتعدد خدمات طب الأسنان لتوفير تجربة واضحة ومريحة لكل مريض.",
  clinicIntroTitle: "تعرّف على عيادة الوسام",
  clinicIntroLead:
    "عيادة الوسام لطب الأسنان مساحة طبية تهدف إلى توفير تجربة منظمة وواضحة للمريض، من اختيار الخدمة والطبيب إلى الحجز والمتابعة بعد الزيارة.",
  clinicIntroFeatures: [
    {
      title: "حجز من المنزل",
      description: "أرسلوا طلب الموعد عبر الموقع دون عناء التنقل.",
    },
    {
      title: "اختيار الطبيب",
      description: "اطلعوا على الملفات العامة واختاروا الطبيب المناسب.",
    },
    {
      title: "تنظيم المواعيد",
      description: "مسار واضح من الطلب إلى التأكيد عبر الاستقبال.",
    },
    {
      title: "متابعة بعد الزيارة",
      description: "تعليمات ومتابعة منظمة وفق توجيه الطبيب.",
    },
    {
      title: "خصوصية معلومات المريض",
      description: "نحمي بياناتكم ونستخدمها لأغراض الرعاية والتواصل فقط.",
    },
    {
      title: "خدمات أسنان متعددة",
      description: "عام، تقويم، جراحة، وتنظيف وخدمات أخرى منشورة.",
    },
  ],
  learnMoreAbout: "اعرف المزيد عنّا",
  learnMoreClinic: "اعرف المزيد عن العيادة",
  locationTitle: "الموقع والتواصل",
  locationLead:
    "يمكنك الوصول إلى عيادة الوسام بسهولة، أو التواصل معنا للاستفسار وحجز موعدك قبل الحضور.",
  homeLocationLead:
    "تواصل معنا أو افتح اتجاهات الوصول إلى عيادة الوسام قبل زيارتك.",
  locationImageAlt: "موقع عيادة الوسام ومعلومات التواصل",
  addressLabel: "عنوان العيادة",
  phoneNumberLabel: "رقم الهاتف",
  emailLabel: "البريد الإلكتروني",
  whatsappLabel: "تواصل عبر واتساب",
  facebookLabel: "صفحتنا على فيسبوك",
  callClinic: "اتصل بالعيادة",
  directionsLabel: "عرض الاتجاهات",
  openDirectionsMaps: "فتح الاتجاهات في خرائط Google",
  openDirectionsMapsShort: "الوصول إلى العيادة",
  mapsUrlLabel: "رابط الموقع على خرائط Google",
  heroBookDoctor: "احجز موعدًا مع طبيب",
  heroDirections: "الوصول إلى العيادة",
  sendEmailAction: "أرسل بريدًا إلكترونيًا",
  quickCallSupport: "تواصل هاتفيًا مع فريق الاستقبال",
  quickWaSupport: "راسل العيادة عبر واتساب مباشرة",
  quickEmailSupport: "أرسل رسالة إلى بريد العيادة",
  quickMapsSupport: "افتح موقع العيادة على الخريطة",
  selectDoctorAction: "اختيار الطبيب",
  doctorSelectedAction: "تم اختيار الطبيب",
  contactFinalCtaTitle: "جاهزون لاستقبال استفسارك أو حجز موعدك",
  contactFinalCtaLead:
    "تواصل معنا هاتفيًا أو عبر واتساب، أو أرسل استفسارك، أو احجز موعدًا مع أحد أطباء العيادة.",
  contactClinic: "تواصل مع العيادة",
  bookingConvenienceKicker: "حجز من المنزل",
  bookingConvenienceTitle: "احجز موعدك من منزلك بكل سهولة",
  bookingConvenienceSupport:
    "لا حاجة إلى إضاعة الوقت والمال في التنقل فقط للبحث عن موعد. اختر الخدمة والطبيب والتاريخ المناسب، وأرسل طلب الحجز من منزلك.",
  bookingConvenienceMain: "",
  bookingConvenienceClose:
    "اترك لفريق عيادة الوسام مهمة تنظيم زيارتك والتواصل معك لتأكيد الموعد.",
  bookingConveniencePrimary: "احجز موعدك الآن",
  bookingConvenienceSecondary: "تعرّف على أطبائنا",
  bookingConvenienceTrust:
    "اختر الخدمة والطبيب والموعد، ثم انتظر تأكيد فريق العيادة.",
  bookingConvenienceImageAlt: "حجز موعد طبي من المنزل",
  bookingConvenienceBenefits: [
    "اختر الخدمة",
    "اختر الطبيب",
    "حدد الموعد",
    "أرسل طلب الحجز",
  ],
  bookingSteps: [
    {
      label: "اختر الخدمة",
      description: "اختر الخدمة أو التخصص المناسب لحالتك.",
    },
    {
      label: "اختر الطبيب",
      description: "اطّلع على الأطباء المنشورين واختر الأنسب لك.",
    },
    {
      label: "حدد الموعد",
      description: "اختر التاريخ والوقت المفضّلين لديك.",
    },
    {
      label: "أرسل طلب الحجز",
      description: "أرسل الطلب وانتظر تأكيد فريق العيادة.",
    },
  ],
  bookingFloatAppointment: "طلب حجز",
  bookingFloatCalendar: "التقويم",
  bookingFloatConfirm: "بانتظار التأكيد",
  patientFloatAppointment: "موعد قادم",
  patientFloatProgress: "متابعة العلاج",
  patientFloatNotice: "تذكير",
  patientFloatFile: "ملف طبي",
  patientSecurityBadge: "خصوصية محسّنة",
  emptySpecialties: "لا توجد تخصصات منشورة حاليًا.",
  emptyFaq: "لا تتوفر أسئلة شائعة للعرض حاليًا.",
  retryLabel: "إعادة المحاولة",
  doctorCountLabel: "أطباء",
  relatedCta: "احجز موعدًا",
  hoursLabel: "ساعات العمل",
  reviewsTitle: "تجارب وآراء مرضانا",
  reviewsLead:
    "اطّلع على تجارب المرضى المنشورة بعد مراجعتها واعتمادها من عيادة الوسام.",
  reviewsAnonymous: "مريض/ة",
  reviewsVerifiedBadge: "مريض موثّق",
  reviewsReadMore: "اقرأ المزيد",
  reviewsReadLess: "عرض أقل",
  reviewsSearchPlaceholder: "ابحث في التقييمات…",
  reviewsSearchLabel: "بحث",
  reviewsClearSearch: "مسح",
  reviewsFilterRating: "التقييم",
  reviewsFilterVerified: "موثّق فقط",
  reviewsFilterFeatured: "مميز فقط",
  reviewsAllRatings: "كل التقييمات",
  reviewsResultsCount: "{n} تقييم",
  reviewsFeaturedTitle: "تقييمات مميزة",
  reviewsLoadError: "تعذر تحميل التقييمات. يرجى المحاولة مرة أخرى.",
  reviewsStatsPublished: "تقييم منشور",
  reviewsStatsAverage: "متوسط التقييم",
  reviewsStatsVerified: "تقييم موثّق",
  reviewsPrevPage: "السابق",
  reviewsNextPage: "التالي",
  reviewsPageLabel: "صفحة",
  wizardSpecialtyOptional: "التخصص — اختياري",
  wizardServiceOptional: "الخدمة — اختيارية",
  wizardDoctorOptional: "الطبيب المفضل — اختياري",
  reviewNoSpecialty:
    "سيقوم فريق الاستقبال بمراجعة سبب الزيارة وتوجيه الطلب إلى القسم المناسب.",
  reviewNoService: "لم تُحدَّد خدمة — يمكن لفريق الاستقبال المساعدة في التوجيه.",
  reviewNoDoctor:
    "سيقوم فريق الاستقبال باختيار الطبيب المناسب بعد مراجعة الطلب.",
  confirmationPendingAssignment: "طلبك بانتظار تعيين الطبيب",
  confirmationPendingAssignmentLead:
    "تم إرسال طلب الحجز بنجاح. سيقوم فريق الاستقبال بمراجعة الطلب واختيار الطبيب المناسب، ثم التواصل معك لتأكيد الموعد.",
  doctorNoSchedule:
    "لم يتم نشر جدول عمل هذا الطبيب حاليًا. يمكنك التواصل مع الاستقبال للمساعدة في الحجز.",
  experiencesTitle: "تجارب مرضانا",
  experiencesLead:
    "آراء وتجارب منشورة بعد مراجعتها واعتمادها من عيادة الوسام.",
  experiencesEmpty: "لا توجد تجارب منشورة حاليًا.",
  experiencesError: "تعذر تحميل تجارب المرضى. يرجى المحاولة مرة أخرى.",
  experiencesVerified: "مريض موثّق",
  experiencesRating: "التقييم",
  experiencesPrev: "التجربة السابقة",
  experiencesNext: "التجربة التالية",
  experiencesPause: "إيقاف التشغيل التلقائي",
  experiencesReadMore: "عرض المزيد",
  experiencesReadLess: "عرض أقل",
  beforeAfterTitle: "حالات علاجية سابقة",
  beforeAfterLead:
    "نماذج من حالات علاج الأسنان المنشورة بموافقة أصحابها.",
  beforeAfterDisclaimer:
    "تختلف النتائج من حالة إلى أخرى، وتحدد الخطة العلاجية بعد الفحص والتقييم من طرف الطبيب.",
  beforeAfterPublicationNote:
    "الصور منشورة بعد الحصول على الموافقات المطلوبة، ولا تمثل ضمانًا للحصول على النتيجة نفسها.",
  beforeAfterEmpty: "لا توجد حالات علاجية منشورة حاليًا.",
  beforeAfterError: "تعذر تحميل الحالات العلاجية حاليًا. حاول مرة أخرى.",
  beforeLabel: "قبل العلاج",
  afterLabel: "بعد العلاج",
  beforeAfterPrev: "الحالة السابقة",
  beforeAfterNext: "الحالة التالية",
  comparisonControl: "مقارنة صور قبل وبعد العلاج",
  bookTreatmentCta: "احجز استشارة",
  availabilityLabel: "التوفّر",
  heroVisualCaption: "رعاية فموية هادئة ودقيقة",
  heroEyebrow: "رعاية أسنان متخصصة في الوادي",
  heroTrustHome: "حجز سهل من المنزل",
  heroTrustDoctor: "اختيار الطبيب المناسب",
  heroTrustFollowUp: "متابعة منظمة للمواعيد",
  heroOverlayMain: "رعاية دقيقة واهتمام بكل خطوة",
  heroOverlayAccent: "بيئة طبية منظمة ومريحة",
  heroOverlayBadge: "حجز ومتابعة من مكان واحد",
  quickBookTitle: "بحث سريع عن موعد",
  quickBookCta: "البحث عن موعد متاح",
  wizardSpecialty: "التخصص",
  wizardDoctor: "الطبيب",
  wizardSchedule: "الوقت",
  wizardPatient: "بياناتك",
  wizardReview: "المراجعة",
  next: "التالي",
  previous: "السابق",
  anyDoctor: "اتركه فارغًا ليختار الاستقبال الطبيب المناسب",
  preferredSlotNote:
    "يمكنك اختيار طبيب أو تخصص، كما يمكنك تركهما فارغين وسيقوم فريق الاستقبال بمراجعة سبب الزيارة وتوجيه طلبك إلى الطبيب المناسب.",
  pastDateError: "لا يمكن اختيار تاريخ في الماضي.",
  reviewSummary: "مراجعة الطلب",
  stepLabel: "الخطوة",
  patientAccountKicker: "حساب المريض",
  patientAccountTitle: "كل تفاصيل حالتك العلاجية في حساب واحد",
  patientAccountLead:
    "أنشئ حساب مريض لمتابعة مواعيدك وزياراتك السابقة وصورك وتقاريرك وتعليمات طبيبك من لوحة تحكم خاصة وآمنة.",
  patientAccountRegister: "إنشاء حساب جديد",
  patientAccountLogin: "تسجيل الدخول",
  patientAccountImageAlt: "بيئة رعاية أسنان احترافية للمرضى",
  patientAccountMockLabel: "معاينة توضيحية للوحة التحكم (بيانات وهمية)",
  locationEmailAction: "إرسال بريد إلكتروني",
  locationWhatsappAction: "تواصل عبر واتساب",
  locationContactPage: "صفحة التواصل",
  benefitAppointments: "متابعة جميع المواعيد",
  benefitStatus: "معرفة حالة كل حجز",
  benefitHistory: "عرض الزيارات السابقة",
  benefitFiles: "الاطلاع على الصور والتقارير الخاصة بك",
  benefitInstructions: "مراجعة تعليمات الطبيب",
  benefitReminders: "استلام تذكيرات المتابعة",
  benefitProfile: "تحديث معلوماتك الشخصية",
  benefitMessaging: "التواصل بخصوص الزيارات المكتملة",
  reasons: baseReasons("ar"),
};

const en: PublicCopy = {
  navHome: "Home",
  navAbout: "About",
  navServices: "Services",
  navSpecialties: "Specialties",
  navDoctors: "Doctors",
  navReviews: "Reviews",
  navFaq: "FAQ",
  navContact: "Contact",
  navBook: "Book appointment",
  navCreateAccount: "Create Account",
  navLogin: "Login",
  navStaff: "Staff login",
  heroCtaDoctors: "Meet our doctors",
  sectionServices: "Our services",
  sectionSpecialties: "Our Medical Specialties",
  sectionSpecialtiesLead: "A range of dental specialties to support accurate diagnosis and appropriate care for each case.",
  sectionDentalServices: "Dental Services",
  sectionDentalServicesLead: "Choose the service you need, then review available doctors and appointment times to book.",
  viewSpecialtyDetails: "View specialty",
  viewServiceDetails: "Service details",
  serviceCountLabel: "available services",
  consultationRequired: "Initial exam required",
  parentSpecialtyLabel: "Specialty",
  serviceInfoAction: "Service information",
  emptyServices: "No public services are available yet.",
  searchSpecialtyService: "Search for a specialty or service...",
  medicalTreatmentDisclaimer:
    "Suitability of the service and its care plan is determined after examination and assessment by the dentist; the plan and outcomes may vary from one case to another.",
  specialtiesHeroTitle: "Dental specialties",
  specialtiesHeroLead:
    "Browse Al Wissam specialties and related services, and meet the doctors available for booking.",
  browseSpecialtiesCta: "Browse specialties",
  featuredSpecialtyBadge: "Featured",
  featuredSpecialtiesTitle: "Featured specialties",
  allSpecialtiesTitle: "All specialties",
  specialtyStatsLabel: "Specialty statistics",
  serviceAvailableLabel: "Available to book",
  specialtyJourneyTitle: "How does your visit start?",
  specialtyJourneyLead: "A clear path from choosing a specialty to clinical follow-up.",
  specialtyJourneySteps: [
    "Choose a specialty",
    "Choose a service or leave it to the dentist",
    "Choose a doctor or ask reception for help",
    "Pick an appointment time",
    "Examination and assessment",
    "The dentist explains a suitable plan",
    "Follow-up begins as needed",
  ],
  specialtyDoctorDecidesNote:
    "The dentist determines the suitable service and treatment plan after examination and assessment.",
  specialtyLinkedServicesTitle: "Services linked to this specialty",
  specialtyLinkedServicesLead:
    "Explore the public services available in this specialty and choose one when booking.",
  specialtyBookPanelTitle: "Book an appointment for this specialty",
  specialtyBookPanelLead:
    "Choose the service, doctor, and time — or leave doctor selection to reception for review.",
  viewDoctorsCta: "View doctors",
  specialtyOverviewTitle: "Specialty overview",
  specialtyRelatedLabel: "Services related to this specialty",
  wizardService: "Service",
  sectionDoctors: "Doctors",
  sectionDoctorsLead:
    "Meet the Al-Wisam clinical team and choose the right dentist for your appointment.",
  homeDoctorsLead:
    "A specialized medical team to help you choose the right care and book with ease.",
  sectionProcess: "How booking works",
  sectionFaq: "FAQ",
  sectionWhy: "Why our clinic",
  sectionJourney: "Your journey at Al-Wisam Clinic",
  sectionJourneyLead:
    "Clear steps from choosing a service through post-visit follow-up.",
  journeyCta: "Start your journey and book",
  allServices: "All services",
  allSpecialties: "All specialties",
  allDoctors: "All doctors",
  viewProfile: "View doctor profile",
  bookWithDoctor: "Book an appointment",
  process1: "Choose a specialty or doctor",
  process2: "Pick a preferred date",
  process3: "Submit your request",
  process4: "Reception confirms your visit",
  whyItems: [
    { title: "Multidisciplinary clinical team", description: "Clear specialties help you reach the right care efficiently." },
    { title: "Easy doctor selection", description: "Browse public profiles and choose by specialty and availability." },
    { title: "Clear, flexible scheduling", description: "Online requests with reception confirmation against the live schedule." },
    { title: "Patient privacy respected", description: "We use your details for care and coordination only, with clear boundaries." },
    { title: "Organized post-visit follow-up", description: "Follow-up visits can be arranged through reception per your clinician’s plan." },
    { title: "Clear information before and after visits", description: "Patient pages explain what to bring and how follow-up works." },
    { title: "Convenient working hours", description: "Saturday to Thursday 08:00–17:00; Friday closed." },
    { title: "A calm path from booking to follow-up", description: "Specialty → doctor → time → confirmation → visit → follow-up." },
  ],
  why1: "Multidisciplinary clinical team",
  why2: "Clear, flexible scheduling",
  why3: "Patient privacy respected",
  journeySteps: [
    {
      title: "Choose a service or specialty",
      description: "Select the service or specialty that best matches your visit reason.",
    },
    {
      title: "Choose a doctor or leave it to reception",
      description:
        "Pick a published clinician, or let reception assign the right doctor.",
    },
    {
      title: "Choose a suitable date and time",
      description: "Select preferred slots within the clinic’s working hours.",
    },
    {
      title: "Submit the booking request",
      description: "Send your details and visit reason through the secure form.",
    },
    {
      title: "Review and confirm the appointment",
      description: "Reception reviews the request and confirms the final time with you.",
    },
    {
      title: "Visit the clinic",
      description: "On arrival, reception checks you in and guides you to your clinician.",
    },
    {
      title: "Receive instructions and follow-up",
      description:
        "You receive aftercare guidance and can book follow-up when needed.",
    },
  ],
  journeyBefore: "Before your visit",
  journeyDuring: "During your visit",
  journeyAfter: "After your visit",
  footerClinic: "Clinic",
  footerQuick: "Quick links",
  footerPatients: "Patients",
  footerLegal: "Legal",
  footerContact: "Contact",
  patientInfo: "Patient information",
  beforeVisit: "Before your visit",
  afterVisit: "After your visit",
  support: "Support",
  refund: "Refund policy",
  cancellation: "Cancellation policy",
  privacy: "Privacy",
  terms: "Terms",
  cookies: "Cookies",
  accessibility: "Accessibility",
  disclaimer: "Medical disclaimer",
  openMenu: "Menu",
  closeMenu: "Close",
  searchPlaceholder: "Search by name",
  emptyDoctors: "No published doctors are available yet.",
  emptyReviews: "No approved reviews are available yet.",
  contactFormTitle: "Send an inquiry",
  sendMessage: "Send message",
  sendInquiry: "Send an Inquiry",
  sendInquiryButton: "Send Inquiry",
  sending: "Sending...",
  sendingInquiry: "Sending your inquiry...",
  subject: "Inquiry subject",
  message: "Inquiry details",
  fullNameLabel: "Full name",
  phoneLabel: "Phone number",
  fullNamePlaceholder: "Enter your full name",
  phonePlaceholder: "Enter your phone number",
  subjectPlaceholder: "Write the subject of your inquiry",
  messagePlaceholder: "Write the details of your inquiry here",
  contactHeroTitle: "Contact Us and Book Your Appointment with Ease",
  contactHeroLead:
    "The Al Wissam clinic team is ready to answer your questions and help you choose the right doctor and appointment before your visit.",
  inquiryFormLead:
    "Write your inquiry and the clinic team will contact you on the phone number you enter.",
  inquirySuccessTitle: "Your inquiry was sent successfully",
  inquirySuccessMessage:
    "The Al Wissam clinic team will get back to you as soon as possible.",
  contactInfoSummaryTitle: "Contact information",
  addressCardTitle: "Al Wissam Clinic Location",
  addressCardKicker: "Address",
  whatsappCta: "Contact via WhatsApp",
  contactBookingLead:
    "Choose the specialty, doctor, and suitable appointment, then submit your booking request and wait for the clinic team to confirm.",
  noBookableDoctors:
    "No doctors are available for booking right now. Please contact the clinic for help.",
  tabInquiry: "Send an inquiry",
  tabBookDoctor: "Book an Appointment with a Doctor",
  noSlots: "No times are available on this day. Try another date.",
  loadingSlots: "Loading available times...",
  bookTitle: "Request an appointment",
  bookLead: "Share your details and reception will confirm your visit.",
  consent: "I agree to clinic policies and use of my data for appointment handling.",
  firstName: "First name",
  lastName: "Last name",
  preferredDate: "Preferred date",
  preferredTime: "Preferred time",
  visitReason: "Visit reason",
  confirmationTitle: "Booking request sent successfully",
  confirmationLead:
    "Your request has been recorded. The Al Wissam clinic team will contact you to confirm the appointment.",
  queueLabel: "Reference",
  backHome: "Back to home",
  effective: "Effective / last updated",
  mission: "Our mission",
  vision: "Our vision",
  visionBody: "To be a local reference for organized oral care that stays clear and respectful from booking through follow-up.",
  valuesTitle: "Our values",
  values: [
    { title: "Respect", description: "Professional care that protects patient dignity and time." },
    { title: "Privacy", description: "Contact and care data used only within clinical coordination boundaries." },
    { title: "Clarity", description: "Clear information on specialties, scheduling, and visit steps." },
    { title: "Quality", description: "Commitment to clinical precision and professional responsibility." },
    { title: "Follow-up", description: "Continuity of care after the visit when needed." },
    { title: "Responsibility", description: "Honest communication about availability, confirmations, and guidance." },
    { title: "Clinical collaboration", description: "Coordination between specialties and reception for the patient." },
  ],
  careApproach: "Patient-care approach",
  careApproachBody: "We start from your need, guide you to the right specialty and clinician, and keep scheduling and follow-up organized.",
  aboutHeroTitle: "Care built on trust and attention",
  aboutHeroDescription:
    "Al-Wisam combines organized dental care, clear booking, and a wide range of services for a calm patient experience.",
  clinicIntroTitle: "Discover Al-Wisam Clinic",
  clinicIntroLead:
    "Al-Wisam Dental Clinic is a medical space designed to give patients a clear, organized experience—from choosing a service and doctor to booking and post-visit follow-up.",
  clinicIntroFeatures: [
    {
      title: "Book from home",
      description: "Send your appointment request online without unnecessary travel.",
    },
    {
      title: "Choose your doctor",
      description: "Browse public profiles and select the clinician who fits your needs.",
    },
    {
      title: "Organized scheduling",
      description: "A clear path from request to confirmation with reception.",
    },
    {
      title: "Follow-up after the visit",
      description: "Aftercare guidance and organized follow-up when needed.",
    },
    {
      title: "Patient privacy",
      description: "We protect your information and use it only for care and coordination.",
    },
    {
      title: "Multiple dental services",
      description: "General care, orthodontics, surgery, cleaning, and more published services.",
    },
  ],
  learnMoreAbout: "Learn more about us",
  learnMoreClinic: "Learn more about the clinic",
  locationTitle: "Location and Contact",
  locationLead:
    "Find the clinic easily, contact our team, or book your appointment before visiting.",
  homeLocationLead:
    "Contact us or open directions to Al-Wisam Clinic before your visit.",
  locationImageAlt: "Clinic location and contact information",
  addressLabel: "Clinic Address",
  phoneNumberLabel: "Phone Number",
  emailLabel: "Email Address",
  whatsappLabel: "Contact via WhatsApp",
  facebookLabel: "Facebook Page",
  callClinic: "Call the Clinic",
  directionsLabel: "Get Directions",
  openDirectionsMaps: "Open directions in Google Maps",
  openDirectionsMapsShort: "Get to the clinic",
  mapsUrlLabel: "Google Maps location link",
  heroBookDoctor: "Book an appointment with a doctor",
  heroDirections: "Get to the clinic",
  sendEmailAction: "Send an email",
  quickCallSupport: "Call reception directly",
  quickWaSupport: "Message the clinic on WhatsApp",
  quickEmailSupport: "Email the clinic address",
  quickMapsSupport: "Open the clinic location on the map",
  selectDoctorAction: "Select doctor",
  doctorSelectedAction: "Doctor selected",
  contactFinalCtaTitle: "Ready for your inquiry or appointment request",
  contactFinalCtaLead:
    "Call or WhatsApp us, send an inquiry, or book an appointment with a clinic doctor.",
  contactClinic: "Contact the clinic",
  bookingConvenienceKicker: "Book from home",
  bookingConvenienceTitle: "Book your appointment from home with ease",
  bookingConvenienceSupport:
    "No need to waste time and money travelling just to look for an appointment. Choose the service, doctor, and date that suit you, then send your booking request from home.",
  bookingConvenienceMain: "",
  bookingConvenienceClose:
    "Leave visit coordination and confirmation to the Al-Wisam clinic team.",
  bookingConveniencePrimary: "Book your appointment now",
  bookingConvenienceSecondary: "Meet our doctors",
  bookingConvenienceTrust:
    "Choose the service, doctor, and time, then wait for confirmation from the clinic team.",
  bookingConvenienceImageAlt: "Booking a medical appointment from home",
  bookingConvenienceBenefits: [
    "Choose the service",
    "Choose the doctor",
    "Pick a time",
    "Send the booking request",
  ],
  bookingSteps: [
    {
      label: "Choose the service",
      description: "Select the service or specialty that fits your needs.",
    },
    {
      label: "Choose the doctor",
      description: "Browse published doctors and pick the right clinician.",
    },
    {
      label: "Pick a time",
      description: "Choose your preferred date and time.",
    },
    {
      label: "Send the booking request",
      description: "Submit your request and wait for clinic confirmation.",
    },
  ],
  bookingFloatAppointment: "Booking request",
  bookingFloatCalendar: "Calendar",
  bookingFloatConfirm: "Awaiting confirmation",
  patientFloatAppointment: "Upcoming visit",
  patientFloatProgress: "Care progress",
  patientFloatNotice: "Reminder",
  patientFloatFile: "Medical file",
  patientSecurityBadge: "Privacy protected",
  emptySpecialties: "No public specialties are available yet.",
  emptyFaq: "No FAQ entries are available yet.",
  retryLabel: "Retry",
  doctorCountLabel: "doctors",
  relatedCta: "Book appointment",
  hoursLabel: "Working hours",
  reviewsTitle: "Patient reviews & experiences",
  reviewsLead:
    "Real ratings and feedback from Al Wissam patients after receiving care — approved and published with consent.",
  reviewsAnonymous: "Patient",
  reviewsVerifiedBadge: "Verified patient",
  reviewsReadMore: "Read more",
  reviewsReadLess: "Show less",
  reviewsSearchPlaceholder: "Search reviews…",
  reviewsSearchLabel: "Search",
  reviewsClearSearch: "Clear",
  reviewsFilterRating: "Rating",
  reviewsFilterVerified: "Verified only",
  reviewsFilterFeatured: "Featured only",
  reviewsAllRatings: "All ratings",
  reviewsResultsCount: "{n} reviews",
  reviewsFeaturedTitle: "Featured reviews",
  reviewsLoadError: "Could not load reviews. Please try again.",
  reviewsStatsPublished: "Published reviews",
  reviewsStatsAverage: "Average rating",
  reviewsStatsVerified: "Verified reviews",
  reviewsPrevPage: "Previous",
  reviewsNextPage: "Next",
  reviewsPageLabel: "Page",
  wizardSpecialtyOptional: "Specialty (optional)",
  wizardServiceOptional: "Service (optional)",
  wizardDoctorOptional: "Doctor (optional)",
  reviewNoSpecialty: "No specialty selected — reception will guide you",
  reviewNoService: "No service selected — optional",
  reviewNoDoctor: "No doctor selected — reception will assign a suitable clinician",
  confirmationPendingAssignment: "Your request is awaiting doctor assignment",
  confirmationPendingAssignmentLead:
    "We received your request. Reception will assign a suitable doctor and contact you to confirm the appointment.",
  doctorNoSchedule: "Schedule not available online — contact reception to book.",
  experiencesTitle: "Patient Experiences",
  experiencesLead:
    "Opinions and experiences published after review and approval by Al-Wisam Clinic.",
  experiencesEmpty: "No published patient experiences are available yet.",
  experiencesError: "Could not load patient experiences. Please try again.",
  experiencesVerified: "Verified patient",
  experiencesRating: "Rating",
  experiencesPrev: "Previous experience",
  experiencesNext: "Next experience",
  experiencesPause: "Pause autoplay",
  experiencesReadMore: "Read more",
  experiencesReadLess: "Show less",
  beforeAfterTitle: "Before and After Treatment",
  beforeAfterLead:
    "Treatment cases published after review and the required consents.",
  beforeAfterDisclaimer:
    "Results vary from one case to another. The treatment plan is determined after examination and assessment by the dentist.",
  beforeAfterPublicationNote:
    "Images are published after obtaining the required consents and do not guarantee the same outcome.",
  beforeAfterEmpty: "No published before-and-after cases are available yet.",
  beforeAfterError: "Could not load before-and-after cases. Please try again.",
  beforeLabel: "Before",
  afterLabel: "After",
  beforeAfterPrev: "Previous case",
  beforeAfterNext: "Next case",
  comparisonControl: "Compare before and after treatment images",
  bookTreatmentCta: "Book a consultation",
  availabilityLabel: "Availability",
  heroVisualCaption: "Calm, precise oral care",
  heroEyebrow: "Specialized dental care in El Oued",
  heroTrustHome: "Easy booking from home",
  heroTrustDoctor: "Choose the right doctor",
  heroTrustFollowUp: "Organized appointment follow-up",
  heroOverlayMain: "Precise care at every step",
  heroOverlayAccent: "An organized, comfortable clinic",
  heroOverlayBadge: "Book and follow up in one place",
  quickBookTitle: "Quick appointment search",
  quickBookCta: "Continue booking",
  wizardSpecialty: "Specialty",
  wizardDoctor: "Doctor",
  wizardSchedule: "Schedule",
  wizardPatient: "Your details",
  wizardReview: "Review",
  next: "Next",
  previous: "Previous",
  anyDoctor: "Any available doctor",
  preferredSlotNote:
    "Times shown are preferences. Reception confirms the final slot based on doctor availability.",
  pastDateError: "Past dates cannot be selected.",
  reviewSummary: "Review request",
  stepLabel: "Step",
  patientAccountKicker: "Patient account",
  patientAccountTitle: "All your care details in one secure account",
  patientAccountLead:
    "Create a patient account to follow appointments, past visits, images and reports, and doctor instructions from a private, secure dashboard.",
  patientAccountRegister: "Create an account",
  patientAccountLogin: "Sign in",
  patientAccountImageAlt: "Professional dental care environment for patients",
  patientAccountMockLabel: "Decorative dashboard preview (mock data)",
  locationEmailAction: "Send an email",
  locationWhatsappAction: "Contact via WhatsApp",
  locationContactPage: "Contact page",
  benefitAppointments: "Follow all appointments",
  benefitStatus: "Know each booking status",
  benefitHistory: "View past visits",
  benefitFiles: "Access your private images and reports",
  benefitInstructions: "Review doctor instructions",
  benefitReminders: "Receive follow-up reminders",
  benefitProfile: "Update your personal details",
  benefitMessaging: "Message about completed visits",
  reasons: baseReasons("en"),
};

const fr: PublicCopy = {
  navHome: "Accueil",
  navAbout: "À propos",
  navServices: "Services",
  navSpecialties: "Spécialités",
  navDoctors: "Médecins",
  navReviews: "Avis",
  navFaq: "FAQ",
  navContact: "Contact",
  navBook: "Prendre rendez-vous",
  navCreateAccount: "Créer un compte",
  navLogin: "Se connecter",
  navStaff: "Espace personnel",
  heroCtaDoctors: "Nos médecins",
  sectionServices: "Nos services",
  sectionSpecialties: "Nos spécialités médicales",
  sectionSpecialtiesLead: "Un ensemble de spécialités dentaires pour un diagnostic et une prise en charge adaptés à chaque cas.",
  sectionDentalServices: "Services dentaires",
  sectionDentalServicesLead: "Choisissez le service dont vous avez besoin, puis consultez les médecins et créneaux disponibles.",
  viewSpecialtyDetails: "Voir la spécialité",
  viewServiceDetails: "Détails du service",
  serviceCountLabel: "services disponibles",
  consultationRequired: "Examen initial requis",
  parentSpecialtyLabel: "Spécialité",
  serviceInfoAction: "Informations sur le service",
  emptyServices: "Aucun service public pour le moment.",
  searchSpecialtyService: "Rechercher une spécialité ou un service...",
  medicalTreatmentDisclaimer:
    "L’indication du service et son plan de soins sont déterminés après examen et évaluation par le dentiste ; le plan et les résultats peuvent varier selon les cas.",
  specialtiesHeroTitle: "Spécialités dentaires",
  specialtiesHeroLead:
    "Parcourez les spécialités de la Clinique El Wissam, les services associés et les médecins disponibles à la réservation.",
  browseSpecialtiesCta: "Parcourir les spécialités",
  featuredSpecialtyBadge: "À la une",
  featuredSpecialtiesTitle: "Spécialités mises en avant",
  allSpecialtiesTitle: "Toutes les spécialités",
  specialtyStatsLabel: "Statistiques de la spécialité",
  serviceAvailableLabel: "Disponible à la réservation",
  specialtyJourneyTitle: "Comment commence votre visite ?",
  specialtyJourneyLead:
    "Un parcours clair, du choix de la spécialité au suivi clinique.",
  specialtyJourneySteps: [
    "Choisir la spécialité",
    "Choisir le service ou laisser le choix au dentiste",
    "Choisir le médecin ou demander l’aide de l’accueil",
    "Choisir le rendez-vous",
    "Examen et évaluation",
    "Le dentiste explique le plan adapté",
    "Le suivi commence selon le cas",
  ],
  specialtyDoctorDecidesNote:
    "Le dentiste détermine le service et le plan de soins adaptés après examen et évaluation.",
  specialtyLinkedServicesTitle: "Services liés à cette spécialité",
  specialtyLinkedServicesLead:
    "Découvrez les services publics disponibles dans cette spécialité et choisissez-en un lors de la réservation.",
  specialtyBookPanelTitle: "Prendre rendez-vous pour cette spécialité",
  specialtyBookPanelLead:
    "Choisissez le service, le médecin et l’horaire — ou laissez la sélection du médecin à l’accueil.",
  viewDoctorsCta: "Voir les médecins",
  specialtyOverviewTitle: "Aperçu de la spécialité",
  specialtyRelatedLabel: "Services liés à cette spécialité",
  wizardService: "Service",
  sectionDoctors: "Nos médecins",
  sectionDoctorsLead:
    "Découvrez l’équipe de la clinique Al-Wisam et choisissez le dentiste adapté à votre rendez-vous.",
  homeDoctorsLead:
    "Une équipe médicale spécialisée pour vous aider à choisir les soins adaptés et réserver facilement.",
  sectionProcess: "Comment réserver",
  sectionFaq: "FAQ",
  sectionWhy: "Pourquoi nous",
  sectionJourney: "Parcours patient à la clinique Al-Wisam",
  sectionJourneyLead:
    "Des étapes claires, du choix du service au suivi après la visite.",
  journeyCta: "Commencez votre parcours et réservez",
  allServices: "Tous les services",
  allSpecialties: "Toutes les spécialités",
  allDoctors: "Tous les médecins",
  viewProfile: "Voir le profil du médecin",
  bookWithDoctor: "Prendre rendez-vous",
  process1: "Choisir une spécialité ou un médecin",
  process2: "Choisir une date",
  process3: "Envoyer la demande",
  process4: "L’accueil confirme la visite",
  whyItems: [
    { title: "Équipe pluridisciplinaire", description: "Des spécialités claires pour orienter rapidement les soins." },
    { title: "Choix simple du médecin", description: "Parcourez les profils publics selon spécialité et disponibilité." },
    { title: "Agenda clair et flexible", description: "Demandes en ligne confirmées par l’accueil selon le planning réel." },
    { title: "Respect de la confidentialité", description: "Vos données servent à la coordination des soins, avec des limites claires." },
    { title: "Suivi organisé après la visite", description: "Le suivi peut être planifié via l’accueil selon le plan clinique." },
    { title: "Informations claires avant et après", description: "Des pages patient expliquent quoi apporter et comment se fait le suivi." },
    { title: "Horaires adaptés", description: "Samedi à jeudi 08:00–17:00 ; vendredi fermé." },
    { title: "Parcours serein de la réservation au suivi", description: "Spécialité → médecin → horaire → confirmation → visite → suivi." },
  ],
  why1: "Équipe pluridisciplinaire",
  why2: "Agenda clair et flexible",
  why3: "Respect de la confidentialité",
  journeySteps: [
    {
      title: "Choisir le service ou la spécialité",
      description: "Sélectionnez le service ou la spécialité le plus adapté au motif.",
    },
    {
      title: "Choisir le médecin ou laisser l’accueil décider",
      description:
        "Choisissez un profil publié, ou laissez l’accueil orienter la demande.",
    },
    {
      title: "Choisir la date et l’heure adaptées",
      description: "Sélectionnez des créneaux dans les horaires d’ouverture.",
    },
    {
      title: "Envoyer la demande de rendez-vous",
      description: "Transmettez vos informations et le motif via le formulaire sécurisé.",
    },
    {
      title: "Révision et confirmation du rendez-vous",
      description: "L’accueil examine la demande et confirme l’horaire final avec vous.",
    },
    {
      title: "Visiter la clinique",
      description: "À l’arrivée, l’accueil vous enregistre et vous oriente vers le clinicien.",
    },
    {
      title: "Recevoir les consignes et le suivi",
      description:
        "Vous recevez les consignes après la visite et pouvez planifier le suivi si besoin.",
    },
  ],
  journeyBefore: "Avant la visite",
  journeyDuring: "Pendant la visite",
  journeyAfter: "Après la visite",
  footerClinic: "Clinique",
  footerQuick: "Liens rapides",
  footerPatients: "Patients",
  footerLegal: "Légal",
  footerContact: "Contact",
  patientInfo: "Informations patients",
  beforeVisit: "Avant votre visite",
  afterVisit: "Après votre visite",
  support: "Assistance",
  refund: "Remboursement",
  cancellation: "Annulation",
  privacy: "Confidentialité",
  terms: "Conditions",
  cookies: "Cookies",
  accessibility: "Accessibilité",
  disclaimer: "Avertissement médical",
  openMenu: "Menu",
  closeMenu: "Fermer",
  searchPlaceholder: "Rechercher par nom",
  emptyDoctors: "Aucun médecin publié pour le moment.",
  emptyReviews: "Aucun avis approuvé pour le moment.",
  contactFormTitle: "Envoyer une demande",
  sendMessage: "Envoyer le message",
  sendInquiry: "Envoyer une demande",
  sendInquiryButton: "Envoyer la demande",
  sending: "Envoi...",
  sendingInquiry: "Envoi de la demande…",
  subject: "Objet de la demande",
  message: "Détails de la demande",
  fullNameLabel: "Nom complet",
  phoneLabel: "Numéro de téléphone",
  fullNamePlaceholder: "Saisissez votre nom complet",
  phonePlaceholder: "Saisissez votre numéro de téléphone",
  subjectPlaceholder: "Écrivez l’objet de votre demande",
  messagePlaceholder: "Écrivez les détails de votre demande ici",
  contactHeroTitle: "Contactez-nous et prenez rendez-vous facilement",
  contactHeroLead:
    "L’équipe de la clinique El Wissam est prête à répondre à vos questions et à vous aider à choisir le médecin et le créneau adaptés avant votre visite.",
  inquiryFormLead:
    "Écrivez votre demande ; l’équipe vous contactera au numéro de téléphone saisi.",
  inquirySuccessTitle: "Votre demande a bien été envoyée",
  inquirySuccessMessage:
    "L’équipe de la clinique El Wissam vous recontactera dans les plus brefs délais.",
  contactInfoSummaryTitle: "Coordonnées",
  addressCardTitle: "Emplacement de la clinique El Wissam",
  addressCardKicker: "Adresse",
  whatsappCta: "Contacter via WhatsApp",
  contactBookingLead:
    "Choisissez la spécialité, le médecin et le créneau adapté, puis envoyez votre demande et attendez la confirmation de l’équipe.",
  noBookableDoctors:
    "Aucun médecin n’est disponible pour la réservation pour le moment. Veuillez contacter la clinique.",
  tabInquiry: "Envoyer une demande",
  tabBookDoctor: "Prendre rendez-vous avec un médecin",
  noSlots: "Aucun créneau ce jour-là. Essayez une autre date.",
  loadingSlots: "Chargement des créneaux...",
  bookTitle: "Demande de rendez-vous",
  bookLead: "Indiquez vos coordonnées ; l’accueil confirmera la visite.",
  consent:
    "J’accepte les politiques de la clinique et l’utilisation de mes données pour le rendez-vous.",
  firstName: "Prénom",
  lastName: "Nom",
  preferredDate: "Date préférée",
  preferredTime: "Heure préférée",
  visitReason: "Motif de visite",
  confirmationTitle: "Demande de rendez-vous envoyée avec succès",
  confirmationLead:
    "Votre demande a été enregistrée. L’équipe de la clinique El Wissam vous contactera pour confirmer le rendez-vous.",
  queueLabel: "Référence",
  backHome: "Retour à l’accueil",
  effective: "Date d’effet / mise à jour",
  mission: "Notre mission",
  vision: "Notre vision",
  visionBody: "Devenir une référence locale de soins bucco-dentaires organisés, clairs et respectueux, de la réservation au suivi.",
  valuesTitle: "Nos valeurs",
  values: [
    { title: "Respect", description: "Une prise en charge professionnelle qui préserve la dignité et le temps du patient." },
    { title: "Confidentialité", description: "Des données utilisées uniquement dans le cadre de la coordination clinique." },
    { title: "Clarté", description: "Des informations nettes sur spécialités, horaires et étapes de visite." },
    { title: "Qualité", description: "Un engagement de précision clinique et de responsabilité." },
    { title: "Suivi", description: "Une continuité des soins après la visite si besoin." },
    { title: "Responsabilité", description: "Une communication honnête sur disponibilités et confirmations." },
    { title: "Collaboration", description: "Une coordination entre spécialités et accueil au service du patient." },
  ],
  careApproach: "Approche de soins",
  careApproachBody: "Nous partons de votre besoin, vous orientons vers la spécialité et le clinicien adaptés, avec un suivi organisé.",
  aboutHeroTitle: "Des soins fondés sur la confiance et l’attention",
  aboutHeroDescription:
    "La clinique Al-Wisam allie organisation médicale, prise de rendez-vous claire et diversité de soins dentaires pour une expérience sereine.",
  clinicIntroTitle: "Découvrez la clinique Al-Wisam",
  clinicIntroLead:
    "La clinique dentaire Al-Wisam est un espace médical conçu pour offrir au patient une expérience claire et organisée, du choix du service et du médecin jusqu’au suivi après la visite.",
  clinicIntroFeatures: [
    {
      title: "Réserver depuis chez soi",
      description: "Envoyez votre demande en ligne sans déplacements inutiles.",
    },
    {
      title: "Choisir le médecin",
      description: "Consultez les profils publics et sélectionnez le clinicien adapté.",
    },
    {
      title: "Organisation des rendez-vous",
      description: "Un parcours clair de la demande à la confirmation par l’accueil.",
    },
    {
      title: "Suivi après la visite",
      description: "Consignes et suivi organisé selon les indications du médecin.",
    },
    {
      title: "Confidentialité des données",
      description: "Nous protégeons vos informations et les utilisons uniquement pour les soins et la coordination.",
    },
    {
      title: "Services dentaires variés",
      description: "Soins généraux, orthodontie, chirurgie, nettoyage et autres services publiés.",
    },
  ],
  learnMoreAbout: "En savoir plus",
  learnMoreClinic: "En savoir plus sur la clinique",
  locationTitle: "Localisation et contact",
  locationLead:
    "Trouvez facilement la clinique, contactez notre équipe ou réservez votre rendez-vous avant votre visite.",
  homeLocationLead:
    "Contactez-nous ou ouvrez l’itinéraire vers la clinique El Wissam avant votre visite.",
  locationImageAlt: "Localisation et informations de contact de la clinique",
  addressLabel: "Adresse de la clinique",
  phoneNumberLabel: "Numéro de téléphone",
  emailLabel: "Adresse e-mail",
  whatsappLabel: "Contacter via WhatsApp",
  facebookLabel: "Page Facebook",
  callClinic: "Appeler la clinique",
  directionsLabel: "Afficher l’itinéraire",
  openDirectionsMaps: "Ouvrir l’itinéraire dans Google Maps",
  openDirectionsMapsShort: "Accéder à la clinique",
  mapsUrlLabel: "Lien Google Maps de l’emplacement",
  heroBookDoctor: "Prendre rendez-vous avec un médecin",
  heroDirections: "Accéder à la clinique",
  sendEmailAction: "Envoyer un e-mail",
  quickCallSupport: "Appelez directement la réception",
  quickWaSupport: "Écrivez à la clinique sur WhatsApp",
  quickEmailSupport: "Envoyez un message à l’adresse e-mail",
  quickMapsSupport: "Ouvrez l’emplacement sur la carte",
  selectDoctorAction: "Choisir le médecin",
  doctorSelectedAction: "Médecin sélectionné",
  contactFinalCtaTitle: "Prêts pour votre demande ou votre rendez-vous",
  contactFinalCtaLead:
    "Appelez-nous ou écrivez sur WhatsApp, envoyez une demande, ou réservez avec un médecin de la clinique.",
  contactClinic: "Contacter la clinique",
  bookingConvenienceKicker: "Réservation à domicile",
  bookingConvenienceTitle: "Réservez votre rendez-vous depuis chez vous en toute simplicité",
  bookingConvenienceSupport:
    "Plus besoin de perdre du temps et de l’argent en vous déplaçant uniquement pour chercher un rendez-vous. Choisissez le service, le médecin et la date qui vous conviennent, puis envoyez votre demande depuis chez vous.",
  bookingConvenienceMain: "",
  bookingConvenienceClose:
    "Laissez à l’équipe de la clinique El Wissam le soin d’organiser votre visite et de vous contacter pour confirmer le rendez-vous.",
  bookingConveniencePrimary: "Réservez votre rendez-vous maintenant",
  bookingConvenienceSecondary: "Découvrir nos médecins",
  bookingConvenienceTrust:
    "Choisissez le service, le médecin et l’horaire, puis attendez la confirmation de l’équipe de la clinique.",
  bookingConvenienceImageAlt: "Prise de rendez-vous médical depuis le domicile",
  bookingConvenienceBenefits: [
    "Choisir le service",
    "Choisir le médecin",
    "Choisir l’horaire",
    "Envoyer la demande",
  ],
  bookingSteps: [
    {
      label: "Choisir le service",
      description: "Sélectionnez le service ou la spécialité adaptés à votre besoin.",
    },
    {
      label: "Choisir le médecin",
      description: "Consultez les médecins publiés et choisissez le clinicien adapté.",
    },
    {
      label: "Choisir l’horaire",
      description: "Indiquez la date et l’heure que vous préférez.",
    },
    {
      label: "Envoyer la demande",
      description: "Envoyez votre demande et attendez la confirmation de la clinique.",
    },
  ],
  bookingFloatAppointment: "Demande de RDV",
  bookingFloatCalendar: "Calendrier",
  bookingFloatConfirm: "En attente de confirmation",
  patientFloatAppointment: "Visite à venir",
  patientFloatProgress: "Suivi du soin",
  patientFloatNotice: "Rappel",
  patientFloatFile: "Dossier médical",
  patientSecurityBadge: "Confidentialité renforcée",
  emptySpecialties: "Aucune spécialité publique pour le moment.",
  emptyFaq: "Aucune FAQ disponible pour le moment.",
  retryLabel: "Réessayer",
  doctorCountLabel: "médecins",
  relatedCta: "Prendre rendez-vous",
  hoursLabel: "Horaires",
  reviewsTitle: "Avis et expériences patients",
  reviewsLead:
    "Évaluations et retours réels de patients de la clinique El Wissam — approuvés et publiés avec consentement.",
  reviewsAnonymous: "Patient",
  reviewsVerifiedBadge: "Patient vérifié",
  reviewsReadMore: "Lire la suite",
  reviewsReadLess: "Réduire",
  reviewsSearchPlaceholder: "Rechercher dans les avis…",
  reviewsSearchLabel: "Recherche",
  reviewsClearSearch: "Effacer",
  reviewsFilterRating: "Évaluation",
  reviewsFilterVerified: "Vérifiés uniquement",
  reviewsFilterFeatured: "Mis en avant",
  reviewsAllRatings: "Toutes les notes",
  reviewsResultsCount: "{n} avis",
  reviewsFeaturedTitle: "Avis mis en avant",
  reviewsLoadError: "Impossible de charger les avis. Veuillez réessayer.",
  reviewsStatsPublished: "Avis publiés",
  reviewsStatsAverage: "Note moyenne",
  reviewsStatsVerified: "Avis vérifiés",
  reviewsPrevPage: "Précédent",
  reviewsNextPage: "Suivant",
  reviewsPageLabel: "Page",
  wizardSpecialtyOptional: "Spécialité (optionnel)",
  wizardServiceOptional: "Service (optionnel)",
  wizardDoctorOptional: "Médecin (optionnel)",
  reviewNoSpecialty: "Aucune spécialité — l’accueil vous orientera",
  reviewNoService: "Aucun service — optionnel",
  reviewNoDoctor: "Aucun médecin — l’accueil attribuera un clinicien adapté",
  confirmationPendingAssignment: "Demande en attente d’attribution",
  confirmationPendingAssignmentLead:
    "Votre demande a été reçue. L’accueil attribuera un médecin et vous contactera pour confirmer le rendez-vous.",
  doctorNoSchedule: "Planning non disponible en ligne — contactez l’accueil pour réserver.",
  experiencesTitle: "Expériences de nos patients",
  experiencesLead:
    "Avis et expériences publiés après révision et validation par la clinique Al-Wisam.",
  experiencesEmpty: "Aucune expérience patient publiée pour le moment.",
  experiencesError:
    "Impossible de charger les expériences. Veuillez réessayer.",
  experiencesVerified: "Patient vérifié",
  experiencesRating: "Évaluation",
  experiencesPrev: "Expérience précédente",
  experiencesNext: "Expérience suivante",
  experiencesPause: "Pause du défilement automatique",
  experiencesReadMore: "Afficher plus",
  experiencesReadLess: "Afficher moins",
  beforeAfterTitle: "Avant et après le traitement",
  beforeAfterLead:
    "Cas thérapeutiques publiés après révision et obtention des consentements requis.",
  beforeAfterDisclaimer:
    "Les résultats varient d’un cas à l’autre. Le plan de traitement est déterminé après examen et évaluation par le dentiste.",
  beforeAfterPublicationNote:
    "Les images sont publiées après obtention des consentements requis et ne garantissent pas le même résultat.",
  beforeAfterEmpty: "Aucun cas avant/après publié pour le moment.",
  beforeAfterError:
    "Impossible de charger les cas avant/après. Veuillez réessayer.",
  beforeLabel: "Avant",
  afterLabel: "Après",
  beforeAfterPrev: "Cas précédent",
  beforeAfterNext: "Cas suivant",
  comparisonControl: "Comparer les images avant et après le traitement",
  bookTreatmentCta: "Prendre rendez-vous",
  availabilityLabel: "Disponibilité",
  heroVisualCaption: "Des soins bucco-dentaires calmes et précis",
  heroEyebrow: "Soins dentaires spécialisés à El Oued",
  heroTrustHome: "Réservation facile depuis chez vous",
  heroTrustDoctor: "Choisissez le bon médecin",
  heroTrustFollowUp: "Suivi organisé des rendez-vous",
  heroOverlayMain: "Des soins précis à chaque étape",
  heroOverlayAccent: "Un environnement médical organisé",
  heroOverlayBadge: "Réserver et suivre au même endroit",
  quickBookTitle: "Recherche rapide de rendez-vous",
  quickBookCta: "Continuer la réservation",
  wizardSpecialty: "Spécialité",
  wizardDoctor: "Médecin",
  wizardSchedule: "Horaire",
  wizardPatient: "Vos informations",
  wizardReview: "Vérification",
  next: "Suivant",
  previous: "Précédent",
  anyDoctor: "Tout médecin disponible",
  preferredSlotNote:
    "Les horaires indiqués sont des préférences. L’accueil confirme le créneau final selon la disponibilité.",
  pastDateError: "Les dates passées ne peuvent pas être sélectionnées.",
  reviewSummary: "Vérifier la demande",
  stepLabel: "Étape",
  patientAccountKicker: "Compte patient",
  patientAccountTitle: "Tous les détails de vos soins dans un seul compte",
  patientAccountLead:
    "Créez un compte patient pour suivre vos rendez-vous, vos visites précédentes, vos images et rapports, et les consignes de votre médecin depuis un tableau de bord privé et sécurisé.",
  patientAccountRegister: "Créer un compte",
  patientAccountLogin: "Se connecter",
  patientAccountImageAlt: "Environnement de soins dentaires professionnel",
  patientAccountMockLabel: "Aperçu décoratif du tableau de bord (données fictives)",
  locationEmailAction: "Envoyer un e-mail",
  locationWhatsappAction: "Contacter via WhatsApp",
  locationContactPage: "Page de contact",
  benefitAppointments: "Suivre tous les rendez-vous",
  benefitStatus: "Connaître l’état de chaque réservation",
  benefitHistory: "Voir les visites précédentes",
  benefitFiles: "Consulter vos images et rapports privés",
  benefitInstructions: "Relire les consignes du médecin",
  benefitReminders: "Recevoir des rappels de suivi",
  benefitProfile: "Mettre à jour vos informations personnelles",
  benefitMessaging: "Échanger au sujet des visites terminées",
  reasons: baseReasons("fr"),
};

export function getPublicCopy(locale: Locale): PublicCopy {
  if (locale === "en") return en;
  if (locale === "fr") return fr;
  return ar;
}

export function reasonLabel(locale: Locale, code: string): string {
  const map = getPublicCopy(locale).reasons;
  return map[code] || code;
}
