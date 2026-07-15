import type { Locale } from "./config";

export type PatientAuthCopy = {
  registerTitle: string;
  registerLead: string;
  registerSupport: string;
  registerSubmit: string;
  registerSubmitting: string;
  registerHasAccount: string;
  loginLink: string;
  loginTitle: string;
  loginLead: string;
  loginSubmit: string;
  loginSubmitting: string;
  loginCreateAccount: string;
  forgotPassword: string;
  rememberMe: string;
  fullName: string;
  phone: string;
  emailOptional: string;
  password: string;
  confirmPassword: string;
  privacyAgree: string;
  termsAgree: string;
  identifier: string;
  benefitsTitle: string;
  benefits: string[];
  registerImageAlt: string;
  loginImageAlt: string;
  documentTitleRegister: string;
  documentTitleLogin: string;
};

const ar: PatientAuthCopy = {
  registerTitle: "أنشئ حساب المريض",
  registerLead:
    "احتفظ بمواعيدك وحالاتك العلاجية وصورك وتقاريرك وتعليمات طبيبك في حساب خاص وآمن.",
  registerSupport: "أنشئ حسابك خلال دقائق وابدأ متابعة زياراتك من مكان واحد.",
  registerSubmit: "إنشاء الحساب",
  registerSubmitting: "جارٍ إنشاء الحساب...",
  registerHasAccount: "لديك حساب بالفعل؟",
  loginLink: "تسجيل الدخول",
  loginTitle: "تسجيل الدخول إلى حساب المريض",
  loginLead:
    "تابع مواعيدك وحالتك العلاجية وصورك وتقاريرك وتعليمات طبيبك من حسابك الخاص.",
  loginSubmit: "تسجيل الدخول",
  loginSubmitting: "جارٍ تسجيل الدخول...",
  loginCreateAccount: "إنشاء حساب جديد",
  forgotPassword: "نسيت كلمة المرور؟",
  rememberMe: "تذكرني",
  fullName: "الاسم الكامل",
  phone: "رقم الهاتف",
  emailOptional: "البريد الإلكتروني (اختياري)",
  password: "كلمة المرور",
  confirmPassword: "تأكيد كلمة المرور",
  privacyAgree: "أوافق على سياسة الخصوصية",
  termsAgree: "أوافق على شروط الاستخدام",
  identifier: "رقم الهاتف أو البريد الإلكتروني",
  benefitsTitle: "ماذا يوفّر لك حساب المريض؟",
  benefits: [
    "متابعة جميع الحجوزات",
    "معرفة حالة كل موعد",
    "عرض الزيارات المكتملة والملغاة",
    "الاطلاع على الحالات العلاجية",
    "عرض الصور والتقارير الخاصة بك",
    "مراجعة تعليمات الطبيب",
    "استلام تذكيرات المتابعة",
    "التواصل بخصوص الزيارات المكتملة",
  ],
  registerImageAlt: "مريض يستخدم حسابه لمتابعة مواعيد عيادة الأسنان",
  loginImageAlt: "مريض يسجّل الدخول لمتابعة مواعيده في عيادة الوسام",
  documentTitleRegister: "إنشاء حساب مريض",
  documentTitleLogin: "تسجيل دخول المريض",
};

const en: PatientAuthCopy = {
  registerTitle: "Create your patient account",
  registerLead:
    "Keep your appointments, treatment progress, images, reports, and doctor instructions in one secure place.",
  registerSupport: "Create your account in minutes and follow your visits from one place.",
  registerSubmit: "Create account",
  registerSubmitting: "Creating account...",
  registerHasAccount: "Already have an account?",
  loginLink: "Login",
  loginTitle: "Patient account login",
  loginLead:
    "Follow your appointments, treatment updates, images, reports, and doctor instructions from your private account.",
  loginSubmit: "Login",
  loginSubmitting: "Signing in...",
  loginCreateAccount: "Create Account",
  forgotPassword: "Forgot password?",
  rememberMe: "Remember me",
  fullName: "Full name",
  phone: "Phone number",
  emailOptional: "Email (optional)",
  password: "Password",
  confirmPassword: "Confirm password",
  privacyAgree: "I agree to the privacy policy",
  termsAgree: "I agree to the terms of use",
  identifier: "Phone or email",
  benefitsTitle: "What your patient account includes",
  benefits: [
    "Track all bookings",
    "See each appointment status",
    "View completed and cancelled visits",
    "Follow treatment cases",
    "View your images and reports",
    "Review doctor instructions",
    "Receive follow-up reminders",
    "Message about completed visits",
  ],
  registerImageAlt: "Patient using their account to follow dental clinic appointments",
  loginImageAlt: "Patient signing in to follow appointments at Al Wissam Dental Clinic",
  documentTitleRegister: "Create patient account",
  documentTitleLogin: "Patient login",
};

const fr: PatientAuthCopy = {
  registerTitle: "Créer un compte patient",
  registerLead:
    "Conservez vos rendez-vous, traitements, images, rapports et consignes du médecin dans un espace sécurisé.",
  registerSupport:
    "Créez votre compte en quelques minutes et suivez vos visites depuis un seul endroit.",
  registerSubmit: "Créer le compte",
  registerSubmitting: "Création du compte...",
  registerHasAccount: "Vous avez déjà un compte ?",
  loginLink: "Se connecter",
  loginTitle: "Connexion au compte patient",
  loginLead:
    "Suivez vos rendez-vous, traitements, images, rapports et consignes du médecin depuis votre compte.",
  loginSubmit: "Se connecter",
  loginSubmitting: "Connexion...",
  loginCreateAccount: "Créer un compte",
  forgotPassword: "Mot de passe oublié ?",
  rememberMe: "Se souvenir de moi",
  fullName: "Nom complet",
  phone: "Numéro de téléphone",
  emailOptional: "E-mail (facultatif)",
  password: "Mot de passe",
  confirmPassword: "Confirmer le mot de passe",
  privacyAgree: "J’accepte la politique de confidentialité",
  termsAgree: "J’accepte les conditions d’utilisation",
  identifier: "Téléphone ou e-mail",
  benefitsTitle: "Ce que votre compte patient offre",
  benefits: [
    "Suivre toutes les réservations",
    "Connaître l’état de chaque rendez-vous",
    "Voir les visites terminées et annulées",
    "Consulter les cas de traitement",
    "Voir vos images et rapports",
    "Relire les consignes du médecin",
    "Recevoir des rappels de suivi",
    "Communiquer au sujet des visites terminées",
  ],
  registerImageAlt:
    "Patient utilisant son compte pour suivre ses rendez-vous dentaires",
  loginImageAlt:
    "Patient se connectant pour suivre ses rendez-vous à la clinique El Wissam",
  documentTitleRegister: "Créer un compte patient",
  documentTitleLogin: "Connexion patient",
};

const byLocale: Record<Locale, PatientAuthCopy> = { ar, en, fr };

export function getPatientAuthCopy(locale: Locale): PatientAuthCopy {
  return byLocale[locale] || ar;
}
