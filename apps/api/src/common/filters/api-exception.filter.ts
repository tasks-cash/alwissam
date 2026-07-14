import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { ApiErrorBody, ErrorCodes } from "../errors/error-codes";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId =
      (req.headers["x-request-id"] as string | undefined) || randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiErrorBody = {
      statusCode: status,
      code: ErrorCodes.INTERNAL_ERROR,
      message: "حدث خطأ غير متوقع.",
      path: req.originalUrl || req.url,
      requestId,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === "string") {
        body = {
          statusCode: status,
          code: mapStatusToCode(status),
          message: payload,
          path: req.originalUrl || req.url,
          requestId,
        };
      } else if (payload && typeof payload === "object") {
        const obj = payload as Record<string, unknown>;
        const messageRaw = obj.message ?? obj.error;
        const message = Array.isArray(messageRaw)
          ? String(messageRaw[0])
          : String(messageRaw || exception.message);
        const fieldErrors =
          (obj.fieldErrors as Record<string, string[]> | undefined) ||
          (typeof obj.message === "object" && !Array.isArray(obj.message)
            ? undefined
            : undefined);

        // class-validator default shape: message: string[]
        const fromValidation =
          Array.isArray(obj.message) && !obj.fieldErrors
            ? { _form: obj.message.map(String) }
            : fieldErrors;

        body = {
          statusCode: status,
          code: String(obj.code || mapStatusToCode(status)),
          message:
            typeof obj.message === "string"
              ? obj.message
              : Array.isArray(obj.message)
                ? String(obj.message[0])
                : message,
          fieldErrors: fromValidation,
          path: req.originalUrl || req.url,
          requestId,
        };
      }
    } else if (
      exception &&
      typeof exception === "object" &&
      (exception as { code?: number }).code === 11000
    ) {
      status = HttpStatus.CONFLICT;
      const key =
        Object.keys(
          ((exception as { keyPattern?: Record<string, number> }).keyPattern ||
            {}) as Record<string, number>,
        )[0] || "";
      if (key.includes("email")) {
        body = {
          statusCode: 409,
          code: ErrorCodes.DUPLICATE_EMAIL,
          message: "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.",
          fieldErrors: {
            email: ["يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل."],
          },
          path: req.originalUrl || req.url,
          requestId,
        };
      } else if (key.includes("phone")) {
        body = {
          statusCode: 409,
          code: ErrorCodes.DUPLICATE_PHONE,
          message: "يوجد حساب مسجل بهذا الرقم بالفعل.",
          fieldErrors: {
            phone: ["يوجد حساب مسجل بهذا الرقم بالفعل."],
          },
          path: req.originalUrl || req.url,
          requestId,
        };
      } else {
        body = {
          statusCode: 409,
          code: ErrorCodes.CONFLICT,
          message: "البيانات متعارضة مع سجل موجود.",
          path: req.originalUrl || req.url,
          requestId,
        };
      }
    }

    res.status(status).json(body);
  }
}

function mapStatusToCode(status: number): string {
  switch (status) {
    case 400:
      return ErrorCodes.VALIDATION_ERROR;
    case 401:
      return ErrorCodes.UNAUTHORIZED;
    case 403:
      return ErrorCodes.FORBIDDEN;
    case 404:
      return ErrorCodes.NOT_FOUND;
    case 409:
      return ErrorCodes.CONFLICT;
    default:
      return ErrorCodes.INTERNAL_ERROR;
  }
}
