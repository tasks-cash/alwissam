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
  directionsLabel: string;
  contactClinic: string;
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
  sending: string;
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
  sectionSpecialties: "تخصصاتنا",
  sectionDoctors: "الأطباء",
  sectionProcess: "مسار الحجز",
  sectionFaq: "أسئلة شائعة",
  sectionWhy: "لماذا عيادتنا؟",
  sectionJourney: "رحلة المريض",
  allServices: "كل الخدمات",
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
  sendInquiry: "إرسال الاستفسار",
  sending: "جارٍ الإرسال...",
  subject: "موضوع الرسالة",
  message: "تفاصيل الرسالة",
  fullNameLabel: "الاسم الكامل",
  phoneLabel: "رقم الهاتف",
  fullNamePlaceholder: "أدخل اسمك الكامل",
  phonePlaceholder: "أدخل رقم هاتفك",
  subjectPlaceholder: "اكتب موضوع استفسارك",
  messagePlaceholder: "اكتب تفاصيل رسالتك هنا",
  contactHeroTitle: "تواصل معنا أو احجز موعدك",
  contactHeroLead:
    "يمكنك إرسال استفسارك إلى فريق العيادة أو اختيار التخصص والطبيب والموعد المناسب لك.",
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
  confirmationTitle: "تم استلام الطلب",
  confirmationLead: "احتفظوا برقم المرجع وانتظروا توجيه الاستقبال.",
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
  directionsLabel: "الاتجاهات",
  contactClinic: "تواصل مع العيادة",
  emptySpecialties: "لا تتوفر تخصصات عامة للعرض حاليًا.",
  emptyFaq: "لا تتوفر أسئلة شائعة للعرض حاليًا.",
  retryLabel: "إعادة المحاولة",
  doctorCountLabel: "أطباء",
  relatedCta: "احجز موعدًا",
  hoursLabel: "ساعات العمل",
  reviewsTitle: "آراء مرضى موثّقة",
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
  sectionSpecialties: "Specialties",
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
  sendInquiry: "Send inquiry",
  sending: "Sending...",
  subject: "Subject",
  message: "Message details",
  fullNameLabel: "Full name",
  phoneLabel: "Phone number",
  fullNamePlaceholder: "Enter your full name",
  phonePlaceholder: "Enter your phone number",
  subjectPlaceholder: "What is your inquiry about?",
  messagePlaceholder: "Write the details of your message here",
  contactHeroTitle: "Contact us or book your visit",
  contactHeroLead:
    "Send an inquiry to the clinic team, or choose a specialty, doctor, and available time.",
  tabInquiry: "Send an inquiry",
  tabBookDoctor: "Book with a doctor",
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
  confirmationTitle: "Request received",
  confirmationLead: "Keep your reference number and wait for reception guidance.",
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
  locationTitle: "Location & contact",
  directionsLabel: "Directions",
  contactClinic: "Contact the clinic",
  emptySpecialties: "No public specialties are available yet.",
  emptyFaq: "No FAQ entries are available yet.",
  retryLabel: "Retry",
  doctorCountLabel: "doctors",
  relatedCta: "Book appointment",
  hoursLabel: "Working hours",
  reviewsTitle: "Verified patient reviews",
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
  sectionSpecialties: "Spécialités",
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
  sendInquiry: "Envoyer la demande",
  sending: "Envoi...",
  subject: "Objet",
  message: "Détails du message",
  fullNameLabel: "Nom complet",
  phoneLabel: "Numéro de téléphone",
  fullNamePlaceholder: "Saisissez votre nom complet",
  phonePlaceholder: "Saisissez votre numéro de téléphone",
  subjectPlaceholder: "Objet de votre demande",
  messagePlaceholder: "Écrivez les détails de votre message ici",
  contactHeroTitle: "Contactez-nous ou réservez votre visite",
  contactHeroLead:
    "Envoyez une demande à l’équipe, ou choisissez spécialité, médecin et créneau.",
  tabInquiry: "Envoyer une demande",
  tabBookDoctor: "Réserver avec un médecin",
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
  confirmationTitle: "Demande reçue",
  confirmationLead: "Conservez votre référence et attendez l’accueil.",
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
  locationTitle: "Lieu et contact",
  directionsLabel: "Itinéraire",
  contactClinic: "Contacter la clinique",
  emptySpecialties: "Aucune spécialité publique pour le moment.",
  emptyFaq: "Aucune FAQ disponible pour le moment.",
  retryLabel: "Réessayer",
  doctorCountLabel: "médecins",
  relatedCta: "Prendre rendez-vous",
  hoursLabel: "Horaires",
  reviewsTitle: "Avis patients vérifiés",
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
