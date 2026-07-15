import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service";
import { PublicCatalogQueryDto } from "./dto/catalog.dto";

@ApiTags("catalog-public")
@Controller("api/public")
export class CatalogPublicController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("specialties")
  listSpecialties(@Query() query: PublicCatalogQueryDto) {
    return this.catalog.listPublicSpecialties({
      locale: query.locale,
      featured: query.featured === "true",
      limit: query.limit,
      page: query.page,
    });
  }

  @Get("specialties/:slug")
  getSpecialty(
    @Param("slug") slug: string,
    @Query() query: PublicCatalogQueryDto,
  ) {
    return this.catalog.getPublicSpecialty(slug, query.locale);
  }

  @Get("services")
  listServices(@Query() query: PublicCatalogQueryDto) {
    return this.catalog.listPublicServices({
      locale: query.locale,
      specialty: query.specialty,
      featured: query.featured === "true",
      limit: query.limit,
      page: query.page,
      search: query.search,
    });
  }

  @Get("services/:slug")
  getService(
    @Param("slug") slug: string,
    @Query() query: PublicCatalogQueryDto,
  ) {
    return this.catalog.getPublicService(slug, query.locale);
  }
}
