import { z } from "zod";
import {
  DOCTOR_TYPES,
  FULL_NAME_MAX,
  FULL_NAME_MIN,
  GENDERS,
  IDENTIFIER_MIN,
  LOGIN_PORTALS,
  PASSWORD_MAX,
  PASSWORD_MIN_CREATE,
  PASSWORD_MIN_LOGIN,
  PAYMENT_METHODS,
  PHONE_MAX_DIGITS,
  PHONE_MIN_DIGITS,
  SECRETARY_SHIFT_CODES,
  validationMessagesAr,
} from "./constants";
import {
  isEmailLike,
  isValidPhoneDigits,
  normalizeEmail,
  normalizePhoneDigits,
} from "./phone";

const passwordLogin = z
  .string({ required_error: validationMessagesAr.passwordRequired })
  .min(PASSWORD_MIN_LOGIN, validationMessagesAr.passwordMinLogin)
  .max(PASSWORD_MAX);

const passwordCreate = z
  .string({ required_error: validationMessagesAr.passwordRequired })
  .min(PASSWORD_MIN_CREATE, validationMessagesAr.passwordMinCreate)
  .max(PASSWORD_MAX);

/** Empty / whitespace → undefined (ignore on update). */
const passwordOptionalUpdate = z
  .union([z.string().max(PASSWORD_MAX), z.literal("")])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const t = v.trim();
    return t.length === 0 ? undefined : t;
  })
  .refine(
    (v) => v === undefined || v.length >= PASSWORD_MIN_CREATE,
    { message: validationMessagesAr.passwordMinCreate },
  );

const fullName = z
  .string({ required_error: validationMessagesAr.fullNameMin })
  .trim()
  .min(FULL_NAME_MIN, validationMessagesAr.fullNameMin)
  .max(FULL_NAME_MAX);

const emailRequired = z
  .string()
  .trim()
  .email(validationMessagesAr.emailInvalid)
  .transform(normalizeEmail);

const emailOptional = z
  .union([z.string().trim(), z.literal("")])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    return normalizeEmail(v);
  })
  .refine((v) => v === undefined || isEmailLike(v), {
    message: validationMessagesAr.emailInvalid,
  });

const phoneRequired = z
  .string({ required_error: validationMessagesAr.phoneRequired })
  .trim()
  .refine(isValidPhoneDigits, {
    message: validationMessagesAr.phoneDigitsOnly,
  })
  .transform(normalizePhoneDigits);

const phoneOptional = z
  .union([z.string().trim(), z.literal("")])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    return v;
  })
  .refine(
    (v) => {
      if (v === undefined) return true;
      return isValidPhoneDigits(v);
    },
    { message: validationMessagesAr.phoneDigitsOnly },
  )
  .transform((v) => (v === undefined ? undefined : normalizePhoneDigits(v)));

function passwordsMatchSchema<Shape extends z.ZodRawShape>(
  schema: z.ZodObject<Shape>,
) {
  return schema
    .extend({
      confirmPassword: z
        .string({ required_error: validationMessagesAr.passwordConfirmRequired })
        .min(1, validationMessagesAr.passwordConfirmRequired),
    })
    .superRefine((data, ctx) => {
      const password = (data as { password?: string }).password;
      if (data.confirmPassword !== password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: validationMessagesAr.passwordMismatch,
          path: ["confirmPassword"],
        });
      }
    });
}

/** Staff/patient login — confirm password NOT used. */
export const loginSchema = z
  .object({
    email: z.string().trim().optional(),
    identifier: z.string().trim().optional(),
    password: passwordLogin,
    rememberMe: z.boolean().optional().default(false),
    portal: z.enum(LOGIN_PORTALS).optional(),
  })
  .superRefine((data, ctx) => {
    const id = (data.email || data.identifier || "").trim();
    if (id.length < IDENTIFIER_MIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validationMessagesAr.identifierMin,
        path: [data.email !== undefined ? "email" : "identifier"],
      });
      return;
    }
    const phoneOk = isValidPhoneDigits(id);
    const emailOk = isEmailLike(id);
    if (!phoneOk && !emailOk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validationMessagesAr.identifierInvalid,
        path: [data.email !== undefined ? "email" : "identifier"],
      });
    }
  })
  .transform((data) => {
    const raw = (data.email || data.identifier || "").trim();
    const loginId = isEmailLike(raw)
      ? raw.toLowerCase()
      : normalizePhoneDigits(raw) || raw;
    return {
      loginId,
      email: data.email,
      identifier: data.identifier,
      password: data.password,
      rememberMe: data.rememberMe ?? false,
      portal: data.portal,
    };
  });

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(IDENTIFIER_MIN, validationMessagesAr.identifierMin),
});

export const resetPasswordSchema = passwordsMatchSchema(
  z.object({
    token: z.string().min(1, validationMessagesAr.required),
    password: passwordCreate,
  }),
);

export const activateAccountSchema = passwordsMatchSchema(
  z.object({
    token: z.string().min(1, validationMessagesAr.required),
    password: passwordCreate,
  }),
);

export const changePasswordSchema = passwordsMatchSchema(
  z.object({
    currentPassword: passwordLogin,
    password: passwordCreate,
  }),
);

export const createDoctorSchema = passwordsMatchSchema(
  z.object({
    fullName,
    email: emailRequired,
    phone: phoneRequired,
    password: passwordCreate,
    type: z.enum(DOCTOR_TYPES, {
      errorMap: () => ({ message: validationMessagesAr.doctorTypeInvalid }),
    }),
    specialtyAr: z.string().trim().optional(),
  }),
);

export const updateDoctorSchema = z.object({
  userId: z.string().min(1, validationMessagesAr.required),
  email: emailOptional,
  phone: phoneOptional,
  newPassword: passwordOptionalUpdate,
});

export const createSecretarySchema = passwordsMatchSchema(
  z.object({
    fullName,
    email: emailRequired,
    phone: phoneRequired,
    password: passwordCreate,
    shiftCode: z.enum(SECRETARY_SHIFT_CODES, {
      errorMap: () => ({ message: validationMessagesAr.shiftInvalid }),
    }),
  }),
);

export const updateSecretaryLoginSchema = z.object({
  section: z.literal("login"),
  userId: z.string().min(1),
  email: emailOptional,
  phone: phoneOptional,
  newPassword: passwordOptionalUpdate,
});

export const updateSecretaryHoursSchema = z.object({
  section: z.literal("hours"),
  userId: z.string().min(1),
  shiftCode: z.enum(SECRETARY_SHIFT_CODES),
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/),
  workDays: z.string().min(1),
});

export const createPatientSchema = z.object({
  fullName,
  phone: phoneRequired,
  email: emailOptional,
  age: z.coerce.number().int().min(1).max(120).optional(),
  gender: z.enum(GENDERS).optional(),
  city: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const walkInSchema = z.object({
  fullName,
  phone: phoneRequired,
  age: z.coerce.number().int().min(1).max(120).optional(),
  city: z.string().trim().optional(),
});

export const collectChargeSchema = z.object({
  invoiceId: z.string().min(1),
  method: z.enum(PAYMENT_METHODS),
  entryId: z.string().optional(),
  appointmentId: z.string().optional(),
});

export const contactSettingsSchema = z.object({
  section: z.literal("contact"),
  nameAr: z.string().trim().optional(),
  phone: phoneOptional,
  email: emailOptional,
  address: z.string().trim().optional(),
  mapsLink: z.string().trim().optional(),
  mapsEmbedUrl: z.string().trim().optional(),
});

export const PHONE_BOUNDS = {
  min: PHONE_MIN_DIGITS,
  max: PHONE_MAX_DIGITS,
} as const;

/** Strip confirmPassword before sending to API / persisting. */
export function omitConfirmPassword<T extends { confirmPassword?: string }>(
  value: T,
): Omit<T, "confirmPassword"> {
  const { confirmPassword: _ignored, ...rest } = value;
  return rest;
}
