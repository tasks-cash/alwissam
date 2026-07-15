import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog } from "../../auth/schemas/auth.schemas";
import type { AuthUser } from "../auth/session.guard";

export type AuditWriteInput = {
  actor?: AuthUser | null;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  reason?: string;
  ipAddress?: string;
};

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLog>,
  ) {}

  async write(input: AuditWriteInput): Promise<void> {
    try {
      await this.auditLogs.create({
        userId: input.actor?.id,
        roleCode: input.actor?.roleCode,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValue: input.oldValue,
        newValue: input.newValue,
        reason: input.reason,
        ipAddress: input.ipAddress,
      });
    } catch {
      // Audit must not break business flows; failures are silent by design.
    }
  }
}
