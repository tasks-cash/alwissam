import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/auth/current-user.decorator";
import type { AuthUser } from "../common/auth/session.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { SecretariesService } from "./secretaries.service";
import {
  CreateSecretaryDto,
  DeleteSecretaryDto,
  UpdateSecretaryDto,
} from "./dto/secretary.dto";

@ApiTags("secretaries")
@Controller("api/admin/secretaries")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard)
export class SecretariesController {
  constructor(private readonly secretariesService: SecretariesService) {}

  @Get()
  list() {
    return this.secretariesService.list();
  }

  @Post()
  @HttpCode(200)
  create(@Body() dto: CreateSecretaryDto, @CurrentUser() user: AuthUser) {
    return this.secretariesService.create(dto, user);
  }

  @Patch()
  @HttpCode(200)
  update(@Body() dto: UpdateSecretaryDto, @CurrentUser() user: AuthUser) {
    return this.secretariesService.update(dto, user);
  }

  @Delete()
  @HttpCode(200)
  remove(@Body() dto: DeleteSecretaryDto, @CurrentUser() user: AuthUser) {
    return this.secretariesService.remove(dto, user);
  }
}
