import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
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
import { JwtAuthGuard } from "../common/auth/session.guard";
import {
  CollectChargeDto,
  CreateInvoiceDto,
  RecordPaymentDto,
} from "./dto/finance.dto";
import { FinanceService } from "./finance.service";

@ApiTags("finance")
@Controller("api")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("secretary/invoices/open")
  @RequireRoles("ADMIN", "SECRETARY", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.view_payments)
  openInvoices() {
    return this.financeService.listOpenInvoices();
  }

  @Get("secretary/payments/recent")
  @RequireRoles("ADMIN", "SECRETARY", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.view_payments)
  recentPayments() {
    return this.financeService.listRecentPayments();
  }

  @Post("secretary/invoices")
  @HttpCode(200)
  @RequireRoles("ADMIN", "SECRETARY", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.record_payments)
  createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.financeService.createInvoice(dto, user);
  }

  @Post("secretary/payments")
  @HttpCode(200)
  @RequireRoles("ADMIN", "SECRETARY")
  @RequirePermissions(PERMISSIONS.record_payments)
  recordPayment(
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.financeService.recordPayment(dto, user);
  }

  @Post("secretary/collect-charge")
  @HttpCode(200)
  @RequireRoles("ADMIN", "SECRETARY")
  @RequirePermissions(PERMISSIONS.record_payments)
  collect(@Body() dto: CollectChargeDto, @CurrentUser() user: AuthUser) {
    return this.financeService.collectCharge(dto, user);
  }
}
