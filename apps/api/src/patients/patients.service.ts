import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  CreatePatientDto,
  ListPatientsQueryDto,
  UpdatePatientDto,
} from "./dto/patient.dto";
import { Patient } from "./schemas/patient.schema";

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private readonly patients: Model<Patient>,
    private readonly audit: AuditService,
  ) {}

  private async nextPatientNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `P${year}`;
    const latest = await this.patients
      .findOne({ patientNumber: { $regex: `^${prefix}` } })
      .sort({ patientNumber: -1 })
      .select("patientNumber")
      .lean();
    let seq = 1;
    if (latest?.patientNumber) {
      const n = Number(latest.patientNumber.slice(prefix.length));
      if (Number.isFinite(n)) seq = n + 1;
    }
    return `${prefix}${String(seq).padStart(5, "0")}`;
  }

  private serialize(p: Patient & { _id: Types.ObjectId; createdAt?: Date }) {
    return {
      id: String(p._id),
      patientNumber: p.patientNumber,
      fullName: p.fullName,
      phone: p.phone,
      email: p.email,
      gender: p.gender,
      city: p.city,
      address: p.address,
      notes: p.notes,
      patientType: p.patientType,
      primaryDoctorId: p.primaryDoctorId
        ? String(p.primaryDoctorId)
        : undefined,
      userId: p.userId ? String(p.userId) : undefined,
      createdAt: p.createdAt,
    };
  }

  async list(query: ListPatientsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.q?.trim()) {
      const q = query.q.trim();
      filter.$or = [
        { fullName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { phone: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") } },
        { patientNumber: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.patients.countDocuments(filter),
      this.patients
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      ok: true,
      total,
      page,
      pageSize,
      patients: rows.map((p) => this.serialize(p as never)),
    };
  }

  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "المريض غير موجود",
      });
    }
    const patient = await this.patients.findOne({ _id: id, deletedAt: null }).lean();
    if (!patient) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "المريض غير موجود",
      });
    }
    return { ok: true, patient: this.serialize(patient as never) };
  }

  async getByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "سجل المريض غير موجود",
      });
    }
    const patient = await this.patients
      .findOne({ userId: new Types.ObjectId(userId), deletedAt: null })
      .lean();
    if (!patient) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "سجل المريض غير موجود",
      });
    }
    return { ok: true, patient: this.serialize(patient as never) };
  }

  async create(dto: CreatePatientDto, actor: AuthUser) {
    const phoneTaken = await this.patients.findOne({
      phone: dto.phone,
      deletedAt: null,
    });
    if (phoneTaken) {
      throw new ConflictException({
        code: ErrorCodes.DUPLICATE_PHONE,
        message: "يوجد مريض مسجل بهذا الرقم بالفعل.",
        fieldErrors: {
          phone: ["يوجد مريض مسجل بهذا الرقم بالفعل."],
        },
      });
    }
    if (dto.email) {
      const emailTaken = await this.patients.findOne({
        email: dto.email,
        deletedAt: null,
      });
      if (emailTaken) {
        throw new ConflictException({
          code: ErrorCodes.DUPLICATE_EMAIL,
          message: "يوجد مريض مسجل بهذا البريد بالفعل.",
          fieldErrors: {
            email: ["يوجد مريض مسجل بهذا البريد بالفعل."],
          },
        });
      }
    }

    const patientNumber = await this.nextPatientNumber();
    const created = await this.patients.create({
      patientNumber,
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      gender: dto.gender,
      city: dto.city,
      address: dto.address,
      notes: dto.notes,
      primaryDoctorId: dto.primaryDoctorId
        ? new Types.ObjectId(dto.primaryDoctorId)
        : undefined,
      createdById: new Types.ObjectId(actor.id),
      patientType: "REGULAR",
    });

    await this.audit.write({
      actor,
      action: "PATIENT_CREATED",
      entityType: "Patient",
      entityId: String(created._id),
      newValue: {
        patientNumber,
        fullName: created.fullName,
        phone: created.phone,
      },
    });

    return {
      ok: true,
      message: "تم تسجيل المريض بنجاح.",
      patient: this.serialize(created as never),
    };
  }

  async update(dto: UpdatePatientDto, actor: AuthUser) {
    const target = await this.patients.findOne({
      _id: dto.patientId,
      deletedAt: null,
    });
    if (!target) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "المريض غير موجود",
      });
    }

    if (dto.phone && dto.phone !== target.phone) {
      const phoneTaken = await this.patients.findOne({
        phone: dto.phone,
        deletedAt: null,
        _id: { $ne: target._id },
      });
      if (phoneTaken) {
        throw new ConflictException({
          code: ErrorCodes.DUPLICATE_PHONE,
          message: "يوجد مريض مسجل بهذا الرقم بالفعل.",
          fieldErrors: { phone: ["يوجد مريض مسجل بهذا الرقم بالفعل."] },
        });
      }
      target.phone = dto.phone;
    }
    if (dto.email !== undefined) {
      if (dto.email) {
        const emailTaken = await this.patients.findOne({
          email: dto.email,
          deletedAt: null,
          _id: { $ne: target._id },
        });
        if (emailTaken) {
          throw new ConflictException({
            code: ErrorCodes.DUPLICATE_EMAIL,
            message: "يوجد مريض مسجل بهذا البريد بالفعل.",
            fieldErrors: { email: ["يوجد مريض مسجل بهذا البريد بالفعل."] },
          });
        }
      }
      target.email = dto.email;
    }
    if (dto.fullName) target.fullName = dto.fullName;
    if (dto.gender) target.gender = dto.gender;
    if (dto.city !== undefined) target.city = dto.city;
    if (dto.address !== undefined) target.address = dto.address;
    if (dto.notes !== undefined) target.notes = dto.notes;
    if (dto.primaryDoctorId) {
      target.primaryDoctorId = new Types.ObjectId(dto.primaryDoctorId);
    }

    await target.save();
    await this.audit.write({
      actor,
      action: "PATIENT_UPDATED",
      entityType: "Patient",
      entityId: String(target._id),
      newValue: { fullName: target.fullName, phone: target.phone },
    });

    return {
      ok: true,
      message: "تم حفظ تعديلات المريض.",
      patient: this.serialize(target as never),
    };
  }

  async countActive() {
    return this.patients.countDocuments({ deletedAt: null });
  }

  async countCreatedSince(since: Date) {
    return this.patients.countDocuments({
      deletedAt: null,
      createdAt: { $gte: since },
    });
  }
}
