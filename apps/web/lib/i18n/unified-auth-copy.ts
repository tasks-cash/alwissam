import type { Locale } from "./config";

export type UnifiedAuthCopy = {
  loginTitle: string;
  loginLead: string;
  loginSupport: string;
  loginSubmit: string;
  loginSubmitting: string;
  createAccount: string;
  forgotPassword: string;
  rememberMe: string;
  identifier: string;
  password: string;
  homeLink: string;
  registerTitle: string;
  registerLead: string;
  registerPatientTitle: string;
  registerPatientLead: string;
  registerDoctorTitle: string;
  registerDoctorLead: string;
  registerSecretaryTitle: string;
  registerSecretaryLead: string;
  registerPatientMode: string;
  registerDoctorMode: string;
  registerSecretaryMode: string;
  registerSubmit: string;
  registerSubmitting: string;
  hasAccount: string;
  loginLink: string;
  fullName: string;
  phone: string;
  emailOptional: string;
  confirmPassword: string;
  privacyAgree: string;
  termsAgree: string;
  invitationInvalid: string;
  invitationLoading: string;
  accountCreatedTitle: string;
  accountCreatedLead: string;
  goLogin: string;
  loginOverlay: string;
  loginBenefitsTitle: string;
  loginBenefits: string[];
  loginSecurityNote: string;
  loginImageAlt: string;
  registerOverlay: string;
  patientBenefitsTitle: string;
  patientBenefits: string[];
  doctorBenefitsTitle: string;
  doctorBenefits: string[];
  secretaryBenefitsTitle: string;
  secretaryBenefits: string[];
  registerSecurityNote: string;
  registerImageAlt: string;
};

const ar: UnifiedAuthCopy = {
  loginTitle: "تسجيل الدخول إلى حسابك",
  loginLead:
    "ادخل إلى حسابك لمتابعة مواعيدك والوصول إلى المساحة المخصصة لك داخل عيادة الوسام.",
  loginSupport:
    "يمكن للمريض والطبيب والسكرتارية وإدارة العيادة تسجيل الدخول من هذه الصفحة.",
  loginSubmit: "تسجيل الدخول",
  loginSubmitting: "جارٍ تسجيل الدخول...",
  createAccount: "إنشاء حساب جديد",
  forgotPassword: "نسيت كلمة المرور؟",
  rememberMe: "تذكرني",
  identifier: "رقم الهاتف أو البريد الإلكتروني",
  password: "كلمة المرور",
  homeLink: "العودة إلى الصفحة الرئيسية",
  registerTitle: "إنشاء حساب جديد",
  registerLead:
    "أنشئ حساب المريض، أو أكمل تسجيل حساب الطبيب أو السكرتارية باستخدام دعوة صادرة من إدارة العيادة.",
  registerPatientTitle: "أنشئ حساب المريض",
  registerPatientLead:
    "احتفظ بمواعيدك وزياراتك وتعليمات طبيبك في حساب خاص وآمن.",
  registerDoctorTitle: "إكمال تسجيل حساب الطبيب",
  registerDoctorLead:
    "أكمل بيانات حسابك باستخدام الدعوة الصادرة من إدارة عيادة الوسام.",
  registerSecretaryTitle: "إكمال تسجيل حساب السكرتارية",
  registerSecretaryLead:
    "أكمل بيانات حسابك للوصول إلى مساحة العمل المخصصة لك وفق الصلاحيات وجدول العمل المحدد.",
  registerPatientMode: "حساب المريض",
  registerDoctorMode: "دعوة طبيب",
  registerSecretaryMode: "دعوة سكرتارية",
  registerSubmit: "إنشاء الحساب",
  registerSubmitting: "جارٍ إنشاء الحساب...",
  hasAccount: "لديك حساب بالفعل؟",
  loginLink: "تسجيل الدخول",
  fullName: "الاسم الكامل",
  phone: "رقم الهاتف",
  emailOptional: "البريد الإلكتروني (اختياري)",
  confirmPassword: "تأكيد كلمة المرور",
  privacyAgree: "أوافق على سياسة الخصوصية",
  termsAgree: "أوافق على شروط الاستخدام",
  invitationInvalid: "دعوة التسجيل غير صالحة.",
  invitationLoading: "جارٍ التحقق من الدعوة...",
  accountCreatedTitle: "تم إنشاء الحساب",
  accountCreatedLead: "يمكنك الآن تسجيل الدخول إلى حسابك.",
  goLogin: "الانتقال لتسجيل الدخول",
  loginOverlay: "مساحتك الخاصة لمتابعة مواعيدك وخدمات العيادة",
  loginBenefitsTitle: "ماذا يوفّر لك حسابك؟",
  loginBenefits: [
    "الوصول إلى لوحة التحكم المخصصة لحسابك",
    "متابعة المواعيد والحجوزات",
    "الوصول الآمن إلى معلوماتك المصرح بها",
    "تجربة موحدة للمريض وطاقم العيادة",
  ],
  loginSecurityNote: "دخول آمن بتشفير وحماية للجلسة",
  loginImageAlt: "مريض يسجّل الدخول لمتابعة مواعيده في عيادة الوسام",
  registerOverlay: "حساب آمن لمتابعة زياراتك وخدمات العيادة",
  patientBenefitsTitle: "ماذا يوفّر لك حساب المريض؟",
  patientBenefits: [
    "متابعة جميع الحجوزات",
    "معرفة حالة كل موعد",
    "عرض الزيارات السابقة",
    "الاطلاع على الصور والتقارير الخاصة بك",
    "مراجعة تعليمات الطبيب",
    "استلام تذكيرات المتابعة",
    "تحديث معلوماتك الشخصية",
    "التواصل بخصوص الزيارات المكتملة",
  ],
  doctorBenefitsTitle: "ماذا يوفّر لك حساب الطبيب؟",
  doctorBenefits: [
    "الوصول إلى لوحة الطبيب",
    "متابعة المرضى والمواعيد المصرح بها",
    "إدارة جدول العمل",
    "التواصل مع السكرتارية",
    "الوصول إلى أدوات المتابعة الطبية",
  ],
  secretaryBenefitsTitle: "ماذا يوفّر لك حساب السكرتارية؟",
  secretaryBenefits: [
    "الوصول إلى لوحة السكرتارية",
    "إدارة الحجوزات والمرضى المصرح بهم",
    "متابعة قائمة الانتظار",
    "التواصل الداخلي مع الطبيب",
    "العمل ضمن الجدول والصلاحيات المحددة",
  ],
  registerSecurityNote: "بياناتك محمية ولا تُشارك خارج العيادة",
  registerImageAlt: "مريض يستخدم حسابه لمتابعة مواعيد عيادة الأسنان",
};

const en: UnifiedAuthCopy = {
  loginTitle: "Sign in to your account",
  loginLead:
    "Sign in to follow your appointments and open the workspace reserved for you at Al-Wisam Clinic.",
  loginSupport:
    "Patients, doctors, secretaries, and clinic management can sign in from this page.",
  loginSubmit: "Sign in",
  loginSubmitting: "Signing in...",
  createAccount: "Create account",
  forgotPassword: "Forgot password?",
  rememberMe: "Remember me",
  identifier: "Phone or email",
  password: "Password",
  homeLink: "Back to homepage",
  registerTitle: "Create an account",
  registerLead:
    "Create a patient account, or complete a doctor/secretary registration with a clinic invitation.",
  registerPatientTitle: "Create your patient account",
  registerPatientLead:
    "Keep your appointments, visits, and doctor instructions in a private, secure account.",
  registerDoctorTitle: "Complete doctor registration",
  registerDoctorLead:
    "Finish creating your account using the invitation issued by Al-Wisam Clinic management.",
  registerSecretaryTitle: "Complete secretary registration",
  registerSecretaryLead:
    "Finish creating your account to access your workspace according to your permissions and schedule.",
  registerPatientMode: "Patient account",
  registerDoctorMode: "Doctor invitation",
  registerSecretaryMode: "Secretary invitation",
  registerSubmit: "Create account",
  registerSubmitting: "Creating account...",
  hasAccount: "Already have an account?",
  loginLink: "Sign in",
  fullName: "Full name",
  phone: "Phone",
  emailOptional: "Email (optional)",
  confirmPassword: "Confirm password",
  privacyAgree: "I agree to the privacy policy",
  termsAgree: "I agree to the terms of use",
  invitationInvalid: "This invitation is invalid.",
  invitationLoading: "Validating invitation...",
  accountCreatedTitle: "Account created",
  accountCreatedLead: "You can now sign in.",
  goLogin: "Go to sign in",
  loginOverlay: "Your private space for appointments and clinic services",
  loginBenefitsTitle: "What your account includes",
  loginBenefits: [
    "Access the dashboard for your account",
    "Follow appointments and bookings",
    "Secure access to information you are allowed to see",
    "One login experience for patients and clinic staff",
  ],
  loginSecurityNote: "Secure sign-in with encrypted session protection",
  loginImageAlt: "Signing in to follow appointments at Al Wissam Dental Clinic",
  registerOverlay: "A secure account for your visits and clinic services",
  patientBenefitsTitle: "What your patient account includes",
  patientBenefits: [
    "Track all bookings",
    "See each appointment status",
    "View past visits",
    "View your images and reports",
    "Review doctor instructions",
    "Receive follow-up reminders",
    "Update your personal details",
    "Message about completed visits",
  ],
  doctorBenefitsTitle: "What your doctor account includes",
  doctorBenefits: [
    "Access the doctor dashboard",
    "Follow authorized patients and appointments",
    "Manage your work schedule",
    "Coordinate with the secretary desk",
    "Use clinical follow-up tools",
  ],
  secretaryBenefitsTitle: "What your secretary account includes",
  secretaryBenefits: [
    "Access the secretary dashboard",
    "Manage authorized bookings and patients",
    "Follow the waiting list",
    "Coordinate internally with the doctor",
    "Work within your assigned schedule and permissions",
  ],
  registerSecurityNote: "Your data is protected and not shared outside the clinic",
  registerImageAlt:
    "Patient using their account to follow dental clinic appointments",
};

const fr: UnifiedAuthCopy = {
  loginTitle: "Connectez-vous à votre compte",
  loginLead:
    "Connectez-vous pour suivre vos rendez-vous et accéder à l’espace qui vous est réservé à la clinique Al-Wisam.",
  loginSupport:
    "Patients, médecins, secrétaires et direction peuvent se connecter depuis cette page.",
  loginSubmit: "Se connecter",
  loginSubmitting: "Connexion...",
  createAccount: "Créer un compte",
  forgotPassword: "Mot de passe oublié ?",
  rememberMe: "Se souvenir de moi",
  identifier: "Téléphone ou e-mail",
  password: "Mot de passe",
  homeLink: "Retour à l’accueil",
  registerTitle: "Créer un compte",
  registerLead:
    "Créez un compte patient, ou finalisez une invitation médecin/secrétaire.",
  registerPatientTitle: "Créer un compte patient",
  registerPatientLead:
    "Conservez vos rendez-vous, visites et consignes du médecin dans un compte privé et sécurisé.",
  registerDoctorTitle: "Finaliser l’inscription médecin",
  registerDoctorLead:
    "Complétez votre compte à l’aide de l’invitation émise par la direction de la clinique Al-Wisam.",
  registerSecretaryTitle: "Finaliser l’inscription secrétaire",
  registerSecretaryLead:
    "Complétez votre compte pour accéder à votre espace selon vos permissions et votre planning.",
  registerPatientMode: "Compte patient",
  registerDoctorMode: "Invitation médecin",
  registerSecretaryMode: "Invitation secrétaire",
  registerSubmit: "Créer le compte",
  registerSubmitting: "Création...",
  hasAccount: "Vous avez déjà un compte ?",
  loginLink: "Connexion",
  fullName: "Nom complet",
  phone: "Téléphone",
  emailOptional: "E-mail (facultatif)",
  confirmPassword: "Confirmer le mot de passe",
  privacyAgree: "J’accepte la politique de confidentialité",
  termsAgree: "J’accepte les conditions d’utilisation",
  invitationInvalid: "Cette invitation est invalide.",
  invitationLoading: "Validation de l’invitation...",
  accountCreatedTitle: "Compte créé",
  accountCreatedLead: "Vous pouvez maintenant vous connecter.",
  goLogin: "Aller à la connexion",
  loginOverlay: "Votre espace pour suivre rendez-vous et services",
  loginBenefitsTitle: "Ce que votre compte offre",
  loginBenefits: [
    "Accéder au tableau de bord de votre compte",
    "Suivre rendez-vous et réservations",
    "Accès sécurisé aux informations autorisées",
    "Une expérience unique pour patients et équipe",
  ],
  loginSecurityNote: "Connexion sécurisée avec protection de session",
  loginImageAlt:
    "Connexion pour suivre les rendez-vous à la clinique El Wissam",
  registerOverlay: "Un compte sécurisé pour vos visites et services",
  patientBenefitsTitle: "Ce que votre compte patient offre",
  patientBenefits: [
    "Suivre toutes les réservations",
    "Connaître l’état de chaque rendez-vous",
    "Voir les visites passées",
    "Consulter vos images et rapports",
    "Relire les consignes du médecin",
    "Recevoir des rappels de suivi",
    "Mettre à jour vos informations",
    "Communiquer au sujet des visites terminées",
  ],
  doctorBenefitsTitle: "Ce que votre compte médecin offre",
  doctorBenefits: [
    "Accéder au tableau de bord médecin",
    "Suivre patients et rendez-vous autorisés",
    "Gérer votre planning",
    "Coordonner avec la secrétariat",
    "Utiliser les outils de suivi médical",
  ],
  secretaryBenefitsTitle: "Ce que votre compte secrétaire offre",
  secretaryBenefits: [
    "Accéder au tableau de bord secrétariat",
    "Gérer réservations et patients autorisés",
    "Suivre la salle d’attente",
    "Coordonner en interne avec le médecin",
    "Travailler selon le planning et les permissions",
  ],
  registerSecurityNote:
    "Vos données sont protégées et non partagées hors clinique",
  registerImageAlt:
    "Patient utilisant son compte pour suivre ses rendez-vous dentaires",
};

const map: Record<Locale, UnifiedAuthCopy> = { ar, en, fr };

export function getUnifiedAuthCopy(locale: Locale): UnifiedAuthCopy {
  return map[locale] || en;
}
