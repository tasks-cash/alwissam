import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("health")
  @ApiOperation({ summary: "Liveness / MongoDB connectivity" })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get("api/health")
  @ApiOperation({ summary: "Health alias under /api/health" })
  getHealthAlias() {
    return this.healthService.getHealth();
  }
}
