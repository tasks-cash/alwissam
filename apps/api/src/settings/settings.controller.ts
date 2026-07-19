import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
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
import {
  ContactInquiryListDto,
  ContactInquiryStatusDto,
  PublicContactDto,
} from "./dto/public-contact.dto";
import { UpsertSettingsDto } from "./dto/settings.dto";
import { SettingsService } from "./settings.service";

@ApiTags("settings")
@Controller("api")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("public/site")
  publicSite() {
    return this.settingsService.getPublicSite();
  }

  /** Public-safe clinic contact settings only (no private admin fields). */
  @Get("public/clinic-settings")
  async publicClinicSettings() {
    const site = await this.settingsService.getPublicSite();
    return { ok: true, clinic: site.clinic };
  }

  @Post("public/contact")
  @HttpCode(200)
  async contact(
    @Body() dto: PublicContactDto,
    @Req() req: { ip?: string; headers?: Record<string, string | undefined> },
  ) {
    const ip =
      req.ip ||
      req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      undefined;
    const result = await this.settingsService.createContactMessage({
      fullName: dto.fullName,
      phone: dto.phone,
      subject: dto.subject,
      message: dto.message,
      locale: dto.locale,
      sourcePage: dto.sourcePage || "contact",
      ipAddress: ip,
      doctorId: dto.doctorId,
      specialtyId: dto.specialtyId,
      serviceId: dto.serviceId,
    });
    if (!result.ok) {
      throw new HttpException(
        {
          ok: false,
          message:
            result.message ||
            "تعذر إرسال الاستفسار حاليًا. يرجى المحاولة مرة أخرى.",
          rateLimited: Boolean(result.rateLimited),
        },
        result.rateLimited
          ? HttpStatus.TOO_MANY_REQUESTS
          : HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }

  /** Alias used by some clients / specs */
  @Post("public/contact-messages")
  @HttpCode(200)
  contactMessages(
    @Body() dto: PublicContactDto,
    @Req() req: { ip?: string; headers?: Record<string, string | undefined> },
  ) {
    return this.contact(dto, req);
  }

  @Get("admin/clinic-settings")
  @UseGuards(JwtAuthGuard, ClinicOwnerGuard)
  getAdmin() {
    return this.settingsService.getClinicInfo();
  }

  @Get("admin/public-pages")
  @UseGuards(JwtAuthGuard, ClinicOwnerGuard)
  getPublicPages() {
    return this.settingsService.getPublicPages();
  }

  @Get("public/specialties-page")
  getPublicSpecialtiesPage() {
    return this.settingsService.getSpecialtiesPage(false);
  }

  @Get("admin/specialties-page")
  @UseGuards(JwtAuthGuard, ClinicOwnerGuard)
  getAdminSpecialtiesPage() {
    return this.settingsService.getSpecialtiesPage(true);
  }

  @Get("admin/homepage-sections")
  @UseGuards(JwtAuthGuard, ClinicOwnerGuard)
  getAdminHomepageSections() {
    return this.settingsService.getHomepageSections(true);
  }

  @Get("public/homepage-sections")
  getPublicHomepageSections() {
    return this.settingsService.getHomepageSections(false);
  }

  @Get("admin/contact-inquiries")
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, ClinicOwnerGuard)
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.manage_settings)
  listContactInquiries(@Query() query: ContactInquiryListDto) {
    return this.settingsService.listContactMessages({
      page: query.page || 1,
      limit: query.limit || 20,
      status: query.status,
      search: query.search,
    });
  }

  @Patch("admin/contact-inquiries/:id/status")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, ClinicOwnerGuard)
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.manage_settings)
  updateContactInquiryStatus(
    @Param("id") id: string,
    @Body() dto: ContactInquiryStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.settingsService.updateContactMessageStatus(
      id,
      dto.status,
      user,
    );
  }

  @Put("admin/clinic-settings")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, ClinicOwnerGuard)
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.manage_settings)
  upsert(@Body() dto: UpsertSettingsDto, @CurrentUser() user: AuthUser) {
    return this.settingsService.upsert(dto, user);
  }
}
