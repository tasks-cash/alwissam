import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterPatientDto } from "./dto/register-patient.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/password-reset.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateLocaleDto } from "./dto/update-locale.dto";
import { CurrentUser } from "../common/auth/current-user.decorator";
import type { AuthUser } from "../common/auth/session.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} from "../common/auth/token.util";

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  ) {
    const result = await this.authService.login(dto, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    this.setAuthCookies(res, result);
    return result.body;
  }

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
    res.clearCookie(ACCESS_COOKIE, { path: "/" });
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
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

  /** Compatibility alias with legacy path */
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
}
