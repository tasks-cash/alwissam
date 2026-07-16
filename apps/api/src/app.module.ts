import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { validateEnv } from "./config/env.validation";
import { AppointmentsModule } from "./appointments/appointments.module";
import { AuthModule } from "./auth/auth.module";
import { AuditModule } from "./common/audit/audit.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DoctorsModule } from "./doctors/doctors.module";
import { FinanceModule } from "./finance/finance.module";
import { HealthModule } from "./health/health.module";
import { PatientsModule } from "./patients/patients.module";
import { SecretariesModule } from "./secretaries/secretaries.module";
import { SecurityModule } from "./security/security.module";
import { BeforeAfterModule } from "./before-after/before-after.module";
import { MediaModule } from "./media/media.module";
import { PatientExperiencesModule } from "./patient-experiences/patient-experiences.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { SettingsModule } from "./settings/settings.module";
import { CatalogModule } from "./catalog/catalog.module";
import { FaqsModule } from "./faqs/faqs.module";
import { PatientPortalModule } from "./patient-portal/patient-portal.module";
import { StaffChatModule } from "./staff-chat/staff-chat.module";

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
    AuditModule,
    HealthModule,
    AuthModule,
    DoctorsModule,
    SecretariesModule,
    PatientsModule,
    AppointmentsModule,
    DashboardModule,
    FinanceModule,
    SettingsModule,
    CatalogModule,
    FaqsModule,
    ReviewsModule,
    PatientExperiencesModule,
    BeforeAfterModule,
    MediaModule,
    SecurityModule,
    PatientPortalModule,
    StaffChatModule,
  ],
})
export class AppModule {}
