import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DoctorsService } from "./doctors.service";

/** Unauthenticated public doctor directory. */
@ApiTags("public-doctors")
@Controller("api/public/doctors")
export class PublicDoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  list(@Query("q") q?: string, @Query("specialty") specialty?: string) {
    return this.doctorsService.listPublic({ q, specialty });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.doctorsService.getPublicById(id);
  }
}
