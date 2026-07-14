import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { validateEnv } from "./config/env.validation";
import { AuthModule } from "./auth/auth.module";
import { DoctorsModule } from "./doctors/doctors.module";
import { SecretariesModule } from "./secretaries/secretaries.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.getOrThrow<string>("MONGODB_URI");
        return { uri };
      },
    }),
    HealthModule,
    AuthModule,
    DoctorsModule,
    SecretariesModule,
  ],
})
export class AppModule {}
