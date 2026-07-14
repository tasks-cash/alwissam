export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_PHONE: "DUPLICATE_PHONE",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export type ApiErrorBody = {
  statusCode: number;
  code: ErrorCode | string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  path?: string;
  requestId?: string;
};
