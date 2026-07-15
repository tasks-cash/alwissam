import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PublicFaqsQueryDto } from "./dto/faq.dto";
import { FaqsService } from "./faqs.service";

@ApiTags("faqs-public")
@Controller("api/public")
export class FaqsPublicController {
  constructor(private readonly faqs: FaqsService) {}

  @Get("faqs")
  list(@Query() query: PublicFaqsQueryDto) {
    return this.faqs.listPublic(query);
  }
}
