import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { HealthResponse } from "@alwisam/shared-types";
import { Connection } from "mongoose";

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getHealth(): Promise<HealthResponse> {
    let mongodb: HealthResponse["mongodb"] = "down";

    try {
      const readyState = this.connection.readyState;
      // 1 = connected
      if (readyState === 1) {
        await this.connection.db?.admin().ping();
        mongodb = "up";
      } else if (!process.env.MONGODB_URI) {
        mongodb = "skipped";
      } else {
        mongodb = "down";
      }
    } catch {
      mongodb = "down";
    }

    return {
      status: "ok",
      service: "alwisam-api",
      mongodb,
      timestamp: new Date().toISOString(),
    };
  }
}
