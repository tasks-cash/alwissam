/**
 * Central validation constraints for Al-Wisam target stack.
 * Frontend Zod schemas and NestJS DTOs must import these values —
 * do not redefine contradictory mins/maxes elsewhere.
 */

/** Login accepts existing seed passwords (legacy login zod min 6). */
export const PASSWORD_MIN_LOGIN = 6;

/** Account create, reset, change-password. */
export const PASSWORD_MIN_CREATE = 8;

export const PASSWORD_MAX = 128;

export const FULL_NAME_MIN = 2;
export const FULL_NAME_MAX = 120;

/** Digits only after normalization (strip spaces/dashes). */
export const PHONE_MIN_DIGITS = 8;
export const PHONE_MAX_DIGITS = 15;

export const IDENTIFIER_MIN = 3;

export const EMAIL_MAX = 254;

export const LOGIN_PORTALS = ["staff", "patient"] as const;
export type LoginPortal = (typeof LOGIN_PORTALS)[number];

export const DOCTOR_TYPES = ["GENERAL", "SPECIALIST"] as const;
export type DoctorType = (typeof DOCTOR_TYPES)[number];

export const SECRETARY_SHIFT_CODES = ["MORNING", "EVENING", "CUSTOM"] as const;
export type SecretaryShiftCode = (typeof SECRETARY_SHIFT_CODES)[number];

export const PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "OTHER",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const GENDERS = ["MALE", "FEMALE"] as const;
export type Gender = (typeof GENDERS)[number];

/** Allowed upload MIME types (target files module). */
export const ALLOWED_UPLOAD_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_UPLOAD_SIZE_MB_DEFAULT = 10;

export const validationMessagesAr = {
  required: "هذا الحقل مطلوب",
  identifierMin: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف",
  identifierInvalid: "يجب إدخال بريد إلكتروني أو رقم هاتف صالح",
  passwordRequired: "كلمة المرور مطلوبة",
  passwordMinLogin: `كلمة المرور قصيرة جدًا (الحد الأدنى ${PASSWORD_MIN_LOGIN} أحرف)`,
  passwordMinCreate: `كلمة المرور قصيرة جدًا (الحد الأدنى ${PASSWORD_MIN_CREATE} أحرف)`,
  passwordConfirmRequired: "تأكيد كلمة المرور مطلوب",
  passwordMismatch: "كلمتا المرور غير متطابقتين",
  fullNameMin: "الاسم الكامل مطلوب",
  emailInvalid: "البريد الإلكتروني غير صالح",
  phoneRequired: "رقم الهاتف مطلوب",
  phoneDigitsOnly: "رقم الهاتف يجب أن يحتوي على أرقام فقط.",
  phoneLength: `طول رقم الهاتف غير صالح.`,
  phoneInvalid: "رقم الهاتف غير صالح.",
  emailDuplicate: "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.",
  phoneDuplicate: "يوجد حساب مسجل بهذا الرقم بالفعل.",
  duplicateConflict: "البيانات متعارضة مع سجل موجود.",
  invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  accountDisabled: "تم تعطيل هذا الحساب.",
  forbidden: "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
  backendUnavailable: "تعذر الاتصال بالخادم حاليًا. يرجى المحاولة مرة أخرى.",
  validationFailed: "بيانات النموذج غير صالحة.",
  doctorCreated: "تم إنشاء حساب الطبيب بنجاح.",
  secretaryCreated: "تم إنشاء حساب السكرتير بنجاح.",
  saved: "تم حفظ التعديلات بنجاح.",
  doctorTypeInvalid: "نوع الطبيب غير صالح",
  shiftInvalid: "وردية غير صالحة",
  portalInvalid: "بوابة الدخول غير صالحة",
  amountPositive: "المبلغ يجب أن يكون أكبر من صفر",
} as const;
