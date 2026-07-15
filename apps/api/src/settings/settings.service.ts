import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { UpsertSettingsDto } from "./dto/settings.dto";
import { ClinicSetting } from "./schemas/clinic-setting.schema";
import { ContactMessage } from "./schemas/contact-message.schema";

const DEFAULT_PUBLIC_PAGES = {
  aboutAr:
    "عيادة الوسام لطب الأسنان — رعاية احترافية تجمع بين الخبرة والتقنيات الحديثة في بيئة هادئة وموثوقة.",
  aboutEn:
    "Al-Wisam Dental Clinic — professional care combining expertise and modern techniques in a calm, trustworthy setting.",
  aboutFr:
    "Clinique dentaire Al-Wisam — des soins professionnels alliant expertise et techniques modernes dans un cadre serein.",
  missionAr: "تقديم رعاية فموية آمنة ودقيقة تضع راحة المريض أولاً.",
  missionEn: "Deliver safe, precise oral care that puts patient comfort first.",
  missionFr:
    "Offrir des soins bucco-dentaires sûrs et précis en priorisant le confort du patient.",
  services: [
    {
      slug: "general-exam",
      nameAr: "فحص عام",
      nameEn: "General examination",
      nameFr: "Examen général",
      descriptionAr: "تقييم شامل لصحة الفم والأسنان.",
      descriptionEn: "A thorough assessment of oral and dental health.",
      descriptionFr: "Une évaluation complète de la santé bucco-dentaire.",
    },
    {
      slug: "orthodontics",
      nameAr: "تقويم الأسنان",
      nameEn: "Orthodontics",
      nameFr: "Orthodontie",
      descriptionAr: "خطط علاجية مخصصة لتقويم الأسنان.",
      descriptionEn: "Personalized plans for orthodontic care.",
      descriptionFr: "Plans personnalisés de soins orthodontiques.",
    },
    {
      slug: "oral-surgery",
      nameAr: "جراحة الفم",
      nameEn: "Oral surgery",
      nameFr: "Chirurgie orale",
      descriptionAr: "إجراءات جراحية بإشراف متخصصين.",
      descriptionEn: "Surgical procedures under specialist supervision.",
      descriptionFr: "Interventions chirurgicales sous supervision spécialisée.",
    },
    {
      slug: "cleaning",
      nameAr: "تنظيف الأسنان",
      nameEn: "Dental cleaning",
      nameFr: "Nettoyage dentaire",
      descriptionAr: "تنظيف احترافي للحفاظ على صحة اللثة والأسنان.",
      descriptionEn: "Professional cleaning to support gum and tooth health.",
      descriptionFr: "Nettoyage professionnel pour la santé des gencives et des dents.",
    },
  ],
  specialties: [
    {
      slug: "general-dentistry",
      nameAr: "طب الأسنان",
      nameEn: "Dentistry",
      nameFr: "Dentisterie",
      descriptionAr: "رعاية يومية وتشخيص وعلاج أساسي لصحة الفم والأسنان.",
      descriptionEn: "Everyday oral and dental care, diagnosis, and essential treatment.",
      descriptionFr: "Soins bucco-dentaires quotidiens, diagnostic et traitements essentiels.",
    },
    {
      slug: "orthodontics",
      nameAr: "التقويم",
      nameEn: "Orthodontics",
      nameFr: "Orthodontie",
      descriptionAr: "استشارات ومتابعة تقويم متخصصة.",
      descriptionEn: "Specialized orthodontic consults and follow-up.",
      descriptionFr: "Consultations et suivi orthodontiques spécialisés.",
    },
    {
      slug: "surgery",
      nameAr: "الجراحة",
      nameEn: "Surgery",
      nameFr: "Chirurgie",
      descriptionAr: "إجراءات جراحية مخططة بعناية.",
      descriptionEn: "Carefully planned surgical procedures.",
      descriptionFr: "Procédures chirurgicales soigneusement planifiées.",
    },
  ],
  faqs: [
    {
      questionAr: "كيف يمكنني حجز موعد؟",
      questionEn: "How can I book an appointment?",
      questionFr: "Comment puis-je prendre rendez-vous ?",
      answerAr:
        "يمكنكم إرسال طلب عبر صفحة الحجز، أو التواصل مع الاستقبال خلال ساعات العمل.",
      answerEn:
        "Submit a request via the booking page, or contact reception during working hours.",
      answerFr:
        "Envoyez une demande via la page de réservation, ou contactez l’accueil pendant les heures d’ouverture.",
    },
    {
      questionAr: "كيف أسجّل عند الوصول؟",
      questionEn: "How do I check in when I arrive?",
      questionFr: "Comment m’enregistrer à mon arrivée ?",
      answerAr:
        "عند الوصول، الاستقبال يسجّل حضوركم ويوجّهكم إلى الطبيب أو قاعة الانتظار.",
      answerEn:
        "On arrival, reception checks you in and directs you to your clinician or the waiting area.",
      answerFr:
        "À l’arrivée, l’accueil enregistre votre présence et vous oriente vers le clinicien ou la salle d’attente.",
    },
    {
      questionAr: "هل أحتاج حسابًا للزيارة؟",
      questionEn: "Do I need an account to visit?",
      questionFr: "Ai-je besoin d’un compte pour venir ?",
      answerAr:
        "لا يلزم حساب للزيارة الأولى. قد يُفعَّل حساب المريض لاحقًا عند الحاجة للمتابعة طويلة الأمد.",
      answerEn:
        "An account is not required for a first visit. A patient account may be activated later for long-term follow-up when needed.",
      answerFr:
        "Aucun compte n’est requis pour une première visite. Un compte patient peut être activé plus tard pour le suivi.",
    },
    {
      questionAr: "ما هي مواعيد العيادة؟",
      questionEn: "What are the clinic hours?",
      questionFr: "Quels sont les horaires de la clinique ?",
      answerAr:
        "من السبت إلى الخميس من الساعة 08:00 إلى الساعة 17:00. الجمعة: مغلق.",
      answerEn:
        "Saturday to Thursday, 08:00–17:00. Friday: Closed.",
      answerFr:
        "Du samedi au jeudi, 08:00–17:00. Vendredi : fermé.",
    },
    {
      questionAr: "هل يمكنني اختيار طبيب محدد؟",
      questionEn: "Can I choose a specific doctor?",
      questionFr: "Puis-je choisir un médecin précis ?",
      answerAr: "نعم. يمكنكم اختيار التخصص ثم الطبيب المناسب قبل إرسال طلب الحجز.",
      answerEn: "Yes. You can select a specialty and then a specific doctor before submitting your request.",
      answerFr: "Oui. Vous pouvez choisir une spécialité puis un médecin avant d’envoyer la demande.",
    },
    {
      questionAr: "كيف أعرف المواعيد المتاحة للطبيب؟",
      questionEn: "How do I know a doctor’s available times?",
      questionFr: "Comment connaître les disponibilités d’un médecin ?",
      answerAr: "بعد اختيار الطبيب، تظهر المواعيد المتاحة إن وُجدت في نظام العيادة، ثم تؤكّدها الاستقبال.",
      answerEn: "After selecting a doctor, available times from the clinic schedule are shown when configured, then confirmed by reception.",
      answerFr: "Après le choix du médecin, les créneaux disponibles s’affichent si configurés, puis l’accueil confirme.",
    },
    {
      questionAr: "هل يمكن تعديل موعد الحجز؟",
      questionEn: "Can I reschedule an appointment?",
      questionFr: "Puis-je reporter un rendez-vous ?",
      answerAr: "نعم عبر التواصل مع الاستقبال مسبقًا لإعادة الجدولة حسب التوفر.",
      answerEn: "Yes — contact reception in advance to reschedule based on availability.",
      answerFr: "Oui — contactez l’accueil à l’avance pour reporter selon la disponibilité.",
    },
    {
      questionAr: "كيف يمكن إلغاء الموعد؟",
      questionEn: "How can I cancel an appointment?",
      questionFr: "Comment annuler un rendez-vous ?",
      answerAr: "تواصلوا مع الاستقبال عبر الهاتف أو صفحة التواصل في أقرب وقت ممكن.",
      answerEn: "Contact reception by phone or the contact page as soon as possible.",
      answerFr: "Contactez l’accueil par téléphone ou via la page contact dès que possible.",
    },
    {
      questionAr: "ما المعلومات المطلوبة لإتمام الحجز؟",
      questionEn: "What information is needed to complete a booking?",
      questionFr: "Quelles informations sont nécessaires pour réserver ?",
      answerAr: "الاسم الكامل ورقم الهاتف وسبب الزيارة والتاريخ والوقت المفضّلان، واختياريًا التخصص والطبيب.",
      answerEn: "Full name, phone, visit reason, preferred date and time, and optionally specialty and doctor.",
      answerFr: "Nom complet, téléphone, motif, date et heure préférées, éventuellement spécialité et médecin.",
    },
    {
      questionAr: "ماذا يجب أن أحضر معي يوم الزيارة؟",
      questionEn: "What should I bring on the day of the visit?",
      questionFr: "Que dois-je apporter le jour de la visite ?",
      answerAr: "بطاقة تعريف إن أمكن، وأي تحاليل أو صور سابقة، وقائمة الأدوية والحساسية.",
      answerEn: "ID if available, prior labs or images, and a list of medications and allergies.",
      answerFr: "Une pièce d’identité si possible, analyses ou radios antérieures, et la liste des traitements et allergies.",
    },
    {
      questionAr: "متى يجب أن أصل إلى العيادة؟",
      questionEn: "When should I arrive at the clinic?",
      questionFr: "Quand dois-je arriver à la clinique ?",
      answerAr: "يُفضَّل الوصول قبل الموعد بوقت قصير لإتمام التسجيل في الاستقبال.",
      answerEn: "Please arrive a little early so reception can complete check-in.",
      answerFr: "Merci d’arriver un peu en avance pour l’enregistrement à l’accueil.",
    },
    {
      questionAr: "كيف أتواصل مع العيادة للاستفسار؟",
      questionEn: "How do I contact the clinic with a question?",
      questionFr: "Comment contacter la clinique pour une question ?",
      answerAr: "استخدموا صفحة التواصل أو اتصلوا برقم العيادة خلال ساعات العمل.",
      answerEn: "Use the contact page or call the clinic phone during working hours.",
      answerFr: "Utilisez la page contact ou téléphonez pendant les heures d’ouverture.",
    },
    {
      questionAr: "هل يمكن الحجز لطفل أو أحد أفراد العائلة؟",
      questionEn: "Can I book for a child or a family member?",
      questionFr: "Puis-je réserver pour un enfant ou un proche ?",
      answerAr: "نعم، مع ذكر اسم المريض ورقم تواصل واضح للمستقبلين.",
      answerEn: "Yes — include the patient’s name and a clear contact number for reception.",
      answerFr: "Oui — indiquez le nom du patient et un numéro joignable pour l’accueil.",
    },
    {
      questionAr: "ماذا أفعل إذا لم يصلني تأكيد الموعد؟",
      questionEn: "What if I do not receive appointment confirmation?",
      questionFr: "Que faire si je ne reçois pas de confirmation ?",
      answerAr: "تواصلوا مع الاستقبال مع رقم الطلب إن وُجد لتأكيد الحالة.",
      answerEn: "Contact reception with your request reference if you have one to confirm status.",
      answerFr: "Contactez l’accueil avec votre référence de demande, le cas échéant.",
    },
    {
      questionAr: "هل توجد متابعة بعد الزيارة؟",
      questionEn: "Is there follow-up after the visit?",
      questionFr: "Y a-t-il un suivi après la visite ?",
      answerAr: "نعم وفق توجيه الطبيب؛ يمكن حجز متابعة عبر الاستقبال أو صفحة الحجز.",
      answerEn: "Yes, according to your clinician’s plan — book follow-up via reception or the booking page.",
      answerFr: "Oui, selon le plan du clinicien — réservez le suivi via l’accueil ou la page de réservation.",
    },
    {
      questionAr: "كيف أختار التخصص المناسب؟",
      questionEn: "How do I choose the right specialty?",
      questionFr: "Comment choisir la bonne spécialité ?",
      answerAr: "ابدأوا بوصف الشكوى في طلب الحجز، أو اختاروا التخصص الأقرب، ويمكن للاستقبال توجيهكم.",
      answerEn: "Describe your concern in the booking request, or pick the closest specialty — reception can also guide you.",
      answerFr: "Décrivez votre motif ou choisissez la spécialité la plus proche ; l’accueil peut aussi vous orienter.",
    },
    {
      questionAr: "هل يمكن للعيادة اختيار الطبيب المناسب بدلًا مني؟",
      questionEn: "Can the clinic assign a suitable doctor for me?",
      questionFr: "La clinique peut-elle choisir un médecin adapté ?",
      answerAr: "نعم، إذا لم تحدّدوا طبيبًا، تقوم الاستقبال بتوجيه الطلب حسب التوفر ونوع الزيارة.",
      answerEn: "Yes. If you do not pick a doctor, reception assigns based on availability and visit type.",
      answerFr: "Oui. Sans médecin choisi, l’accueil oriente selon disponibilité et type de visite.",
    },
  ],
  policies: {
    refundAr:
      "سياسة الاسترداد تعتمد على حالة الموعد ومدى الإشعار المسبق. يرجى التواصل مع الاستقبال لمراجعة طلبكم.\n\nتاريخ السريان: 2026-01-01",
    refundEn:
      "Refunds depend on appointment status and notice period. Please contact reception to review your request.\n\nEffective date: 2026-01-01",
    refundFr:
      "Les remboursements dépendent du statut du rendez-vous et du préavis. Contactez l’accueil pour examiner votre demande.\n\nDate d’effet : 2026-01-01",
    cancellationAr:
      "يُفضَّل إلغاء أو إعادة جدولة الموعد مسبقًا عبر الاستقبال. التأخير المتكرر أو عدم الحضور قد يؤثر على أولوية الحجز لاحقًا.\n\nتاريخ السريان: 2026-01-01",
    cancellationEn:
      "Please cancel or reschedule in advance via reception. Repeated late arrivals or no-shows may affect future booking priority.\n\nEffective date: 2026-01-01",
    cancellationFr:
      "Merci d’annuler ou de reporter à l’avance via l’accueil. Les retards répétés ou absences peuvent affecter la priorité des prochains rendez-vous.\n\nDate d’effet : 2026-01-01",
    privacyAr:
      "نجمع بيانات التواصل والمواعيد لإدارة الرعاية داخل العيادة فقط. لا نبيع بياناتكم لأطراف ثالثة. للاستفسار تواصلوا معنا عبر صفحة التواصل.",
    privacyEn:
      "We collect contact and appointment data only to manage clinical care. We do not sell your data. Contact us via the contact page for privacy questions.",
    privacyFr:
      "Nous collectons les données de contact et de rendez-vous uniquement pour la prise en charge clinique. Nous ne vendons pas vos données.",
    termsAr:
      "باستخدام الموقع فإنكم توافقون على تقديم معلومات صحيحة واستخدام خدمة الحجز بحسن نية. المحتوى الطبي على الموقع معلوماتي ولا يغني عن الاستشارة السريرية.",
    termsEn:
      "By using this site you agree to provide accurate information and use booking in good faith. Website medical content is informational and not a substitute for clinical advice.",
    termsFr:
      "En utilisant ce site, vous acceptez de fournir des informations exactes et d’utiliser la réservation de bonne foi. Le contenu médical est informatif.",
    cookiesAr:
      "نستخدم ملفات تعريف أساسية للغة والجلسة عندما تسجّلون الدخول. يمكنكم إدارة تفضيلات المتصفح محليًا.",
    cookiesEn:
      "We use essential cookies for language and authenticated sessions. Manage browser preferences locally.",
    cookiesFr:
      "Nous utilisons des cookies essentiels pour la langue et les sessions authentifiées.",
    accessibilityAr:
      "نسعى إلى موقع واضح التباين وقابل للتصفح بلوحة المفاتيح. أبلغونا عن أي عائق عبر صفحة التواصل.",
    accessibilityEn:
      "We aim for clear contrast and keyboard-friendly navigation. Tell us about barriers via the contact page.",
    accessibilityFr:
      "Nous visons un contraste clair et une navigation au clavier. Signalez tout obstacle via la page contact.",
    disclaimerAr:
      "المعلومات على هذا الموقع لأغراض تعريفية عامة وليست تشخيصًا أو وصفة طبية. في الحالات الطارئة راجعوا جهة طبية مختصة فورًا.",
    disclaimerEn:
      "Information on this site is general and not a diagnosis or prescription. Seek urgent medical care for emergencies.",
    disclaimerFr:
      "Les informations de ce site sont générales et ne constituent pas un diagnostic. En urgence, consultez un professionnel immédiatement.",
  },
  patientInfoAr:
    "أحضروا بطاقة تعريف ورقم هاتف واضح، واذكروا الأدوية والحساسية عند الزيارة. يُفضَّل الحضور قبل الموعد بقليل.",
  patientInfoEn:
    "Bring ID and a reachable phone number, and mention medications and allergies at your visit. Arrive a little early when possible.",
  patientInfoFr:
    "Apportez une pièce d’identité et un numéro joignable, et mentionnez traitements et allergies. Arrivez un peu en avance si possible.",
  beforeVisitAr:
    "أكدوا الموعد، أحضروا التحاليل أو الصور إن وُجدت، وأخبروا الاستقبال بأي أعراض حادة قبل الدخول.",
  beforeVisitEn:
    "Confirm your appointment, bring labs or x-rays if available, and tell reception about acute symptoms before you are seen.",
  beforeVisitFr:
    "Confirmez le rendez-vous, apportez analyses ou radios si disponibles, et signalez tout symptôme aigu à l’accueil.",
  afterVisitAr:
    "اتبعوا تعليمات الطبيب، واحتفظوا بالوصفات والمستندات، واتصلوا بالاستقبال لأي استفسار عن المتابعة.",
  afterVisitEn:
    "Follow your clinician’s instructions, keep prescriptions and documents, and contact reception with follow-up questions.",
  afterVisitFr:
    "Suivez les consignes du clinicien, conservez ordonnances et documents, et contactez l’accueil pour le suivi.",
  supportAr:
    "للدعم الإداري وطلبات المواعيد تواصلوا عبر صفحة التواصل أو هاتف العيادة خلال ساعات العمل.",
  supportEn:
    "For administrative support and appointment requests, use the contact page or clinic phone during working hours.",
  supportFr:
    "Pour le support administratif et les rendez-vous, utilisez la page contact ou le téléphone pendant les heures d’ouverture.",
  /** Verified patient reviews — empty by default; never invent testimonials. */
  reviews: [] as Array<{
    nameAr?: string;
    nameEn?: string;
    nameFr?: string;
    quoteAr?: string;
    quoteEn?: string;
    quoteFr?: string;
    rating?: number;
    verified?: boolean;
  }>,
};

const DEFAULT_CLINIC_INFO = {
  nameAr: "عيادة الوسام لطب الأسنان",
  nameEn: "Al-Wisam Dental Clinic",
  nameFr: "Clinique Dentaire Al-Wisam",
  phone: "",
  email: "",
  address: "",
  descriptionAr: "",
  descriptionEn: "",
  descriptionFr: "",
  mapsEmbedUrl: "",
  mapsLink: "",
  workingHoursAr: "من السبت إلى الخميس\nمن الساعة 08:00 إلى الساعة 17:00\nالجمعة: مغلق",
  workingHoursEn: "Saturday to Thursday\n08:00–17:00\nFriday: Closed",
  workingHoursFr: "Du samedi au jeudi\n08:00–17:00\nVendredi : fermé",
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(ClinicSetting.name)
    private readonly settings: Model<ClinicSetting>,
    @InjectModel(ContactMessage.name)
    private readonly contactMessages: Model<ContactMessage>,
    private readonly audit: AuditService,
  ) {}

  private async getKey(key: string): Promise<Record<string, unknown> | null> {
    const row = await this.settings.findOne({ key }).lean();
    return (row?.value as Record<string, unknown>) || null;
  }

  async getClinicInfo() {
    const stored = await this.getKey("clinic_info");
    const merged = { ...DEFAULT_CLINIC_INFO, ...(stored || {}) };
    // Prefer Sat–Thu schedule when stored values still use legacy Sun–Thu defaults.
    for (const [key, fallback] of [
      ["workingHoursAr", DEFAULT_CLINIC_INFO.workingHoursAr],
      ["workingHoursEn", DEFAULT_CLINIC_INFO.workingHoursEn],
      ["workingHoursFr", DEFAULT_CLINIC_INFO.workingHoursFr],
    ] as const) {
      const value = String(merged[key] || "");
      const legacy =
        /الأحد|Sunday|Dimanche/i.test(value) &&
        !/سبت|Saturday|samedi/i.test(value);
      if (!value.trim() || legacy) {
        merged[key] = fallback;
      }
    }
    return {
      ok: true,
      clinicInfo: merged,
    };
  }

  async getPublicPages() {
    const stored = await this.getKey("public_pages");
    const merged = {
      ...DEFAULT_PUBLIC_PAGES,
      ...(stored || {}),
    };
    const services = Array.isArray(merged.services)
      ? merged.services
          .filter((s) => s && typeof s === "object")
          .map((raw) => {
            const s = raw as Record<string, string>;
            return {
              slug:
                s.slug ||
                (s.nameEn || s.name || s.nameAr || "service")
                  .toLowerCase()
                  .replace(/\s+/g, "-"),
              name: s.nameAr || s.name || s.nameEn || "",
              nameAr: s.nameAr || s.name || "",
              nameEn: s.nameEn || s.name || s.nameAr || "",
              nameFr: s.nameFr || s.nameEn || s.name || s.nameAr || "",
              description: s.descriptionAr || s.description || "",
              descriptionAr: s.descriptionAr || s.description || "",
              descriptionEn: s.descriptionEn || s.description || s.descriptionAr || "",
              descriptionFr:
                s.descriptionFr || s.descriptionEn || s.description || s.descriptionAr || "",
            };
          })
          .filter((s) => s.nameAr || s.nameEn)
      : DEFAULT_PUBLIC_PAGES.services;
    const mappedFaqs = Array.isArray(merged.faqs)
      ? merged.faqs
          .filter((f) => f && typeof f === "object")
          .map((raw) => {
            const f = raw as Record<string, string>;
            return {
              question: f.questionAr || f.question || "",
              questionAr: f.questionAr || f.question || "",
              questionEn: f.questionEn || f.question || f.questionAr || "",
              questionFr: f.questionFr || f.questionEn || f.question || "",
              answer: f.answerAr || f.answer || "",
              answerAr: f.answerAr || f.answer || "",
              answerEn: f.answerEn || f.answer || f.answerAr || "",
              answerFr: f.answerFr || f.answerEn || f.answer || "",
            };
          })
          .filter((f) => f.questionAr || f.questionEn)
      : [];
    const faqs =
      mappedFaqs.length >= 10 ? mappedFaqs : DEFAULT_PUBLIC_PAGES.faqs;
    let specialties = Array.isArray(
      (merged as { specialties?: unknown }).specialties,
    )
      ? ((merged as { specialties: Record<string, string>[] }).specialties || [])
      : DEFAULT_PUBLIC_PAGES.specialties;
    if (!specialties.length) specialties = DEFAULT_PUBLIC_PAGES.specialties;
    const hasDentistry = specialties.some(
      (s) =>
        s &&
        (s.slug === "general-dentistry" ||
          s.slug === "dentistry" ||
          /طب الأسنان|dentistry|dentisterie/i.test(
            `${s.nameAr || ""} ${s.nameEn || ""} ${s.nameFr || ""}`,
          )),
    );
    if (!hasDentistry) {
      specialties = [
        DEFAULT_PUBLIC_PAGES.specialties[0],
        ...specialties,
      ];
    }
    specialties = specialties.map((raw) => {
      const s = raw as Record<string, string>;
      if (s.slug === "general-dentistry" || s.slug === "dentistry") {
        return {
          ...s,
          nameAr: s.nameAr?.includes("أسنان") ? "طب الأسنان" : s.nameAr || "طب الأسنان",
          nameEn:
            /dentistry/i.test(s.nameEn || "") || !s.nameEn
              ? "Dentistry"
              : s.nameEn,
          nameFr:
            /dentist/i.test(s.nameFr || "") || !s.nameFr
              ? "Dentisterie"
              : s.nameFr,
        };
      }
      return s;
    });
    const reviews = Array.isArray((merged as { reviews?: unknown }).reviews)
      ? ((merged as { reviews: Array<Record<string, unknown>> }).reviews || []).filter(
          (r) => r && (r.quoteAr || r.quoteEn || r.quoteFr),
        )
      : [];

    return {
      ok: true,
      publicPages: {
        ...merged,
        services,
        faqs,
        specialties,
        reviews,
        policies:
          (merged as { policies?: typeof DEFAULT_PUBLIC_PAGES.policies }).policies ||
          DEFAULT_PUBLIC_PAGES.policies,
      },
    };
  }

  /** Public unauthenticated payload. */
  async getPublicSite() {
    const [info, pages] = await Promise.all([
      this.getClinicInfo(),
      this.getPublicPages(),
    ]);
    return {
      ok: true,
      clinic: info.clinicInfo,
      content: pages.publicPages,
    };
  }

  async upsert(dto: UpsertSettingsDto, actor: AuthUser) {
    if (dto.section === "clinic_info") {
      const prev = (await this.getKey("clinic_info")) || {};
      const next = { ...prev, ...(dto.clinicInfo || {}) };
      await this.settings.findOneAndUpdate(
        { key: "clinic_info" },
        { $set: { value: next } },
        { upsert: true, new: true },
      );
      await this.audit.write({
        actor,
        action: "CLINIC_SETTINGS_UPDATED",
        entityType: "ClinicSetting",
        entityId: "clinic_info",
        newValue: next as Record<string, unknown>,
      });
      return { ok: true, message: "تم حفظ معلومات العيادة.", clinicInfo: next };
    }

    const prev = (await this.getKey("public_pages")) || {};
    const next = { ...prev, ...(dto.publicPages || {}) };
    await this.settings.findOneAndUpdate(
      { key: "public_pages" },
      { $set: { value: next } },
      { upsert: true, new: true },
    );
    await this.audit.write({
      actor,
      action: "PUBLIC_PAGES_UPDATED",
      entityType: "ClinicSetting",
      entityId: "public_pages",
    });
    return { ok: true, message: "تم حفظ محتوى الموقع.", publicPages: next };
  }

  async createContactMessage(input: {
    fullName: string;
    phone: string;
    subject: string;
    message: string;
    locale?: string;
    ipAddress?: string;
  }) {
    const recent = await this.contactMessages.findOne({
      phone: input.phone,
      createdAt: { $gte: new Date(Date.now() - 60_000) },
    });
    if (recent) {
      return {
        ok: true,
        message: "تم استلام رسالتكم. شكرًا لتواصلكم.",
        deduped: true,
      };
    }
    await this.contactMessages.create({
      fullName: input.fullName,
      phone: input.phone,
      subject: input.subject,
      message: input.message,
      locale: input.locale,
      ipAddress: input.ipAddress,
      status: "NEW",
    });
    return {
      ok: true,
      message: "تم إرسال رسالتك بنجاح، وسيتواصل معك فريق العيادة في أقرب وقت.",
    };
  }
}
