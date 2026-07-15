import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthUser, AuthedRequest } from "./session.guard";
import { ErrorCodes } from "../errors/error-codes";
import {
  defaultPermissionsForRole,
  type PermissionKey,
} from "./permissions";

export const PERMISSIONS_KEY = "permissions";
export const ROLES_KEY = "roles";

export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

function resolvePermissions(user: AuthUser): string[] {
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }
  return defaultPermissionsForRole(user.roleCode);
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];
    if (roles.length === 0) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = req.authUser;
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }
    if (!roles.includes(user.roleCode)) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
      });
    }
    return true;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];
    if (required.length === 0) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = req.authUser;
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }

    // Clinic owner / ADMIN always allowed for permission-gated staff ops.
    if (
      user.roleCode === "ADMIN" ||
      user.roleCode === "OWNER" ||
      user.roleCode === "SUPER_ADMIN" ||
      (user.roleCode === "DOCTOR_SPECIALIST" &&
        user.doctor?.type === "SPECIALIST")
    ) {
      return true;
    }

    const held = new Set(resolvePermissions(user));
    const ok = required.every((p) => held.has(p));
    if (!ok) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
      });
    }
    return true;
  }
}
