import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import type { Request } from "express";
import { User } from "../../auth/schemas/auth.schemas";
import { JwtTokenService } from "./jwt-token.service";
import { ACCESS_COOKIE } from "./token.util";
import { ErrorCodes } from "../errors/error-codes";

export type AuthUser = {
  id: string;
  fullName: string;
  roleCode: string;
  permissions?: string[];
  doctor?: User["doctor"];
  secretary?: User["secretary"];
};

export type AuthedRequest = Request & { authUser?: AuthUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly tokens: JwtTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    const bearer =
      typeof header === "string" && header.startsWith("Bearer ")
        ? header.slice(7)
        : undefined;
    const cookieToken = req.cookies?.[ACCESS_COOKIE] as string | undefined;
    const raw = bearer || cookieToken;
    if (!raw) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }

    let payload;
    try {
      payload = await this.tokens.verifyAccess(raw);
    } catch {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "انتهت الجلسة أو الرمز غير صالح",
      });
    }

    const user = await this.users.findOne({
      _id: payload.sub,
      deletedAt: null,
    });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "الحساب غير متاح",
      });
    }
    if (user.status === "INACTIVE") {
      throw new ForbiddenException({
        code: ErrorCodes.ACCOUNT_DISABLED,
        message: "تم تعطيل هذا الحساب.",
      });
    }
    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException({
        code: ErrorCodes.ACCOUNT_DISABLED,
        message: "الحساب غير متاح",
      });
    }

    req.authUser = {
      id: String(user._id),
      fullName: user.fullName,
      roleCode: user.roleCode,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      doctor: user.doctor,
      secretary: user.secretary,
    };
    return true;
  }
}

@Injectable()
export class ClinicOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = req.authUser;
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }
    const ok =
      user.roleCode === "ADMIN" ||
      user.roleCode === "ADMIN_OWNER" ||
      user.roleCode === "OWNER" ||
      user.roleCode === "SUPER_ADMIN" ||
      (user.roleCode === "DOCTOR_SPECIALIST" &&
        user.doctor?.type === "SPECIALIST");
    if (!ok) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
      });
    }
    return true;
  }
}

/** @deprecated Use JwtAuthGuard — alias kept during cutover. */
export { JwtAuthGuard as SessionAuthGuard };

/** CSRF not required for JWT cookie auth (SameSite). */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}
