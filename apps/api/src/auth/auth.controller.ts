import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StaffInvitationsService } from "./staff-invitations.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterPatientDto } from "./dto/register-patient.dto";
import {
  CreateStaffInvitationDto,
  RegisterInvitationDto,
} from "./dto/invitation.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/password-reset.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateLocaleDto } from "./dto/update-locale.dto";
import {
  ResendVerificationDto,
  VerifyContactDto,
} from "./dto/verification.dto";
import { CurrentUser } from "../common/auth/current-user.decorator";
import type { AuthUser } from "../common/auth/session.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} from "../common/auth/token.util";

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly invitations: StaffInvitationsService,
  ) {}

  private setAuthCookies(
    res: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
      accessExpiresAt: Date;
      refreshExpiresAt: Date;
    },
  ) {
    const secure = process.env.COOKIE_SECURE === "true";
    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      expires: tokens.accessExpiresAt,
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      expires: tokens.refreshExpiresAt,
    });
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query("next") next?: string,
  ) {
    const result = await this.authService.login(
      dto,
      {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
      { next: typeof next === "string" ? next : undefined },
    );
    this.setAuthCookies(res, result);
    return result.body;
  }

  /** Public patient registration only. Never accepts privileged roles. */
  @Post("register")
  @HttpCode(201)
  async register(
    @Body() dto: RegisterPatientDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerPatient(dto, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    this.setAuthCookies(res, result);
    return result.body;
  }

  @Post("register/patient")
  @HttpCode(201)
  async registerPatientAlias(
    @Body() dto: RegisterPatientDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.register(dto, req, res);
  }

  @Get("invitations/:token/validate")
  validateInvitation(@Param("token") token: string) {
    return this.authService.validateInvitationToken(token);
  }

  @Post("register/invitation")
  @HttpCode(201)
  async registerInvitation(
    @Body() dto: RegisterInvitationDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerFromInvitation(
      dto.invitationToken,
      dto,
      {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    );
    this.setAuthCookies(res, result);
    return result.body;
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await this.authService.refresh(raw, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    this.setAuthCookies(res, result);
    return { ok: true, accessToken: result.accessToken };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  sessions(@CurrentUser() user: AuthUser) {
    return this.authService.listSessions(user.id, user.sessionJti);
  }

  @Post("sessions/logout-others")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  logoutOtherSessions(@CurrentUser() user: AuthUser) {
    return this.authService.logoutOtherSessions(user.id, user.sessionJti);
  }

  @Delete("sessions/:sessionId")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  revokeSession(
    @CurrentUser() user: AuthUser,
    @Param("sessionId") sessionId: string,
  ) {
    return this.authService.revokeSession(user.id, sessionId);
  }

  @Patch("locale")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  updateLocale(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateLocaleDto,
  ) {
    return this.authService.updateLocale(user.id, dto.locale);
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(raw);
    res.clearCookie(ACCESS_COOKIE, {
      path: "/",
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
    });
    res.clearCookie(REFRESH_COOKIE, {
      path: "/",
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
    });
    return { ok: true };
  }

  @Post("logout-all")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.id);
    res.clearCookie(ACCESS_COOKIE, {
      path: "/",
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
    });
    res.clearCookie(REFRESH_COOKIE, {
      path: "/",
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
    });
    return { ok: true };
  }

  @Post("change-password")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.password,
    );
  }

  @Post("forgot-password")
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.identifier);
  }

  @Post("password-reset")
  @HttpCode(200)
  async forgotPasswordAlias(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.identifier);
  }

  @Post("reset-password")
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post("password-reset/confirm")
  @HttpCode(200)
  async resetPasswordAlias(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post("verify-email")
  @HttpCode(200)
  verifyEmail(@Body() dto: VerifyContactDto) {
    return this.authService.verifyContact(dto.token, dto.channel || "email");
  }

  @Post("verify-phone")
  @HttpCode(200)
  verifyPhone(@Body() dto: VerifyContactDto) {
    return this.authService.verifyContact(dto.token, dto.channel || "phone");
  }

  @Post("resend-verification")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  resendVerification(
    @CurrentUser() user: AuthUser,
    @Body() dto: ResendVerificationDto,
  ) {
    return this.authService.resendVerification(
      user.id,
      dto.channel || "email",
    );
  }
}

@ApiTags("admin-invitations")
@Controller("api/admin/staff-invitations")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard)
export class StaffInvitationsController {
  constructor(private readonly invitations: StaffInvitationsService) {}

  @Post()
  @HttpCode(200)
  create(
    @Body() dto: CreateStaffInvitationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.invitations.create(dto, user);
  }

  @Get()
  list() {
    return this.invitations.list();
  }

  @Post(":id/revoke")
  @HttpCode(200)
  revoke(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.invitations.revoke(id, user);
  }

  @Post(":id/resend")
  @HttpCode(200)
  resend(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.invitations.resend(id, user);
  }
}
