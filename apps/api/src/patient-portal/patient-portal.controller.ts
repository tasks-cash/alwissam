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
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { PatientPortalService } from "./patient-portal.service";
import { JwtAuthGuard } from "../common/auth/session.guard";
import type { AuthUser } from "../common/auth/session.guard";
import { CurrentUser } from "../common/auth/current-user.decorator";
import {
  PermissionsGuard,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";

class MessageBodyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;
}

class NoteBodyDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

class ReviewSubmitDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  subject?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsBoolean()
  consentConfirmed!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarImage?: string;
}

class ProfileUpdateDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsOptional()
  @IsString()
  locale?: "ar" | "en" | "fr";
}

@ApiTags("patient-portal")
@Controller("api/patient")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@RequireRoles("PATIENT")
export class PatientPortalController {
  constructor(private readonly portal: PatientPortalService) {}

  @Get("dashboard")
  dashboard(@CurrentUser() user: AuthUser) {
    return this.portal.dashboard(user);
  }

  @Get("appointments")
  appointments(
    @CurrentUser() user: AuthUser,
    @Query("status") status?: string,
  ) {
    return this.portal.listAppointments(user, status);
  }

  @Get("appointments/:reference")
  appointment(
    @CurrentUser() user: AuthUser,
    @Param("reference") reference: string,
  ) {
    return this.portal.getAppointmentByReference(user, reference);
  }

  @Post("appointments/:reference/cancellation-request")
  @HttpCode(200)
  cancel(
    @CurrentUser() user: AuthUser,
    @Param("reference") reference: string,
    @Body() body: NoteBodyDto,
  ) {
    return this.portal.requestCancellation(user, reference, body.reason);
  }

  @Post("appointments/:reference/modification-request")
  @HttpCode(200)
  modify(
    @CurrentUser() user: AuthUser,
    @Param("reference") reference: string,
    @Body() body: NoteBodyDto,
  ) {
    return this.portal.requestModification(user, reference, body.note);
  }

  @Post("appointments/:reference/review")
  @HttpCode(200)
  submitReview(
    @CurrentUser() user: AuthUser,
    @Param("reference") reference: string,
    @Body() body: ReviewSubmitDto,
  ) {
    return this.portal.submitExperienceReview(user, reference, body);
  }

  @Get("medical-cases")
  cases(@CurrentUser() user: AuthUser) {
    return this.portal.listMedicalCases(user);
  }

  @Get("medical-cases/:id")
  caseDetail(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.portal.getMedicalCase(user, id);
  }

  @Get("files")
  files(@CurrentUser() user: AuthUser) {
    return this.portal.listFiles(user);
  }

  @Get("files/:id")
  async fileStream(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    return this.portal.streamFile(user, id, res);
  }

  @Get("instructions")
  instructions(@CurrentUser() user: AuthUser) {
    return this.portal.listInstructions(user);
  }

  @Get("messages")
  messages(@CurrentUser() user: AuthUser) {
    return this.portal.listThreads(user);
  }

  @Get("messages/:threadId")
  thread(
    @CurrentUser() user: AuthUser,
    @Param("threadId") threadId: string,
  ) {
    return this.portal.getThread(user, threadId);
  }

  @Post("messages/:threadId")
  @HttpCode(200)
  send(
    @CurrentUser() user: AuthUser,
    @Param("threadId") threadId: string,
    @Body() body: MessageBodyDto,
  ) {
    return this.portal.sendMessage(user, threadId, body.message);
  }

  @Post("appointments/:reference/message-thread")
  @HttpCode(200)
  openThread(
    @CurrentUser() user: AuthUser,
    @Param("reference") reference: string,
  ) {
    return this.portal.openThreadForAppointment(user, reference);
  }

  @Get("follow-up")
  followUp(@CurrentUser() user: AuthUser) {
    return this.portal.listFollowUps(user);
  }

  @Get("notifications")
  notifications(@CurrentUser() user: AuthUser) {
    return this.portal.listNotifications(user);
  }

  @Patch("notifications/read-all")
  @HttpCode(200)
  readAll(@CurrentUser() user: AuthUser) {
    return this.portal.markAllNotificationsRead(user);
  }

  @Patch("notifications/:id/read")
  @HttpCode(200)
  readOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.portal.markNotificationRead(user, id);
  }

  @Get("profile")
  profile(@CurrentUser() user: AuthUser) {
    return this.portal.getProfile(user);
  }

  @Patch("profile")
  @HttpCode(200)
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: ProfileUpdateDto,
  ) {
    return this.portal.updateProfile(user, body);
  }

  @Get("sessions")
  sessions(@CurrentUser() user: AuthUser) {
    return this.portal.listSessions(user);
  }

  @Delete("sessions/:id")
  revokeSession(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.portal.revokeSession(user, id);
  }

  @Post("logout-all")
  @HttpCode(200)
  logoutAll(@CurrentUser() user: AuthUser) {
    return this.portal.logoutAll(user);
  }

  @Get("consents")
  consents(@CurrentUser() user: AuthUser) {
    return this.portal.listConsents(user);
  }

  @Post("account/delete-request")
  @HttpCode(200)
  deleteRequest(
    @CurrentUser() user: AuthUser,
    @Body() body: NoteBodyDto,
  ) {
    return this.portal.requestDeletion(user, body.reason);
  }

  @Post("account/export-request")
  @HttpCode(200)
  exportRequest(@CurrentUser() user: AuthUser) {
    return this.portal.requestExport(user);
  }

  @Get("account/export/:requestId")
  exportDownload(
    @CurrentUser() user: AuthUser,
    @Param("requestId") requestId: string,
    @Res() res: Response,
  ) {
    return this.portal.downloadExport(user, requestId, res);
  }
}

@ApiTags("doctor-messages")
@Controller("api/doctor/messages")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@RequireRoles("DOCTOR_GENERAL", "DOCTOR_SPECIALIST")
export class DoctorMessagesController {
  constructor(private readonly portal: PatientPortalService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.portal.doctorListThreads(user);
  }

  @Post(":threadId/reply")
  @HttpCode(200)
  reply(
    @CurrentUser() user: AuthUser,
    @Param("threadId") threadId: string,
    @Body() body: MessageBodyDto,
  ) {
    return this.portal.doctorReply(user, threadId, body.message);
  }

  @Post(":threadId/close")
  @HttpCode(200)
  close(
    @CurrentUser() user: AuthUser,
    @Param("threadId") threadId: string,
  ) {
    return this.portal.doctorCloseThread(user, threadId);
  }
}
