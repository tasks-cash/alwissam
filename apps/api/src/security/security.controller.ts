import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CurrentUser } from "../common/auth/current-user.decorator";
import {
  PermissionsGuard,
  RequirePermissions,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { PERMISSIONS } from "../common/auth/permissions";
import type { AuthUser } from "../common/auth/session.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { AuditLog, Session, User } from "../auth/schemas/auth.schemas";
import { AuditService } from "../common/audit/audit.service";
import { ErrorCodes } from "../common/errors/error-codes";

@ApiTags("security")
@Controller("api")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SecurityController {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLog>,
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly audit: AuditService,
  ) {}

  @Get("admin/audit-logs")
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.view_audit_logs)
  @UseGuards(ClinicOwnerGuard)
  async listAudit(
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "30",
    @Query("userId") userId?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const size = Math.min(100, Math.max(1, Number(pageSize) || 30));
    const filter: Record<string, unknown> = {};
    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = new Types.ObjectId(userId);
    }
    const [total, rows] = await Promise.all([
      this.auditLogs.countDocuments(filter),
      this.auditLogs
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((p - 1) * size)
        .limit(size)
        .lean(),
    ]);
    const actorIds = [
      ...new Set(
        rows
          .map((r) => (r.userId ? String(r.userId) : null))
          .filter(Boolean) as string[],
      ),
    ];
    const actors = await this.users
      .find({ _id: { $in: actorIds } })
      .select("fullName roleCode")
      .lean();
    const map = new Map(actors.map((a) => [String(a._id), a]));
    return {
      ok: true,
      total,
      page: p,
      pageSize: size,
      filterUserId: userId && Types.ObjectId.isValid(userId) ? userId : undefined,
      logs: rows.map((r) => {
        const actor = r.userId ? map.get(String(r.userId)) : undefined;
        return {
          id: String(r._id),
          action: r.action,
          entityType: r.entityType,
          entityId: r.entityId,
          roleCode: r.roleCode || actor?.roleCode,
          actorName: actor?.fullName,
          reason: r.reason,
          createdAt: (r as { createdAt?: Date }).createdAt,
        };
      }),
    };
  }

  @Get("admin/sessions")
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  @UseGuards(ClinicOwnerGuard)
  async listSessions(@Query("userId") userId?: string) {
    const filter: Record<string, unknown> = { revokedAt: null };
    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = new Types.ObjectId(userId);
    }
    const rows = await this.sessions
      .find(filter)
      .sort({ lastActivityAt: -1 })
      .limit(100)
      .lean();
    const userIds = [...new Set(rows.map((r) => String(r.userId)))];
    const users = await this.users
      .find({ _id: { $in: userIds } })
      .select("fullName roleCode email")
      .lean();
    const map = new Map(users.map((u) => [String(u._id), u]));
    return {
      ok: true,
      sessions: rows.map((s) => {
        const u = map.get(String(s.userId));
        return {
          id: String(s._id),
          userId: String(s.userId),
          userName: u?.fullName,
          roleCode: u?.roleCode,
          email: u?.email,
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          expiresAt: s.expiresAt,
          lastActivityAt: s.lastActivityAt,
          rememberMe: s.rememberMe,
        };
      }),
    };
  }

  @Delete("admin/sessions/:id")
  @HttpCode(200)
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  @UseGuards(ClinicOwnerGuard)
  async revokeSession(
    @Param("id") id: string,
    @CurrentUser() actor: AuthUser,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الجلسة غير موجودة",
      });
    }
    const session = await this.sessions.findById(id);
    if (!session || session.revokedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الجلسة غير موجودة",
      });
    }
    session.revokedAt = new Date();
    await session.save();
    await this.audit.write({
      actor,
      action: "SESSION_REVOKED",
      entityType: "Session",
      entityId: id,
      newValue: { userId: String(session.userId) },
    });
    return { ok: true, message: "تم إنهاء الجلسة." };
  }

  @Delete("admin/sessions/user/:userId")
  @HttpCode(200)
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  @UseGuards(ClinicOwnerGuard)
  async revokeUserSessions(
    @Param("userId") userId: string,
    @CurrentUser() actor: AuthUser,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "المستخدم غير موجود",
      });
    }
    if (userId === actor.id) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "لا يمكن إنهاء كل جلساتك من هنا. استخدم تسجيل الخروج.",
      });
    }
    const result = await this.sessions.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    await this.audit.write({
      actor,
      action: "USER_SESSIONS_REVOKED",
      entityType: "User",
      entityId: userId,
      newValue: { modified: result.modifiedCount },
    });
    return {
      ok: true,
      message: "تم إنهاء جلسات المستخدم.",
      revoked: result.modifiedCount,
    };
  }
}
