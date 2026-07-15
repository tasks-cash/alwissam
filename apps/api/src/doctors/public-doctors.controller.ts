import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DoctorsService } from "./doctors.service";

/** Unauthenticated public doctor directory. */
@ApiTags("public-doctors")
@Controller("api/public/doctors")
export class PublicDoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  list(
    @Query("q") q?: string,
    @Query("specialty") specialty?: string,
    @Query("active") active?: string,
    @Query("public") isPublic?: string,
    @Query("bookable") bookable?: string,
    @Query("featured") featured?: string,
    @Query("limit") limit?: string,
  ) {
    return this.doctorsService.listPublic({
      q,
      specialty,
      active,
      public: isPublic,
      bookable,
      featured,
      limit,
    });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.doctorsService.getPublicById(id);
  }
}
