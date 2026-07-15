import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLog, AuditLogSchema } from "../../auth/schemas/auth.schemas";
import { AuditService } from "./audit.service";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [AuditService],
  exports: [AuditService, MongooseModule],
})
export class AuditModule {}
