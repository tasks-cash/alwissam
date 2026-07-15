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
  wizardService: string;
  sectionDoctors: string;
  sectionProcess: string;
  sectionFaq: string;
  sectionWhy: string;
  sectionJourney: string;
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
  clinicIntroTitle: string;
  learnMoreAbout: string;
  locationTitle: string;
  locationLead: string;
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
  experiencesTitle: string;
  experiencesLead: string;
  experiencesEmpty: string;
  experiencesError: string;
  experiencesVerified: string;
  experiencesRating: string;
  experiencesPrev: string;
  experiencesNext: string;
  experiencesPause: string;
  beforeAfterTitle: string;
  beforeAfterLead: string;
  beforeAfterDisclaimer: string;
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
  consultationRequired: "يتطلب استشارة مسبقة",
  parentSpecialtyLabel: "التخصص",
  serviceInfoAction: "معلومات الخدمة",
  emptyServices: "لا تتوفر خدمات عامة للعرض حاليًا.",
  searchSpecialtyService: "ابحث عن تخصص أو خدمة",
  medicalTreatmentDisclaimer: "تحدد ملاءمة العلاج بعد الفحص والتقييم من طرف الطبيب، وقد تختلف الخطة العلاجية من حالة إلى أخرى.",
  wizardService: "الخدمة",
  sectionDoctors: "الأطباء",
  sectionProcess: "مسار الحجز",
  sectionFaq: "أسئلة شائعة",
  sectionWhy: "لماذا عيادتنا؟",
  sectionJourney: "رحلة المريض",
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
    { title: "اختيار التخصص", description: "حدّدوا التخصص الأقرب لسبب الزيارة." },
    { title: "اختيار الطبيب", description: "اختاروا طبيبًا عامًا منشورًا أو اتركوا التوجيه للاستقبال." },
    { title: "اختيار التاريخ والوقت", description: "اختاروا من الأوقات المتاحة فعليًا في النظام." },
    { title: "إرسال طلب الحجز", description: "أرسلوا بياناتكم وسبب الزيارة عبر النموذج." },
    { title: "استلام تأكيد الموعد", description: "يؤكّد الاستقبال الموعد النهائي ويبلغكم." },
    { title: "زيارة العيادة", description: "التسجيل عند الوصول ثم موعدكم مع الطبيب." },
    { title: "المتابعة بعد الزيارة", description: "اتبعوا التعليمات واحجزوا المتابعة عند الحاجة." },
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
  emptyDoctors: "لا تتوفر ملفات أطباء عامة حاليًا.",
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
    { title: "الجودة", description: "التزام بالدقة السريرية والمسؤولية المهنية." },
    { title: "المتابعة", description: "استمرارية الرعاية بعد الزيارة عند الحاجة." },
    { title: "المسؤولية", description: "تواصل صادق حول التوفر والتأكيدات والتوجيه الإداري." },
    { title: "التعاون الطبي", description: "تنسيق بين التخصصات والاستقبال لصالح المريض." },
  ],
  careApproach: "نهج رعاية المريض",
  careApproachBody: "نبدأ بفهم احتياجكم، ثم توجيهكم للتخصص والطبيب المناسب، مع مواعيد واضحة ومتابعة منظمة بعد الزيارة.",
  aboutHeroTitle: "رعاية طبية قائمة على الثقة والاهتمام",
  clinicIntroTitle: "تعريف بالعيادة",
  learnMoreAbout: "اعرف المزيد عنّا",
  locationTitle: "الموقع والتواصل",
  locationLead:
    "يمكنك الوصول إلى عيادة الوسام بسهولة، أو التواصل معنا للاستفسار وحجز موعدك قبل الحضور.",
  locationImageAlt: "موقع العيادة ومعلومات التواصل",
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
  bookingConvenienceTitle: "لماذا تتعب من أجل حجز موعد؟",
  bookingConvenienceSupport:
    "هل سئمت من إضاعة الوقت والمال في التنقل، أو استئجار سيارة فقط من أجل البحث عن موعد؟",
  bookingConvenienceMain:
    "مع عيادتنا، يمكنك اختيار التخصص والطبيب والموعد المناسب لك، وإرسال طلب الحجز من منزلك بكل سهولة، دون عناء التنقل أو الانتظار.",
  bookingConvenienceClose: "احجز موعدك من بيتك، واترك لنا مهمة تنظيم زيارتك.",
  bookingConveniencePrimary: "احجز موعدك الآن",
  bookingConvenienceSecondary: "تعرّف على أطبائنا",
  bookingConvenienceTrust:
    "اختر الطبيب والموعد المناسب، ثم انتظر تأكيد الحجز من فريق العيادة.",
  bookingConvenienceImageAlt: "حجز موعد طبي من المنزل",
  bookingConvenienceBenefits: [
    "الحجز من المنزل",
    "اختيار الطبيب المناسب",
    "عرض المواعيد المتاحة",
    "تأكيد من فريق العيادة",
  ],
  emptySpecialties: "لا تتوفر تخصصات عامة للعرض حاليًا.",
  emptyFaq: "لا تتوفر أسئلة شائعة للعرض حاليًا.",
  retryLabel: "إعادة المحاولة",
  doctorCountLabel: "أطباء",
  relatedCta: "احجز موعدًا",
  hoursLabel: "ساعات العمل",
  reviewsTitle: "آراء مرضى موثّقة",
  experiencesTitle: "تجارب مرضانا",
  experiencesLead:
    "آراء وتجارب حقيقية يشاركها مرضانا بعد تلقي خدمات العيادة.",
  experiencesEmpty: "لا توجد تجارب معتمدة للعرض حاليًا.",
  experiencesError: "تعذر تحميل تجارب المرضى. يرجى المحاولة مرة أخرى.",
  experiencesVerified: "مريض موثّق",
  experiencesRating: "التقييم",
  experiencesPrev: "التجربة السابقة",
  experiencesNext: "التجربة التالية",
  experiencesPause: "إيقاف التشغيل التلقائي",
  beforeAfterTitle: "نتائج قبل وبعد العلاج",
  beforeAfterLead:
    "نماذج موثقة لحالات علاجية منشورة بعد الحصول على الموافقة اللازمة.",
  beforeAfterDisclaimer:
    "النتائج تختلف من حالة إلى أخرى، والصور المعروضة لأغراض توضيحية وبعد الحصول على موافقة النشر.",
  beforeAfterEmpty: "لا توجد حالات معتمدة للعرض حاليًا.",
  beforeAfterError: "تعذر تحميل نتائج قبل وبعد. يرجى المحاولة مرة أخرى.",
  beforeLabel: "قبل العلاج",
  afterLabel: "بعد العلاج",
  beforeAfterPrev: "الحالة السابقة",
  beforeAfterNext: "الحالة التالية",
  comparisonControl: "مقارنة صور قبل وبعد العلاج",
  bookTreatmentCta: "احجز استشارة",
  availabilityLabel: "التوفّر",
  heroVisualCaption: "رعاية فموية هادئة ودقيقة",
  quickBookTitle: "بحث سريع عن موعد",
  quickBookCta: "البحث عن موعد متاح",
  wizardSpecialty: "التخصص",
  wizardDoctor: "الطبيب",
  wizardSchedule: "الوقت",
  wizardPatient: "بياناتك",
  wizardReview: "المراجعة",
  next: "التالي",
  previous: "السابق",
  anyDoctor: "أي طبيب متاح",
  preferredSlotNote:
    "الأوقات الموضّحة مفضّلة. يؤكّد الاستقبال الموعد النهائي حسب توفر الطبيب.",
  pastDateError: "لا يمكن اختيار تاريخ في الماضي.",
  reviewSummary: "مراجعة الطلب",
  stepLabel: "الخطوة",
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
  consultationRequired: "Consultation required",
  parentSpecialtyLabel: "Specialty",
  serviceInfoAction: "Service information",
  emptyServices: "No public services are available yet.",
  searchSpecialtyService: "Search for a specialty or service",
  medicalTreatmentDisclaimer: "Suitability of treatment is determined after examination and assessment by the dentist, and the care plan may vary from one case to another.",
  wizardService: "Service",
  sectionDoctors: "Doctors",
  sectionProcess: "How booking works",
  sectionFaq: "FAQ",
  sectionWhy: "Why our clinic",
  sectionJourney: "Patient journey",
  allServices: "All services",
  allSpecialties: "All specialties",
  allDoctors: "All doctors",
  viewProfile: "View profile",
  bookWithDoctor: "Book with doctor",
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
    { title: "Choose a specialty", description: "Pick the specialty closest to your visit reason." },
    { title: "Choose a doctor", description: "Select a public clinician or let reception guide assignment." },
    { title: "Choose date and time", description: "Select from times that are genuinely available in the system." },
    { title: "Submit the booking request", description: "Send your details and visit reason through the form." },
    { title: "Receive confirmation", description: "Reception confirms the final appointment and notifies you." },
    { title: "Visit the clinic", description: "Check in at reception, then see your clinician." },
    { title: "Follow-up after the visit", description: "Follow instructions and book follow-up when needed." },
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
  emptyDoctors: "No public doctor profiles are available yet.",
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
  clinicIntroTitle: "About the clinic",
  learnMoreAbout: "Learn more about us",
  locationTitle: "Location and Contact",
  locationLead:
    "Find the clinic easily, contact our team, or book your appointment before visiting.",
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
  bookingConvenienceTitle: "Why travel just to book an appointment?",
  bookingConvenienceSupport:
    "There is no need to spend time and money travelling to the clinic before confirming an available appointment.",
  bookingConvenienceMain:
    "Choose the specialty, doctor, date, and available time from home, then submit your appointment request in just a few simple steps.",
  bookingConvenienceClose: "Book from home and let our clinic organize your visit.",
  bookingConveniencePrimary: "Book an Appointment",
  bookingConvenienceSecondary: "Meet Our Doctors",
  bookingConvenienceTrust:
    "Choose your preferred doctor and time, then wait for confirmation from the clinic team.",
  bookingConvenienceImageAlt: "Booking a medical appointment from home",
  bookingConvenienceBenefits: [
    "Book from home",
    "Choose your doctor",
    "View available times",
    "Receive clinic confirmation",
  ],
  emptySpecialties: "No public specialties are available yet.",
  emptyFaq: "No FAQ entries are available yet.",
  retryLabel: "Retry",
  doctorCountLabel: "doctors",
  relatedCta: "Book appointment",
  hoursLabel: "Working hours",
  reviewsTitle: "Verified patient reviews",
  experiencesTitle: "Patient Experiences",
  experiencesLead:
    "Real opinions and experiences shared by our patients after receiving clinic care.",
  experiencesEmpty: "No approved patient experiences are available yet.",
  experiencesError: "Could not load patient experiences. Please try again.",
  experiencesVerified: "Verified patient",
  experiencesRating: "Rating",
  experiencesPrev: "Previous experience",
  experiencesNext: "Next experience",
  experiencesPause: "Pause autoplay",
  beforeAfterTitle: "Before and After Treatment",
  beforeAfterLead:
    "Documented treatment cases published after obtaining the required consent.",
  beforeAfterDisclaimer:
    "Results vary from one patient to another. Images are published for illustrative purposes after obtaining publication consent.",
  beforeAfterEmpty: "No approved before-and-after cases are available yet.",
  beforeAfterError: "Could not load before-and-after cases. Please try again.",
  beforeLabel: "Before",
  afterLabel: "After",
  beforeAfterPrev: "Previous case",
  beforeAfterNext: "Next case",
  comparisonControl: "Compare before and after treatment images",
  bookTreatmentCta: "Book a consultation",
  availabilityLabel: "Availability",
  heroVisualCaption: "Calm, precise oral care",
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
  consultationRequired: "Consultation requise",
  parentSpecialtyLabel: "Spécialité",
  serviceInfoAction: "Informations sur le service",
  emptyServices: "Aucun service public pour le moment.",
  searchSpecialtyService: "Rechercher une spécialité ou un service",
  medicalTreatmentDisclaimer: "L’indication du traitement est déterminée après examen et évaluation par le dentiste ; le plan de soins peut varier selon les cas.",
  wizardService: "Service",
  sectionDoctors: "Médecins",
  sectionProcess: "Comment réserver",
  sectionFaq: "FAQ",
  sectionWhy: "Pourquoi nous",
  sectionJourney: "Parcours patient",
  allServices: "Tous les services",
  allSpecialties: "Toutes les spécialités",
  allDoctors: "Tous les médecins",
  viewProfile: "Voir le profil",
  bookWithDoctor: "Réserver avec le médecin",
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
    { title: "Choisir la spécialité", description: "Sélectionnez la spécialité la plus proche du motif." },
    { title: "Choisir le médecin", description: "Choisissez un profil public ou laissez l’accueil orienter." },
    { title: "Choisir date et heure", description: "Sélectionnez des créneaux réellement disponibles." },
    { title: "Envoyer la demande", description: "Transmettez vos informations et le motif via le formulaire." },
    { title: "Recevoir la confirmation", description: "L’accueil confirme le rendez-vous final et vous informe." },
    { title: "Visiter la clinique", description: "Enregistrement à l’accueil, puis consultation." },
    { title: "Suivi après la visite", description: "Suivez les consignes et réservez le suivi si besoin." },
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
  emptyDoctors: "Aucun profil médecin public pour le moment.",
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
  clinicIntroTitle: "Présentation de la clinique",
  learnMoreAbout: "En savoir plus",
  locationTitle: "Localisation et contact",
  locationLead:
    "Trouvez facilement la clinique, contactez notre équipe ou réservez votre rendez-vous avant votre visite.",
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
  bookingConvenienceTitle:
    "Pourquoi vous déplacer uniquement pour prendre rendez-vous ?",
  bookingConvenienceSupport:
    "Il n’est plus nécessaire de perdre du temps et de l’argent en vous déplaçant avant de confirmer la disponibilité d’un rendez-vous.",
  bookingConvenienceMain:
    "Choisissez la spécialité, le médecin, la date et l’heure disponible depuis chez vous, puis envoyez votre demande en quelques étapes simples.",
  bookingConvenienceClose:
    "Réservez depuis chez vous et laissez notre clinique organiser votre visite.",
  bookingConveniencePrimary: "Prendre rendez-vous",
  bookingConvenienceSecondary: "Découvrir nos médecins",
  bookingConvenienceTrust:
    "Choisissez le médecin et l’horaire souhaités, puis attendez la confirmation de l’équipe de la clinique.",
  bookingConvenienceImageAlt: "Prise de rendez-vous médical depuis le domicile",
  bookingConvenienceBenefits: [
    "Réserver depuis chez vous",
    "Choisir votre médecin",
    "Voir les horaires disponibles",
    "Recevoir la confirmation de la clinique",
  ],
  emptySpecialties: "Aucune spécialité publique pour le moment.",
  emptyFaq: "Aucune FAQ disponible pour le moment.",
  retryLabel: "Réessayer",
  doctorCountLabel: "médecins",
  relatedCta: "Prendre rendez-vous",
  hoursLabel: "Horaires",
  reviewsTitle: "Avis patients vérifiés",
  experiencesTitle: "Expériences de nos patients",
  experiencesLead:
    "Avis et expériences réels partagés par nos patients après les soins.",
  experiencesEmpty: "Aucune expérience patient approuvée pour le moment.",
  experiencesError:
    "Impossible de charger les expériences. Veuillez réessayer.",
  experiencesVerified: "Patient vérifié",
  experiencesRating: "Évaluation",
  experiencesPrev: "Expérience précédente",
  experiencesNext: "Expérience suivante",
  experiencesPause: "Pause du défilement automatique",
  beforeAfterTitle: "Avant et après le traitement",
  beforeAfterLead:
    "Cas documentés publiés après obtention du consentement requis.",
  beforeAfterDisclaimer:
    "Les résultats varient d’un patient à l’autre. Les images sont publiées à titre illustratif après obtention du consentement de publication.",
  beforeAfterEmpty: "Aucun cas avant/après approuvé pour le moment.",
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
